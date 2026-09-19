export class HUD {
  constructor(state, bus) {
    this.state = state;
    this.el = {
      crosshair: document.getElementById('crosshair'),
      ammo: document.getElementById('ammo'),
      wname: document.getElementById('wname'),
      hpFill: document.getElementById('hp-fill'),
      hpText: document.getElementById('hp-text'),
      wave: document.getElementById('wave'),
      score: document.getElementById('score'),
      hitmarker: document.getElementById('hitmarker'),
      vignette: document.getElementById('vignette'),
      reload: document.getElementById('reload'),
      banner: document.getElementById('banner'),
    };

    this.vignetteT = 0;
    this.hitT = 0;

    bus.on('hit', (e) => {
      this.hitT = 0.12;
      this.el.hitmarker.classList.toggle('head', !!e.head);
    });
    bus.on('player-hurt', () => { this.vignetteT = 0.5; });
    bus.on('wave-start', (e) => this.showBanner(`VAGUE ${e.wave}`));
    bus.on('weapon-switched', (e) => this.showBanner(e.weapon.name));
    bus.on('game-over', () => { this.el.crosshair.style.display = 'none'; });
    bus.on('game-start', () => { this.el.crosshair.style.display = ''; });
  }

  showBanner(text) {
    const b = this.el.banner;
    b.textContent = text;
    b.classList.add('show');
    clearTimeout(this._bt);
    this._bt = setTimeout(() => b.classList.remove('show'), 1600);
  }

  update(dt) {
    const s = this.state;
    const w = s.weapon();
    this.el.ammo.textContent = w.reserve > 0 ? `${w.mag} / ${w.reserve}` : `${w.mag}`;
    this.el.wname.textContent = w.def.name;
    this.el.hpFill.style.width = `${(s.player.hp / s.player.maxHp) * 100}%`;
    this.el.hpText.textContent = Math.ceil(s.player.hp);
    this.el.wave.textContent = s.wave;
    this.el.score.textContent = s.score;

    this.el.reload.style.display = w.reloading ? 'block' : 'none';

    if (this.hitT > 0) {
      this.hitT -= dt;
      this.el.hitmarker.style.opacity = this.hitT > 0 ? 1 : 0;
    }
    if (this.vignetteT > 0) {
      this.vignetteT -= dt;
      this.el.vignette.style.opacity = Math.min(0.75, this.vignetteT * 1.6);
    } else {
      this.el.vignette.style.opacity = 0;
    }
  }
}
