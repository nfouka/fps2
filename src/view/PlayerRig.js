import * as THREE from 'three';
import { flashTexture, gunWoodTexture } from '../core/Procedural.js';

const metal = (c = 0x2b2e33) => new THREE.MeshLambertMaterial({ color: c });
const wood = () => new THREE.MeshLambertMaterial({ color: 0x5d4224 });

let woodTex = null;
const pbrWood = () => {
  if (!woodTex) {
    woodTex = new THREE.CanvasTexture(gunWoodTexture());
    woodTex.colorSpace = THREE.SRGBColorSpace;
    woodTex.anisotropy = 4;
  }
  return new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.55, metalness: 0.05 });
};
const steel = (c = 0x2e3238, rough = 0.45, m = 0.75) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: m });

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
  const wm = pbrWood();

  // --- Boîte de culasse (tôle emboutie) ---
  part(g, new THREE.BoxGeometry(0.075, 0.11, 0.34), steel(), 0, 0, 0.02);
  part(g, new THREE.BoxGeometry(0.004, 0.055, 0.15), steel(0x23262b), 0.038, -0.012, 0.03);
  part(g, new THREE.BoxGeometry(0.004, 0.055, 0.15), steel(0x23262b), -0.038, -0.012, 0.03);
  part(g, new THREE.BoxGeometry(0.05, 0.025, 0.30), steel(0x33373d), 0, 0.062, 0.02);
  part(g, new THREE.BoxGeometry(0.022, 0.026, 0.055), steel(0x3a3f45, 0.35, 0.85), 0.05, 0.045, -0.05); // armement
  part(g, new THREE.BoxGeometry(0.007, 0.022, 0.13), steel(0x3a3f45, 0.35, 0.85), 0.043, 0.012, 0.04, 0, 0.12); // sûreté
  part(g, new THREE.BoxGeometry(0.034, 0.022, 0.03), steel(0x23262b), 0, 0.082, -0.105); // hausse

  // --- chargeur "banane" courbé ---
  const mag = steel(0x2a2d33, 0.5, 0.7);
  part(g, new THREE.BoxGeometry(0.048, 0.12, 0.095), mag, 0, -0.135, -0.075, 0.16);
  part(g, new THREE.BoxGeometry(0.048, 0.12, 0.09), mag, 0, -0.245, -0.125, 0.42);
  part(g, new THREE.BoxGeometry(0.046, 0.11, 0.085), mag, 0, -0.34, -0.205, 0.7);
  part(g, new THREE.BoxGeometry(0.055, 0.035, 0.105), steel(0x23262b), 0, -0.075, -0.075);

  // --- Pistolet + détente ---
  part(g, new THREE.BoxGeometry(0.048, 0.155, 0.062), wm, 0, -0.125, 0.115, -0.32);
  part(g, new THREE.BoxGeometry(0.012, 0.04, 0.014), steel(0x1a1d21, 0.4, 0.8), 0, -0.065, -0.028, 0.15);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.006, 6, 14), steel(0x23262b, 0.45, 0.75));
  guard.position.set(0, -0.055, -0.03);
  guard.rotation.y = Math.PI / 2;
  guard.scale.set(1.25, 1.15, 1);
  g.add(guard);

  // --- Canon + tube de gaz + bloc gaz ---
  part(g, new THREE.CylinderGeometry(0.017, 0.017, 0.46, 12), steel(0x1c1f23, 0.35, 0.85), 0, 0.025, -0.44, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.013, 0.013, 0.34, 10), steel(0x2a2e33, 0.4, 0.8), 0, 0.078, -0.32, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.032, 0.07, 0.045), steel(0x23262b), 0, 0.055, -0.475);

  // --- Garde-main bois nervuré ---
  part(g, new THREE.BoxGeometry(0.058, 0.05, 0.20), wm, 0, 0.052, -0.24);
  for (let i = 0; i < 5; i++) part(g, new THREE.BoxGeometry(0.063, 0.054, 0.012), wm, 0, 0.052, -0.155 - i * 0.042);
  part(g, new THREE.BoxGeometry(0.062, 0.055, 0.17), wm, 0, -0.022, -0.20);

  // --- Bandage + guidon protégé ---
  part(g, new THREE.CylinderGeometry(0.022, 0.022, 0.035, 12), steel(0x2a2e33, 0.4, 0.8), 0, 0.025, -0.60, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.03, 0.075, 0.035), steel(0x23262b), 0, 0.035, -0.635);
  part(g, new THREE.BoxGeometry(0.006, 0.03, 0.006), steel(0x111111, 0.3, 0.9), 0, 0.095, -0.635);
  part(g, new THREE.BoxGeometry(0.022, 0.006, 0.012), steel(0x23262b), 0, 0.112, -0.635);
  part(g, new THREE.BoxGeometry(0.005, 0.03, 0.012), steel(0x23262b), 0.011, 0.098, -0.635);
  part(g, new THREE.BoxGeometry(0.005, 0.03, 0.012), steel(0x23262b), -0.011, 0.098, -0.635);

  // --- Frein de bouche (compensateur) ---
  part(g, new THREE.CylinderGeometry(0.021, 0.016, 0.075, 10), steel(0x1c1f23, 0.35, 0.85), 0, 0.025, -0.755, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.02, 0.014, 0.03), steel(0x1c1f23, 0.35, 0.85), 0.013, 0.04, -0.745, 0, 0.5);

  // --- Crosse bois ---
  part(g, new THREE.BoxGeometry(0.055, 0.105, 0.30), wm, 0, -0.045, 0.33, 0.14);
  part(g, new THREE.BoxGeometry(0.05, 0.135, 0.028), steel(0x17191c, 0.6, 0.3), 0, -0.068, 0.475, 0.14);

  g.userData.muzzle = new THREE.Vector3(0, 0.025, -0.8);
  return g;
}

