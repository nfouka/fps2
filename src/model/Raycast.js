// Maths pures de hitscan (sans THREE) — rayon/sphère et rayon/AABB.

export function raySphere(ro, rd, cx, cy, cz, r) {
  const ox = ro.x - cx, oy = ro.y - cy, oz = ro.z - cz;
  const b = ox * rd.x + oy * rd.y + oz * rd.z;
  const c = ox * ox + oy * oy + oz * oz - r * r;
  const disc = b * b - c;
  if (disc < 0) return -1;
  const s = Math.sqrt(disc);
  let t = -b - s;
  if (t < 0.05) t = -b + s;
  if (t < 0.05) return -1;
  return t;
}

export function rayAABB(ro, rd, box) {
  const { min, max } = box;
  let tmin = -Infinity, tmax = Infinity;
  const axes = ['x', 'y', 'z'];
  for (const a of axes) {
    const d = rd[a];
    if (Math.abs(d) < 1e-8) {
      if (ro[a] < min[a] || ro[a] > max[a]) return -1;
    } else {
      let t1 = (min[a] - ro[a]) / d;
      let t2 = (max[a] - ro[a]) / d;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return -1;
    }
  }
  if (tmax < 0.05) return -1;
  return tmin > 0.05 ? tmin : tmax;
}

// Cercle (joueur/ennemi) contre AABB en XZ — renvoie le vecteur de correction.
export function resolveCircleAABB(px, pz, r, box) {
  const { min, max } = box;
  const cx = Math.max(min.x, Math.min(px, max.x));
  const cz = Math.max(min.z, Math.min(pz, max.z));
  let dx = px - cx, dz = pz - cz;
  const d2 = dx * dx + dz * dz;
  if (d2 > r * r) return null;
  if (d2 > 1e-9) {
    const d = Math.sqrt(d2);
    return { x: cx + (dx / d) * r - px, z: cz + (dz / d) * r - pz };
  }
  // centre dans la boîte : pousser vers la face la plus proche
  const left = px - min.x, right = max.x - px, top = pz - min.z, bot = max.z - pz;
  const m = Math.min(left, right, top, bot);
  if (m === left) return { x: -(left + r), z: 0 };
  if (m === right) return { x: right + r, z: 0 };
  if (m === top) return { x: 0, z: -(top + r) };
  return { x: 0, z: bot + r };
}
