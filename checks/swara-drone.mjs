import assert from 'node:assert/strict';
import {SoundEngine,midiHz,detectPitch,centsBetween} from '../docs/swara-studio/music.js';

// Capture the actual Web Audio oscillator settings without opening a speaker.
function audioContext(){
  return {
    state:'running', currentTime:0, destination:{},
    createOscillator(){return {frequency:{value:0},connect(){},start(){this.started=true;},stop(){this.stopped=true;}};},
    createGain(){return {gain:{value:0,linearRampToValueAtTime(value){this.value=value;}},connect(){},disconnect(){this.disconnected=true;}};}
  };
}
const engine=new SoundEngine();engine.ctx=audioContext();
let worst=0;
for(let base=54;base<=61;base++){
  const previous=[...engine.drone];
  await engine.toggleDrone(base,true);
  assert.ok(previous.every(({osc})=>osc.stopped),'Changing shruthi must stop the old drone');
  const sa=midiHz(base),lowest=Math.min(...engine.drone.map(({osc})=>osc.frequency.value));
  assert.ok(Math.abs(lowest-sa)<1e-8,'The lowest oscillator must be the selected Sa');
  const fundamental=engine.drone.find(({osc})=>Math.abs(osc.frequency.value-sa)<1e-8);
  assert.ok(fundamental,'The selected Sa must be present');
  assert.ok(engine.drone.every(({gain})=>gain.gain.value<=fundamental.gain.gain.value),'The selected Sa must dominate');
  const buffer=new Float32Array(2048),sampleRate=48000;
  for(let j=0;j<buffer.length;j++)for(const{osc,gain}of engine.drone)buffer[j]+=gain.gain.value*Math.sin(2*Math.PI*osc.frequency.value*j/sampleRate);
  const detected=detectPitch(buffer,sampleRate);assert.ok(detected,'The drone must have a detectable fundamental');
  const error=Math.abs(centsBetween(detected.hz,sa));worst=Math.max(worst,error);assert.ok(error<1,`Drone resolved to the wrong pitch: ${error} cents`);
}
const last=[...engine.drone];await engine.toggleDrone(56,false);
assert.equal(engine.drone.length,0);assert.ok(last.every(({osc,gain})=>osc.stopped&&gain.disconnected),'Turning off must stop and disconnect every drone tone');
assert.ok(Math.abs(midiHz(56)-207.65234878997256)<1e-8,'G♯3 must equal 207.65 Hz');
console.log(`Drone checks passed for all 8 shruthis; worst detected pitch error ${worst.toFixed(2)} cents. G♯3 = ${midiHz(56).toFixed(2)} Hz.`);