function buildMinigun() {
  const g = new THREE.Group();
  // carter / boîte de transmission
  part(g, new THREE.CylinderGeometry(0.06, 0.06, 0.3, 14), steel(0x23262b, 0.4, 0.8), 0, 0.02, -0.05, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.055, 0.055, 0.05, 14), steel(0x1b1e22, 0.35, 0.85), 0, 0.02, -0.22, Math.PI / 2);
  // groupe de 6 canons (entraîné à la rotation)
  const bg = new THREE.Group();
  bg.name = 'barrels';
  bg.position.set(0, 0.02, -0.5);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.52, 8), steel(0x15181c, 0.3, 0.9));
    b.position.set(Math.sin(a) * 0.033, Math.cos(a) * 0.033, 0);
    b.rotation.x = Math.PI / 2;
    bg.add(b);
  }
  g.add(bg);
  // moteur + goulotte
  part(g, new THREE.BoxGeometry(0.08, 0.09, 0.18), steel(0x2a2e33, 0.45, 0.75), 0, -0.06, 0.02);
  part(g, new THREE.BoxGeometry(0.035, 0.09, 0.14), steel(0x1b1e22), 0, -0.08, 0.1);
  // caisse de munitions
  part(g, new THREE.BoxGeometry(0.13, 0.15, 0.22), steel(0x2f3a2c, 0.6, 0.3), 0.01, -0.17, 0.26);
  part(g, new THREE.BoxGeometry(0.135, 0.02, 0.225), steel(0x232b22, 0.6, 0.3), 0.01, -0.095, 0.26);
  // poignée pistolet
  part(g, new THREE.BoxGeometry(0.05, 0.15, 0.06), steel(0x1a1d21, 0.55, 0.5), 0, -0.125, 0.02, -0.3);
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
      minigun: buildMinigun(),
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
    this.spin = 0;
    this.barrels = this.models.minigun.getObjectByName('barrels');

    bus.on('shot', (e) => {
      this.kickVel += (e.recoil || 1) * 2.4;
      this.flashT = 0.045;
      if (this.current === 'minigun') this.spin = Math.min(55, this.spin + 14);
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

    if (this.barrels) {
      this.barrels.rotation.z += this.spin * dt;
      this.spin = Math.max(0, this.spin - 18 * dt);
    }

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
