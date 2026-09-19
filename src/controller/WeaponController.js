import { raySphere, rayAABB } from '../model/Raycast.js';

export class WeaponController {
  constructor(camera, state, station, bus) {
    this.camera = camera;
    this.state = state;
    this.station = station;
    this.bus = bus;
    this.mouseDown = false;

    document.addEventListener('mousedown', (e) => {
      if (e.button === 0 && document.pointerLockElement && state.status === 'playing') {
        this.mouseDown = true;
        this.tryFire();
      }
    });
    document.addEventListener('mouseup', (e) => { if (e.button === 0) this.mouseDown = false; });

    // molette = changement d'arme
    window.addEventListener('wheel', (e) => {
      if (state.status !== 'playing' || !document.pointerLockElement) return;
      e.preventDefault();
      state.switchWeapon(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR' && state.status === 'playing') this.tryReload();
      if (e.code === 'Digit1') this.selectWeapon(0);
      if (e.code === 'Digit2') this.selectWeapon(1);
      if (e.code === 'Digit3') this.selectWeapon(2);
      if (e.code === 'Digit4') this.selectWeapon(3);
    });
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
    s.player.addRecoil(def.recoil);

    for (let p = 0; p < def.pellets; p++) this.hitscan(w);
  }

  hitscan(w) {
    const s = this.state;
    const def = w.def;
    const origin = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
    const dir = { x: 0, y: 0, z: -1 };
    // direction caméra (yaw/pitch)
    const cp = Math.cos(s.player.pitch + s.player.recoilOffset), sp = Math.sin(s.player.pitch + s.player.recoilOffset);
    const cy = Math.cos(s.player.yaw), sy = Math.sin(s.player.yaw);
    dir.x = -sy * cp; dir.y = sp; dir.z = -cy * cp;

    // dispersion
    const spread = def.spread * (s.player.moving ? 1.8 : 1);
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
      const dmg = def.damage * (head ? 2.2 : 1);
      const killed = hitEnemy.damage(dmg);
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

  update(dt) {
    const s = this.state;
    const w = s.weapon();
    if (w.reloading && w.finishReload(s.time)) {
      this.bus.emit('reload-end', { weapon: w });
    }
    if (this.mouseDown && w.def.auto && s.status === 'playing') {
      this.tryFire();
    }
  }
}
