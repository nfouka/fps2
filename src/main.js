import { Engine } from './core/Engine.js';
import { EventBus } from './core/EventBus.js';
import { GameState } from './model/GameState.js';
import { Spawner } from './model/Spawner.js';
import { buildStation } from './view/SubwayStation.js';
import { buildWalls } from './view/Walls.js';
import { Lighting } from './view/Lighting.js';
import { PlayerRig } from './view/PlayerRig.js';
import { EnemyView } from './view/EnemyView.js';
import { EffectsView } from './view/EffectsView.js';
import { HUD } from './view/HUD.js';
import { Minimap } from './view/Minimap.js';
import { PlayerController } from './controller/PlayerController.js';
import { WeaponController } from './controller/WeaponController.js';
import { EnemyController } from './controller/EnemyController.js';
import { UIController } from './controller/UIController.js';
import { AudioManager } from './audio/AudioManager.js';
import { attachSFX } from './audio/SFX.js';

const bus = new EventBus();
const engine = new Engine(document.getElementById('app'));
const state = new GameState(bus);

const station = buildStation(engine.scene);
buildWalls(engine.scene, station);

const lighting = new Lighting(engine.scene, engine, station, bus);
const rig = new PlayerRig(engine.camera, bus);
const enemyView = new EnemyView(engine.scene);
const effects = new EffectsView(engine.scene, engine.camera, bus);
const hud = new HUD(state, bus);
const minimap = new Minimap(document.getElementById('minimap'), state, station);

const audio = new AudioManager(bus);
attachSFX(audio, bus);

const playerCtrl = new PlayerController(engine.camera, state, station, bus);
const weaponCtrl = new WeaponController(engine.camera, state, station, bus);
const enemyCtrl = new EnemyController(state, bus, station);
const spawner = new Spawner(state);

function lock() {
  const el = engine.renderer.domElement;
  const p = el.requestPointerLock();
  if (p && p.catch) p.catch(() => {});
}

const ui = new UIController(state, bus, {
  start() {
    audio.init();
    state.status = 'playing';
    ui.hideAll();
    bus.emit('game-start', {});
    spawner.startWave(1);
    bus.emit('brightness', state.brightness);
    lock();
  },
  resume() {
    state.status = 'playing';
    ui.hideAll();
    lock();
  },
  restart() {
    state.reset();
    enemyView.clear();
    effects.clear();
    spawner.reset();
    state.status = 'playing';
    ui.hideAll();
    bus.emit('game-start', {});
    spawner.startWave(1);
    lock();
  },
});

// position de départ (x=4 : entre deux piliers, jamais DEDANS)
state.player.x = 4;
state.player.z = 0;
state.player.yaw = Math.PI / 2;
engine.camera.position.set(4, state.player.eye, 0);
engine.camera.rotation.set(0, Math.PI / 2, 0);
lighting.setBrightness(state.brightness);

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state.status === 'playing') {
    state.time += dt;
    playerCtrl.update(dt);
    weaponCtrl.update(dt);
    enemyCtrl.update(dt);
    spawner.update(dt);
    lighting.update(state.time);
  }

  rig.update(dt, state);
  enemyView.update(state, dt);
  effects.update(dt);
  hud.update(dt);
  minimap.update();

  engine.render();
}
requestAnimationFrame(frame);
