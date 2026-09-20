import { raySphere, rayAABB } from '../model/Raycast.js';
import { groundHeight } from '../view/SubwayStation.js';

let ROCKET_SEQ = 1;
let NADE_SEQ = 1;

export class WeaponController {
  constructor(camera, state, station, bus) {
    this.camera = camera;
    this.state = state;
    this.station = station;
    this.bus = bus;
    this.mouseDown = false;
    this.baseFov = camera.fov;
    this.ads = false;
    this.rockets = [];
    this.grenades = [];
    this.fires = [];

    document.addEventListener('mousedown', (e) => {
      if (!document.pointerLockElement || state.status !== 'playing') return;
      if (e.button === 0) {
        this.mouseDown = true;
        this.tryFire();
      }
      if (e.button === 2) this.setAds(true);
    });
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
      if (e.button === 2) this.setAds(false);
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // molette = changement d'arme
    window.addEventListener('wheel', (e) => {
      if (state.status !== 'playing' || !document.pointerLockElement) return;
      e.preventDefault();
      state.switchWeapon(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (state.status !== 'playing') return;
      if (e.code === 'KeyR') this.tryReload();
      if (e.code === 'Digit1') this.selectWeapon(0);
      if (e.code === 'Digit2') this.selectWeapon(1);
      if (e.code === 'Digit3') this.selectWeapon(2);
      if (e.code === 'Digit4') this.selectWeapon(3);
      if (e.code === 'Digit5') this.selectWeapon(4);
      if (e.code === 'Digit6') this.selectWeapon(5);
      if (e.code === 'KeyG') this.throwNade('grenade');
      if (e.code === 'KeyN') this.throwNade('napalm');
    });
    bus.on('weapon-switched', () => this.setAds(false));
  }

  setAds(on) {
    if (this.ads === on) return;
    this.ads = on;
    this.state.ads = on;
    if (!on) this.state.adsRange = null;
    this.bus.emit('ads', { on, weapon: this.state.weapon() });
  }

  selectWeapon(i) {
    const s = this.state;
    if (i < 0 || i >= s.weapons.length || i === s.weaponIndex) return;
    s.weapons[s.weaponIndex].cancelReload();
    s.weaponIndex = i;
    this.bus.emit('weapon-switched', { weapon: s.weapon(), index: i });
  }

  tryReload() {
    const w = this.state.weapon();
    if (w.startReload(this.state.time)) this.bus.emit('reload-start', { weapon: w });
  }

  aimDir() {
    const s = this.state;
    const cp = Math.cos(s.player.pitch), sp = Math.sin(s.player.pitch);
    const cy = Math.cos(s.player.yaw), sy = Math.sin(s.player.yaw);
    return { x: -sy * cp, y: sp, z: -cy * cp };
  }

  tryFire() {
    const s = this.state;
    const w = s.weapon();
    if (w.reloading) return;
    if (w.empty) {
      if (w.reserve > 0) this.tryReload();
      return;
    }
    if (!w.canFire(s.time)) return;
    w.fire(s.time);

    const def = w.def;
    this.bus.emit('shot', { weapon: w, recoil: def.recoil });

    if (def.rocket) {
      const dir = this.aimDir();
      const origin = {
        x: this.camera.position.x + dir.x * 0.4,
        y: this.camera.position.y - 0.12,
        z: this.camera.position.z + dir.z * 0.4,
      };
      const r = { id: 'r' + ROCKET_SEQ++, pos: origin, vel: { x: dir.x * 30, y: dir.y * 30, z: dir.z * 30 }, t: def.range, def };
      this.rockets.push(r);
      this.bus.emit('rocket-fired', { id: r.id, pos: origin, dir });
    } else {
      for (let p = 0; p < def.pellets; p++) this.hitscan(w);
    }
  }

  throwNade(kind) {
    const s = this.state;
    if (s.status !== 'playing') return;
    if (kind === 'grenade' && s.grenades <= 0) return;
    if (kind === 'napalm' && s.napalm <= 0) return;
    if (kind === 'grenade') s.grenades--; else s.napalm--;
    const dir = this.aimDir();
    const origin = {
      x: this.camera.position.x + dir.x * 0.3,
      y: this.camera.position.y - 0.05,
      z: this.camera.position.z + dir.z * 0.3,
    };
    const g = {
      id: 'n' + NADE_SEQ++,
      kind, pos: origin,
      vel: { x: dir.x * 13, y: dir.y * 13 + 2.6, z: dir.z * 13 },
      fuse: kind === 'grenade' ? 2.0 : 2.6,
    };
    this.grenades.push(g);
    this.bus.emit('nade-fired', { id: g.id, kind, pos: origin });
  }

  splashDamage(pos, radius, maxDmg, hurtPlayer) {
    const s = this.state;
    for (const e of s.enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - pos.x, e.y + 0.95 - pos.y, e.z - pos.z);
      if (d < radius) {
        const killed = e.damage(maxDmg * (1 - 0.65 * (d / radius)));
        if (killed) {
          s.addScore(100);
          this.bus.emit('enemy-killed', { enemy: e, head: false });
        }
      }
    }
    if (hurtPlayer) {
      const p = s.player;
      const d = Math.hypot(p.x - pos.x, p.y + 0.9 - pos.y, p.z - pos.z);
      if (d < radius * 0.8) {
        const dead = p.damage(maxDmg * 0.35 * (1 - d / (radius * 0.8)));
        this.bus.emit('player-hurt', { hp: p.hp, damage: 0 });
        if (dead) {
          s.status = 'dead';
          this.bus.emit('game-over', { score: s.score });
        }
      }
    }
  }

