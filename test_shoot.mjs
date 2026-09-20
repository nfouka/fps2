globalThis.document = { addEventListener: () => {}, pointerLockElement: null, getElementById: () => null };
globalThis.window = { addEventListener: () => {} };
const { EventBus } = await import('./src/core/EventBus.js');
const { GameState } = await import('./src/model/GameState.js');
const { Enemy } = await import('./src/model/Enemy.js');
const { WeaponController } = await import('./src/controller/WeaponController.js');

const bus = new EventBus();
const state = new GameState(bus);
state.status = 'playing';
state.time = 1;

const e = new Enemy(-10, 0, 1);
e.y = 0;
state.enemies.push(e);

const camera = { position: { x: 0, y: 1.66, z: 0 } };
const station = { collidables: [] };
const events = [];
for (const ev of ['shot', 'hit', 'miss', 'enemy-killed']) bus.on(ev, () => events.push(ev));

const wc = new WeaponController(camera, state, station, bus);
state.player.yaw = Math.PI / 2; // face -X toward enemy at x=-10
state.player.pitch = 0;

for (let i = 1; i <= 4; i++) {
  state.time += 0.2;
  wc.tryFire();
  console.log(`shot ${i}: events=[${events.join(',')}] hp=${e.hp} state=${e.state}`);
  events.length = 0;
}
