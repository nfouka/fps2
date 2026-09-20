import * as THREE from 'three';
import { groundHeight } from './SubwayStation.js';

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

    // --- traces de balle dans les caisses (entrée/sortie) ---
    this.crateHoles = [];
    const crateHoleGeo = new THREE.CircleGeometry(0.045, 10);
    for (let i = 0; i < N_HOLES; i++) {
      const m = new THREE.Mesh(crateHoleGeo, new THREE.MeshBasicMaterial({ color: 0x1c1109, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
      m.visible = false;
      scene.add(m);
      this.crateHoles.push({ mesh: m, life: 0 });
    }
    this.crateHoleIdx = 0;

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

    // --- débris de caisses (morceaux de bois) ---
    this.debris = [];
    const debrisGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const debrisMat = new THREE.MeshLambertMaterial({ color: 0x8a6a34 });
    for (let i = 0; i < 120; i++) {
      const m = new THREE.Mesh(debrisGeo, debrisMat);
      m.visible = false;
      scene.add(m);
      this.debris.push({ mesh: m, vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0, resting: false });
    }
    this.debrisIdx = 0;

    // --- poussière de destruction ---
    this.dust = [];
    const dustGeo = new THREE.SphereGeometry(1, 12, 10);
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(dustGeo, new THREE.MeshBasicMaterial({ color: 0xb09a6a, transparent: true, opacity: 0, depthWrite: false }));
      m.visible = false;
      scene.add(m);
      this.dust.push({ mesh: m, life: 0 });
    }
    this.dustIdx = 0;

    // --- roquettes & grenades (projectiles)
    this.projectiles = new Map();
    this.rocketGeo = null;
    this.nadeGeo = new THREE.SphereGeometry(0.09, 8, 8);
    this.nadeMat = new THREE.MeshPhongMaterial({ color: 0x2e3a26, shininess: 40 });
    this.bottleMat = new THREE.MeshPhongMaterial({ color: 0x7a3010, emissive: 0x330d00, shininess: 60 });

    // --- explosions
    this.booms = [];
    for (let i = 0; i < 5; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffa030, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      sphere.visible = false;
      const light = new THREE.PointLight(0xff8830, 0, 24, 2);
      const scorch = new THREE.Mesh(
        new THREE.CircleGeometry(1, 20),
        new THREE.MeshBasicMaterial({ color: 0x0c0a08, transparent: true, opacity: 0, depthWrite: false })
      );
      scorch.rotation.x = -Math.PI / 2;
      scorch.visible = false;
      scene.add(sphere); scene.add(light); scene.add(scorch);
      this.booms.push({ sphere, light, scorch, life: 0, radius: 1 });
    }
    this.boomIdx = 0;

    // --- nappes de feu
    this.pools = [];
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(70 * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const flames = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xff7722, size: 0.22, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      flames.frustumCulled = false;
      const light = new THREE.PointLight(0xff6611, 0, 12, 2);
      scene.add(flames); scene.add(light);
      this.pools.push({ flames, light, seeds: new Float32Array(70 * 3), life: 0 });
    }
    this.poolIdx = 0;

    bus.on('shot-visual', (e) => this.onShot(e));
    bus.on('rocket-fired', (e) => this.spawnRocket(e));
    bus.on('rocket-step', (e) => this.stepProjectile(e.id, e.pos, e.dir));
    bus.on('rocket-end', (e) => this.removeProjectile(e.id));
    bus.on('nade-fired', (e) => this.spawnNade(e));
    bus.on('nade-step', (e) => this.stepProjectile(e.id, e.pos, null));
    bus.on('nade-end', (e) => this.removeProjectile(e.id));
    bus.on('explosion', (e) => this.spawnBoom(e));
    bus.on('fire-pool', (e) => this.spawnPool(e));
    bus.on('crate-debris', (e) => this.spawnCrateDebris(e));
    bus.on('crate-holes', (e) => this.spawnCrateHoles(e));
  }

  spawnRocket(e) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 10),
      new THREE.MeshPhongMaterial({ color: 0x3d4a3a, shininess: 50 }));
    body.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 10),
      new THREE.MeshPhongMaterial({ color: 0x8a2020, shininess: 60 }));
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -0.33;
    g.add(body); g.add(nose);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.12, 0.1),
        new THREE.MeshPhongMaterial({ color: 0x222622 }));
      fin.position.z = 0.24;
      fin.position.x = Math.sin((i * Math.PI) / 2) * 0.07;
      fin.position.y = Math.cos((i * Math.PI) / 2) * 0.07;
      fin.rotation.z = (i * Math.PI) / 2;
      g.add(fin);
    }
    const light = new THREE.PointLight(0xff9944, 14, 6, 2);
    g.add(light);
    g.position.set(e.pos.x, e.pos.y, e.pos.z);
    this.scene.add(g);
    this.projectiles.set(e.id, { mesh: g, life: 8 });
  }

  spawnNade(e) {
    const m = new THREE.Mesh(this.nadeGeo, e.kind === 'napalm' ? this.bottleMat : this.nadeMat);
    m.position.set(e.pos.x, e.pos.y, e.pos.z);
    this.scene.add(m);
    this.projectiles.set(e.id, { mesh: m, life: 8 });
  }

  stepProjectile(id, pos, dir) {
    const p = this.projectiles.get(id);
    if (!p) return;
    p.mesh.position.set(pos.x, pos.y, pos.z);
    if (dir) p.mesh.lookAt(pos.x + dir.x, pos.y + dir.y, pos.z + dir.z);
    else p.mesh.rotation.x += 0.25;
  }

  removeProjectile(id) {
    const p = this.projectiles.get(id);
    if (!p) return;
    this.scene.remove(p.mesh);
    p.mesh.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); });
    this.projectiles.delete(id);
  }

  spawnBoom(e) {
    const b = this.booms[this.boomIdx = (this.boomIdx + 1) % this.booms.length];
    b.sphere.visible = true;
    b.sphere.position.set(e.pos.x, e.pos.y, e.pos.z);
    b.light.position.set(e.pos.x, e.pos.y + 0.3, e.pos.z);
    b.light.intensity = 320;
    b.scorch.visible = true;
    b.scorch.position.set(e.pos.x, groundHeight(e.pos.x, e.pos.z) + 0.02, e.pos.z);
    b.scorch.scale.setScalar(e.radius * 0.9);
    b.scorch.material.opacity = 0.85;
    b.radius = e.radius;
    b.life = 0.6;
  }

  spawnPool(e) {
    const p = this.pools[this.poolIdx = (this.poolIdx + 1) % this.pools.length];
    const pos = p.flames.geometry.attributes.position.array;
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 2.4;
      p.seeds[i * 3] = e.pos.x + Math.cos(a) * r;
      p.seeds[i * 3 + 1] = e.pos.y;
      p.seeds[i * 3 + 2] = e.pos.z + Math.sin(a) * r;
      pos[i * 3] = p.seeds[i * 3];
      pos[i * 3 + 1] = p.seeds[i * 3 + 1] + Math.random() * 0.8;
      pos[i * 3 + 2] = p.seeds[i * 3 + 2];
    }
    p.flames.geometry.attributes.position.needsUpdate = true;
    p.flames.material.opacity = 1;
    p.light.position.set(e.pos.x, e.pos.y + 0.7, e.pos.z);
    p.life = 7;
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

  spawnCrateHole(p, dir) {
    const h = this.crateHoles[this.crateHoleIdx = (this.crateHoleIdx + 1) % this.crateHoles.length];
    h.mesh.visible = true;
    h.mesh.position.set(p.x, p.y, p.z);
    const n = new THREE.Vector3(-dir.x, -dir.y, -dir.z).normalize();
    h.mesh.lookAt(h.mesh.position.clone().add(n));
    h.mesh.translateZ(0.006);
    // depthTest désactivé : la trace de sortie reste visible derrière le bois
    h.mesh.material.depthTest = false;
    h.life = 12;
  }

  spawnCrateHoles(e) {
    for (const h of e.holes) this.spawnCrateHole(h.p, h.dir);
  }

  spawnCrateDebris(e) {
    const c = e.pos;
    // puff de poussière à l'explosion de la caisse
    const dt = this.dust[this.dustIdx = (this.dustIdx + 1) % this.dust.length];
    dt.mesh.visible = true;
    dt.mesh.position.set(c.x, c.y, c.z);
    dt.mesh.scale.setScalar(0.3);
    dt.life = 0.5;
    // vol de morceaux de bois
    const n = 20 + (Math.random() * 8) | 0;
    for (let i = 0; i < n; i++) {
      const d = this.debris[this.debrisIdx = (this.debrisIdx + 1) % this.debris.length];
      d.resting = false;
      d.mesh.visible = true;
      d.mesh.position.set(c.x, c.y, c.z);
      const s = 0.4 + Math.random() * 0.9;
      d.mesh.scale.set(s, s * (0.5 + Math.random() * 0.9), s * (0.45 + Math.random() * 0.6));
      const a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 4;
      d.vel.set(Math.cos(a) * sp, 2 + Math.random() * 4.5, Math.sin(a) * sp);
      d.spin.set(Math.random() * 11, Math.random() * 11, Math.random() * 11);
      d.life = 0.55 + Math.random() * 0.45;
    }
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
    for (const d of this.debris) {
      if (d.resting) continue;
      if (d.life > 0) {
        d.life -= dt;
        d.vel.y -= 14 * dt;
        d.mesh.position.addScaledVector(d.vel, dt);
        d.mesh.rotation.x += d.spin.x * dt;
        d.mesh.rotation.y += d.spin.y * dt;
        d.mesh.rotation.z += d.spin.z * dt;
        const gy = groundHeight(d.mesh.position.x, d.mesh.position.z);
        const r = d.mesh.scale.x * 0.05;
        if (d.mesh.position.y < gy + r) {
          d.mesh.position.y = gy + r;
          if (d.vel.y < 0) d.vel.y = -d.vel.y * 0.3;
          d.vel.x *= 0.5; d.vel.z *= 0.5;
          if (Math.abs(d.vel.y) < 0.5) d.vel.set(0, 0, 0);
        }
        if (d.life <= 0) {
          // le morceau pose sur le sol : il reste un débris visible
          d.resting = true;
        }
      }
    }
    for (const d of this.dust) {
      if (d.life > 0) {
        d.life -= dt;
        const t = 1 - d.life / 0.5;
        d.mesh.scale.setScalar(0.3 + t * 1.7);
        d.mesh.material.opacity = 0.5 * (1 - t);
        if (d.life <= 0) d.mesh.visible = false;
      }
    }
    for (const b of this.booms) {
      if (b.life > 0) {
        b.life -= dt;
        const t = 1 - b.life / 0.6;
        b.sphere.scale.setScalar(0.3 + t * b.radius);
        b.sphere.material.opacity = (1 - t) * 0.9;
        b.light.intensity *= 0.82;
        if (b.life <= 0) { b.sphere.visible = false; b.light.intensity = 0; }
      }
      if (b.scorch.visible) {
        b.scorch.material.opacity -= dt * 0.06;
        if (b.scorch.material.opacity <= 0) b.scorch.visible = false;
      }
    }
    for (const p of this.pools) {
      if (p.life > 0) {
        p.life -= dt;
        const pos = p.flames.geometry.attributes.position.array;
        for (let i = 0; i < 70; i++) {
          pos[i * 3 + 1] += dt * (1.2 + (i % 5) * 0.4);
          if (pos[i * 3 + 1] > p.seeds[i * 3 + 1] + 1.6) {
            pos[i * 3 + 1] = p.seeds[i * 3 + 1];
          }
          pos[i * 3] += Math.sin((p.life + i) * 9) * dt * 0.3;
        }
        p.flames.geometry.attributes.position.needsUpdate = true;
        p.flames.material.opacity = Math.min(1, p.life / 1.5) * (0.75 + Math.random() * 0.25);
        p.light.intensity = 30 + Math.random() * 22;
        if (p.life <= 0) { p.flames.material.opacity = 0; p.light.intensity = 0; }
      }
    }
    for (const [id, p] of this.projectiles) {
      p.life -= dt;
      if (p.life <= 0) this.removeProjectile(id);
    }
  }

  clear() {
    for (const h of this.holes) { h.life = 0; h.mesh.visible = false; }
    for (const t of this.tracers) t.life = 0;
    for (const b of this.bloods) b.life = 0;
    for (const s of this.shells) { s.life = 0; s.mesh.visible = false; }
    for (const b of this.booms) { b.life = 0; b.sphere.visible = false; b.scorch.visible = false; b.light.intensity = 0; }
    for (const p of this.pools) { p.life = 0; p.flames.material.opacity = 0; p.light.intensity = 0; }
    for (const d of this.debris) { d.life = 0; d.resting = false; d.mesh.visible = false; }
    for (const d of this.dust) { d.life = 0; d.mesh.visible = false; }
    for (const h of this.crateHoles) { h.life = 0; h.mesh.visible = false; }
    for (const [id] of this.projectiles) this.removeProjectile(id);
  }
}