  explode(pos, radius, dmg, hurtPlayer) {
    this.bus.emit('explosion', { pos, radius });
    this.splashDamage(pos, radius, dmg, hurtPlayer);
  }

  hitscan(w) {
    const s = this.state;
    const def = w.def;
    const origin = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
    const dir = this.aimDir();

    // dispersion (visée = précision millimétrée)
    let spread = def.spread * (s.player.moving ? 1.8 : 1);
    if (s.player.crouch) spread *= 0.6;
    if (this.ads) spread *= 0.12;
    dir.x += (Math.random() - 0.5) * spread;
    dir.y += (Math.random() - 0.5) * spread;
    dir.z += (Math.random() - 0.5) * spread;
    const len = Math.hypot(dir.x, dir.y, dir.z);
    dir.x /= len; dir.y /= len; dir.z /= len;

    let bestT = def.range, hitEnemy = null, head = false;

    for (const e of s.enemies) {
      if (!e.alive) continue;
      const th = raySphere(origin, dir, e.x, e.y + 1.62, e.z, 0.26);
      if (th >= 0 && th < bestT) { bestT = th; hitEnemy = e; head = true; continue; }
      const tb = raySphere(origin, dir, e.x, e.y + 0.95, e.z, 0.5);
      if (tb >= 0 && tb < bestT) { bestT = tb; hitEnemy = e; head = false; }
    }

    for (const b of this.station.collidables) {
      const t = rayAABB(origin, dir, b);
      if (t >= 0 && t < bestT) { bestT = t; hitEnemy = null; head = false; }
    }

    const hitPoint = {
      x: origin.x + dir.x * bestT,
      y: origin.y + dir.y * bestT,
      z: origin.z + dir.z * bestT,
    };

    if (hitEnemy) {
      const killed = head ? hitEnemy.kill() : hitEnemy.damage(def.damage);
      this.bus.emit('hit', { head, point: hitPoint, enemy: hitEnemy });
      if (killed) {
        s.addScore(head ? 150 : 100);
        this.bus.emit('enemy-killed', { enemy: hitEnemy, head });
      }
    } else {
      this.bus.emit('miss', { point: hitPoint });
    }

    this.bus.emit('shot-visual', {
      origin, dir, hitPoint,
      enemyHit: !!hitEnemy, head,
    });
  }

