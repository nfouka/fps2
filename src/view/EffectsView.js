import * as THREE from 'three';

const N_HOLES = 64, N_TRACERS = 24, N_BLOOD = 8, N_SHELLS = 36;

export class EffectsView {
  constructor(scene, camera, bus) {
    this.scene = scene;
    this.camera = camera;

    // --- impacts (trous de balle)
    this.holes = [];
    const holeGeo = new THREE.CircleGeometry(0.035, 8);
    for (let i = 0; i < N_HOLES; i++) {
      const m = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.9, depthWrite: false }));
      m.visible = false;
      scene.add(m);
      this.holes.push({ mesh: m, life: 0 });
    }
    this.holeIdx = 0;

    // --- traces lumineuses
    this.tracers = [];
    for (let i = 0; i < N_TRACERS; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      line.frustumCulled = false;
      scene.add(line);
      this.tracers.push({ line, life: 0 });
    }
    this.tracerIdx = 0;

    // --- gerbes de sang
    this.bloods = [];
    for (let i = 0; i < N_BLOOD; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(24 * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8a0f12, size: 0.07, transparent: true, opacity: 0, depthWrite: false }));
      pts.frustumCulled = false;
      scene.add(pts);
      this.bloods.push({ pts, vel: new Float32Array(24 * 3), life: 0 });
    }
    this.bloodIdx = 0;

    // --- douilles
    this.shells = [];
    const shellGeo = new THREE.BoxGeometry(0.018, 0.018, 0.055);
    const shellMat = new THREE.MeshLambertMaterial({ color: 0xc9a227 });
    for (let i = 0; i < N_SHELLS; i++) {
      const m = new THREE.Mesh(shellGeo, shellMat);
      m.visible = false;
      scene.add(m);
      this.shells.push({ mesh: m, vel: new THREE.Vector3(), life: 0 });
    }
    this.shellIdx = 0;

    bus.on('shot-visual', (e) => this.onShot(e));
  }

  onShot(e) {
    // tracer de la bouche au point d'impact
    const cam = this.camera;
    const dir = new THREE.Vector3(e.dir.x, e.dir.y, e.dir.z).normalize();
    const muzzle = cam.position.clone()
      .addScaledVector(dir, 0.45)
      .addScaledVector(new THREE.Vector3(0, 1, 0), -0.18)
      .addScaledVector(dir.clone().cross(new THREE.Vector3(0, 1, 0)).normalize(), 0.22);

    const tr = this.tracers[this.tracerIdx = (this.tracerIdx + 1) % N_TRACERS];
    const arr = tr.line.geometry.attributes.position.array;
    arr[0] = muzzle.x; arr[1] = muzzle.y; arr[2] = muzzle.z;
    arr[3] = e.hitPoint.x; arr[4] = e.hitPoint.y; arr[5] = e.hitPoint.z;
    tr.line.geometry.attributes.position.needsUpdate = true;
    tr.line.material.opacity = 0.85;
    tr.life = 0.07;

    // douille éjectée
    const sh = this.shells[this.shellIdx = (this.shellIdx + 1) % N_SHELLS];
    sh.mesh.visible = true;
    sh.mesh.position.copy(muzzle);
    sh.vel.set((Math.random() - 0.3) * 2.2, 1.6 + Math.random(), (Math.random() - 0.5) * 1.5);
    sh.vel.applyAxisAngle(new THREE.Vector3(0, 1, 0), cam.rotation.y);
    sh.life = 2.2;

    if (e.enemyHit) {
      this.spawnBlood(e.hitPoint, e.dir);
    } else {
      this.spawnHole(e.hitPoint, e.dir);
    }
  }

  spawnHole(p, dir) {
    const h = this.holes[this.holeIdx = (this.holeIdx + 1) % N_HOLES];
    h.mesh.visible = true;
    h.mesh.position.set(p.x, p.y, p.z);
    const n = new THREE.Vector3(-dir.x, -dir.y, -dir.z).normalize();
    h.mesh.lookAt(h.mesh.position.clone().add(n));
    h.mesh.translateZ(0.006);
    h.mesh.material.opacity = 0.9;
    h.life = 9;
  }

  spawnBlood(p, dir) {
    const b = this.bloods[this.bloodIdx = (this.bloodIdx + 1) % N_BLOOD];
    const pos = b.pts.geometry.attributes.position.array;
    for (let i = 0; i < 24; i++) {
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      b.vel[i * 3] = (Math.random() - 0.5) * 2 - dir.x * 1.2;
      b.vel[i * 3 + 1] = Math.random() * 2.2;
      b.vel[i * 3 + 2] = (Math.random() - 0.5) * 2 - dir.z * 1.2;
    }
    b.pts.geometry.attributes.position.needsUpdate = true;
    b.pts.material.opacity = 1;
    b.life = 0.55;
  }

  update(dt) {
    for (const h of this.holes) {
      if (h.life > 0) {
        h.life -= dt;
        if (h.life < 1.5) h.mesh.material.opacity = 0.9 * (h.life / 1.5);
        if (h.life <= 0) h.mesh.visible = false;
      }
    }
    for (const t of this.tracers) {
      if (t.life > 0) {
        t.life -= dt;
        t.line.material.opacity = Math.max(0, t.life / 0.07) * 0.85;
      }
    }
    for (const b of this.bloods) {
      if (b.life > 0) {
        b.life -= dt;
        const pos = b.pts.geometry.attributes.position.array;
        for (let i = 0; i < 24; i++) {
          b.vel[i * 3 + 1] -= 9.8 * dt;
          pos[i * 3] += b.vel[i * 3] * dt;
          pos[i * 3 + 1] += b.vel[i * 3 + 1] * dt;
          pos[i * 3 + 2] += b.vel[i * 3 + 2] * dt;
        }
        b.pts.geometry.attributes.position.needsUpdate = true;
        b.pts.material.opacity = Math.max(0, b.life / 0.55);
      }
    }
    for (const s of this.shells) {
      if (s.life > 0) {
        s.life -= dt;
        s.vel.y -= 9.8 * dt;
        s.mesh.position.addScaledVector(s.vel, dt);
        if (s.mesh.position.y < -1.3) { s.mesh.position.y = -1.3; s.vel.set(0, 0, 0); }
        s.mesh.rotation.x += dt * 9;
        s.mesh.rotation.z += dt * 7;
        if (s.life <= 0) s.mesh.visible = false;
      }
    }
  }

  clear() {
    for (const h of this.holes) { h.life = 0; h.mesh.visible = false; }
    for (const t of this.tracers) t.life = 0;
    for (const b of this.bloods) b.life = 0;
    for (const s of this.shells) { s.life = 0; s.mesh.visible = false; }
  }
}
