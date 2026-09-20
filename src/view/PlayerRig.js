import * as THREE from 'three';
import { flashTexture } from '../core/Procedural.js';

const metal = (c = 0x2b2e33) => new THREE.MeshLambertMaterial({ color: c });
const wood = () => new THREE.MeshLambertMaterial({ color: 0x5d4224 });

function part(g, geo, mat, x, y, z, rx = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.x = rx; m.rotation.z = rz;
  g.add(m);
  return m;
}

function buildPistol() {
  const g = new THREE.Group();
  part(g, new THREE.BoxGeometry(0.07, 0.1, 0.34), metal(), 0, 0.02, -0.14);
  part(g, new THREE.BoxGeometry(0.06, 0.16, 0.08), metal(0x1e2126), 0, -0.1, -0.02, 0.35);
  part(g, new THREE.BoxGeometry(0.03, 0.03, 0.16), metal(0x111), 0, 0.02, -0.36);
  g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.46);
  return g;
}

function buildCarbine() {
  const g = new THREE.Group();
  part(g, new THREE.BoxGeometry(0.08, 0.11, 0.62), metal(0x23262b), 0, 0, -0.2);
  part(g, new THREE.BoxGeometry(0.05, 0.05, 0.3), metal(0x111), 0, 0.01, -0.62);
  part(g, new THREE.BoxGeometry(0.05, 0.2, 0.09), metal(0x1a1d21), 0, -0.14, -0.05, 0.12);
  part(g, new THREE.BoxGeometry(0.05, 0.06, 0.1), metal(0x1a1d21), 0, -0.09, 0.06);
  part(g, new THREE.BoxGeometry(0.06, 0.1, 0.26), wood(), 0, -0.02, 0.24);
  part(g, new THREE.BoxGeometry(0.04, 0.06, 0.16), metal(0x33373d), 0, 0.09, -0.16);
  g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.79);
  return g;
}

function buildShotgun() {
  const g = new THREE.Group();
  part(g, new THREE.BoxGeometry(0.08, 0.1, 0.5), wood(), 0, 0, -0.1);
  part(g, new THREE.BoxGeometry(0.05, 0.05, 0.5), metal(0x141619), 0, 0.045, -0.42);
  part(g, new THREE.BoxGeometry(0.05, 0.05, 0.42), metal(0x141619), 0, -0.02, -0.36);
  part(g, new THREE.BoxGeometry(0.07, 0.07, 0.16), wood(), 0, -0.02, -0.34);
  part(g, new THREE.BoxGeometry(0.06, 0.12, 0.24), wood(), 0, -0.03, 0.26, 0.25);
  g.userData.muzzle = new THREE.Vector3(0, 0.045, -0.68);
  return g;
}

function buildSaw() {
  const g = new THREE.Group();
  part(g, new THREE.BoxGeometry(0.11, 0.14, 0.7), metal(0x2f3338), 0, 0, -0.22);
  part(g, new THREE.BoxGeometry(0.05, 0.05, 0.42), metal(0x15171a), 0, 0.02, -0.72);
  part(g, new THREE.BoxGeometry(0.16, 0.22, 0.24), metal(0x3a3f2e), 0, -0.16, -0.12); // caisse munitions
  part(g, new THREE.BoxGeometry(0.05, 0.12, 0.1), metal(0x1a1d21), 0, -0.1, 0.08);
  part(g, new THREE.BoxGeometry(0.07, 0.11, 0.3), metal(0x23262b), 0, -0.02, 0.28);
  part(g, new THREE.BoxGeometry(0.02, 0.16, 0.02), metal(0x111), -0.05, 0.09, -0.5); // lance-chausse-trapes
  // bipod
  part(g, new THREE.BoxGeometry(0.02, 0.16, 0.02), metal(0x111), 0, -0.12, -0.6, 0.5, 0.4);
  part(g, new THREE.BoxGeometry(0.02, 0.16, 0.02), metal(0x111), 0, -0.12, -0.6, 0.5, -0.4);
  g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.95);
  return g;
}

