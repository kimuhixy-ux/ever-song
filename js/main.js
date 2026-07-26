import { moods, randomTempo } from "./moods.js";
import { keyName, mutateKey } from "./theory.js";
import { Synth } from "./synth.js";
import { Scheduler } from "./scheduler.js";
import { MusicGenerator } from "./generators.js";
import { Visualizer } from "./visual.js";

const playButton = document.querySelector("#play");
const mutateButton = document.querySelector("#mutate");
const status = document.querySelector("#status");
const toast = document.querySelector("#toast");
const moodButtons = [...document.querySelectorAll("[data-mood]")];
const visual = new Visualizer(document.querySelector("#visual"));

let context; let synth; let scheduler; let generator; let playing = false; let wakeLock; let toastShown = false;
let pendingMood = null; let pendingMutation = false;
const initialMoodKey = "night";
const state = {
  key: Math.floor(Math.random() * 12), mode: moods[initialMoodKey].mode, moodKey: initialMoodKey,
  mood: moods[initialMoodKey], tempo: randomTempo(moods[initialMoodKey]), density: moods[initialMoodKey].density,
  filterCutoff: 2600, bar: 0,
};

function updateStatus(note = "") {
  status.textContent = `${keyName(state.key)} ${state.mode} · ${state.tempo} BPM${note ? ` · ${note}` : ""}`;
}

function selectMood(name, queued = false) {
  moodButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.mood === name);
    button.setAttribute("aria-pressed", String(button.dataset.mood === name));
  });
  if (queued) updateStatus("next phrase");
}

function applyPhraseChanges() {
  let harmonyChanged = false;
  if (pendingMood) {
    state.moodKey = pendingMood; state.mood = moods[pendingMood]; state.mode = state.mood.mode;
    state.tempo = randomTempo(state.mood); state.density = state.mood.density; synth.setReverb(state.mood.reverb);
    scheduler.setTempo(state.tempo); pendingMood = null; harmonyChanged = true;
  }
  if (pendingMutation) {
    const mutation = Math.floor(Math.random() * 4);
    if (mutation === 0) { Object.assign(state, mutateKey(state.key, state.mode)); harmonyChanged = true; }
    if (mutation === 1) { state.tempo = Math.max(52, Math.min(150, state.tempo + (Math.random() < 0.5 ? -8 : 8))); scheduler.setTempo(state.tempo); }
    if (mutation === 2) state.density = Math.max(0.12, Math.min(0.5, state.mood.density * (0.7 + Math.random() * 0.7)));
    if (mutation === 3) state.filterCutoff = 1200 + Math.random() * 2800;
    pendingMutation = false; mutateButton.classList.remove("queued");
  }
  if (harmonyChanged) generator.resetHarmony(); updateStatus();
}

function ensureAudio() {
  if (context) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext; context = new AudioContext();
  synth = new Synth(context, (event) => visual.note({ ...event, delay: (event.time - context.currentTime) * 1000 }));
  synth.setReverb(state.mood.reverb); generator = new MusicGenerator(synth, state);
  scheduler = new Scheduler(context, (step, time) => generator.tick(step, time), (bar) => {
    state.bar = bar; if (bar > 0 && bar % 8 === 0) applyPhraseChanges();
  });
}

async function requestWakeLock() {
  try { if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen"); } catch { /* optional */ }
}

async function start() {
  ensureAudio();
  try { await context.resume(); } catch { updatePlaying(false); return; }
  synth.master.gain.cancelScheduledValues(context.currentTime); synth.master.gain.setValueAtTime(0.0001, context.currentTime); synth.master.gain.linearRampToValueAtTime(0.68, context.currentTime + 0.12);
  generator.resetHarmony(); scheduler.start(state.tempo); updatePlaying(true); requestWakeLock();
  if (!toastShown) { toastShown = true; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 6500); }
}

function stop() {
  if (!context) return; scheduler.stop(); synth.master.gain.cancelScheduledValues(context.currentTime); synth.master.gain.setTargetAtTime(0.0001, context.currentTime, 0.025);
  wakeLock?.release().catch(() => {}); wakeLock = null; updatePlaying(false);
}

function updatePlaying(value) {
  playing = value; playButton.classList.toggle("playing", value); playButton.setAttribute("aria-label", value ? "Stop music" : "Play music");
  playButton.querySelector("span").textContent = value ? "■" : "▶"; document.body.classList.toggle("is-playing", value);
}

playButton.addEventListener("click", () => playing ? stop() : start());
moodButtons.forEach((button) => button.addEventListener("click", () => {
  const name = button.dataset.mood;
  if (playing) { pendingMood = name; selectMood(name, true); }
  else { state.moodKey = name; state.mood = moods[name]; state.mode = state.mood.mode; state.tempo = randomTempo(state.mood); state.density = state.mood.density; selectMood(name); updateStatus(); }
}));
mutateButton.addEventListener("click", () => { pendingMutation = true; mutateButton.classList.add("queued"); updateStatus("mutation queued"); });
document.addEventListener("visibilitychange", async () => {
  if (!document.hidden && playing && context && ["suspended", "interrupted"].includes(context.state)) {
    try { await context.resume(); } catch { stop(); }
  }
});

selectMood(initialMoodKey); updateStatus();
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
