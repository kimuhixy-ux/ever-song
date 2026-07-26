import { chordFor, dominantSeventh, nextDegree, scaleNotes, voiceChord } from "./theory.js";

export class MusicGenerator {
  constructor(synth, state) {
    this.synth = synth; this.state = state; this.degree = "I"; this.chord = null; this.voicing = [];
    this.chordStartBar = 0; this.chordBars = 1; this.lastMelody = 72; this.restUntil = -1; this.nextChord = null; this.pendingDegree = null;
  }

  resetHarmony() { this.degree = "I"; this.chord = null; this.voicing = []; this.chordStartBar = this.state.bar; this.chordBars = 1; }

  startChord(time) {
    const phraseBar = this.state.bar % 8;
    if (this.pendingDegree) { this.degree = this.pendingDegree; this.pendingDegree = null; }
    else if (this.chord) this.degree = nextDegree(this.degree, this.state.mode, phraseBar >= 6);
    const diatonic = chordFor(this.state.key, this.state.mode, this.degree, this.state.mood.seventh);
    this.nextChord = chordFor(this.state.key, this.state.mode, nextDegree(this.degree, this.state.mode, phraseBar >= 6), this.state.mood.seventh);
    const injectDominant = this.state.mood.secondaryDominant && phraseBar < 7 && Math.random() < 0.2;
    this.chord = injectDominant ? dominantSeventh(this.nextChord.root) : diatonic;
    if (injectDominant) this.pendingDegree = this.nextChord.degree;
    this.voicing = voiceChord(this.chord, this.voicing);
    this.chordBars = phraseBar >= 6 ? 1 : (Math.random() < 2 / 3 ? 1 : 2);
    this.chordStartBar = this.state.bar;
    const beatSeconds = 60 / this.state.tempo;
    this.synth.pad(this.voicing, time, this.chordBars * 4 * beatSeconds + 1.2, this.state.mood.waveform === "sawtooth" ? "triangle" : this.state.mood.waveform);
  }

  tick(note16, time) {
    const step = note16 % 16; const beatSeconds = 60 / this.state.tempo;
    if (step === 0 && (!this.chord || this.state.bar >= this.chordStartBar + this.chordBars)) this.startChord(time);
    if (!this.chord) return;
    this.bass(step, time, beatSeconds); this.melody(step, note16, time, beatSeconds); this.rhythm(step, time);
  }

  bass(step, time, beat) {
    const root = 36 + ((this.chord.root - 36) % 12 + 12) % 12; const fifth = root + 7;
    const style = this.state.moodKey === "calm" ? 0 : this.state.moodKey === "night" ? (Math.random() < 0.5 ? 0 : 1) : 2;
    if (step === 0) this.synth.bass(root, time, style === 0 ? beat * 3.8 : style === 1 ? beat * 1.9 : beat * 0.9);
    if (style === 1 && step === 8) this.synth.bass(fifth, time, beat * 1.8);
    if (style === 2 && [4, 8, 12].includes(step)) this.synth.bass(step === 8 ? root + 12 : fifth, time, beat * 0.82);
    if (step === 14 && Math.random() < 0.3 && this.nextChord) {
      const nextRoot = 36 + ((this.nextChord.root - 36) % 12 + 12) % 12;
      this.synth.bass(nextRoot + (Math.random() < 0.5 ? -1 : 1), time, beat * 0.4);
    }
  }

  melody(step, absoluteStep, time, beat) {
    if (absoluteStep < this.restUntil || Math.random() > this.state.density) return;
    if (Math.random() < 0.1) { this.restUntil = absoluteStep + 4 + Math.floor(Math.random() * 5); return; }
    const strong = step === 0 || step === 8;
    let candidates = strong
      ? this.chord.intervals.flatMap((interval) => [60, 72].map((octave) => octave + ((this.chord.root + interval - octave) % 12 + 12) % 12)).filter((n) => n <= 84)
      : scaleNotes(this.state.key, this.state.mode);
    if (this.state.bar % 8 === 7 && step >= 12) {
      const targetIntervals = [this.chord.intervals[0], this.chord.intervals[1]];
      candidates = candidates.filter((n) => targetIntervals.some((i) => (n - this.chord.root - i) % 12 === 0));
    }
    const weighted = candidates.flatMap((note) => {
      const distance = Math.abs(note - this.lastMelody); let weight = distance <= 5 ? 5 : 1;
      if (note === this.lastMelody) weight = 1; return Array(weight).fill(note);
    });
    const midi = weighted[Math.floor(Math.random() * weighted.length)] ?? 72; this.lastMelody = midi;
    const lengths = [0.25, 0.5, 0.75]; const duration = beat * lengths[Math.floor(Math.random() * lengths.length)];
    this.synth.melody(midi, time, duration, this.state.mood.waveform, this.state.filterCutoff * (0.85 + Math.random() * 0.3));
  }

  rhythm(step, time) {
    if (!this.state.mood.rhythm) return;
    if (step === 0 || step === 8) this.synth.kick(time);
    if (step % 4 === 2 && Math.random() < this.state.mood.rhythmDensity) this.synth.hat(time);
  }
}
