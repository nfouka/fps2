import * as THREE from 'three';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function grain(ctx, w, h, alpha, n) {
  for (let i = 0; i < n; i++) {
    const v = (Math.random() * 255) | 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function tex(canvas, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function tileTexture(base = [150, 160, 168], grout = [52, 56, 62], cols = 6) {
  const S = 256, [c, g] = makeCanvas(S, S);
  g.fillStyle = `rgb(${grout})`; g.fillRect(0, 0, S, S);
  const s = S / cols;
  for (let x = 0; x < cols; x++) for (let y = 0; y < cols; y++) {
    const d = (Math.random() * 26 - 13) | 0;
    g.fillStyle = `rgb(${base[0] + d},${base[1] + d},${base[2] + d})`;
    g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(x * s + 2, y * s + 2, s - 4, 2);
  }
  grain(g, S, S, 0.05, 1400);
  return c;
}

export function concreteTexture(base = [92, 94, 98]) {
  const S = 256, [c, g] = makeCanvas(S, S);
  g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) {
    const r = 6 + Math.random() * 40;
    const d = (Math.random() * 30 - 15) | 0;
    g.fillStyle = `rgba(${base[0] + d},${base[1] + d},${base[2] + d},0.5)`;
    g.beginPath(); g.arc(Math.random() * S, Math.random() * S, r, 0, 7); g.fill();
  }
  for (let i = 0; i < 14; i++) {
    g.strokeStyle = 'rgba(20,20,22,0.35)'; g.lineWidth = 0.6 + Math.random();
    g.beginPath();
    let x = Math.random() * S, y = Math.random() * S;
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += Math.random() * 40 - 20; y += Math.random() * 40 - 20; g.lineTo(x, y); }
    g.stroke();
  }
  grain(g, S, S, 0.08, 2600);
  return c;
}

export function ballastTexture() {
  const S = 256, [c, g] = makeCanvas(S, S);
  g.fillStyle = '#26241f'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) {
    const v = 30 + ((Math.random() * 60) | 0);
    g.fillStyle = `rgb(${v},${v - 3},${v - 8})`;
    const r = 1.5 + Math.random() * 3.5;
    g.beginPath(); g.arc(Math.random() * S, Math.random() * S, r, 0, 7); g.fill();
  }
  // traverses en bois
  for (let y = 8; y < S; y += 32) {
    g.fillStyle = '#3a2c1c'; g.fillRect(0, y, S, 12);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y + 10, S, 2);
    grain(g, S, 12, 0.15, 120);
  }
  return c;
}

export function metalTexture(base = [120, 122, 128]) {
  const S = 128, [c, g] = makeCanvas(S, S);
  g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 200; i++) {
    const d = (Math.random() * 40 - 20) | 0;
    g.strokeStyle = `rgba(${base[0] + d},${base[1] + d},${base[2] + d},0.5)`;
    const y = Math.random() * S;
    g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke();
  }
  return c;
}

export function stripeTexture() {
  const S = 128, [c, g] = makeCanvas(S, S);
  g.fillStyle = '#c9a227'; g.fillRect(0, 0, S, S);
  g.fillStyle = 'rgba(0,0,0,0.28)';
  for (let x = -S; x < S; x += 26) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 13, 0); g.lineTo(x + 13 - S, S); g.lineTo(x - S, S); g.fill();
  }
  grain(g, S, S, 0.12, 800);
  return c;
}

export function gunWoodTexture(base = [122, 82, 44]) {
  const S = 128, [c, g] = makeCanvas(S, S);
  g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * S;
    const d = (Math.random() * 44 - 22) | 0;
    g.strokeStyle = `rgba(${base[0] + d},${base[1] + d},${base[2] + d},${0.25 + Math.random() * 0.4})`;
    g.lineWidth = 0.8 + Math.random() * 2.4;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= S; x += 12) g.lineTo(x, y + Math.sin(x * 0.07 + i * 1.7) * 3.5);
    g.stroke();
  }
  grain(g, S, S, 0.05, 700);
  return c;
}

export function signTexture(text, bg = '#0f3d2e', fg = '#e8f2ea') {
  const [c, g] = makeCanvas(640, 160);
  g.fillStyle = bg; g.fillRect(0, 0, 640, 160);
  g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(12, 12, 616, 136);
  g.fillStyle = fg;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 72px Arial';
  let fs = 72;
  while (g.measureText(text).width > 610 && fs > 14) {
    fs -= 2;
    g.font = `bold ${fs}px Arial`;
  }
  g.fillText(text, 320, 80);
  grain(g, 640, 160, 0.06, 1200);
  return c;
}

export function wayOutTexture() {
  const [c, g] = makeCanvas(512, 128);
  g.fillStyle = '#0c6b34'; g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#ffffff';
  g.font = 'bold 52px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('WAY OUT →', 256, 64);
  return c;
}

export function adTexture() {
  const [c, g] = makeCanvas(256, 256);
  const hue = (Math.random() * 360) | 0;
  g.fillStyle = `hsl(${hue},45%,30%)`; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `hsla(${(hue + Math.random() * 120) | 0},60%,${40 + Math.random() * 30}%,0.8)`;
    g.fillRect(Math.random() * 200, Math.random() * 200, 30 + Math.random() * 90, 20 + Math.random() * 60);
  }
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.font = 'bold 26px Arial';
  g.fillText(['METRO', 'CAFE', 'VOYAGE', 'JAZZ', 'CIRQUE'][(Math.random() * 5) | 0], 128, 220);
  grain(g, 256, 256, 0.1, 1500);
  return c;
}

