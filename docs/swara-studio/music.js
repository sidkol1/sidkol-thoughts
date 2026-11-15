export const SWARAS = [
  {name:'Sa',variant:'S',offset:0,tip:'Sa is your anchor. Take a moment to let the sound settle before you sing it back.'},
  {name:'Ri',variant:'R₁',offset:1,tip:'Ri sits just above Sa. Listen for that small, close step, then let your voice find it gently.'},
  {name:'Ga',variant:'G₃',offset:4,tip:'Notice the space between Ri and Ga. Listen to the interval before you try to cross it.'},
  {name:'Ma',variant:'M₁',offset:5,tip:'Ga and Ma are close neighbors. Let the small distance guide you without pushing your voice.'},
  {name:'Pa',variant:'P',offset:7,tip:'Pa is another steady landmark. Hear its relationship with Sa and let the sound ring clearly.'},
  {name:'Da',variant:'D₁',offset:8,tip:'Da sits just above Pa. Keep the movement small and your breath easy.'},
  {name:'Ni',variant:'N₃',offset:11,tip:'Ni leans toward the upper Sa. Hold the note without letting it drift up too soon.'},
  {name:'Sā',variant:'Ṡ',offset:12,tip:'The upper Sa is your anchor one octave higher. Keep the same ease as your lower Sa.'}
];
export const midiHz = midi => 440 * 2 ** ((midi-69)/12);
export const centsBetween = (hz, target) => 1200*Math.log2(hz/target);
export const noteName = midi => ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][((Math.round(midi)%12)+12)%12] + (Math.floor(Math.round(midi)/12)-1);
export const swaraHz = (base,index) => midiHz(base+SWARAS[index].offset);
export function nearestSwara(hz,base){
  const position=12*Math.log2(hz/midiHz(base));
  let best={index:0,cents:Infinity,octave:0};
  for(let octave=-2;octave<=2;octave++) for(let index=0;index<7;index++){
    const cents=(position-SWARAS[index].offset-octave*12)*100;
    if(Math.abs(cents)<Math.abs(best.cents)) best={index,cents,octave};
  }
  if(best.index===0&&best.octave===1) return {...best,index:7,octave:0};
  return best;
}
export function median(values){if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b);const m=Math.floor(sorted.length/2);return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;}
// YIN difference function with a cumulative mean normalized threshold.
// Search the voice range only; unvoiced frames and weak periodicity are rejected.
export function detectPitch(buffer,sampleRate){
  let energy=0,mean=0;
  for(const value of buffer)mean+=value;
  mean/=buffer.length;
  for(const value of buffer)energy+=(value-mean)**2;
  const rms=Math.sqrt(energy/buffer.length);
  if(rms<.008)return null;
  const maxTau=Math.min(Math.floor(sampleRate/65),Math.floor(buffer.length/2)-1);
  const minTau=Math.floor(sampleRate/1100);
  const window=buffer.length-maxTau;
  const diff=new Float32Array(maxTau+1);
  for(let tau=1;tau<=maxTau;tau++){
    let sum=0;for(let j=0;j<window;j++){const delta=buffer[j]-buffer[j+tau];sum+=delta*delta;}diff[tau]=sum;
  }
  let running=0;diff[0]=1;
  for(let tau=1;tau<=maxTau;tau++){running+=diff[tau];diff[tau]=running?diff[tau]*tau/running:1;}
  let found=-1;
  for(let tau=minTau;tau<maxTau;tau++){
    if(diff[tau]<.15){while(tau+1<maxTau&&diff[tau+1]<diff[tau])tau++;found=tau;break;}
  }
  if(found<0)return null;
  const a=diff[found-1],b=diff[found],c=diff[found+1];
  const denominator=2*(2*b-c-a);
  const refined=found+(denominator?(c-a)/denominator:0);
  return {hz:sampleRate/refined,confidence:1-b,rms};
}
export function scorePitch(samples,targets,secondsPerNote,base,tolerance){
  const details=targets.map((index,n)=>{
    // Ignore the first 250 ms of each response window to allow an onset/transition.
    const frames=samples.filter(p=>p.t>=n*secondsPerNote+.25&&p.t<(n+1)*secondsPerNote&&p.hz);
    const target=swaraHz(base,index), deviations=frames.map(p=>centsBetween(p.hz,target));
    const center=median(deviations), spread=center===null?null:median(deviations.map(d=>Math.abs(d-center)));
    const accuracy=frames.length?Math.round(100*deviations.filter(d=>Math.abs(d)<=tolerance).length/frames.length):0;
    const coverage=Math.min(1,frames.length/((secondsPerNote-.25)*16));
    const held=frames.length>=8;
    return {index,accuracy:held?accuracy:0,cents:center,stability:spread,coverage,detected:held,pass:held&&accuracy>=70&&coverage>=.2};
  });
  const accuracy=Math.round(details.reduce((sum,d)=>sum+d.accuracy,0)/details.length);
  return {details,accuracy,pass:details.every(d=>d.pass),voiced:details.some(d=>d.detected)};
}
export class SoundEngine{
  constructor(){this.ctx=null;this.nodes=new Set();this.drone=[];this.stream=null;this.recorder=null;this.chunks=[];this.source=null;this.analyser=null;this.recordUrl=null;}
  async unlock(){this.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state!=='running')await this.ctx.resume();}
  tone(hz,duration,timbre='piano',volume=.19){
    const ctx=this.ctx,now=ctx.currentTime, master=ctx.createGain();master.connect(ctx.destination);
    const nodes=[];
    const harmonics=timbre==='pure'?[1]:timbre==='piano'?[1,.31,.14,.06]:timbre==='vocal-low'?[1,.65,.4,.18,.08]:[.8,.7,.42,.25,.12];
    harmonics.forEach((amplitude,h)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=hz*(h+1);osc.type='sine';gain.gain.value=amplitude/harmonics.reduce((s,x)=>s+x,0);osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+duration+.09);nodes.push(osc,gain);});
    master.gain.setValueAtTime(0,now);master.gain.linearRampToValueAtTime(volume,now+.035);
    if(timbre==='piano'){master.gain.exponentialRampToValueAtTime(volume*.55,now+Math.min(duration*.5,1));}
    master.gain.setValueAtTime(timbre==='piano'?volume*.55:volume,now+duration-.04);
    master.gain.linearRampToValueAtTime(0,now+duration+.06);
    const entry={master,nodes};this.nodes.add(entry);
    nodes[0].onended=()=>{master.disconnect();nodes.forEach(n=>n.disconnect());this.nodes.delete(entry);};
  }
  stopNotes(){for(const {nodes,master}of this.nodes){try{master.gain.cancelScheduledValues(this.ctx.currentTime);master.gain.setTargetAtTime(0,this.ctx.currentTime,.015);for(const n of nodes)if(n.stop)n.stop(this.ctx.currentTime+.06);}catch{}}}
  async toggleDrone(base,on){await this.unlock();this.stopDrone();if(!on)return;const ctx=this.ctx;[midiHz(base-12),midiHz(base),midiHz(base-5)].forEach((hz,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=hz;gain.gain.value=0;gain.gain.linearRampToValueAtTime(i===0?.045:.022,ctx.currentTime+.5);osc.connect(gain);gain.connect(ctx.destination);osc.start();this.drone.push({osc,gain});});}
  stopDrone(){for(const{osc,gain}of this.drone){try{osc.stop();gain.disconnect();}catch{}}this.drone=[];}
  async microphone(signal){
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone access needs HTTPS or localhost in a supported browser.');
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
    if(signal?.aborted){stream.getTracks().forEach(t=>t.stop());throw new DOMException('Cancelled','AbortError');}
    this.stream=stream;this.source=this.ctx.createMediaStreamSource(this.stream);this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=2048;this.source.connect(this.analyser);
  }
  startRecording(){
    this.chunks=[];this.recordingEnded=Promise.resolve(null);
    if(!this.stream||!window.MediaRecorder)return;
    const preferred=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));
    try{this.recorder=new MediaRecorder(this.stream,preferred?{mimeType:preferred}:undefined);}catch{return;}
    const recorder=this.recorder;
    this.recordingEnded=new Promise(resolve=>{recorder.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data);};recorder.onstop=()=>{if(this.recordUrl)URL.revokeObjectURL(this.recordUrl);const blob=new Blob(this.chunks,{type:recorder.mimeType});this.recordUrl=blob.size?URL.createObjectURL(blob):null;resolve(this.recordUrl);};});
    recorder.start();
  }
  async finishRecording(){if(this.recorder?.state==='recording')this.recorder.stop();return this.recordingEnded;}
  releaseMic(){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.source?.disconnect();this.source=null;this.analyser=null;}
  shutdown(){this.stopNotes();this.stopDrone();this.finishRecording();this.releaseMic();}
}
