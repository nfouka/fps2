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

const bus = new EventBus();
const scene = new THREE.Scene();
const station = buildStation(scene, bus);

// pile x~-20 (3 caisses empilées)
const pile = station.crates.filter((c) => c.cx < -19 && c.cz > 0.5).sort((a, b) => a.cy - b.cy);
console.log('pile cy (bas->haut):', pile.map((c) => c.cy.toFixed(2)));
const [bottom, mid, top] = pile;
console.log('avant destruction -> bas:%s milieu:%s haut:%s | états:', bottom.cy, mid.cy, top.cy, [bottom.state, mid.state, top.state].join(','));

// détruit la caisse du bas (10 balles) via onCrateHit
const bottomBox = bottom.box;
for (let i = 0; i < 10; i++) station.onCrateHit(bottomBox);
console.log('bas détruit -> caisses restantes:', station.crates.length, '| milieu état:', mid.state, '| haut état:', top.state);

// simule la gravité (~3s)
const dt = 1 / 60;
for (let i = 0; i < 180; i++) station.updatePhysics(dt);

console.log('après chute -> milieu cy=%.2f (%s) | haut cy=%.2f (%s)',
  mid.cy, mid.state, top.cy, top.state);
console.log('mesh milieu y=%.2f (attend ~0.4) | mesh haut y=%.2f (attend ~1.0)',
  mid.mesh.position.y, top.mesh.position.y);

const ok = station.crates.includes(mid) && station.crates.includes(top)
  && mid.cy < 1.0 && mid.state === 'static'
  && top.cy < 1.6 && top.state === 'static'
  && top.cy > mid.cy + 0.2; // le haut repose au-dessus du milieu (pas de traversal)
console.log(ok ? '\nRESULTAT: OK (les caisses du haut tombent et reposent en pile)' : '\nRESULTAT: ECHEC');
process.exit(ok ? 0 : 1);
