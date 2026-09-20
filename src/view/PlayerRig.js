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
  // --- Canon seul + tube de munitions (chargeur tubulaire) ---
  part(g, new THREE.CylinderGeometry(0.02, 0.02, 0.62, 12), steel(0x1c1f23, 0.35, 0.85), 0, 0.03, -0.42, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.028, 0.028, 0.6, 12), steel(0x26292e, 0.4, 0.8), 0, -0.01, -0.42, Math.PI / 2);
  // --- Garde-main pompe (crosse coulissante en bois) ---
  part(g, new THREE.BoxGeometry(0.06, 0.06, 0.24), pbrWood(), 0, -0.01, -0.52);
  for (let i = 0; i < 4; i++) part(g, new THREE.BoxGeometry(0.066, 0.066, 0.012), pbrWood(), 0, -0.01, -0.6 - i * 0.05);
  // --- Receiver (corps) ---
  part(g, new THREE.BoxGeometry(0.07, 0.09, 0.24), steel(0x2a2e33, 0.45, 0.8), 0, 0.01, -0.06);
  part(g, new THREE.BoxGeometry(0.066, 0.03, 0.24), steel(0x1a1d21, 0.5, 0.7), 0, 0.05, -0.06);
  // verrou / culasse arrière
  part(g, new THREE.BoxGeometry(0.05, 0.07, 0.04), steel(0x15171a, 0.45, 0.8), 0, 0.01, 0.1);
  // --- Levier de pompe rivets ---
  part(g, new THREE.BoxGeometry(0.06, 0.02, 0.02), steel(0x33373d, 0.4, 0.8), 0, -0.045, -0.52);
  // --- Garde-de-trigger + levier de déclenchement ---
  const tg = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.005, 6, 12), steel(0x23262b, 0.45, 0.75));
  tg.position.set(0, -0.04, 0.06); tg.rotation.y = Math.PI / 2; g.add(tg);
  part(g, new THREE.BoxGeometry(0.012, 0.03, 0.014), steel(0x111314, 0.4, 0.8), 0, -0.05, 0.055);
  // --- Crosse à pistolet (bois) ---
  part(g, new THREE.BoxGeometry(0.058, 0.1, 0.28), pbrWood(), 0, -0.05, 0.24, 0.12);
  part(g, new THREE.BoxGeometry(0.054, 0.13, 0.03), steel(0x17191c, 0.6, 0.3), 0, -0.07, 0.38, 0.12);
  part(g, new THREE.BoxGeometry(0.05, 0.09, 0.06), pbrWood(), 0, -0.1, 0.1, -0.1);
  // --- Vues ---
  part(g, new THREE.BoxGeometry(0.024, 0.03, 0.024), steel(0x23262b), 0, 0.04, -0.66);
  part(g, new THREE.BoxGeometry(0.006, 0.024, 0.006), steel(0x111111, 0.3, 0.9), 0, 0.055, -0.68);
  g.userData.muzzle = new THREE.Vector3(0, 0.03, -0.74);
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

  // --- Boîte de culasse emboutie (style AKM) ---
  part(g, new THREE.BoxGeometry(0.076, 0.105, 0.36), steel(0x26292e, 0.4, 0.82), 0, 0.005, 0.02);
  // couvre-culse (dust cover) légèrement bombé
  part(g, new THREE.BoxGeometry(0.072, 0.02, 0.34), steel(0x2f3338, 0.42, 0.8), 0, 0.058, 0.02);
  part(g, new THREE.BoxGeometry(0.05, 0.028, 0.3), steel(0x33373d, 0.4, 0.8), 0, 0.07, 0.02);
  // évents de évacuation sur le carter
  for (let i = 0; i < 3; i++) part(g, new THREE.BoxGeometry(0.03, 0.008, 0.012), steel(0x14161a, 0.5, 0.7), 0.02, 0.064, -0.02 - i * 0.08);

  // --- Levier de sélection / sûreté (drapeau) ---
  part(g, new THREE.BoxGeometry(0.02, 0.045, 0.014), steel(0x3a3f45, 0.35, 0.85), 0.045, 0.04, 0.14, 0, 0.35);
  part(g, new THREE.BoxGeometry(0.024, 0.024, 0.016), steel(0x3a3f45, 0.35, 0.85), 0.05, 0.055, 0.15);

  // --- Repère de pointage arrière (hausse AK) ---
  part(g, new THREE.BoxGeometry(0.034, 0.03, 0.016), steel(0x23262b), 0, 0.085, -0.15);
  part(g, new THREE.BoxGeometry(0.02, 0.012, 0.02), steel(0x1c1f23), 0, 0.095, -0.15);

  // --- Chargeur "banane" courbé emblématique ---
  const mag = steel(0x2a2d33, 0.5, 0.7);
  part(g, new THREE.BoxGeometry(0.05, 0.13, 0.1), mag, 0, -0.13, -0.06, 0.18);
  part(g, new THREE.BoxGeometry(0.05, 0.13, 0.095), mag, 0, -0.25, -0.12, 0.5);
  part(g, new THREE.BoxGeometry(0.048, 0.11, 0.09), mag, 0, -0.34, -0.2, 0.78);
  part(g, new THREE.BoxGeometry(0.058, 0.04, 0.11), steel(0x23262b), 0, -0.08, -0.06, 0.16);

  // --- Pistolet + détente (crosse pistolet bois) ---
  part(g, new THREE.BoxGeometry(0.05, 0.16, 0.066), wm, 0, -0.125, 0.12, -0.3);
  part(g, new THREE.BoxGeometry(0.013, 0.042, 0.015), steel(0x1a1d21, 0.4, 0.8), 0, -0.06, -0.028, 0.15);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.007, 6, 14), steel(0x23262b, 0.45, 0.75));
  guard.position.set(0, -0.056, -0.032);
  guard.rotation.y = Math.PI / 2;
  guard.scale.set(1.2, 1.1, 1);
  g.add(guard);

  // --- Canon + tube de gaz + bloc gaz ---
  part(g, new THREE.CylinderGeometry(0.018, 0.018, 0.5, 12), steel(0x1c1f23, 0.35, 0.85), 0, 0.028, -0.46, Math.PI / 2);
  // tube de gaz au-dessus du canon
  part(g, new THREE.CylinderGeometry(0.012, 0.012, 0.36, 10), steel(0x2a2e33, 0.4, 0.8), 0, 0.082, -0.34, Math.PI / 2);
  // bloc de gaz
  part(g, new THREE.BoxGeometry(0.034, 0.05, 0.05), steel(0x23262b), 0, 0.06, -0.5);

  // --- Garde-main bois pièce (2 parties) nervuré ---
  part(g, new THREE.BoxGeometry(0.06, 0.055, 0.14), wm, 0, 0.055, -0.34);
  part(g, new THREE.BoxGeometry(0.06, 0.055, 0.14), wm, 0, 0.055, -0.16);
  for (let i = 0; i < 3; i++) {
    part(g, new THREE.BoxGeometry(0.065, 0.059, 0.01), wm, 0, 0.055, -0.38 - i * 0.14);
    part(g, new THREE.BoxGeometry(0.065, 0.059, 0.01), wm, 0, 0.055, -0.2 - i * 0.14);
  }

  // --- Bandage + guidon protégé ---
  part(g, new THREE.CylinderGeometry(0.023, 0.023, 0.036, 12), steel(0x2a2e33, 0.4, 0.8), 0, 0.028, -0.64, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.032, 0.08, 0.036), steel(0x23262b), 0, 0.036, -0.67);
  part(g, new THREE.BoxGeometry(0.007, 0.032, 0.012), steel(0x111111, 0.3, 0.9), 0, 0.1, -0.67);

  // --- Frein de bouche incliné (slant brake) ---
  part(g, new THREE.CylinderGeometry(0.023, 0.018, 0.09, 10), steel(0x1c1f23, 0.35, 0.85), 0, 0.028, -0.78, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.024, 0.016, 0.034), steel(0x1c1f23, 0.35, 0.85), 0.014, 0.042, -0.77, 0, 0.5);

  // --- Crosse bois inclinée (tôle bois tressé, fissure) ---
  part(g, new THREE.BoxGeometry(0.058, 0.11, 0.32), wm, 0, -0.045, 0.34, 0.16);
  part(g, new THREE.BoxGeometry(0.054, 0.14, 0.03), steel(0x17191c, 0.6, 0.3), 0, -0.07, 0.49, 0.16);
  part(g, new THREE.BoxGeometry(0.004, 0.1, 0.004), steel(0x3a2a14, 0.7), 0.01, -0.03, 0.36, 0.16);

  g.userData.muzzle = new THREE.Vector3(0, 0.028, -0.83);
  return g;
}

