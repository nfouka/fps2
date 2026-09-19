export class UIController {
  constructor(state, bus, hooks) {
    this.state = state;
    this.bus = bus;
    this.hooks = hooks; // { start, resume, restart }

    const $ = (id) => document.getElementById(id);
    this.menu = $('menu');
    this.pause = $('pause');
    this.dead = $('dead');
    this.finalScore = $('final-score');
    this.lum = $('lum');

    $('start-btn').addEventListener('click', () => hooks.start());
    $('resume-btn').addEventListener('click', () => hooks.resume());
    $('restart-btn').addEventListener('click', () => hooks.restart());

    this.lum.addEventListener('input', () => {
      const v = parseFloat(this.lum.value);
      state.brightness = v;
      bus.emit('brightness', v);
    });

    document.addEventListener('pointerlockchange', () => {
      const locked = !!document.pointerLockElement;
      if (!locked && state.status === 'playing') {
        state.status = 'paused';
        this.show('pause');
      }
    });

    bus.on('game-over', (e) => {
      this.finalScore.textContent = e.score;
      this.show('dead');
    });

    this.lum.value = state.brightness;
  }

  show(which) {
    this.menu.style.display = which === 'menu' ? 'flex' : 'none';
    this.pause.style.display = which === 'pause' ? 'flex' : 'none';
    this.dead.style.display = which === 'dead' ? 'flex' : 'none';
  }

  hideAll() {
    this.show(null);
  }
}
