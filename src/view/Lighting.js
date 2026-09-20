import * as THREE from 'three';

export class Lighting {
  constructor(scene, engine, station, bus) {
    this.engine = engine;
    this.mul = 1;

    this.hemi = new THREE.HemisphereLight(0x6a7a96, 0x1a1d24, 0.8);
    scene.add(this.hemi);

    this.lights = [];
    this.flicker = new Map();
    for (let x = -24; x <= 24; x += 8) {
      const l = new THREE.PointLight(0xfff0d0, 46, 26, 1.6);
      l.position.set(x, 2.85, 0);
      scene.add(l);
      this.lights.push({ light: l, base: 46 });
    }
    // deux réglettes grésillent
    this.flicker.set(this.lights[2], { t: 0, drop: 0 });
    this.flicker.set(this.lights[5], { t: 0, drop: 0 });

    // lueurs dans les tunnels
    for (const s of [1, -1]) for (const t of [1, -1]) {
      const l = new THREE.PointLight(0x3a5a80, 12, 16, 2);
      l.position.set(s * 33, 0.6, t * 8);
      scene.add(l);
      this.lights.push({ light: l, base: 12 });
    }

    this.strips = station.lightStrips;

    bus.on('brightness', (v) => this.setBrightness(v));
  }

  setBrightness(v) {
    this.mul = v;
    this.engine.renderer.toneMappingExposure = 0.55 + 0.75 * v;
    for (const s of this.strips) s.material.color.setScalar(0.7 + 0.5 * v);
  }

  update(time) {
    for (const { light, base } of this.lights) {
      let f = this.flicker.get(this.lights.find((o) => o.light === light));
      if (f) {
        f.t -= 0.016;
        if (f.t <= 0) {
          f.t = 0.03 + Math.random() * 0.2;
          f.drop = Math.random() < 0.22 ? Math.random() * 0.85 : 0;
        }
        light.intensity = base * this.mul * (1 - f.drop) * (0.92 + 0.08 * Math.sin(time * 40 + light.position.x));
      } else {
        light.intensity = base * this.mul;
      }
    }
  }
}
