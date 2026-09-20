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

// renvoie nb de traces encore visibles dans la box donnée
const visibleInBox = (box) => fx.crateHoles.filter((h) => {
  const p = h.mesh.position;
  return p.x >= box.min.x - 0.03 && p.x <= box.max.x + 0.03 &&
    p.y >= box.min.y - 0.03 && p.y <= box.max.y + 0.03 &&
    p.z >= box.min.z - 0.03 && p.z <= box.max.z + 0.03 && h.mesh.visible;
}).length;

// pose 2 traces (entree + sortie) sur la surface d'une box
const pierce = (box) => {
  const dir = { x: 0, y: 0, z: -1 };
  const holes = [
    { p: { x: mid(box.min.x, box.max.x), y: mid(box.min.y, box.max.y), z: box.max.z - 0.001 }, dir },
    { p: { x: mid(box.min.x, box.max.x), y: mid(box.min.y, box.max.y), z: box.min.z + 0.001 }, dir },
  ];
  bus.emit('crate-holes', { holes });
};

let ok = true;

// ---- CAISSE ----
const crate = station.crates[0];
const cbox = crate.box;
console.log('[caisse] box x[' + cbox.min.x.toFixed(2) + ',' + cbox.max.x.toFixed(2) + '] y[' + cbox.min.y.toFixed(2) + ',' + cbox.max.y.toFixed(2) + '] z[' + cbox.min.z.toFixed(2) + ',' + cbox.max.z.toFixed(2) + ']');
pierce(cbox);
const beforeC = visibleInBox(cbox);
console.log('[caisse] traces avant destruction:', beforeC);
for (let i = 0; i < 10; i++) station.onCrateHit(cbox);
const crateGone = !station.crates.includes(crate);
const afterC = visibleInBox(cbox);
console.log('[caisse] caisse supprimee:', crateGone, '| traces apres destruction:', afterC);
ok = ok && beforeC >= 2 && crateGone && afterC === 0;

// ---- BARIL ROUGE ----
const rbox = station.collidables.find((b) => b.isBarrel);
console.log('[baril] box x[' + rbox.min.x.toFixed(2) + ',' + rbox.max.x.toFixed(2) + '] y[' + rbox.min.y.toFixed(2) + ',' + rbox.max.y.toFixed(2) + '] z[' + rbox.min.z.toFixed(2) + ',' + rbox.max.z.toFixed(2) + ']');
pierce(rbox);
const beforeR = visibleInBox(rbox);
console.log('[baril] traces avant explosion:', beforeR);
for (let i = 0; i < 3; i++) station.onBarrelHit(rbox);
const barrelGone = !station.barrels.some((rb) => rb.mesh === rbox.mesh);
const afterR = visibleInBox(rbox);
console.log('[baril] baril supprimee:', barrelGone, '| traces apres explosion:', afterR);
ok = ok && beforeR >= 2 && barrelGone && afterR === 0;

console.log(ok ? '\nRESULTAT: OK (traces disparaissent a la destruction caisse + baril)' : '\nRESULTAT: ECHEC');
process.exit(ok ? 0 : 1);
