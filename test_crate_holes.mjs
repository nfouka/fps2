globalThis.document = {
  addEventListener: () => {},
  pointerLockElement: null,
  getElementById: () => null,
  createElement: () => ({ width: 256, height: 256, getContext: () => new Proxy({}, { get: () => () => {}, set: () => true }) }),
};
globalThis.window = { addEventListener: () => {} };

const THREE = await import('three');
const { EventBus } = await import('./src/core/EventBus.js');
const { buildStation } = await import('./src/view/SubwayStation.js');
const { EffectsView } = await import('./src/view/EffectsView.js');

const bus = new EventBus();
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const station = buildStation(scene, bus);
const fx = new EffectsView(scene, camera, bus);

const mid = (a, b) => (a + b) / 2;
const dir = { x: 0, y: 0, z: -1 };

// traces generales (impacts generaux) dans une box
const genInBox = (box) => fx.holes.filter((h) => {
  const p = h.mesh.position;
  return p.x >= box.min.x - 0.03 && p.x <= box.max.x + 0.03 &&
    p.y >= box.min.y - 0.03 && p.y <= box.max.y + 0.03 &&
    p.z >= box.min.z - 0.03 && p.z <= box.max.z + 0.03 && h.mesh.visible;
}).length;
// traces de caisse dans une box
const crateInBox = (box) => fx.crateHoles.filter((h) => {
  const p = h.mesh.position;
  return p.x >= box.min.x - 0.03 && p.x <= box.max.x + 0.03 &&
    p.y >= box.min.y - 0.03 && p.y <= box.max.y + 0.03 &&
    p.z >= box.min.z - 0.03 && p.z <= box.max.z + 0.03 && h.mesh.visible;
}).length;

let ok = true;

// ---- CAISSE : les caisses posent des crateHoles ----
const crate = station.crates[0];
const cbox = crate.box;
console.log('[caisse] crateHoles avant:', crateInBox(cbox));
bus.emit('crate-holes', { holes: [
  { p: { x: mid(cbox.min.x, cbox.max.x), y: mid(cbox.min.y, cbox.max.y), z: cbox.max.z - 0.001 }, dir },
  { p: { x: mid(cbox.min.x, cbox.max.x), y: mid(cbox.min.y, cbox.max.y), z: cbox.min.z + 0.001 }, dir },
]});
const cBefore = crateInBox(cbox);
for (let i = 0; i < 10; i++) station.onCrateHit(cbox);
const cAfter = crateInBox(cbox);
console.log('[caisse] crateHoles avant destruction:', cBefore, '| apres:', cAfter, '| caisse supprimee:', !station.crates.includes(crate));
ok = ok && cBefore >= 2 && cAfter === 0;

// ---- BARIL ROUGE : les barils posent des impacts generaux (spawnHole) ----
const rbox = station.collidables.find((b) => b.isBarrel);
console.log('[baril] box x[' + rbox.min.x.toFixed(2) + ',' + rbox.max.x.toFixed(2) + '] y[' + rbox.min.y.toFixed(2) + ',' + rbox.max.y.toFixed(2) + '] z[' + rbox.min.z.toFixed(2) + ',' + rbox.max.z.toFixed(2) + ']');
fx.spawnHole({ x: mid(rbox.min.x, rbox.max.x), y: mid(rbox.min.y, rbox.max.y), z: rbox.max.z - 0.001 }, dir);
fx.spawnHole({ x: mid(rbox.min.x, rbox.max.x), y: mid(rbox.min.y, rbox.max.y), z: rbox.min.z + 0.001 }, dir);
const rBefore = genInBox(rbox);
console.log('[baril] impacts generaux avant explosion:', rBefore);
for (let i = 0; i < 3; i++) station.onBarrelHit(rbox);
const barrelGone = !station.barrels.some((rb) => rb.mesh === rbox.mesh);
const rAfter = genInBox(rbox);
console.log('[baril] impacts generaux apres explosion:', rAfter, '| baril supprimee:', barrelGone);
ok = ok && rBefore >= 2 && rAfter === 0;

console.log(ok ? '\nRESULTAT: OK (traces caisse + baril effacees a la destruction)' : '\nRESULTAT: ECHEC');
process.exit(ok ? 0 : 1);
