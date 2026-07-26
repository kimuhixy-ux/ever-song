export const moods = {
  calm:    { label: "Calm",    tempo: [60, 76],   mode: "major",  density: 0.15, rhythm: false, rhythmDensity: 0,    seventh: false, waveform: "sine",     reverb: 0.60, bassPattern: "whole" },
  night:   { label: "Night",   tempo: [70, 88],   mode: "dorian", density: 0.25, rhythm: true,  rhythmDensity: 0.58, seventh: true,  waveform: "triangle", reverb: 0.50, bassPattern: "half" },
  jazz:    { label: "Jazz",    tempo: [96, 132],  mode: "major",  density: 0.35, rhythm: true,  rhythmDensity: 0.70, seventh: true,  waveform: "triangle", reverb: 0.30, bassPattern: "walk", secondaryDominant: true },
  upbeat:  { label: "Upbeat",  tempo: [110, 128], mode: "major",  density: 0.45, rhythm: true,  rhythmDensity: 0.84, seventh: false, waveform: "sawtooth", reverb: 0.25, bassPattern: "walk" },
  dream:   { label: "Dream",   tempo: [56, 72],   mode: "major",  density: 0.22, rhythm: false, rhythmDensity: 0,    seventh: true,  waveform: "sine",     reverb: 0.78, bassPattern: "whole" },
  mist:    { label: "Mist",    tempo: [64, 80],   mode: "minor",  density: 0.18, rhythm: false, rhythmDensity: 0,    seventh: true,  waveform: "triangle", reverb: 0.72, bassPattern: "whole" },
  pulse:   { label: "Pulse",   tempo: [88, 108],  mode: "dorian", density: 0.32, rhythm: true,  rhythmDensity: 0.92, seventh: false, waveform: "sawtooth", reverb: 0.24, bassPattern: "half" },
  sunrise: { label: "Sunrise", tempo: [78, 96],   mode: "major",  density: 0.30, rhythm: true,  rhythmDensity: 0.46, seventh: true,  waveform: "triangle", reverb: 0.42, bassPattern: "half" },
  lunar:   { label: "Lunar",   tempo: [52, 68],   mode: "dorian", density: 0.13, rhythm: false, rhythmDensity: 0,    seventh: true,  waveform: "sine",     reverb: 0.84, bassPattern: "whole" },
  drift:   { label: "Drift",   tempo: [74, 92],   mode: "major",  density: 0.27, rhythm: true,  rhythmDensity: 0.34, seventh: true,  waveform: "sine",     reverb: 0.66, bassPattern: "half" },
  noir:    { label: "Noir",    tempo: [82, 102],  mode: "minor",  density: 0.29, rhythm: true,  rhythmDensity: 0.52, seventh: true,  waveform: "triangle", reverb: 0.46, bassPattern: "walk", secondaryDominant: true },
  spark:   { label: "Spark",   tempo: [124, 144], mode: "major",  density: 0.50, rhythm: true,  rhythmDensity: 0.96, seventh: false, waveform: "sawtooth", reverb: 0.18, bassPattern: "walk" },
};

export const randomTempo = (mood) => Math.round(mood.tempo[0] + Math.random() * (mood.tempo[1] - mood.tempo[0]));
