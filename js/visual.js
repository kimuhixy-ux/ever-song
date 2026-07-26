const COLORS = { pad: "#7796d8", bass: "#a65d4e", melody: "#f4e8a9", rhythm: "#d8dce5" };

export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext("2d"); this.particles = []; this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize = () => { const ratio = Math.min(devicePixelRatio || 1, 2); this.canvas.width = innerWidth * ratio; this.canvas.height = innerHeight * ratio; this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0); };
    addEventListener("resize", this.resize); this.resize(); requestAnimationFrame((t) => this.draw(t));
  }

  note(event) {
    const delay = Math.max(0, event.delay || 0);
    setTimeout(() => { const y = innerHeight * (0.82 - ((event.midi - 36) / 50) * 0.65); this.particles.push({ x: innerWidth * (0.15 + Math.random() * 0.7), y, born: performance.now(), life: this.reduced ? 3500 : 2200, size: event.layer === "pad" ? 32 : event.layer === "bass" ? 18 : 8 + Math.random() * 9, color: COLORS[event.layer] }); }, delay);
  }

  draw(now) {
    const ctx = this.ctx; ctx.clearRect(0, 0, innerWidth, innerHeight);
    this.particles = this.particles.filter((p) => now - p.born < p.life);
    for (const p of this.particles) {
      const progress = (now - p.born) / p.life; const alpha = Math.sin(progress * Math.PI) * 0.55;
      ctx.beginPath(); ctx.fillStyle = `${p.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
      ctx.arc(p.x, p.y - (this.reduced ? 0 : progress * 38), p.size * (0.8 + progress * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame((t) => this.draw(t));
  }
}
