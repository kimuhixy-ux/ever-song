export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};

const ROMANS = ["I", "ii", "iii", "IV", "V", "vi", "vii"];
const TRANSITIONS = {
  major: {
    I: { IV: 3, V: 3, vi: 2, ii: 2, iii: 1 }, ii: { V: 5, IV: 1, vii: 1 },
    iii: { vi: 3, IV: 2 }, IV: { V: 3, I: 2, ii: 2 }, V: { I: 5, vi: 2 },
    vi: { ii: 3, IV: 3, V: 1 }, vii: { I: 4, iii: 1 },
  },
  minor: {
    I: { IV: 3, V: 4, vi: 1, ii: 2 }, ii: { V: 5, IV: 2 }, iii: { vi: 3, IV: 2 },
    IV: { V: 4, I: 3, ii: 1 }, V: { I: 6, vi: 1 }, vi: { ii: 2, IV: 3, V: 2 }, vii: { I: 5 },
  },
};

export const midiToFrequency = (midi) => 440 * (2 ** ((midi - 69) / 12));
export const keyName = (root) => ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"][((root % 12) + 12) % 12];

export function weightedChoice(weights) {
  const entries = Object.entries(weights);
  let n = Math.random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [value, weight] of entries) { n -= weight; if (n <= 0) return value; }
  return entries.at(-1)[0];
}

export function nextDegree(current, mode, resolving = false) {
  const table = TRANSITIONS[mode === "major" ? "major" : "minor"];
  const weights = { ...(table[current] || table.I) };
  if (resolving) {
    if (current === "V") weights.I = (weights.I || 1) * 3;
    else weights.V = (weights.V || 1) * 3;
  }
  return weightedChoice(weights);
}

export function chordFor(root, mode, degree, seventh = false) {
  const scale = SCALES[mode];
  const degreeIndex = Math.max(0, ROMANS.indexOf(degree));
  const note = (step) => root + scale[(degreeIndex + step) % 7] + 12 * Math.floor((degreeIndex + step) / 7);
  const notes = [note(0), note(2), note(4)];
  // A raised leading tone gives minor-key cadences a true dominant pull.
  if (mode === "minor" && degree === "V") notes[1] += 1;
  if (seventh) notes.push(note(6));
  return { degree, root: root + scale[degreeIndex], intervals: notes.map((n) => n - root - scale[degreeIndex]) };
}

export function dominantSeventh(targetRoot) {
  return { degree: "V/…", root: targetRoot + 7, intervals: [0, 4, 7, 10], secondary: true };
}

export function voiceChord(chord, previous = []) {
  const candidates = [];
  for (let base = 48; base <= 60; base += 12) {
    const raw = chord.intervals.map((interval) => base + ((chord.root + interval - base) % 12 + 12) % 12);
    for (let inversion = 0; inversion < raw.length; inversion += 1) {
      const voiced = raw.slice(inversion).concat(raw.slice(0, inversion).map((n) => n + 12)).filter((n) => n <= 72);
      if (voiced.length === raw.length && voiced[0] >= 48) candidates.push(voiced);
    }
  }
  if (!previous.length) return candidates[Math.floor(Math.random() * candidates.length)] || [48, 52, 55];
  const distance = (candidate) => candidate.reduce((sum, note, i) => sum + Math.abs(note - previous[Math.min(i, previous.length - 1)]), 0);
  return candidates.sort((a, b) => distance(a) - distance(b))[0] || previous;
}

export function scaleNotes(root, mode, low = 60, high = 84) {
  const allowed = SCALES[mode];
  return Array.from({ length: high - low + 1 }, (_, i) => low + i).filter((m) => allowed.includes(((m - root) % 12 + 12) % 12));
}

export function mutateKey(root, mode) {
  const options = [{ root: root + 7, mode }, { root: root + 5, mode }, { root, mode: mode === "major" ? "minor" : "major" }];
  const result = options[Math.floor(Math.random() * options.length)];
  return { root: ((result.root % 12) + 12) % 12, mode: result.mode };
}
