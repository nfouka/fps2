import * as THREE from 'three';

function part(g, geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

export class EnemyView {
  constructor(scene) {
    this.scene = scene;
    this.items = new Map();
  }

  build(e) {
    const g = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(e.hue / 360, 0.35, 0.38) });
    const cloth = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL((e.hue + 140) / 360, 0.12, 0.18) });
    const mats = [skin, cloth];

    part(g, new THREE.BoxGeometry(0.55, 0.72, 0.3), cloth, 0, 1.06, 0);
    const head = part(g, new THREE.BoxGeometry(0.26, 0.28, 0.26), skin, 0, 1.62, 0);
    part(g, new THREE.BoxGeometry(0.08, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0xff2211 }), -0.06, 1.65, -0.14);
    part(g, new THREE.BoxGeometry(0.08, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0xff2211 }), 0.06, 1.65, -0.14);

    // bras tendus vers l'avant (pivot à l'épaule)
    const arms = [];
    for (const s of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.36, 1.32, 0);
      pivot.rotation.x = -1.35;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.62, 0.13), skin);
      arm.position.y = -0.31;
      pivot.add(arm);
      g.add(pivot);
      arms.push(pivot);
    }

    // jambes
    const legs = [];
    for (const s of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(s * 0.15, 0.7, 0);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.7, 0.17), cloth);
      leg.position.y = -0.35;
      pivot.add(leg);
      g.add(pivot);
      legs.push(pivot);
    }

    this.scene.add(g);
    return { group: g, mats, arms, legs, head, fallDir: e.fallDir };
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
        it.legs[0].rotation.x = w * 0.62;
        it.legs[1].rotation.x = -w * 0.62;
        it.arms[0].rotation.x = -1.35 + Math.sin(e.walkPhase * 0.7) * 0.12;
        it.arms[1].rotation.x = -1.35 - Math.sin(e.walkPhase * 0.7) * 0.12;
        it.arms[0].rotation.z = -e.attackAnim * 0.9;
        it.arms[1].rotation.z = e.attackAnim * 0.9;
        it.group.position.y = e.y + Math.abs(Math.sin(e.walkPhase)) * 0.04;
      }

      const f = e.hitFlash;
      for (const m of it.mats) m.emissive.setRGB(f * 0.9, f * 0.12, f * 0.12);
    }

    for (const [id, it] of this.items) {
      if (!alive.has(id)) {
        this.scene.remove(it.group);
        it.group.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
        this.items.delete(id);
      }
    }
  }

  clear() {
    for (const [, it] of this.items) {
      this.scene.remove(it.group);
      it.group.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
    }
    this.items.clear();
  }
}
