import { groundHeight } from '../view/SubwayStation.js';

export class EnemyController {
  constructor(state, bus) {
    this.state = state;
    this.bus = bus;
    this.growlTimer = 0;
  }

  update(dt) {
    const s = this.state;
    const p = s.player;

    for (const e of s.enemies) {
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt * 4);

      if (e.state === 'dying') {
        e.deathTime += dt;
        continue;
      }

      const dx = p.x - e.x, dz = p.z - e.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 1.5) {
        e.state = 'attacking';
        e.yaw = Math.atan2(-dx, -dz);
        e.attackCd -= dt;
        e.attackAnim = Math.max(0, e.attackAnim - dt * 3);
        if (e.attackCd <= 0) {
          e.attackCd = 1.0;
          e.attackAnim = 1;
          const dead = p.damage(e.damage);
          this.bus.emit('player-hurt', { hp: p.hp, damage: e.damage });
          if (dead) {
            s.status = 'dead';
            this.bus.emit('game-over', { score: s.score });
          }
        }
      } else {
        e.state = 'chasing';
        // pathfinding : dans les voies -> rejoindre la rampe la plus proche, puis le quai
        if (Math.abs(e.z) <= 5.4) e.onPlatform = true;
        let tx, tz;
        if (e.onPlatform) {
          tx = p.x; tz = p.z;
        } else if (Math.abs(e.x) > 26.8) {
          tx = Math.sign(e.x) * 26.5;
          tz = Math.sign(e.z) * 8;
        } else {
          tx = Math.sign(e.x) * 26.5;
          tz = Math.sign(e.z) * 5.4;
        }
        const mx = tx - e.x, mz = tz - e.z;
        const md = Math.hypot(mx, mz) || 1;
        e.x += (mx / md) * e.speed * dt;
        e.z += (mz / md) * e.speed * dt;
        e.yaw = Math.atan2(-mx, -mz);
        e.walkPhase += dt * (4 + e.speed);
        e.attackAnim = Math.max(0, e.attackAnim - dt * 3);

        // bornes des voies / tunnels
        if (Math.abs(e.z) > 5.3) {
          e.z = Math.max(-10.4, Math.min(10.4, e.z));
          e.x = Math.max(-48, Math.min(48, e.x));
        } else {
          e.x = Math.max(-29.2, Math.min(29.2, e.x));
        }
        if (e.onPlatform) e.z = Math.max(-5.0, Math.min(5.0, e.z));
      }

      e.y = groundHeight(e.x, e.z);
    }

    // séparation (évite l'empilement)
    const list = s.enemies.filter((e) => e.alive);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        const dx = b.x - a.x, dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        const min = 0.7;
        if (d > 0 && d < min) {
          const push = (min - d) / 2;
          const nx = dx / d, nz = dz / d;
          a.x -= nx * push; a.z -= nz * push;
          b.x += nx * push; b.z += nz * push;
        }
      }
    }

    // nettoyage des cadavres
    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const e = s.enemies[i];
      if (e.state === 'dying' && e.deathTime > 5) s.enemies.splice(i, 1);
    }

    // grognements d'ambiance
    this.growlTimer -= dt;
    if (this.growlTimer <= 0 && list.length) {
      this.growlTimer = 1.5 + Math.random() * 3;
      const e = list[(Math.random() * list.length) | 0];
      const d = Math.hypot(p.x - e.x, p.z - e.z);
      if (d < 22) this.bus.emit('growl', { dist: d });
    }
  }
}
