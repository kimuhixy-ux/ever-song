import { midiToFrequency } from "./theory.js";

export class Synth {
  constructor(context, onNote) {
    this.context = context;
    this.onNote = onNote;
    this.layers = {};
    this.master = context.createGain();
    this.master.gain.value = 0.68;
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.01;
    this.compressor.release.value = 0.25;
    this.master.connect(this.compressor).connect(context.destination);
    for (const [name, level] of Object.entries({ pad: 0.17, bass: 0.28, melody: 0.13, rhythm: 0.18 })) {
      const gain = context.createGain(); gain.gain.value = level; gain.connect(this.master); this.layers[name] = gain;
    }
    this.createAmbience();
    this.noise = this.createNoiseBuffer();
  }

  createAmbience() {
    this.ambienceInput = this.context.createGain(); this.ambienceInput.gain.value = 0.3;
    for (const delayTime of [0.311, 0.433]) {
      const delay = this.context.createDelay(1); const feedback = this.context.createGain(); const lowpass = this.context.createBiquadFilter();
      delay.delayTime.value = delayTime; feedback.gain.value = 0.35; lowpass.type = "lowpass"; lowpass.frequency.value = 3000;
      this.ambienceInput.connect(delay); delay.connect(lowpass); lowpass.connect(feedback); feedback.connect(delay); lowpass.connect(this.master);
    }
  }

  setReverb(amount) { this.ambienceInput.gain.setTargetAtTime(amount * 0.55, this.context.currentTime, 0.3); }

  createNoiseBuffer() {
    const buffer = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
    const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  envelope(gain, time, duration, attack, release, peak) {
    const end = time + duration; gain.gain.setValueAtTime(0.0001, time); gain.gain.linearRampToValueAtTime(peak, time + attack);
    gain.gain.setValueAtTime(peak, Math.max(time + attack, end - release)); gain.gain.linearRampToValueAtTime(0.0001, end);
  }

  note(midi, time, duration, options = {}) {
    const { layer = "melody", waveform = "triangle", attack = 0.02, release = 0.2, velocity = 0.7, cutoff = 3000, double = false } = options;
    const output = this.context.createGain(); const filter = this.context.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.setValueAtTime(cutoff, time);
    this.envelope(output, time, duration, attack, Math.min(release, duration * 0.6), velocity); output.connect(filter); filter.connect(this.layers[layer]); filter.connect(this.ambienceInput);
    const oscillators = double ? [-6, 6] : [0];
    for (const detune of oscillators) {
      const osc = this.context.createOscillator(); osc.type = waveform; osc.frequency.setValueAtTime(midiToFrequency(midi), time); osc.detune.value = detune;
      osc.connect(output); osc.start(time); osc.stop(time + duration + 0.03); osc.onended = () => osc.disconnect();
    }
    const cleanupAt = Math.max(0, (time + duration + 0.1 - this.context.currentTime) * 1000);
    setTimeout(() => { output.disconnect(); filter.disconnect(); }, cleanupAt);
    this.onNote?.({ midi, layer, time, duration });
  }

  pad(notes, time, duration, waveform) { notes.forEach((m) => this.note(m, time, duration, { layer: "pad", waveform, attack: 0.3, release: 1.5, velocity: 0.48 / notes.length, cutoff: 2200, double: true })); }
  bass(midi, time, duration) { this.note(midi, time, duration, { layer: "bass", waveform: "sine", attack: 0.01, release: 0.3, velocity: 0.8, cutoff: 400 }); }
  melody(midi, time, duration, waveform, cutoff) { this.note(midi, time, duration, { layer: "melody", waveform, cutoff, velocity: 0.56, release: 0.24 }); }

  kick(time) {
    const osc = this.context.createOscillator(); const gain = this.context.createGain(); osc.type = "sine";
    osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
    gain.gain.setValueAtTime(0.8, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16); osc.connect(gain).connect(this.layers.rhythm);
    osc.start(time); osc.stop(time + 0.18); osc.onended = () => { osc.disconnect(); gain.disconnect(); }; this.onNote?.({ midi: 36, layer: "rhythm", time, duration: 0.18 });
  }

  hat(time) {
    const source = this.context.createBufferSource(); const highpass = this.context.createBiquadFilter(); const gain = this.context.createGain(); source.buffer = this.noise;
    highpass.type = "highpass"; highpass.frequency.value = 7000; const duration = 0.03 + Math.random() * 0.05;
    gain.gain.setValueAtTime(0.25, time); gain.gain.exponentialRampToValueAtTime(0.001, time + duration); source.connect(highpass).connect(gain).connect(this.layers.rhythm);
    source.start(time); source.stop(time + duration); source.onended = () => { source.disconnect(); highpass.disconnect(); gain.disconnect(); };
    this.onNote?.({ midi: 82, layer: "rhythm", time, duration });
  }
}
