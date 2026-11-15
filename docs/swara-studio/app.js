import {SWARAS,midiHz,swaraHz,noteName,nearestSwara,centsBetween,detectPitch,scorePitch,SoundEngine} from './music.js?v=20261115-2';
const $=id=>document.getElementById(id);
const sound=new SoundEngine();
const defaults={base:56,timbre:'piano',level:'beginner',duration:'auto',response:6,memory:false};
let settings={...defaults},history=[];
try{const stored=JSON.parse(localStorage.getItem('swara-studio-v1')||'{}');const s=stored.settings||{};settings={base:[54,55,56,57,58,59,60,61].includes(s.base)?s.base:56,timbre:['piano','pure','vocal-low','vocal-high'].includes(s.timbre)?s.timbre:'piano',level:['beginner','intermediate','advanced'].includes(s.level)?s.level:'beginner',duration:['auto','3','5','10'].includes(s.duration)?s.duration:'auto',response:[4,6,8].includes(s.response)?s.response:6,memory:!!s.memory};history=Array.isArray(stored.history)?stored.history.filter(h=>Number.isFinite(h.accuracy)&&h.accuracy>=0&&h.accuracy<=100&&Number.isFinite(h.time)&&Number.isInteger(h.step)&&h.step>=1&&h.step<=5&&Array.isArray(h.notes)&&h.notes.every(n=>Number.isInteger(n.index)&&n.index>=0&&n.index<8)).slice(-500):[];}catch{}
let step=1,mode='repeat',selected=0,reference=[0],targets=[0],phase='idle',attempt=1,exercise=1,controller=null,session=[],samples=[],live=null,view='practice',drone=false,animation=0,recordStart=0,lastSample=0,activeTarget=0,totalSeconds=6,previewing=false;
const titles={1:['THE FOUNDATIONS','Find your Sa.','Listen closely. Sing freely. Let your ear lead the way.'],2:['A STEP FORWARD','One note leads to another.','Hold the sound in your mind, then find the next swara.'],3:['MUSICAL MEMORY','Let three notes become one.','Listen for the shape of a phrase. Sing it back with care.'],4:['HEARING THE DISTANCE','Make room for the interval.','Explore the space between swaras in Mayamalavagowla.'],5:['INNER LISTENING','Hear it before you sing it.','Imagine the sound in silence, then give it your voice.']};
const isIdentification=()=>step===1&&['identify','relative'].includes(mode);
const busy=()=>!['idle','result'].includes(phase);
const tolerance=()=>({beginner:35,intermediate:25,advanced:15})[settings.level];
function save(){try{localStorage.setItem('swara-studio-v1',JSON.stringify({settings,history:history.slice(-500)}));}catch{toast('Device storage is unavailable. This session will remain open, but progress may not be saved.');}}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5500);}
function referenceDuration(){if(settings.duration!=='auto')return Number(settings.duration);return step===1?(mode==='repeat'?10:5):step===2?5:step===5?5:2;}
function gapDuration(){return step===2?5:step===5?5:settings.memory?2:.6;}
function setPhase(next,label,time=''){phase=next;$('phase-label').textContent=label;$('phase-time').textContent=time;$('phase-dot').classList.toggle('active',busy()&&phase!=='answer');$('note-stage').classList.toggle('playing',next==='reference');$('note-stage').classList.toggle('recording',next==='recording');$('begin').innerHTML=busy()?'<span>Stop practice</span><span aria-hidden="true">■</span>':'<span>Begin practice</span><span aria-hidden="true">→</span>';$('settings-open').disabled=busy();$('shruthi-open').disabled=busy();$('raga-open').disabled=busy();$('memory-toggle').disabled=busy();$('preview-note').disabled=busy()&&phase!=='answer';$('swara-grid').querySelectorAll('button').forEach(b=>b.disabled=busy()||isIdentification());}
function updateConfig(){
  $('shruthi-label').textContent=noteName(settings.base);$('shruthi-hz').textContent=midiHz(settings.base).toFixed(2)+' Hz';$('level-tag').textContent=settings.level[0].toUpperCase()+settings.level.slice(1);$('memory-toggle').setAttribute('aria-pressed',String(settings.memory));
  for(const[id,value]of Object.entries({'shruthi-select':settings.base,'timbre-select':settings.timbre,'level-select':settings.level,'duration-select':settings.duration,'response-select':settings.response}))$(id).value=String(value);
  renderGrid();updateDaily();
}
function renderGrid(){
  $('swara-grid').innerHTML=SWARAS.map((s,i)=>`<button class="swara-key ${selected===i&&!isIdentification()?'active':''}" data-note="${i}" ${isIdentification()?'disabled':''} aria-pressed="${selected===i&&!isIdentification()}" aria-label="Practice ${i===7?'upper Sa':s.name}, ${noteName(settings.base+s.offset)}"><strong>${s.name}</strong><small>${s.variant} · ${noteName(settings.base+s.offset)}</small></button>`).join('');
}
function chooseExercise(){
  reference=[selected];targets=[selected];
  if(step===1){if(mode==='next'){reference=[Math.min(selected,6)];targets=[Math.min(selected,6)+1];}if(mode==='identify'){reference=[0,selected];targets=[selected];}if(mode==='relative'){reference=[settings.level==='beginner'?0:(selected+3)%7,selected];targets=[selected];}}
  if(step===2){reference=[Math.min(selected,6)];targets=[Math.min(selected,6)+1];}
  if(step===3){const n=Math.min(selected,5);reference=[n,n+1,n+2];targets=[...reference];}
  if(step===4){const pairs=[[0,2],[1,3],[2,4],[3,5],[4,6],[2,0],[4,2],[6,4]];reference=[...pairs[selected]];if(settings.level==='advanced')reference.push(0);targets=[...reference];}
  if(step===5){const n=Math.min(selected,6);reference=[n];targets=settings.level==='beginner'?[n+1]:settings.level==='intermediate'?[(n+2)%8]:[n,(n+2)%8,(n+4)%8];}
  activeTarget=0;totalSeconds=Number(settings.response)*targets.length;
}
function renderExercise(){
  chooseExercise();const [eyebrow,title,description]=titles[step];$('step-eyebrow').textContent=`STEP 0${step} / ${eyebrow}`;$('page-title').textContent=title;$('page-title').classList.toggle('long-title',step>1);$('page-description').textContent=description;
  const descriptions={repeat:['Listen. Then make it your own.','Hear the reference, then hold the same swara in your voice.'],next:['Follow the sound one step higher.','Hear a swara, then sing the next one in the ascending scale.'],identify:['A familiar sound. What is its name?','Listen to Sa, then identify the mystery swara.'],relative:['Listen to the space between notes.','Hear the reference and identify the second swara.']};
  let [heading,instruction]=descriptions[mode];
  if(step===2){heading='Listen. Pause. Find the next swara.';instruction='After the reference and a 5-second pause, sing the next swara.';}
  if(step===3){heading='Listen to the whole phrase.';instruction=`Sing ${targets.map(i=>SWARAS[i].name).join(' · ')} in order. Hold each note for ${settings.response} seconds.`;}
  if(step===4){heading='Let the interval stay with you.';instruction=`Hear the combination, then sing each note for ${settings.response} seconds.`;}
  if(step===5){heading='Let your inner ear lead.';instruction=`Hear ${SWARAS[reference[0]].name}, imagine ${targets.map(i=>SWARAS[i].name).join(' · ')}, then sing. The target stays silent until your attempt.`;}
  $('exercise-title').textContent=heading;$('exercise-instruction').textContent=instruction;$('exercise-count').textContent=`EXERCISE ${String(exercise).padStart(2,'0')}`;
  const concealed=isIdentification();$('target-name').textContent=concealed?'?':SWARAS[reference[0]].name;$('note-kicker').textContent=concealed?'THE MYSTERY SWARA':'YOUR REFERENCE';$('target-western').textContent=concealed?'Trust your listening.':`${noteName(settings.base+SWARAS[reference[0]].offset)} · ${swaraHz(settings.base,reference[0]).toFixed(2)} Hz`;
  $('sequence').hidden=targets.length===1;$('sequence').innerHTML=targets.map(i=>`<span>${SWARAS[i].name}</span>`).join('');
  $('duration-caption').textContent=`${referenceDuration()}s reference${step===2?' · 5s pause':''} · ${isIdentification()?'choose your answer':`${settings.response}s${targets.length>1?' / note':''} singing`}`;
  $('memory-toggle').hidden=step!==1||mode!=='repeat';$('lesson-tip').textContent=concealed?'Listen to the reference first, then the mystery swara. Let the distance between them guide your answer.':step===1?SWARAS[selected].tip:step===5?'Try to hear the next pitch inside your mind before making a sound. Give the silence your full attention.':'Notice where each note begins, and where it leads. Use a gentle breath between notes.';
  $('answer-options').hidden=true;$('feedback').hidden=true;renderGrid();setPhase('idle','A quiet breath, then begin.');resetReadings();drawChart();
}
function resetReadings(){$('detected-note').textContent='—';$('detected-hz').innerHTML='— <small>Hz</small>';$('detected-cents').innerHTML='— <small>cents</small>';$('live-status').textContent='Ready when you are';$('signal-dot').classList.remove('on');}
function wait(ms,signal){return new Promise((resolve,reject)=>{if(signal.aborted)return reject(new DOMException('Cancelled','AbortError'));const cancel=()=>{clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'));};const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},ms);signal.addEventListener('abort',cancel,{once:true});});}
async function countDown(seconds,label,signal){const start=performance.now();while(performance.now()-start<seconds*1000){const remaining=Math.ceil(seconds-(performance.now()-start)/1000);$('phase-label').textContent=label;$('phase-time').textContent=`${remaining}s`;await wait(Math.min(100,seconds*1000-(performance.now()-start)),signal);}}
async function playReferences(indices,duration,signal,conceal=false){setPhase('reference','Listen to the reference.');for(let n=0;n<indices.length;n++){const i=indices[n];if(!conceal){$('target-name').textContent=SWARAS[i].name;$('target-western').textContent=`${noteName(settings.base+SWARAS[i].offset)} · ${swaraHz(settings.base,i).toFixed(2)} Hz`;}sound.tone(swaraHz(settings.base,i),duration,settings.timbre);await countDown(duration,conceal?(n===0?'First, your reference.':'Now, the mystery swara.'):`Listen to ${SWARAS[i].name}.`,signal);if(n<indices.length-1)await wait(250,signal);}}
async function preview(){
  if(previewing){sound.stopNotes();controller?.abort();previewing=false;setPhase('idle','A quiet breath, then begin.');return;}
  if(busy()&&phase!=='answer')return;
  const wasAnswer=phase==='answer';controller=new AbortController();previewing=true;
  try{await sound.unlock();await playReferences(reference,isIdentification()?Math.min(2,referenceDuration()):referenceDuration(),controller.signal,isIdentification());setPhase(wasAnswer?'answer':'idle',wasAnswer?'Which swara did you hear?':'Ready to sing it back.');}catch(e){if(e.name!=='AbortError')toast('Audio could not start. Please try again.');}finally{previewing=false;}
}
async function begin(){
  if(busy()){cancelExercise();return;}
  controller=new AbortController();const signal=controller.signal;samples=[];live=null;lastSample=0;previewing=false;$('feedback').hidden=true;$('answer-options').hidden=true;resetReadings();
  try{
    setPhase('preparing',isIdentification()?'Preparing the reference.':'Waiting for microphone access…');await sound.unlock();
    if(drone){sound.stopDrone();drone=false;updateDroneButton();}
    if(!isIdentification()){await sound.microphone(signal);if(signal.aborted)return;}
    $('chart-empty').hidden=isIdentification();drawChart();
    // A failed voice attempt always gets a full ten-second corrective reference.
    const duration=attempt>1&&!isIdentification()?10:referenceDuration();
    await playReferences(reference,duration,signal,isIdentification());
    if(isIdentification()){setPhase('answer','Which swara did you hear?');$('answer-options').hidden=false;$('answer-options').innerHTML=SWARAS.map((s,i)=>`<button data-answer="${i}">${s.name}</button>`).join('');return;}
    setPhase('gap',step===5?'Imagine the target. Stay silent.':step===2?'Hold the reference in your mind.':'Take a breath.');
    await countDown(gapDuration(),step===5?'Imagine the target. Stay silent.':step===2?'Hold the reference in your mind.':settings.memory?'Hold the note in your mind.':'Take a breath.',signal);
    setPhase('recording',`Sing ${SWARAS[targets[0]].name}.`);$('note-kicker').textContent='YOUR TURN TO SING';sound.startRecording();recordStart=performance.now();activeTarget=0;$('chart-empty').hidden=true;
    captureFrame();await wait(totalSeconds*1000,signal);cancelAnimationFrame(animation);animation=0;
    const recording=await sound.finishRecording();sound.releaseMic();
    const result=scorePitch(samples,targets,Number(settings.response),settings.base,tolerance());finishResult(result,recording);
  }catch(e){if(signal.aborted||e.name==='AbortError')return;cancelAnimationFrame(animation);sound.stopNotes();await sound.finishRecording();sound.releaseMic();setPhase('idle','Microphone is not available.');const message=e.name==='NotAllowedError'?'Microphone access was declined. Enable it in your browser’s site settings, then begin again. You can still use the listening exercises.':e.name==='NotFoundError'?'No microphone was found. Connect a microphone, then try again.':e.name==='NotReadableError'?'Your microphone is busy. Close other recording apps and try again.':e.message||'Audio could not start. Please try again.';toast(message);$('live-status').textContent='Check microphone access';}
}
function captureFrame(){
  if(phase!=='recording'||!sound.analyser)return;
  const now=performance.now(),t=(now-recordStart)/1000;const current=Math.min(targets.length-1,Math.floor(t/settings.response));activeTarget=current;
  if(now-lastSample>=50){lastSample=now;const buffer=new Float32Array(sound.analyser.fftSize);sound.analyser.getFloatTimeDomainData(buffer);const result=detectPitch(buffer,sound.ctx.sampleRate);live=result?{hz:result.hz,t,index:targets[current]}:null;samples.push({t,hz:live?.hz||null,index:targets[current]});updateLive();drawChart();}
  $('target-name').textContent=SWARAS[targets[current]].name;$('target-western').textContent=`${noteName(settings.base+SWARAS[targets[current]].offset)} · ${swaraHz(settings.base,targets[current]).toFixed(2)} Hz`;
  $('phase-label').textContent=`Sing ${SWARAS[targets[current]].name}${targets.length>1?` · note ${current+1} of ${targets.length}`:''}.`;$('phase-time').textContent=`${Math.max(0,Math.ceil(totalSeconds-t))}s`;
  [...$('sequence').children].forEach((el,i)=>el.classList.toggle('current',current===i));animation=requestAnimationFrame(captureFrame);
}
function updateLive(){
  if(!live){$('detected-note').textContent='—';$('detected-hz').innerHTML='— <small>Hz</small>';$('detected-cents').innerHTML='— <small>cents</small>';$('live-status').textContent='Listening for your voice…';$('signal-dot').classList.remove('on');return;}
  const nearest=nearestSwara(live.hz,settings.base),cents=centsBetween(live.hz,swaraHz(settings.base,live.index));
  $('detected-note').textContent=SWARAS[nearest.index].name+(nearest.octave<0?' (lower)':nearest.octave>0?' (upper)':'');$('detected-hz').innerHTML=`${live.hz.toFixed(1)} <small>Hz</small>`;$('detected-cents').innerHTML=`${cents>0?'+':''}${Math.round(cents)} <small>cents</small>`;$('live-status').textContent=Math.abs(cents)<=tolerance()?'Finding the center':cents>0?'A little high · ease down':'A little low · lift gently';$('signal-dot').classList.add('on');
}
function cancelExercise(){controller?.abort();cancelAnimationFrame(animation);sound.stopNotes();sound.finishRecording();sound.releaseMic();previewing=false;setPhase('idle','Practice paused. Begin whenever you’re ready.');$('answer-options').hidden=true;$('signal-dot').classList.remove('on');}
function answer(index){if(phase!=='answer')return;const correct=targets[0]===index;$('answer-options').querySelectorAll('button').forEach(b=>{b.disabled=true;if(Number(b.dataset.answer)===targets[0])b.classList.add('correct');else if(Number(b.dataset.answer)===index)b.classList.add('incorrect');});$('target-name').textContent=SWARAS[targets[0]].name;$('target-western').textContent=`${noteName(settings.base+SWARAS[targets[0]].offset)} · ${swaraHz(settings.base,targets[0]).toFixed(2)} Hz`;
  finishResult({accuracy:correct?100:0,pass:correct,voiced:true,details:[{index:targets[0],accuracy:correct?100:0,pass:correct,cents:null,stability:null,detected:true}],identification:true});
}
function finishResult(result,recording=null){
  setPhase('result',result.pass?'A good note to build on.':'Listen again. There’s room to grow.');$('note-kicker').textContent='YOUR REFERENCE';$('begin').innerHTML='<span>Try again</span><span aria-hidden="true">↻</span>';$('sequence').querySelectorAll('span').forEach(el=>el.classList.remove('current'));
  const entry={time:Date.now(),step,mode:step===1?mode:'sequence',base:settings.base,level:settings.level,accuracy:result.accuracy,pass:result.pass,notes:result.details,voiced:result.voiced};history.push(entry);session.push(entry);save();updateDaily();updateSummary();
  let heading=result.pass?'That’s the sound. Keep it with you.':!result.voiced?'Let’s find your voice.':'A small adjustment. Another listen.';
  let body='';
  if(result.identification){heading=result.pass?'Your ear found it.':'Listen to that swara once more.';body=result.pass?`You recognized ${SWARAS[targets[0]].name} correctly. Try another note and listen for its relationship with Sa.`:`That was ${SWARAS[targets[0]].name}. Replay the reference and listen to the distance between the notes before trying again.`;}
  else if(!result.voiced)body='We didn’t hear enough of a steady note to evaluate. Move a little closer to your microphone and sing a comfortable, sustained vowel. Your next attempt includes a longer reference.';
  else if(result.pass)body=targets.length===1?`You held ${SWARAS[targets[0]].name} close to the reference. Keep your breath easy and aim for the same steady sound on your next note.`:'You found the notes in this phrase. Keep listening for smooth, deliberate transitions as the sequence becomes familiar.';
  else{const d=result.details.find(d=>!d.pass);const note=SWARAS[d.index].name;if(!d.detected)body=`We didn’t hear a sustained ${note} in its response window. Follow the note cue and hold each swara until the next prompt.`;else if(Math.abs(d.cents)>700)body=`Your ${note} landed in a different register from the reference. Listen to the octave, then try again. Choose a more comfortable base shruthi if needed.`;else if(Math.abs(d.cents)>tolerance())body=`Your ${note} was about ${Math.abs(Math.round(d.cents))} cents ${d.cents>0?'high':'low'}. ${d.cents>0?'Ease down':'Lift gently'} toward the reference, then hold it steady.`;else body=`You found ${note}, but it drifted during the hold. Listen again, keep your breath relaxed, and aim for a steadier line.`;if(attempt>=3)body+=' You’ve given this note three tries. Take a breath or move to a different note.';}
  $('feedback').hidden=false;$('feedback').innerHTML=`<h3>${heading}</h3><p>${body}</p>${result.identification?'':`<div class="feedback-stat">${result.accuracy}% of detected pitch frames within ±${tolerance()} cents${!result.voiced?' · No reliable voice detected':''}</div>`}<div class="result-notes">${result.details.map(d=>`<span>${SWARAS[d.index].name} · ${d.detected?d.accuracy+'%':'not heard'}${d.stability!==null&&d.stability!==undefined?' · '+Math.round(d.stability)+'¢ variation':''}</span>`).join('')}</div><div class="feedback-actions"><button class="primary-button" id="next-exercise">${result.pass?'Next swara':'Try a different swara'} <span>→</span></button><button class="secondary-button" id="retry-exercise">Listen & retry</button>${recording?'<audio controls aria-label="Listen to your recording"></audio>':''}${step===5?'<button class="secondary-button" id="reveal-target">Hear the target</button>':''}</div>`;
  if(recording)$('feedback').querySelector('audio').src=recording;
  $('next-exercise').onclick=nextExercise;$('retry-exercise').onclick=()=>{attempt++;begin();};if($('reveal-target'))$('reveal-target').onclick=async()=>{if(busy())return;controller=new AbortController();try{await sound.unlock();await playReferences(targets,2,controller.signal);setPhase('result','Keep the target in your mind.');}catch(e){if(e.name!=='AbortError')toast('Audio could not start.');}};
  $('live-status').textContent=result.identification?'Answer saved':result.pass?'A steady step forward':'Practice saved';$('signal-dot').classList.remove('on');
}
function nextExercise(){
  cancelExercise();exercise++;attempt=1;
  // Favor notes that have been missed recently; rotate when evidence is still sparse.
  const recent=history.filter(h=>h.base===settings.base).slice(-40);const stats=SWARAS.map((s,i)=>{const notes=recent.flatMap(h=>h.notes).filter(d=>d.index===i);return {i,weight:notes.length?100-notes.reduce((a,n)=>a+n.accuracy,0)/notes.length:60};});
  const choices=stats.filter(s=>s.i!==selected);if(recent.length>=8&&Math.random()<.55){choices.sort((a,b)=>b.weight-a.weight);selected=choices[0].i;}else selected=(selected+1)%8;
  if(isIdentification())selected=Math.floor(Math.random()*8);samples=[];renderExercise();$('chart-empty').hidden=false;
}
function updateDaily(){const today=new Date().toDateString();const n=history.filter(h=>new Date(h.time).toDateString()===today).length;$('today-count').innerHTML=`${n} <span>/ 8</span>`;$('goal-ring').style.strokeDashoffset=String(125.67*(1-Math.min(n/8,1)));}
function updateSummary(){const singing=session.filter(h=>h.voiced);$('session-attempts').textContent=session.length||'—';$('session-accuracy').textContent=singing.length?Math.round(singing.reduce((a,h)=>a+h.accuracy,0)/singing.length)+'%':'—';const best=singing.flatMap(h=>h.notes).filter(n=>n.stability!==null&&n.stability!==undefined).sort((a,b)=>b.accuracy-a.accuracy)[0];$('session-best').textContent=best?SWARAS[best.index].name:'—';}
function updateDroneButton(){$('drone-toggle').setAttribute('aria-pressed',String(drone));$('drone-status').textContent=drone?'On':'Off';}
function drawChart(){
  const canvas=$('pitch-chart'),bounds=canvas.getBoundingClientRect();if(!bounds.width)return;const dpr=window.devicePixelRatio||1;canvas.width=bounds.width*dpr;canvas.height=bounds.height*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);const w=bounds.width,h=bounds.height,left=39,right=w-12,top=12,bottom=h-25,mid=(top+bottom)/2,range=(bottom-top)/2;
  c.clearRect(0,0,w,h);c.font='8px "DM Mono", monospace';c.textAlign='left';c.lineWidth=1;
  for(const value of [100,50,0,-50,-100]){const y=mid-value/150*range;c.strokeStyle=value===0?'#c7c1a8':'#e9ebdf';c.setLineDash(value===0?[4,4]:[]);c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();c.fillStyle='#a8ae9a';c.fillText(value===0?'0¢':(value>0?'+':'')+value,0,y+3);}
  c.setLineDash([]);const band=tolerance()/150*range;c.fillStyle='#809b5f08';c.fillRect(left,mid-band,right-left,band*2);
  for(let n=0;n<=totalSeconds;n+=Math.max(1,Math.ceil(totalSeconds/6))){const x=left+n/totalSeconds*(right-left);c.fillStyle='#a7ae98';c.fillText(n+'s',x-3,h-6);}
  if(targets.length>1)for(let n=1;n<targets.length;n++){const x=left+n/targets.length*(right-left);c.setLineDash([2,5]);c.strokeStyle='#d6ddc9';c.beginPath();c.moveTo(x,top);c.lineTo(x,bottom);c.stroke();}c.setLineDash([]);
  let previous=null;
  for(const p of samples){if(!p.hz){previous=null;continue;}const deviation=centsBetween(p.hz,swaraHz(settings.base,p.index));const pt={x:left+p.t/totalSeconds*(right-left),y:mid-Math.max(-145,Math.min(145,deviation))/150*range};if(previous){c.strokeStyle=Math.abs(deviation)<=tolerance()?'#75975d':'#b78157';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(previous.x,previous.y);c.lineTo(pt.x,pt.y);c.stroke();}previous=pt;}
  if(previous){c.fillStyle='#688f50';c.beginPath();c.arc(previous.x,previous.y,3,0,Math.PI*2);c.fill();}
}
function showView(next){if(view!==next){if(busy())cancelExercise();sound.stopNotes();}view=next;document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==`${next}-view`);document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===next);el.setAttribute('aria-current',el.dataset.view===next?'page':'false');});if(next==='progress')renderProgress();if(next==='library')renderLibrary();if(next==='practice')requestAnimationFrame(drawChart);}
function renderProgress(){
  const count=history.length,avg=count?Math.round(history.reduce((s,h)=>s+h.accuracy,0)/count):0;const dates=new Set(history.map(h=>new Date(h.time).toDateString()));
  let content='<p class="eyebrow">YOUR PRACTICE JOURNAL</p><h1 class="progress-intro">Small steps, lasting progress.</h1><p class="page-description">Every attentive attempt is part of your musical memory.</p>';
  if(!count){content+='<div class="empty-progress"><div><h2>Your first note starts the story.</h2><p>Complete a practice exercise to see your pitch accuracy and the swaras to revisit.</p></div><button class="primary-button" data-back-practice>Begin practice <span>→</span></button></div>';}
  else{
    content+=`<div class="progress-stats"><div><span class="label">ATTEMPTS</span><strong>${count}</strong></div><div><span class="label">AVERAGE ACCURACY</span><strong>${avg}%</strong></div><div><span class="label">DAYS OF PRACTICE</span><strong>${dates.size}</strong></div></div>`;
    const stats=SWARAS.map((s,i)=>{const notes=history.flatMap(h=>h.notes).filter(n=>n.index===i);return {...s,index:i,count:notes.length,accuracy:notes.length?Math.round(notes.reduce((a,n)=>a+n.accuracy,0)/notes.length):null,stability:notes.filter(n=>Number.isFinite(n.stability)).length?Math.round(notes.filter(n=>Number.isFinite(n.stability)).reduce((a,n)=>a+n.stability,0)/notes.filter(n=>Number.isFinite(n.stability)).length):null};});
    const weakest=[...stats].filter(s=>s.count).sort((a,b)=>a.accuracy-b.accuracy)[0];const recent=history.slice(-5);const ready=recent.length===5&&recent.every(h=>h.pass);const recommendedStep=ready?Math.min(history.at(-1).step+1,5):1;
    content+=`<div class="recommendation"><p><strong>${ready?'Ready for a new kind of listening.':`Return to ${weakest.name}, with fresh ears.`}</strong>${ready?'Your last five attempts met the accuracy target. Explore the next step on your learning path.':`Try ${weakest.name} again with a relaxed breath. A longer listen can help the pitch settle.`}</p><button class="primary-button" id="recommended-practice" data-rec-note="${weakest.index}" data-rec-step="${recommendedStep}">Continue practice <span>→</span></button></div><h2 class="section-title">A closer look at each swara</h2><table class="data-table"><thead><tr><th>SWARA</th><th>ATTEMPTS</th><th>ACCURACY</th><th>PITCH VARIATION</th></tr></thead><tbody>${stats.map(s=>`<tr><td>${s.name} <small>${s.variant}</small></td><td>${s.count||'—'}</td><td>${s.accuracy===null?'—':s.accuracy+'%'}</td><td>${s.stability===null?'—':s.stability+' cents'}</td></tr>`).join('')}</tbody></table><h2 class="section-title">Recent practice</h2><table class="data-table"><thead><tr><th>WHEN</th><th>EXERCISE</th><th>SHRUTHI</th><th>ACCURACY</th></tr></thead><tbody>${[...history].reverse().slice(0,15).map(h=>`<tr><td>${new Date(h.time).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</td><td>${h.step===1?({repeat:'Listen & repeat',next:'Next swara',identify:'Name the swara',relative:'Relative listening'})[h.mode]||'Individual swara':'Step '+h.step} · ${h.notes.map(n=>SWARAS[n.index].name).join(' ')}</td><td>${noteName(h.base)}</td><td>${h.accuracy}%</td></tr>`).join('')}</tbody></table><p class="field-note">Pitch accuracy is the proportion of detected voice frames within the selected tolerance. Variation is the median pitch spread. This journal stays on this browser and device.</p>`;
  }$('progress-view').innerHTML=content;
  $('progress-view').querySelector('[data-back-practice]')?.addEventListener('click',()=>showView('practice'));
  $('recommended-practice')?.addEventListener('click',e=>{const b=e.currentTarget;step=Number(b.dataset.recStep);selected=Number(b.dataset.recNote);mode='repeat';syncPath();renderExercise();showView('practice');});
}
function renderLibrary(){
  $('library-view').innerHTML=`<p class="eyebrow">THE SWARA LIBRARY</p><h1 class="progress-intro">Mayamalavagowla.</h1><p class="page-description">15th melakarta · S R₁ G₃ M₁ P D₁ N₃ Ṡ</p><p class="library-note">A clear beginning: seven swaras, eight resting places, and a world of relationships to hear.</p><div class="library-scale">Sa <span>→</span> Ri <span>→</span> Ga <span>→</span> Ma <span>→</span> Pa <span>→</span> Da <span>→</span> Ni <span>→</span> Sā</div><table class="data-table"><thead><tr><th>SWARA</th><th>VARIANT</th><th>WESTERN NOTE</th><th>FREQUENCY</th><th>LISTEN</th></tr></thead><tbody>${SWARAS.map((s,i)=>`<tr><td>${s.name}</td><td>${s.variant}</td><td>${noteName(settings.base+s.offset)}</td><td>${swaraHz(settings.base,i).toFixed(2)} Hz</td><td><button class="secondary-button" data-library-note="${i}" aria-label="Listen to ${s.name}">▷</button></td></tr>`).join('')}</tbody></table><p class="field-note">All notes are relative to your selected Sa (${noteName(settings.base)}). These plain reference pitches use 12-tone equal temperament. Gamakas and expressive raga intonation require more than fixed pitch matching.</p><h2 class="section-title">Practice the relationships</h2><p class="page-description">Start with the pairs in the requirements: Sa–Ga, Ri–Ma, Ga–Pa, Ma–Da, and Pa–Ni. These are interval drills, a first step toward a teacher-curated phrase library.</p><button class="primary-button" style="margin-top:24px" id="library-practice">Explore combinations <span>→</span></button>`;
  $('library-view').querySelectorAll('[data-library-note]').forEach(b=>b.onclick=async()=>{await sound.unlock();sound.stopNotes();sound.tone(swaraHz(settings.base,Number(b.dataset.libraryNote)),2,settings.timbre);});$('library-practice').onclick=()=>{step=4;selected=0;syncPath();renderExercise();showView('practice');};
}
function syncPath(){document.querySelectorAll('[data-step]').forEach(b=>b.classList.toggle('active',Number(b.dataset.step)===step));$('exercise-tabs').hidden=step!==1;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.mode===mode)));}
function openSettings(){if(busy())return;updateConfig();$('settings-dialog').showModal();}
for(const id of ['settings-open','shruthi-open','raga-open'])$(id).onclick=openSettings;
$('settings-dialog').addEventListener('close',()=>{if($('settings-dialog').returnValue!=='save')return;settings.base=Number($('shruthi-select').value);settings.timbre=$('timbre-select').value;settings.level=$('level-select').value;settings.duration=$('duration-select').value;settings.response=Number($('response-select').value);if(drone)sound.toggleDrone(settings.base,true);samples=[];attempt=1;updateConfig();renderExercise();save();if(view==='library')renderLibrary();toast('Your practice settings are saved.');});
$('help-open').onclick=()=>$('help-dialog').showModal();
$('drone-toggle').onclick=async()=>{if(busy()){toast('The drone is paused during pitch evaluation. Try it between exercises.');return;}try{drone=!drone;await sound.toggleDrone(settings.base,drone);updateDroneButton();}catch{drone=false;updateDroneButton();toast('Audio could not start. Try again.');}};
$('memory-toggle').onclick=()=>{settings.memory=!settings.memory;$('memory-toggle').setAttribute('aria-pressed',String(settings.memory));save();};
$('swara-grid').onclick=e=>{const b=e.target.closest('[data-note]');if(!b||busy())return;selected=Number(b.dataset.note);samples=[];attempt=1;renderExercise();$('chart-empty').hidden=false;};
$('answer-options').onclick=e=>{const b=e.target.closest('[data-answer]');if(b)answer(Number(b.dataset.answer));};
$('begin').onclick=()=>{if(phase==='result')attempt++;begin();};$('preview-note').onclick=preview;
// Tabs follow standard keyboard behavior as well as pointer interaction.
const tabs=[...document.querySelectorAll('[data-mode]')];tabs.forEach((b,i)=>{b.onclick=()=>{cancelExercise();mode=b.dataset.mode;selected=isIdentification()?Math.floor(Math.random()*8):selected;attempt=1;samples=[];syncPath();renderExercise();$('chart-empty').hidden=false;};b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[index].focus();tabs[index].click();}};});
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{cancelExercise();step=Number(b.dataset.step);mode='repeat';selected=0;attempt=1;samples=[];syncPath();renderExercise();showView('practice');$('chart-empty').hidden=false;});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.querySelector('.brand').onclick=e=>{e.preventDefault();showView('practice');};
new ResizeObserver(()=>drawChart()).observe($('pitch-chart'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(busy())cancelExercise();sound.stopDrone();drone=false;updateDroneButton();}});
window.addEventListener('pagehide',()=>sound.shutdown());
updateConfig();syncPath();renderExercise();updateSummary();
