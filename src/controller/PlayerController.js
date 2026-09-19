import { resolveCircleAABB } from '../model/Raycast.js';

const SENS = 0.0021;

export class PlayerController {
  constructor(camera, state, station, bus) {
    this.camera = camera;
    this.state = state;
    this.station = station;
    this.bus = bus;
    this.keys = {};
    this.lastStep = 0;

    window.addEventListener('keydown', (e) => {
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
    if (k['KeyW']) mz -= 1;
    if (k['KeyS']) mz += 1;
    if (k['KeyA']) mx -= 1;
    if (k['KeyD']) mx += 1;

    p.moving = (mx !== 0 || mz !== 0);
    if (p.moving) {
      const len = Math.hypot(mx, mz);
      mx /= len; mz /= len;
      const sin = Math.sin(p.yaw), cos = Math.cos(p.yaw);
      const vx = (mx * cos - mz * sin) * p.speed;
      const vz = (mx * sin + mz * cos) * p.speed;
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

    // collisions (quai, colonnes, mobilier)
    for (const b of this.station.blockers) {
      const fix = resolveCircleAABB(p.x, p.z, p.radius, b);
      if (fix) { p.x += fix.x; p.z += fix.z; }
    }
    p.x = Math.max(-29.4, Math.min(29.4, p.x));
    p.z = Math.max(-4.5, Math.min(4.5, p.z));

    // recul ressort
    p.updateRecoil(dt);

    // caméra
    p.bobY = p.moving ? Math.sin(p.bobPhase * 2) * 0.03 : Math.sin(p.bobPhase) * 0.006;
    this.camera.position.set(p.x, p.eye + p.bobY, p.z);
    this.camera.rotation.set(
      Math.max(-1.5, Math.min(1.5, p.pitch + p.recoilOffset)),
      p.yaw,
      Math.sin(p.bobPhase) * 0.004
    );
  }
}
