import { Player } from './Player.js';
import { Weapon, WEAPONS, WEAPON_ORDER } from './Weapon.js';

export class GameState {
  constructor(bus) {
    this.bus = bus;
    this.status = 'menu'; // menu | playing | paused | dead
    this.time = 0;
    this.score = 0;
    this.wave = 0;
    this.brightness = 1.0;
    this.grenades = 4;
    this.napalm = 2;
    this.exitLevel = 1;
    this.ads = false;
    this.adsRange = null;
    this.player = new Player();
    this.enemies = [];
    this.weapons = WEAPON_ORDER.map((id) => new Weapon(WEAPONS[id]));
    this.weaponIndex = 1;
  }

  weapon() { return this.weapons[this.weaponIndex]; }

  switchWeapon(dir) {
    const n = this.weapons.length;
    this.weapons[this.weaponIndex].cancelReload();
    this.weaponIndex = (this.weaponIndex + dir + n) % n;
    this.bus.emit('weapon-switched', { weapon: this.weapon(), index: this.weaponIndex });
  }

  addScore(n) { this.score += n; }

  heal(n) { this.player.hp = Math.min(this.player.maxHp, this.player.hp + n); }

  reset() {
    this.time = 0;
    this.score = 0;
    this.wave = 0;
    this.grenades = 4;
    this.napalm = 2;
    this.exitLevel = 1;
    this.ads = false;
    this.adsRange = null;
    this.player.reset();
    this.enemies.length = 0;
    this.weapons = WEAPON_ORDER.map((id) => new Weapon(WEAPONS[id]));
    this.weaponIndex = 1;
  }
}
