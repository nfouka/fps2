export const WEAPONS = {
  pistol:  { id: 'pistol',  name: 'M9 PISTOL',    auto: false, rpm: 340, mag: 12,   reserve: 60,  damage: 34, spread: 0.012, recoil: 1.0,  pellets: 1, reloadTime: 1.2, range: 60, sound: 'pistol' },
  carbine: { id: 'carbine', name: 'M4 CARBINE',   auto: true,  rpm: 720, mag: 30,   reserve: 180, damage: 26, spread: 0.022, recoil: 0.75, pellets: 1, reloadTime: 1.8, range: 80, sound: 'carbine' },
  shotgun: { id: 'shotgun', name: 'M870 SHOTGUN', auto: false, rpm: 70,  mag: 7,    reserve: 35,  damage: 13, spread: 0.09,  recoil: 2.6,  pellets: 9, reloadTime: 2.6, range: 28, sound: 'shotgun' },
  saw:     { id: 'saw',     name: 'M249 SAW',     auto: true,  rpm: 780, mag: 1000, reserve: 0,   damage: 22, spread: 0.038, recoil: 0.6,  pellets: 1, reloadTime: 6.0, range: 75, sound: 'saw' },
};

export const WEAPON_ORDER = ['pistol', 'carbine', 'shotgun', 'saw'];

export class Weapon {
  constructor(def) {
    this.def = def;
    this.id = def.id;
    this.mag = def.mag;
    this.reserve = def.reserve;
    this.reloading = false;
    this.reloadEnd = 0;
    this.nextShot = 0;
  }

  get interval() { return 60 / this.def.rpm; }
  get empty() { return this.mag <= 0; }

  canFire(now) {
    return !this.reloading && this.mag > 0 && now >= this.nextShot;
  }

  fire(now) {
    this.mag--;
    this.nextShot = now + this.interval;
  }

  startReload(now) {
    if (this.reloading || this.mag >= this.def.mag || this.reserve <= 0) return false;
    this.reloading = true;
    this.reloadEnd = now + this.def.reloadTime;
    return true;
  }

  finishReload(now) {
    if (!this.reloading || now < this.reloadEnd) return false;
    this.reloading = false;
    const need = this.def.mag - this.mag;
    const take = Math.min(need, this.reserve);
    this.mag += take;
    this.reserve -= take;
    return true;
  }

  cancelReload() {
    this.reloading = false;
  }
}
