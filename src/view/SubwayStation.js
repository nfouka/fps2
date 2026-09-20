import * as THREE from 'three';
import { textures, exitSignTexture } from '../core/Procedural.js';

const box = (cx, cy, cz, sx, sy, sz) => ({
  min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 },
  max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 },
});

export function groundHeight(x, z) {
  const az = Math.abs(z), ax = Math.abs(x);
  // escalier de l'issue de secours (coin NE)
  if (x >= 26 && x <= 30 && z >= 2.0 && z <= 4.4) {
    return Math.min(1.6, Math.max(0, (x - 26) * 0.4));
  }
  if (az <= 5 && ax <= 30) return 0;
  if (az > 5 && az <= 11) {
    if (ax >= 26 && ax <= 30) return -1.4 * (ax - 26) / 4;
    return -1.4;
  }
  return -1.4;
}

export function buildStation(scene, bus) {
  const collidables = []; // pour les tirs
  const blockers = [];    // pour le joueur
  const g = new THREE.Group();
  scene.add(g);

  const matFloor = new THREE.MeshLambertMaterial({ map: textures.tileFloor() });
  const matWall = new THREE.MeshLambertMaterial({ map: textures.tileWall() });
  const matPillar = new THREE.MeshLambertMaterial({ map: textures.tilePillar() });
  const matConcrete = new THREE.MeshLambertMaterial({ map: textures.concrete() });
  const matCeil = new THREE.MeshLambertMaterial({ map: textures.concreteCeil() });
  const matBallast = new THREE.MeshLambertMaterial({ map: textures.ballast() });
  const matMetal = new THREE.MeshLambertMaterial({ map: textures.metal() });
  const matStripe = new THREE.MeshLambertMaterial({ map: textures.stripe() });
  const matDark = new THREE.MeshLambertMaterial({ color: 0x14161a });

  const add = (geo, mat, x, y, z, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.x = rx; m.rotation.z = rz;
    g.add(m);
    return m;
  };

  // ---- Quai central
  add(new THREE.BoxGeometry(60, 0.2, 10), matFloor, 0, -0.1, 0);
  collidables.push(box(0, -0.1, 0, 60, 0.2, 10));

  // Ligne de sécurité jaune
  add(new THREE.BoxGeometry(60, 0.02, 0.45), matStripe, 0, 0.012, 4.2);
  add(new THREE.BoxGeometry(60, 0.02, 0.45), matStripe, 0, 0.012, -4.2);

  // ---- Voies (deux)
  const ang = Math.atan2(1.4, 4);
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(60, 0.2, 6), matBallast, 0, -1.5, s * 8);
    collidables.push(box(0, -1.5, s * 8, 60, 0.2, 6));
    // rails
    for (const r of [-0.75, 0.75]) {
      add(new THREE.BoxGeometry(60, 0.07, 0.07), matMetal, 0, -1.33, s * 8 + r * 2.5);
    }
    // mur extérieur
    add(new THREE.BoxGeometry(60.4, 4.6, 0.4), matWall, 0, 0.7, s * 11.2);
    collidables.push(box(0, 0.7, s * 11.2, 60.4, 4.6, 0.4));
  }
  // rampe d'accès service aux 4 coins (les zombies remontent par là)
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    add(new THREE.BoxGeometry(4.25, 0.18, 6), matConcrete, sx * 28, -0.7, sz * 8, 0, sx === 1 ? -ang : ang);
  }

  // ---- Murs de fond aux extrémités (avec bouches de tunnel)
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(0.4, 3.4, 10.4), matWall, s * 30.2, 1.5, 0);
    collidables.push(box(s * 30.2, 1.5, 0, 0.4, 3.4, 10.4));
    // portions de mur autour de l'ouverture du tunnel (z entre 6 et 10)
    for (const t of [1, -1]) {
      add(new THREE.BoxGeometry(0.4, 4.2, 1.4), matWall, s * 30.2, 0.7, t * 5.3);
      add(new THREE.BoxGeometry(0.4, 4.2, 1.4), matWall, s * 30.2, 0.7, t * 10.3);
      collidables.push(box(s * 30.2, 0.7, t * 5.3, 0.4, 4.2, 1.4));
      collidables.push(box(s * 30.2, 0.7, t * 10.3, 0.4, 4.2, 1.4));
    }
    // linteau au-dessus des bouches de tunnel
    for (const t of [1, -1]) {
      add(new THREE.BoxGeometry(0.4, 1.4, 4.4), matWall, s * 30.2, 1.9, t * 8);
      collidables.push(box(s * 30.2, 1.9, t * 8, 0.4, 1.4, 4.4));
    }
  }

  // ---- Tunnels sombres
  for (const s of [1, -1]) {
    for (const t of [1, -1]) {
      const zc = t * 8;
      add(new THREE.BoxGeometry(20, 0.2, 4.4), matDark, s * 40, -1.5, zc);
      collidables.push(box(s * 40, -1.5, zc, 20, 0.2, 4.4));
      add(new THREE.BoxGeometry(20, 2.8, 0.3), matDark, s * 40, 0, zc + t * 2.15);
      collidables.push(box(s * 40, 0, zc + t * 2.15, 20, 2.8, 0.3));
      add(new THREE.BoxGeometry(20, 2.8, 0.3), matDark, s * 40, 0, zc - t * 2.15);
      collidables.push(box(s * 40, 0, zc - t * 2.15, 20, 2.8, 0.3));
      add(new THREE.BoxGeometry(20, 0.3, 4.6), matDark, s * 40, 1.35, zc);
      collidables.push(box(s * 40, 1.35, zc, 20, 0.3, 4.6));
      add(new THREE.BoxGeometry(0.4, 3, 4.6), matDark, s * 50, 0, zc);
      collidables.push(box(s * 50, 0, zc, 0.4, 3, 4.6));
    }
  }

  // ---- Colonnes carrelées
  const pillars = [];
  const obstacles = [];
  for (let x = -24; x <= 24; x += 8) {
    add(new THREE.BoxGeometry(0.9, 3.2, 0.9), matPillar, x, 1.6, 0);
    const pb = box(x, 1.6, 0, 0.9, 3.2, 0.9);
    collidables.push(pb);
    blockers.push(pb);
    pillars.push(pb);
    obstacles.push(pb);
  }

  // ---- Caisses & barils (couverture au milieu du quai)
  const matCrate = new THREE.MeshLambertMaterial({ map: textures.crate() });
  const matBarrel = new THREE.MeshLambertMaterial({ map: textures.barrel() });
  const CRATE_HITS = 10;      // balles pour casser une caisse
  const BARREL_HITS = 3;      // balles pour faire exploser un baril
  const BARREL_RADIUS = 3;    // rayon d'explosion (mètres)
  const crates = [];
  const barrels = [];

  const addCrate = (cx, cy, cz, w, h, d) => {
    const cyC = cy + h / 2; // centre Y
    const m = add(new THREE.BoxGeometry(w, h, d), matCrate, cx, cyC, cz);
    m.rotation.y = (Math.random() - 0.5) * 0.4;
    const b = box(cx, cyC, cz, w, h, d);
    b.isCrate = true;
    const c = { mesh: m, box: b, hits: 0, state: 'static', vy: 0, cx, cy: cyC, cz, w, h, d };
    b._crate = c;
    collidables.push(b); blockers.push(b); obstacles.push(b);
    crates.push(c);
    return c;
  };
  const addBarrel = (cx, cz) => {
    const m = add(new THREE.CylinderGeometry(0.34, 0.34, 1.0, 12), matBarrel, cx, 0.5, cz);
    const b = box(cx, 0.5, cz, 0.68, 1.0, 0.68);
    b.isBarrel = true;
    b._barrel = { mesh: m, hits: 0 };
    collidables.push(b); blockers.push(b); obstacles.push(b);
    barrels.push(b._barrel);
    return b._barrel;
  };

  // empilements à plusieurs niveaux (couverture)
  addCrate(-20.0, 0, 1.4, 0.9, 1.0, 0.9);       // niveau 1
  addCrate(-19.8, 1.0, 1.0, 0.7, 0.8, 0.7);     // niveau 2
  addCrate(-20.1, 1.8, 0.7, 0.6, 0.6, 0.6);     // niveau 3
  addCrate(-13.0, 0, -1.6, 0.95, 1.0, 0.95);
  addCrate(-12.6, 1.0, -2.0, 0.7, 0.7, 0.7);
  addCrate(-5.0, 0, 1.9, 0.9, 1.0, 0.9);
  addCrate(-4.6, 1.0, 1.5, 0.7, 0.75, 0.7);
  addCrate(12.0, 0, 1.5, 1.0, 1.0, 1.0);
  addCrate(12.4, 1.0, 1.9, 0.7, 0.7, 0.7);      // niveau 2
  addCrate(11.9, 1.7, 1.2, 0.6, 0.6, 0.6);      // niveau 3
  addCrate(19.0, 0, -1.4, 0.9, 1.0, 0.9);
  addCrate(19.4, 1.0, -1.8, 0.65, 0.65, 0.65);
  // caisses isolées (coutribution dispersée)
  addCrate(-12.1, 0, 0.7, 0.65, 0.75, 0.65);
  addCrate(20.2, 0, -0.3, 0.7, 0.8, 0.7);
  addCrate(-1.0, 0, -2.2, 0.8, 0.9, 0.8);
  addCrate(5.0, 0, 3.0, 0.9, 1.0, 0.9);
  addCrate(8.0, 0, -3.0, 0.7, 0.8, 0.7);
  addCrate(-8.0, 0, 3.2, 0.75, 0.85, 0.75);

  // barils rouges explosifs
  addBarrel(-14.5, -2.6);
  addBarrel(11.0, -2.0);
  addBarrel(18.0, 2.4);
  addBarrel(-21.5, -1.0);
  addBarrel(3.5, 3.0);

  const wipe = (a, b) => { const k = a.indexOf(b); if (k >= 0) a.splice(k, 1); };
  const destroyCrate = (b) => {
    const e = b._crate;
    wipe(collidables, b); wipe(blockers, b); wipe(obstacles, b); wipe(crates, e);
    g.remove(e.mesh);
    bus.emit('crate-debris', { pos: { x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2 } });
    bus.emit('crate-cleared', { min: { x: b.min.x, y: b.min.y, z: b.min.z }, max: { x: b.max.x, y: b.max.y, z: b.max.z } });
  };
  const destroyBarrel = (b) => {
    const e = b._barrel;
    wipe(collidables, b); wipe(blockers, b); wipe(obstacles, b); wipe(barrels, e);
    g.remove(e.mesh);
    bus.emit('barrel-explode', { pos: { x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2 }, radius: BARREL_RADIUS });
  };
  const onCrateHit = (b) => { b._crate.hits++; if (b._crate.hits >= CRATE_HITS) destroyCrate(b); };
  const onBarrelHit = (b) => { b._barrel.hits++; if (b._barrel.hits >= BARREL_HITS) destroyBarrel(b); };

  // --- physique d'empilement (une caisse tombe si son soutien disparaît) ---
  const GRAV = 16;
  const GAP = 0.15;
  const syncBox = (c) => {
    const b = c.box;
    b.min.x = c.cx - c.w / 2; b.max.x = c.cx + c.w / 2;
    b.min.y = c.cy - c.h / 2; b.max.y = c.cy + c.h / 2;
    b.min.z = c.cz - c.d / 2; b.max.z = c.cz + c.d / 2;
  };
  const xzOverlap = (a, b) =>
    Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 && Math.abs(a.cz - b.cz) < (a.d + b.d) / 2;
  const supportBelow = (c) => {
    const bottom = c.cy - c.h / 2;
    if (bottom - groundHeight(c.cx, c.cz) <= GAP) return true; // sol juste en dessous
    for (const d of crates) {
      if (d === c || d.state !== 'static' || !xzOverlap(c, d)) continue;
      const top = d.cy + d.h / 2;
      if (top <= bottom + 1e-3 && bottom - top <= GAP) return true; // caisse posée juste en dessous
    }
    return false;
  };
  const restY = (c) => {
    const bottom = c.cy - c.h / 2;
    let rest = groundHeight(c.cx, c.cz);
    for (const d of crates) {
      if (d === c || d.state !== 'static' || !xzOverlap(c, d)) continue;
      const top = d.cy + d.h / 2;
      if (top <= bottom + 1e-3 && bottom - top <= GAP && top > rest) rest = top;
    }
    return rest;
  };
  // met à jour les caisses tombantes (gravité + repos sur le sol / autres caisses)
  const updatePhysics = (dt) => {
    for (const c of crates) {
      if (c.state === 'static' && !supportBelow(c)) c.state = 'falling';
    }
    const sub = 4, h = dt / sub;
    for (let s = 0; s < sub; s++) {
      for (const c of crates) {
        if (c.state !== 'falling') continue;
        c.vy -= GRAV * h;
        c.cy += c.vy * h;
        const rest = restY(c);
        if (c.cy - c.h / 2 <= rest + 0.03) { c.cy = rest + c.h / 2; c.vy = 0; c.state = 'static'; }
        c.mesh.position.y = c.cy;
        syncBox(c);
      }
    }
  };

  // ---- Issue de secours : escalier NE + porte blindée verte
  const matStep = new THREE.MeshLambertMaterial({ map: textures.concrete(), color: 0xb8b8bc });
  for (let i = 0; i < 10; i++) {
    const h = (i + 1) * 0.16;
    add(new THREE.BoxGeometry(0.42, h, 2.4), matStep, 26.21 + i * 0.34, h / 2 - 0.02, 3.2);
    collidables.push(box(26.21 + i * 0.34, h / 2 - 0.02, 3.2, 0.42, h, 2.4));
  }
  add(new THREE.BoxGeometry(0.6, 1.62, 2.4), matStep, 29.7, 0.8, 3.2);
  collidables.push(box(29.7, 0.8, 3.2, 0.6, 1.62, 2.4));
  const railMat = new THREE.MeshLambertMaterial({ color: 0x5a5e66 });
  for (let i = 0; i < 5; i++) {
    const px = 26.4 + i * 0.85;
    const ph = 0.9;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, ph, 6), railMat);
    post.position.set(px, (px - 26) * 0.4 + ph / 2, 2.0);
    g.add(post);
  }
  const handrail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 0.05), railMat);
  handrail.position.set(28.1, 1.86, 2.0);
  handrail.rotation.z = -0.4;
  g.add(handrail);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.7, 1.3),
    new THREE.MeshPhongMaterial({ color: 0x1f7a3d, shininess: 40 }));
  door.position.set(29.94, 2.47, 3.2);
  g.add(door);
  const signTex = new THREE.CanvasTexture(exitSignTexture());
  signTex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.48),
    new THREE.MeshBasicMaterial({ map: signTex }));
  sign.position.set(29.86, 3.0, 3.2);
  sign.rotation.y = -Math.PI / 2;
  g.add(sign);
  const exitLight = new THREE.PointLight(0x30ff70, 12, 6, 2);
  exitLight.position.set(29.2, 2.9, 3.2);
  g.add(exitLight);
  const exit = box(29.6, 2.2, 3.2, 1.0, 2.0, 2.4);

  // ---- Plafond
  add(new THREE.BoxGeometry(60.4, 0.3, 22.8), matCeil, 0, 3.35, 0);
  collidables.push(box(0, 3.35, 0, 60.4, 0.3, 22.8));

  // ---- Réglettes fluorescentes
  const lightStrips = [];
  const stripMat = () => new THREE.MeshBasicMaterial({ color: 0xfff6e0 });
  for (let x = -24; x <= 24; x += 8) {
    const m = add(new THREE.BoxGeometry(2.8, 0.06, 0.28), stripMat(), x, 3.12, 0);
    lightStrips.push(m);
  }

  return { group: g, collidables, blockers, pillars, obstacles, crates, barrels, exit, lightStrips, groundHeight, onCrateHit, onBarrelHit, updatePhysics };
}
