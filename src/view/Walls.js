import * as THREE from 'three';
import { signTexture, wayOutTexture, adTexture, posterTexture, graffitiTexture } from '../core/Procedural.js';

const box = (cx, cy, cz, sx, sy, sz) => ({
  min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 },
  max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 },
});

function planeTex(canvas, w, h) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: t, transparent: false });
}

export function buildWalls(scene, station) {
  const g = new THREE.Group();
  scene.add(g);

  // Panneaux de nom de station sur les murs de voies
  const names = ['GARE DE GRENOBLE', 'ILE PERIERE', 'BASTILLE'];
  for (const s of [1, -1]) {
    names.forEach((n, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), planeTex(signTexture(n), 5.2, 1.3));
      m.position.set(-18 + i * 18, 1.7, s * 10.98);
      m.rotation.y = s === 1 ? Math.PI : 0;
      g.add(m);
    });
  }

  // Enseignes WAY OUT près du plafond aux extrémités
  for (const s of [1, -1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), planeTex(wayOutTexture()));
    m.position.set(s * 29.9, 2.5, 0);
    m.rotation.y = s === 1 ? -Math.PI / 2 : Math.PI / 2;
    g.add(m);
  }

  // Caissons publicitaires + affiches
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const x = -22 + i * 14 + (s === 1 ? 7 : 0);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), planeTex(adTexture()));
      m.position.set(x, 1.35, s * 10.97);
      m.rotation.y = s === 1 ? Math.PI : 0;
      g.add(m);
    }
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), planeTex(posterTexture()));
      m.position.set(-10 + i * 12, 1.2, s * 10.97);
      m.rotation.y = s === 1 ? Math.PI : 0;
      g.add(m);
    }
    // graffitis au ras du sol
    for (let i = 0; i < 3; i++) {
      const t = new THREE.CanvasTexture(graffitiTexture());
      t.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.85, depthWrite: false });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.2), mat);
      m.position.set(-20 + i * 17 + 4, 0.75, s * 10.96);
      m.rotation.y = s === 1 ? Math.PI : 0;
      g.add(m);
    }
  }

  // Tuyauterie en hauteur le long des murs
  const pipeMat = new THREE.MeshLambertMaterial({ color: 0x5a5e66 });
  for (const s of [1, -1]) {
    for (const [off, r] of [[10.55, 0.09], [10.3, 0.06]]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 59, 8), pipeMat);
      p.rotation.z = Math.PI / 2;
      p.position.set(0, 2.75 - off * 0.02, s * off);
      g.add(p);
    }
  }

  // Bancs
  const benchWood = new THREE.MeshLambertMaterial({ color: 0x6b4a2b });
  const benchMetal = new THREE.MeshLambertMaterial({ color: 0x33363c });
  for (const s of [1, -1]) {
    for (const x of [-16, -4, 8, 20]) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.62), benchWood);
      seat.position.set(x, 0.48, s * 3.3);
      g.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 0.08), benchWood);
      back.position.set(x, 0.82, s * 3.58);
      g.add(back);
      for (const lx of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.48, 0.5), benchMetal);
        leg.position.set(x + lx, 0.24, s * 3.3);
        g.add(leg);
      }
      station.collidables.push(box(x, 0.5, s * 3.3, 2.4, 1, 0.75));
      station.blockers.push(box(x, 0.5, s * 3.3, 2.4, 1, 0.75));
    }
  }

  // Poubelles
  const binMat = new THREE.MeshLambertMaterial({ color: 0x2e3a30 });
  for (const [x, z] of [[-12, 4.1], [4, -4.1], [16, 4.1], [-20, -4.1]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.9, 10), binMat);
    b.position.set(x, 0.45, z);
    g.add(b);
    station.collidables.push(box(x, 0.45, z, 0.55, 0.9, 0.55));
    station.blockers.push(box(x, 0.45, z, 0.55, 0.9, 0.55));
  }

  // Distributeur
  const vend = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.6), new THREE.MeshLambertMaterial({ color: 0x8a1f2b }));
  vend.position.set(-8, 0.95, -4.45);
  g.add(vend);
  const vendFront = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 1.5),
    new THREE.MeshBasicMaterial({ color: 0x3fd0ff })
  );
  vendFront.position.set(-8, 1.1, -4.14);
  g.add(vendFront);
  station.collidables.push(box(-8, 0.95, -4.45, 1.2, 1.9, 0.6));
  station.blockers.push(box(-8, 0.95, -4.45, 1.2, 1.9, 0.6));
}
