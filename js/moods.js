export const moods = {
  calm:   { label: "Calm", tempo: [60, 76], mode: "major", density: 0.15, rhythm: false, rhythmDensity: 0, seventh: false, waveform: "sine", reverb: 0.6 },
  night:  { label: "Night", tempo: [70, 88], mode: "dorian", density: 0.25, rhythm: true, rhythmDensity: 0.58, seventh: true, waveform: "triangle", reverb: 0.5 },
  jazz:   { label: "Jazz", tempo: [96, 132], mode: "major", density: 0.35, rhythm: true, rhythmDensity: 0.7, seventh: true, waveform: "triangle", reverb: 0.3, secondaryDominant: true },
  upbeat: { label: "Upbeat", tempo: [110, 128], mode: "major", density: 0.45, rhythm: true, rhythmDensity: 0.84, seventh: false, waveform: "sawtooth", reverb: 0.25 },
};

export const randomTempo = (mood) => Math.round(mood.tempo[0] + Math.random() * (mood.tempo[1] - mood.tempo[0]));
