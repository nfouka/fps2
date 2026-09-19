export function attachSFX(am, bus) {
  const shots = {
    pistol: () => {
      am.noise(0.16, 'bandpass', 1400, 0.5, 0.8);
      am.tone('square', 180, 60, 0.1, 0.25);
    },
    carbine: () => {
      am.noise(0.12, 'bandpass', 1800, 0.55, 0.9);
      am.tone('square', 220, 70, 0.08, 0.3);
    },
    shotgun: () => {
      am.noise(0.35, 'lowpass', 900, 0.8, 0.7);
      am.tone('sine', 90, 35, 0.3, 0.5);
    },
    saw: () => {
      am.noise(0.1, 'bandpass', 1200, 0.65, 0.7);
      am.tone('square', 150, 55, 0.09, 0.38);
    },
  };

  bus.on('shot', (e) => (shots[e.weapon.def.sound] || shots.carbine)());

  bus.on('miss', () => {
    am.noise(0.06, 'highpass', 3000, 0.12);
  });

  bus.on('hit', (e) => {
    am.noise(0.12, 'lowpass', 500, 0.4);
    if (e.head) am.tone('triangle', 900, 300, 0.12, 0.2);
  });

  bus.on('reload-start', () => {
    am.noise(0.05, 'bandpass', 2200, 0.3);
  });
  bus.on('reload-end', () => {
    am.noise(0.05, 'bandpass', 2600, 0.35);
    setTimeout(() => am.noise(0.04, 'bandpass', 1800, 0.3), 120);
  });

  bus.on('enemy-killed', () => {
    am.tone('sawtooth', 160, 40, 0.6, 0.3);
    am.noise(0.3, 'lowpass', 400, 0.35);
  });

  bus.on('growl', (e) => {
    const vol = Math.max(0.04, 0.3 - e.dist * 0.012);
    const ctx = am.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70 + Math.random() * 30, t);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 9 + Math.random() * 6;
    const lg = ctx.createGain();
    lg.gain.value = 18;
    lfo.connect(lg).connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.15);
    g.gain.linearRampToValueAtTime(0, t + 0.9);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 500;
    o.connect(lp).connect(g).connect(am.master);
    o.start(t); lfo.start(t);
    o.stop(t + 1); lfo.stop(t + 1);
  });

  bus.on('player-hurt', () => {
    am.tone('sine', 110, 50, 0.35, 0.5);
    am.noise(0.15, 'lowpass', 300, 0.4);
  });

  bus.on('footstep', () => {
    am.noise(0.07, 'bandpass', 350, 0.14, 1.2);
  });

  bus.on('wave-start', () => {
    am.tone('square', 440, 440, 0.18, 0.18);
    setTimeout(() => am.tone('square', 330, 330, 0.25, 0.18), 220);
  });

  bus.on('game-over', () => {
    am.tone('sawtooth', 220, 30, 1.6, 0.4);
  });
}