function buildMinigun() {
  const g = new THREE.Group();
  // cône avant massif (carter du groupe canons)
  part(g, new THREE.CylinderGeometry(0.078, 0.1, 0.18, 18), steel(0x26292e, 0.35, 0.85), 0, 0.01, -0.14, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.045, 0.078, 0.11, 18), steel(0x1a1d21, 0.4, 0.8), 0, 0.01, -0.27, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.028, 0.028, 0.05, 12), steel(0x111314, 0.4, 0.85), 0, 0.01, -0.35, Math.PI / 2);
  // groupe de 12 canons lourds (entraîné à la rotation)
  const bg = new THREE.Group();
  bg.name = 'barrels';
  bg.position.set(0, 0.01, -0.5);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.82, 10), steel(0x15181c, 0.3, 0.9));
    b.position.set(Math.sin(a) * 0.064, Math.cos(a) * 0.064, 0);
    b.rotation.x = Math.PI / 2;
    bg.add(b);
    for (let i = 0; i < 7; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0185, 0.003, 6, 12), steel(0x22262b, 0.4, 0.8));
      ring.position.set(Math.sin(a) * 0.064, Math.cos(a) * 0.064, -0.12 - i * 0.1);
      ring.rotation.y = Math.PI / 2;
      bg.add(ring);
    }
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8), steel(0x1b1e22, 0.4, 0.8));
  hub.rotation.x = Math.PI / 2; hub.position.set(0, 0.01, -0.5); bg.add(hub);
  // frein de bouche collectif
  part(bg, new THREE.CylinderGeometry(0.09, 0.08, 0.07, 12), steel(0x191c20, 0.35, 0.85), 0, 0.01, -0.4, Math.PI / 2);
  g.add(bg);
  // boîte de transmission / carter arrière
  part(g, new THREE.CylinderGeometry(0.074, 0.074, 0.24, 16), steel(0x2a2e33, 0.45, 0.8), 0, 0.01, 0.02, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.16, 0.17, 0.22), steel(0x23262b, 0.5, 0.7), 0, -0.01, 0.06);
  for (let i = 0; i < 4; i++) part(g, new THREE.BoxGeometry(0.162, 0.012, 0.222), steel(0x1c1f23, 0.45, 0.8), 0, 0.045 + i * 0.032, 0.06);
  // moteur arrière massif
  part(g, new THREE.BoxGeometry(0.105, 0.13, 0.17), steel(0x1a1d21, 0.5, 0.6), 0, -0.045, 0.21);
  part(g, new THREE.BoxGeometry(0.092, 0.055, 0.045), steel(0x111314, 0.45, 0.8), 0, 0.025, 0.3);
  // goulotte d'alimentation par ceinture
  part(g, new THREE.BoxGeometry(0.055, 0.05, 0.3), steel(0x2f3a2c, 0.55, 0.35), 0.065, 0.095, -0.02, 0.15);
  part(g, new THREE.BoxGeometry(0.06, 0.032, 0.13), steel(0x232b22, 0.6, 0.3), 0.065, 0.13, -0.15);
  // caisse de munitions lourde
  part(g, new THREE.BoxGeometry(0.16, 0.19, 0.27), steel(0x2f3a2c, 0.6, 0.3), 0.01, -0.2, 0.3);
  part(g, new THREE.BoxGeometry(0.166, 0.028, 0.276), steel(0x232b22, 0.6, 0.3), 0.01, -0.105, 0.3);
  part(g, new THREE.BoxGeometry(0.045, 0.045, 0.045), steel(0x111314, 0.5, 0.7), 0.095, -0.16, 0.43);
  // poignée + yoke
  part(g, new THREE.BoxGeometry(0.058, 0.18, 0.068), steel(0x1a1d21, 0.55, 0.5), 0, -0.15, 0.04, -0.28);
  part(g, new THREE.BoxGeometry(0.064, 0.064, 0.074), steel(0x23262b, 0.5, 0.7), 0, -0.065, 0.06, -0.13);
  g.userData.muzzle = new THREE.Vector3(0, 0.01, -0.9);
  return g;
}