export function posterTexture() {
  const [c, g] = makeCanvas(256, 256);
  g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = `hsl(${(Math.random() * 360) | 0},35%,45%)`;
  g.fillRect(30, 30, 196, 120);
  g.fillStyle = '#222';
  g.font = 'bold 22px Arial'; g.fillText('INFO', 128, 190);
  for (let i = 0; i < 5; i++) { g.fillRect(40, 205 + i * 9, 176 - Math.random() * 90, 4); }
  grain(g, 256, 256, 0.12, 1200);
  return c;
}

export function graffitiTexture() {
  const S = 256, [c, g] = makeCanvas(S, S);
  g.clearRect(0, 0, S, S);
  const cols = ['#e33', '#3c6', '#39f', '#fc0', '#f6f', '#0cc'];
  for (let i = 0; i < 4; i++) {
    g.strokeStyle = cols[(Math.random() * cols.length) | 0];
    g.lineWidth = 4 + Math.random() * 8;
    g.globalAlpha = 0.75;
    g.beginPath();
    let x = Math.random() * S, y = Math.random() * S;
    g.moveTo(x, y);
    for (let k = 0; k < 8; k++) {
      const cx = x + Math.random() * 90 - 45, cy = y + Math.random() * 90 - 45;
      x += Math.random() * 120 - 60; y += Math.random() * 120 - 60;
      g.quadraticCurveTo(cx, cy, x, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
  return c;
}

export function flashTexture() {
  const S = 128, [c, g] = makeCanvas(S, S);
  const grad = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
  grad.addColorStop(0, 'rgba(255,255,240,1)');
  grad.addColorStop(0.25, 'rgba(255,210,120,0.9)');
  grad.addColorStop(0.6, 'rgba(255,140,40,0.35)');
  grad.addColorStop(1, 'rgba(255,120,20,0)');
  g.fillStyle = grad; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.strokeStyle = 'rgba(255,220,150,0.7)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(S / 2, S / 2);
    g.lineTo(S / 2 + Math.cos(a) * (S / 2) * (0.6 + Math.random() * 0.4), S / 2 + Math.sin(a) * (S / 2) * (0.6 + Math.random() * 0.4));
    g.stroke();
  }
  return c;
}

export function crateTexture() {
  const S = 256, [c, g] = makeCanvas(S, S);
  g.fillStyle = '#6e4d2a'; g.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 42) {
    const d = (Math.random() * 24 - 12) | 0;
    g.fillStyle = `rgb(${110 + d},${77 + d},${42 + d})`;
    g.fillRect(2, y + 2, S - 4, 38);
  }
  g.strokeStyle = 'rgba(30,20,10,0.6)'; g.lineWidth = 3;
  g.strokeRect(4, 4, S - 8, S - 8);
  g.beginPath(); g.moveTo(4, 4); g.lineTo(S - 4, S - 4); g.moveTo(S - 4, 4); g.lineTo(4, S - 4); g.stroke();
  g.fillStyle = 'rgba(200,180,60,0.85)';
  g.font = 'bold 30px Arial'; g.fillText('MUNITIONS', 30, 140);
  grain(g, S, S, 0.12, 2000);
  return c;
}

export function barrelTexture() {
  const S = 256, [c, g] = makeCanvas(S, S);
  g.fillStyle = '#7a2020'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(${90 + Math.random() * 60},${20 + Math.random() * 20},${15 + Math.random() * 15},0.4)`;
    g.fillRect(Math.random() * S, Math.random() * S, 20 + Math.random() * 60, 4 + Math.random() * 10);
  }
  g.fillStyle = '#d8c840'; g.fillRect(0, 96, S, 26);
  g.fillStyle = '#181414';
  g.beginPath(); g.arc(S / 2, 109, 15, 0, 7); g.fill();
  g.fillStyle = '#d8c840';
  g.beginPath(); g.moveTo(S / 2, 99); g.lineTo(S / 2 - 6, 114); g.lineTo(S / 2 + 6, 114); g.fill();
  grain(g, S, S, 0.15, 2200);
  return c;
}

export function exitSignTexture() {
  const [c, g] = makeCanvas(512, 128);
  g.fillStyle = '#0a5c2c'; g.fillRect(0, 0, 512, 128);
  g.strokeStyle = '#d8ffd8'; g.lineWidth = 5; g.strokeRect(8, 8, 496, 112);
  g.fillStyle = '#eaffea';
  g.font = 'bold 52px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('ISSUE DE SECOURS ↑', 256, 66);
  grain(g, 512, 128, 0.06, 900);
  return c;
}

export const textures = {
  tileFloor: () => tex(tileTexture([168, 172, 178], [60, 64, 70], 6), 12, 2),
  tileWall: () => tex(tileTexture([140, 150, 160], [44, 48, 54], 6), 10, 1),
  tilePillar: () => tex(tileTexture([150, 158, 166], [48, 52, 58], 4), 1, 2),
  concrete: () => tex(concreteTexture(), 8, 2),
  concreteCeil: () => tex(concreteTexture([70, 72, 76]), 12, 4),
  ballast: () => tex(ballastTexture(), 6, 2),
  metal: () => tex(metalTexture(), 4, 1),
  stripe: () => tex(stripeTexture(), 14, 1),
  crate: () => tex(crateTexture(), 1, 1),
  barrel: () => tex(barrelTexture(), 2, 1),
};
