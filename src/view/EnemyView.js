import * as THREE from 'three';

function part(g, geo, mat, x, y, z, rx = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.x = rx; m.rotation.z = rz;
  g.add(m);
  return m;
}

function drawLabel(it, pct) {
  const g = it.canvas.getContext('2d');
  g.clearRect(0, 0, 256, 96);
  const color = pct > 60 ? '#6fce5a' : pct > 30 ? '#e8c341' : '#e04a38';
  g.fillStyle = 'rgba(5,8,6,0.72)';
  g.fillRect(28, 20, 200, 26);
  g.fillStyle = color;
  g.fillRect(30, 22, 196 * (pct / 100), 22);
  g.strokeStyle = 'rgba(220,240,220,0.6)';
  g.lineWidth = 2;
  g.strokeRect(28, 20, 200, 26);
  g.font = 'bold 34px Courier New';
  g.textAlign = 'center';
  g.fillStyle = '#ffffff';
  g.strokeStyle = 'rgba(0,0,0,0.9)';
  g.lineWidth = 5;
  g.strokeText(`${pct}%`, 128, 78);
  g.fillText(`${pct}%`, 128, 78);
  it.label.material.map.needsUpdate = true;
}

export class EnemyView {
  constructor(scene) {
    this.scene = scene;
    this.items = new Map();
  }