function buildBazooka() {
  const g = new THREE.Group();
  // --- Tube de lancement (section avant + arrière) ---
  part(g, new THREE.CylinderGeometry(0.058, 0.058, 0.62, 12), metal(0x3a4238), 0, 0, -0.4, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.072, 0.064, 0.34, 12), metal(0x2f362c), 0, 0, 0.12, Math.PI / 2);
  // renforts / entretoises du tube
  for (let i = 0; i < 3; i++) part(g, new THREE.CylinderGeometry(0.062, 0.062, 0.02, 12), metal(0x2b2e33), 0, 0, -0.6 + i * 0.22, Math.PI / 2);
  // --- Tête de munition (charge creuse) ---
  part(g, new THREE.CylinderGeometry(0.032, 0.058, 0.16, 12), metal(0x4a5246), 0, 0, -0.74, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.018, 0.032, 0.1, 10), metal(0x3a4238), 0, 0, -0.86, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.008, 0.014, 0.06, 8), steel(0x1c1f23, 0.4, 0.85), 0, 0, -0.94, Math.PI / 2);
  // pointes de centrage avant de la munition
  part(g, new THREE.BoxGeometry(0.02, 0.02, 0.05), metal(0x2b2e33), 0.02, 0.02, -0.93);
  part(g, new THREE.BoxGeometry(0.02, 0.02, 0.05), metal(0x2b2e33), -0.02, -0.02, -0.93);
  // --- Moteur / tuyère à l'arrière (cloche d'échappement) ---
  part(g, new THREE.CylinderGeometry(0.075, 0.045, 0.2, 12), metal(0x2b2e33), 0, 0, 0.32, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.06, 0.075, 0.08, 12), metal(0x222622), 0, 0, 0.22, Math.PI / 2);
  part(g, new THREE.CylinderGeometry(0.03, 0.045, 0.06, 10), metal(0x1a1d21), 0, 0, 0.42, Math.PI / 2);
  // --- Vues (monoculaire / PSHO) ---
  part(g, new THREE.BoxGeometry(0.03, 0.045, 0.05), metal(0x1a1d21, 0.5, 0.6), 0, 0.065, -0.15);
  part(g, new THREE.CylinderGeometry(0.014, 0.014, 0.03, 8), steel(0x111314, 0.4, 0.85), 0, 0.085, -0.15, Math.PI / 2);
  part(g, new THREE.BoxGeometry(0.024, 0.03, 0.024), metal(0x111314), 0, 0.02, -0.15);
  // --- Poignées (avant + arrière) ---
  part(g, new THREE.BoxGeometry(0.028, 0.1, 0.04), metal(0x1a1d21), 0, -0.09, -0.3, 0.2);
  part(g, new THREE.BoxGeometry(0.026, 0.11, 0.036), metal(0x1a1d21), 0, -0.09, 0.02, -0.15);
  part(g, new THREE.BoxGeometry(0.03, 0.04, 0.05), metal(0x111), 0, -0.1, 0.02, -0.15);
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
