import * as THREE from 'three';
import { textures } from '../core/Procedural.js';

const box = (cx, cy, cz, sx, sy, sz) => ({
  min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 },
  max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 },
});

export function groundHeight(x, z) {
  const az = Math.abs(z), ax = Math.abs(x);
  if (az <= 5 && ax <= 30) return 0;
  if (az > 5 && az <= 11) {
    if (ax >= 26 && ax <= 30) return -1.4 * (ax - 26) / 4;
    return -1.4;
  }
  return -1.4;
}

export function buildStation(scene) {
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

  // Murs invisibles au bord du quai (le joueur ne tombe pas dans les voies)
  blockers.push(box(0, 0.85, 4.72, 60, 1.7, 0.5));
  blockers.push(box(0, 0.85, -4.72, 60, 1.7, 0.5));

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
  for (let x = -24; x <= 24; x += 8) {
    add(new THREE.BoxGeometry(0.9, 3.2, 0.9), matPillar, x, 1.6, 0);
    collidables.push(box(x, 1.6, 0, 0.9, 3.2, 0.9));
    pillars.push(box(x, 1.6, 0, 0.9, 3.2, 0.9));
  }

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

  return { group: g, collidables, blockers, pillars, lightStrips, groundHeight };
}
