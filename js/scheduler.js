export class Scheduler {
  constructor(context, onTick, onBar) {
    this.context = context; this.onTick = onTick; this.onBar = onBar; this.lookahead = 25; this.ahead = 0.1;
    this.current16thNote = 0; this.nextNoteTime = 0; this.timer = null; this.tempo = 72;
  }

  start(tempo) {
    if (this.timer) return; this.tempo = tempo; this.nextNoteTime = this.context.currentTime + 0.06;
    this.timer = setInterval(() => this.scheduleAhead(), this.lookahead); this.scheduleAhead();
  }

  scheduleAhead() {
    while (this.nextNoteTime < this.context.currentTime + this.ahead) {
      if (this.current16thNote % 16 === 0) this.onBar?.(this.current16thNote / 16, this.nextNoteTime);
      this.onTick(this.current16thNote, this.nextNoteTime);
      this.nextNoteTime += 0.25 * (60 / this.tempo); this.current16thNote += 1;
    }
  }

  setTempo(tempo) { this.tempo = tempo; }
  stop() { clearInterval(this.timer); this.timer = null; this.current16thNote = 0; }
}