  build(e) {
    const g = new THREE.Group();
    const skinC = new THREE.Color().setHSL(0.24 + Math.random() * 0.06, 0.28, 0.3 + Math.random() * 0.08);
    const skin = new THREE.MeshLambertMaterial({ color: skinC });
    const skinPale = new THREE.MeshLambertMaterial({ color: skinC.clone().multiplyScalar(1.25) });
    const cloth = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.1, 0.12) });
    const cloth2 = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(0.08, 0.15, 0.1) });
    const mats = [skin, skinPale, cloth, cloth2];
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2a10 });

    // torse voûté, squelettique
    const torso = new THREE.Group();
    torso.position.y = 1.14;
    torso.rotation.x = -0.24;
    part(torso, new THREE.BoxGeometry(0.4, 0.52, 0.24), cloth, 0, 0, 0);
    part(torso, new THREE.BoxGeometry(0.34, 0.3, 0.06), skinPale, 0, 0.06, -0.13);
    for (let i = 0; i < 4; i++) {
      part(torso, new THREE.BoxGeometry(0.26, 0.022, 0.02), skinPale, 0, 0.16 - i * 0.07, -0.155);
    }
    part(torso, new THREE.BoxGeometry(0.44, 0.14, 0.26), cloth2, 0, -0.28, 0);
    part(torso, new THREE.BoxGeometry(0.1, 0.2, 0.03), skin, 0.12, 0.1, 0.13);
    g.add(torso);

    // tête penchée, mâchoire ouverte
    const head = new THREE.Group();
    head.position.set(0, 1.56, -0.06);
    head.rotation.set(0.28, 0, 0.12);
    part(head, new THREE.BoxGeometry(0.23, 0.26, 0.24), skin, 0, 0, 0);
    part(head, new THREE.BoxGeometry(0.24, 0.06, 0.05), skinPale, 0, 0.06, -0.11);
    part(head, new THREE.BoxGeometry(0.06, 0.04, 0.02), eyeMat, -0.055, 0.02, -0.125);
    part(head, new THREE.BoxGeometry(0.06, 0.04, 0.02), eyeMat, 0.055, 0.02, -0.125);
    part(head, new THREE.BoxGeometry(0.035, 0.05, 0.02), new THREE.MeshLambertMaterial({ color: 0x0a0a0a }), -0.055, 0.02, -0.12);
    part(head, new THREE.BoxGeometry(0.035, 0.05, 0.02), new THREE.MeshLambertMaterial({ color: 0x0a0a0a }), 0.055, 0.02, -0.12);
    const jaw = part(head, new THREE.BoxGeometry(0.17, 0.07, 0.16), skin, 0, -0.16, -0.03, 0.5);
    part(head, new THREE.BoxGeometry(0.13, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x1a0505 }), 0, -0.13, -0.1);
    part(head, new THREE.BoxGeometry(0.2, 0.06, 0.2), cloth2, 0, 0.14, 0.01);
    g.add(head);

    // bras tendus vers l'avant (-Z), disloqués
    const arms = [];
    for (const s of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.26, 1.34, -0.02);
      pivot.rotation.x = 1.25 + s * 0.1;
      pivot.rotation.z = -s * 0.18;
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.34, 0.11), cloth);
      upper.position.y = -0.17;
      pivot.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.34;
      elbow.rotation.x = s > 0 ? 0.35 : -0.25;
      const fore = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), skin);
      fore.position.y = -0.16;
      elbow.add(fore);
      for (let f = 0; f < 3; f++) {
        const claw = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), skinPale);
        claw.position.set((f - 1) * 0.035, -0.36, -0.01);
        claw.rotation.x = 0.4;
        elbow.add(claw);
      }
      pivot.add(elbow);
      g.add(pivot);
      arms.push(pivot);
    }

    // jambes traînantes
    const legs = [];
    for (const s of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.13, 0.72, 0);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.68, 0.15), cloth2);
      leg.position.y = -0.34;
      pivot.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.07, 0.26), skin);
      foot.position.set(0, -0.68, -0.05);
      pivot.add(foot);
      g.add(pivot);
      legs.push(pivot);
    }

    this.scene.add(g);
    return { group: g, torso, head, jaw, mats, arms, legs, fallDir: e.fallDir, label: null, labelPct: -1, canvas: null };
  }

  ensureLabel(it) {
    if (it.label) return;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 96;
    it.canvas = c;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(0.8, 0.3, 1);
    this.scene.add(sp);
    it.label = sp;
  }

  update(state, dt) {
    const alive = new Set();
    for (const e of state.enemies) {
      if (e.state === 'dying' && e.deathTime > 4.6) continue;
      alive.add(e.id);
      let it = this.items.get(e.id);
      if (!it) it = this.items.set(e.id, this.build(e)).get(e.id);

      it.group.position.set(e.x, e.y, e.z);

      if (e.state === 'dying') {
        if (it.label) it.label.visible = false;
        const t = Math.min(1, e.deathTime / 0.55);
        it.group.rotation.z = it.fallDir * t * Math.PI / 2;
        it.group.position.y = e.y - t * 0.22;
        if (e.deathTime > 4) {
          const fade = Math.max(0, 1 - (e.deathTime - 4) / 0.6);
          for (const m of it.mats) { m.transparent = true; m.opacity = fade; }
        }
      } else {
        it.group.rotation.y = e.yaw;
        const w = Math.sin(e.walkPhase);
        it.legs[0].rotation.x = w * 0.58;
        it.legs[1].rotation.x = -w * 0.42;
        it.arms[0].rotation.x = 1.25 + Math.sin(e.walkPhase * 0.7) * 0.14;
        it.arms[1].rotation.x = 1.35 - Math.sin(e.walkPhase * 0.7) * 0.14;
        it.arms[0].rotation.z = -0.18 - e.attackAnim * 0.9;
        it.arms[1].rotation.z = 0.18 + e.attackAnim * 0.9;
        it.group.position.y = e.y + Math.abs(Math.sin(e.walkPhase)) * 0.04;
        it.torso.rotation.x = -0.24 + Math.sin(e.walkPhase * 2) * 0.05;
        it.torso.rotation.z = Math.sin(e.walkPhase) * 0.06;
        it.head.rotation.z = 0.12 + Math.sin(e.walkPhase * 0.5) * 0.1;
        it.jaw.rotation.x = 0.5 + Math.sin(e.walkPhase * 3 + e.id) * 0.12 + e.attackAnim * 0.5;

        const pct = Math.max(0, Math.ceil((e.hp / e.maxHp) * 100));
        if (pct < 100) {
          this.ensureLabel(it);
          if (pct !== it.labelPct) {
            it.labelPct = pct;
            drawLabel(it, pct);
          }
          it.label.visible = true;
          it.label.position.set(e.x, e.y + 2.15, e.z);
        } else if (it.label) {
          it.label.visible = false;
        }
      }

      const f = e.hitFlash;
      for (const m of it.mats) m.emissive.setRGB(f * 0.9, f * 0.12, f * 0.12);
    }

    for (const [id, it] of this.items) {
      if (!alive.has(id)) {
        this.scene.remove(it.group);
        it.group.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
        if (it.label) {
          this.scene.remove(it.label);
          it.label.material.map.dispose();
          it.label.material.dispose();
        }
        this.items.delete(id);
      }
    }
  }

  clear() {
    for (const [, it] of this.items) {
      this.scene.remove(it.group);
      it.group.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
      if (it.label) {
        this.scene.remove(it.label);
        it.label.material.map.dispose();
        it.label.material.dispose();
      }
    }
    this.items.clear();
  }
}
