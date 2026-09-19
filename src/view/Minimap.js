// Minimap tactique : plan de la station, joueur + ennemis en temps réel.
export class Minimap {
  constructor(canvas, state, station) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.station = station;
    this.W = canvas.width;
    this.H = canvas.height;
    // monde : x ∈ [-50,50], z ∈ [-11.5,11.5]
    this.scale = Math.min(this.W / 102, this.H / 24);
    this.ox = this.W / 2;
    this.oy = this.H / 2;
  }

  px(x) { return this.ox + x * this.scale; }
  pz(z) { return this.oy + z * this.scale; }

  rect(cx, cz, w, d, fill) {
    const c = this.ctx;
    c.fillStyle = fill;
    c.fillRect(this.px(cx - w / 2), this.pz(cz - d / 2), w * this.scale, d * this.scale);
  }

  update() {
    const c = this.ctx;
    if (this.canvas.style.display === 'none') return;
    c.clearRect(0, 0, this.W, this.H);

    // fond
    c.fillStyle = 'rgba(6,10,14,0.72)';
    c.fillRect(0, 0, this.W, this.H);

    // tunnels
    for (const s of [1, -1]) for (const t of [1, -1]) this.rect(s * 40, t * 8, 20, 4.4, '#1a2530');
    // voies
    this.rect(0, 8, 60, 6, '#16222e');
    this.rect(0, -8, 60, 6, '#16222e');
    // rampes
    for (const s of [1, -1]) { this.rect(s * 28, 8, 4, 6, '#233242'); this.rect(s * 28, -8, 4, 6, '#233242'); }
    // quai
    this.rect(0, 0, 60, 10, '#2c3e50');
    // colonnes
    c.fillStyle = '#7f8c9b';
    for (let x = -24; x <= 24; x += 8) c.fillRect(this.px(x) - 1.5, this.pz(0) - 1.5, 3, 3);

    // ennemis (points rouges pulsants)
    const t = performance.now() / 300;
    const r = 2.4 + Math.sin(t) * 0.6;
    for (const e of this.state.enemies) {
      if (!e.alive) continue;
      c.fillStyle = e.state === 'attacking' ? '#ff5040' : '#e02020';
      c.beginPath();
      c.arc(this.px(e.x), this.pz(e.z), r, 0, 7);
      c.fill();
    }

    // joueur (flèche blanche orientée)
    const p = this.state.player;
    const x = this.px(p.x), z = this.pz(p.z);
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    const a = Math.atan2(fz, fx);
    c.save();
    c.translate(x, z);
    c.rotate(a);
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.moveTo(6, 0);
    c.lineTo(-4, 4);
    c.lineTo(-4, -4);
    c.closePath();
    c.fill();
    c.restore();

    // cône de vision
    c.save();
    c.translate(x, z);
    c.rotate(a);
    c.fillStyle = 'rgba(255,255,255,0.07)';
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(0, 0, 26, -0.5, 0.5);
    c.closePath();
    c.fill();
    c.restore();

    c.strokeStyle = 'rgba(120,150,170,0.35)';
    c.strokeRect(0.5, 0.5, this.W - 1, this.H - 1);
  }
}
