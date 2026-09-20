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

const crate = station.crates[0];
const box = crate.box;
console.log('caisse box ->',
  `x[${box.min.x.toFixed(2)},${box.max.x.toFixed(2)}]`,
  `y[${box.min.y.toFixed(2)},${box.max.y.toFixed(2)}]`,
  `z[${box.min.z.toFixed(2)},${box.max.z.toFixed(2)}]`);

// tir traversant la caisse : trace d'entree (face +z) + de sortie (face -z)
const c = { x: (box.min.x + box.max.x) / 2, y: (box.min.y + box.max.y) / 2, z: (box.min.z + box.max.z) / 2 };
const dir = { x: 0, y: 0, z: -1 };
const holes = [
  { p: { x: c.x, y: c.y, z: box.max.z - 0.001 }, dir },
  { p: { x: c.x, y: c.y, z: box.min.z + 0.001 }, dir },
];
bus.emit('crate-holes', { holes });

const visibleBefore = fx.crateHoles.filter((h) => h.mesh.visible).length;
console.log('traces visible avant destruction:', visibleBefore);

for (let i = 0; i < 10; i++) station.onCrateHit(box);

const crateGone = !station.crates.includes(crate);
console.log('caisse supprimee des crates:', crateGone);

const visibleAfter = fx.crateHoles.filter((h) => h.mesh.visible).length;
console.log('traces visible apres destruction:', visibleAfter);

const inBoxVisible = fx.crateHoles.filter((h) => {
  const p = h.mesh.position;
  const inBox = p.x >= box.min.x - 0.03 && p.x <= box.max.x + 0.03 &&
    p.y >= box.min.y - 0.03 && p.y <= box.max.y + 0.03 &&
    p.z >= box.min.z - 0.03 && p.z <= box.max.z + 0.03;
  return inBox && h.mesh.visible;
}).length;
console.log('traces encore visibles dans la box:', inBoxVisible);

const ok = visibleBefore >= 2 && crateGone && visibleAfter === 0 && inBoxVisible === 0;
console.log(ok ? '\nRESULTAT: OK (les traces disparaissent a la destruction)' : '\nRESULTAT: ECHEC');
process.exit(ok ? 0 : 1);