function buildAk47() {
  const g = new THREE.Group();
  part(g, new THREE.BoxGeometry(0.08, 0.12, 0.5), metal(0x26292e), 0, 0, -0.18);
  part(g, new THREE.BoxGeometry(0.05, 0.05, 0.36), metal(0x111), 0, 0.02, -0.6);
  part(g, new THREE.BoxGeometry(0.05, 0.22, 0.1), metal(0x1a1d21), 0, -0.16, -0.02, -0.25);
  part(g, new THREE.BoxGeometry(0.05, 0.06, 0.1), metal(0x1a1d21), 0, -0.09, 0.08);
  part(g, new THREE.BoxGeometry(0.07, 0.11, 0.28), wood(), 0, -0.01, 0.26);
  part(g, new THREE.BoxGeometry(0.04, 0.05, 0.14), wood(), 0, 0.0, -0.44);
  part(g, new THREE.BoxGeometry(0.02, 0.06, 0.02), metal(0x33373d), 0, 0.1, -0.74);
  g.userData.muzzle = new THREE.Vector3(0, 0.02, -0.8);
  return g;
}

function buildBazooka() {
  const g = new THREE.Group();
  part(g, new THREE.CylinderGeometry(0.06, 0.06, 1.1, 10), metal(0x3a4238), 0, 0, -0.25, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.075, 0.06, 0.3, 10), metal(0x2b2e33), 0, 0, 0.4, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.045, 0.06, 0.2, 10), metal(0x222622), 0, 0, -0.85, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.05, 0.14, 0.08), metal(0x1a1d21), 0, -0.12, -0.05);
  part(g, new THREE.BoxGeometry(0.03, 0.1, 0.04), metal(0x111), 0, 0.09, -0.35);
  part(g, new THREE.BoxGeometry(0.03, 0.1, 0.04), metal(0x111), 0, 0.09, 0.15);
  g.userData.muzzle = new THREE.Vector3(0, 0, -0.97);
  return g;
}

export class PlayerRig {
  constructor(camera, bus) {
    this.group = new THREE.Group();
    camera.add(this.group);
    this.basePos = new THREE.Vector3(0.3, -0.27, -0.55);

    this.models = {
      pistol: buildPistol(),
      ak47: buildAk47(),
      carbine: buildCarbine(),
      shotgun: buildShotgun(),
      saw: buildSaw(),
      bazooka: buildBazooka(),
    };
    for (const k in this.models) {
      this.models[k].visible = k === 'carbine';
      this.group.add(this.models[k]);
    }

    const flashTex = new THREE.CanvasTexture(flashTexture());
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({
      map: flashTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    }));
    this.flash.scale.set(0.38, 0.38, 0.38);
    this.flash.visible = false;
    this.group.add(this.flash);

    this.flashLight = new THREE.PointLight(0xffc36a, 0, 10, 2);
    this.group.add(this.flashLight);

    this.current = 'carbine';
    this.kick = 0;
    this.kickVel = 0;
    this.flashT = 0;

    bus.on('shot', (e) => {
      this.kickVel += (e.recoil || 1) * 2.4;
      this.flashT = 0.045;
      const w = this.models[this.current] || this.models.carbine;
      this.flash.position.copy(w.userData.muzzle);
      this.flashLight.position.copy(w.userData.muzzle);
      const s = 0.3 + Math.random() * 0.25 + (this.current === 'shotgun' ? 0.25 : 0) + (this.current === 'saw' ? 0.12 : 0);
      this.flash.scale.set(s, s, s);
      this.flash.material.rotation = Math.random() * Math.PI;
      this.flashLight.intensity = 90;
    });

    bus.on('weapon-switched', (e) => {
      for (const k in this.models) this.models[k].visible = k === e.weapon.id;
      this.current = e.weapon.id;
    });
  }

  update(dt, state) {
    const p = state.player;
    // ressort de recul local
    const stiff = 130, damp = 14;
    this.kickVel += (-stiff * this.kick - damp * this.kickVel) * dt;
    this.kick += this.kickVel * dt;

    const bobX = Math.sin(p.bobPhase) * 0.012;
    const bobY = Math.abs(Math.sin(p.bobPhase)) * (p.moving ? 0.016 : 0.004);

    this.group.position.set(
      this.basePos.x + bobX,
      this.basePos.y + bobY,
      this.basePos.z + this.kick * 0.06
    );
    this.group.rotation.x = this.kick * 0.12;
    this.group.rotation.z = Math.sin(p.bobPhase * 0.5) * 0.006;

    if (this.flashT > 0) {
      this.flashT -= dt;
      this.flash.visible = true;
      this.flashLight.intensity *= 0.72;
    } else {
      this.flash.visible = false;
      this.flashLight.intensity = 0;
    }
  }
}
