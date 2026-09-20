let NEXT_ID = 1;

export class Enemy {
  constructor(x, z, wave) {
    this.id = NEXT_ID++;
    this.kind = 'zombie';
    this.x = x; this.y = 0; this.z = z;
    this.yaw = 0;
    this.maxHp = 60 + wave * 12;
    this.hp = this.maxHp;
    this.speed = 1.3 + Math.random() * 0.5 + wave * 0.08;
    this.radius = 0.45;
    this.state = 'chasing'; // chasing | attacking | dying
    this.walkPhase = Math.random() * Math.PI * 2;
    this.attackCd = 0;
    this.hitFlash = 0;
    this.deathTime = 0;
    this.fallDir = Math.random() < 0.5 ? 1 : -1;
    this.hue = 90 + (Math.random() * 40 - 20);
    this.attackAnim = 0;
    this.attackDamage = 7 + wave;
    this.onPlatform = false;
  }

  get alive() { return this.state !== 'dying'; }

  damage(n) {
    if (this.state === 'dying') return false;
    this.hp -= n;
    this.hitFlash = 1;
    if (this.hp <= 0) {
      this.state = 'dying';
      this.deathTime = 0;
      return true;
    }
    return false;
  }

  kill() {
    if (this.state === 'dying') return false;
    this.hp = 0;
    this.state = 'dying';
    this.deathTime = 0;
    return true;
  }
}