  rangeFind() {
    const s = this.state;
    const origin = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
    const dir = this.aimDir();
    let best = null;
    for (const e of s.enemies) {
      if (!e.alive) continue;
      const th = raySphere(origin, dir, e.x, e.y + 1.2, e.z, 0.7);
      if (th >= 0 && (best === null || th < best)) best = th;
    }
    s.adsRange = best;
  }

  update(dt) {
    const s = this.state;
    const w = s.weapon();
    if (w.reloading && w.finishReload(s.time)) {
      this.bus.emit('reload-end', { weapon: w });
    }

    // zoom progressif
    let targetFov = this.baseFov;
    if (this.ads) targetFov = w.def.rocket ? 26 : 52;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 12);
      this.camera.updateProjectionMatrix();
    }
    if (this.ads) this.rangeFind();

    if (this.mouseDown && w.def.auto && s.status === 'playing') {
      this.tryFire();
    }

    // roquettes
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      const step = 30 * dt;
      const dn = { x: r.vel.x / 30, y: r.vel.y / 30, z: r.vel.z / 30 };
      let hit = null;
      for (const e of s.enemies) {
        if (!e.alive) continue;
        const t = raySphere(r.pos, dn, e.x, e.y + 1.1, e.z, 0.55);
        if (t >= 0 && t <= step + 0.3) { hit = true; break; }
      }
      if (!hit) {
        for (const b of this.station.collidables) {
          const t = rayAABB(r.pos, dn, b);
          if (t >= 0 && t <= step) { hit = true; break; }
        }
      }
      if (!hit && r.pos.y + dn.y * step < groundHeight(r.pos.x + dn.x * step, r.pos.z + dn.z * step) + 0.05) hit = true;
      if (hit) {
        this.explode(r.pos, r.def.splash, r.def.damage, true);
        this.bus.emit('rocket-end', { id: r.id });
        this.rockets.splice(i, 1);
        continue;
      }
      r.pos.x += r.vel.x * dt; r.pos.y += r.vel.y * dt; r.pos.z += r.vel.z * dt;
      r.t -= 30 * dt;
      this.bus.emit('rocket-step', { id: r.id, pos: r.pos, dir: dn });
      if (r.t <= 0) {
        this.explode(r.pos, r.def.splash, r.def.damage, true);
        this.bus.emit('rocket-end', { id: r.id });
        this.rockets.splice(i, 1);
      }
    }

    // grenades & napalm
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.vel.y -= 11 * dt;
      g.pos.x += g.vel.x * dt; g.pos.y += g.vel.y * dt; g.pos.z += g.vel.z * dt;
      g.fuse -= dt;
      const gy = groundHeight(g.pos.x, g.pos.z);
      let boom = g.fuse <= 0 || g.pos.y <= gy + 0.08;
      if (!boom) {
        for (const e of s.enemies) {
          if (!e.alive) continue;
          if (Math.hypot(e.x - g.pos.x, e.y + 1.0 - g.pos.y, e.z - g.pos.z) < 0.6) { boom = true; break; }
        }
      }
      if (boom) {
        if (g.kind === 'grenade') {
          this.explode(g.pos, 3.5, 110, true);
        } else {
          this.bus.emit('fire-pool', { pos: { x: g.pos.x, y: gy + 0.05, z: g.pos.z } });
          this.fires.push({ x: g.pos.x, z: g.pos.z, r: 2.6, t: 7 });
        }
        this.bus.emit('nade-end', { id: g.id, kind: g.kind, pos: g.pos });
        this.grenades.splice(i, 1);
        continue;
      }
      this.bus.emit('nade-step', { id: g.id, kind: g.kind, pos: g.pos });
    }

    // napalm : brûle les zombies dans la zone
    for (let i = this.fires.length - 1; i >= 0; i--) {
      const f = this.fires[i];
      f.t -= dt;
      for (const e of s.enemies) {
        if (!e.alive) continue;
        if (Math.hypot(e.x - f.x, e.z - f.z) < f.r) {
          const killed = e.damage(16 * dt);
          if (killed) {
            s.addScore(80);
            this.bus.emit('enemy-killed', { enemy: e, head: false });
          }
        }
      }
      if (f.t <= 0) this.fires.splice(i, 1);
    }
  }
}
