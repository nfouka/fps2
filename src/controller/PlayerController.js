import { resolveCircleAABB } from '../model/Raycast.js';
import { groundHeight } from '../view/SubwayStation.js';

const SENS = 0.0021;

export class PlayerController {
  constructor(camera, state, station, bus) {
    this.camera = camera;
    this.state = state;
    this.station = station;
    this.bus = bus;
    this.keys = {};
    this.lastStep = 0;
    this.escaped = false;
    this.camera.rotation.order = 'YXZ';
    bus.on('game-start', () => { this.escaped = false; });

    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      this.keys[e.code] = true;
      if (e.code === 'BracketLeft') this.adjustBrightness(-0.1);
      if (e.code === 'BracketRight') this.adjustBrightness(0.1);
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    document.addEventListener('mousemove', (e) => {
      if (!document.pointerLockElement) return;
      if (this.state.status !== 'playing') return;
      const p = this.state.player;
      p.yaw -= e.movementX * SENS;
      p.pitch -= e.movementY * SENS;
      p.pitch = Math.max(-1.5, Math.min(1.5, p.pitch));
    });
  }

  adjustBrightness(d) {
    const v = Math.max(0.25, Math.min(1.6, this.state.brightness + d));
    this.state.brightness = v;
    this.bus.emit('brightness', v);
    const slider = document.getElementById('lum');
    if (slider) slider.value = v;
  }

  update(dt) {
    const p = this.state.player;
    const k = this.keys;

    let mx = 0, mz = 0;
    if (k['KeyW'] || k['ArrowUp']) mz -= 1;
    if (k['KeyS'] || k['ArrowDown']) mz += 1;
    if (k['KeyA'] || k['ArrowLeft']) mx -= 1;
    if (k['KeyD'] || k['ArrowRight']) mx += 1;

    // gravité + support (quai, voies, rampe, escalier + dessus des caisses)
    const r = p.radius;
    let supportY = groundHeight(p.x, p.z);
    for (const b of this.station.blockers) {
      if (p.x + r > b.min.x && p.x - r < b.max.x && p.z + r > b.min.z && p.z - r < b.max.z) {
        const top = b.max.y;
        // la caisse soutient le joueur si son dessus est sous ses pieds (debout dessus)
        if (top >= supportY - 1e-3 && top <= p.y + 0.12 && top > supportY) supportY = top;
      }
    }
    if (p.vy <= 0 && p.y <= supportY + 0.02) { p.y = supportY; p.vy = 0; p.grounded = true; }
    else p.grounded = false;
    if (!p.grounded) {
      p.vy -= 12 * dt;
      p.y += p.vy * dt;
      if (p.y < supportY) { p.y = supportY; p.vy = 0; }
    } else if (supportY > p.y && supportY - p.y <= 0.16) {
      p.y = supportY;
    }

    // saut + accroupissement
    if (k['Space'] && p.grounded) p.vy = 4.6;
    p.crouch = !!(k['ControlLeft'] || k['ControlRight'] || k['KeyC']) && p.grounded;
    p.speed = p.crouch ? 2.2 : 4.3;
    const targetEye = p.crouch ? 0.95 : 1.66;
    p.eye += (targetEye - p.eye) * Math.min(1, dt * 14);

    p.moving = (mx !== 0 || mz !== 0);
    if (p.moving) {
      const len = Math.hypot(mx, mz);
      mx /= len; mz /= len;
      const sin = Math.sin(p.yaw), cos = Math.cos(p.yaw);
      const vx = (mx * cos + mz * sin) * p.speed;
      const vz = (mz * cos - mx * sin) * p.speed;
      p.x += vx * dt;
      p.z += vz * dt;

      // head bob + pas
      p.bobPhase += dt * 9.5;
      const s = Math.sin(p.bobPhase);
      if ((s > 0.9 && this.prevS <= 0.9) || (s < -0.9 && this.prevS >= -0.9)) {
        this.bus.emit('footstep');
      }
      this.prevS = s;
    } else {
      p.bobPhase += dt * 1.2;
    }

    // collisions (quai, colonnes, mobilier) — pas de repulsion latérale si le joueur est au-dessus d'une caisse
    for (const b of this.station.blockers) {
      if (p.y > b.max.y - 0.15) continue;
      const fix = resolveCircleAABB(p.x, p.z, p.radius, b);
      if (fix) { p.x += fix.x; p.z += fix.z; }
    }
    p.x = Math.max(-29.4, Math.min(29.9, p.x));
    p.z = Math.max(-10.2, Math.min(10.2, p.z));

    // issue de secours atteinte -> niveau supérieur
    if (!this.escaped && p.x > 29.2 && p.z > 2.0 && p.z < 4.4 && p.y > 1.2) {
      this.escaped = true;
      const lvl = ++this.state.exitLevel;
      this.state.addScore(500 * lvl);
      this.state.heal(40);
      this.state.grenades += 1;
      this.state.napalm += 1;
      p.x = 4; p.z = 0; p.y = 0; p.vy = 0;
      this.bus.emit('station-clear', { level: lvl });
    }

    // recul ressort
    p.updateRecoil(dt);

    // caméra
    const bobScale = !p.grounded ? 0 : p.crouch ? 0.4 : 1;
    p.bobY = (p.moving ? Math.sin(p.bobPhase * 2) * 0.03 : Math.sin(p.bobPhase) * 0.006) * bobScale;
    this.camera.position.set(p.x, p.y + p.eye + p.bobY, p.z);
    this.camera.rotation.set(
      Math.max(-1.5, Math.min(1.5, p.pitch)),
      p.yaw,
      Math.sin(p.bobPhase) * 0.004
    );
  }
}
