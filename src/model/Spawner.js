import { Enemy } from './Enemy.js';

// Points d'apparition aux bouches de tunnel (coordonnées monde)
export const SPAWN_POINTS = [
  { x: -34, z: -8 }, { x: -34, z: 8 },
  { x: 34, z: -8 }, { x: 34, z: 8 },
];

export class Spawner {
  constructor(state) {
    this.state = state;
    this.active = false;
    this.toSpawn = 0;
    this.timer = 0;
    this.interval = 1.2;
    this.waveCooldown = 0;
  }

  reset() {
    this.active = false;
    this.toSpawn = 0;
    this.timer = 0;
    this.waveCooldown = 0;
  }

  startWave(n) {
    this.state.wave = n;
    this.active = true;
    this.toSpawn = 4 + n * 2;
    this.interval = Math.max(0.45, 1.4 - n * 0.06);
    this.timer = 0.6;
    this.state.bus.emit('wave-start', { wave: n });
  }

  update(dt) {
    const st = this.state;
    if (!this.active) {
      if (this.waveCooldown > 0) {
        this.waveCooldown -= dt;
        if (this.waveCooldown <= 0) this.startWave(st.wave + 1);
      }
      return;
    }

    if (this.toSpawn > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = this.interval;
        this.toSpawn--;
        const p = SPAWN_POINTS[(Math.random() * SPAWN_POINTS.length) | 0];
        const e = new Enemy(p.x + (Math.random() * 2 - 1), p.z + (Math.random() * 1.4 - 0.7), st.wave);
        st.enemies.push(e);
        st.bus.emit('enemy-spawned', { enemy: e });
      }
    } else {
      const anyAlive = st.enemies.some((e) => e.alive);
      if (!anyAlive) {
        this.active = false;
        this.waveCooldown = 3.5;
        st.bus.emit('wave-clear', { wave: st.wave });
      }
    }
  }
}
