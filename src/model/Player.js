export class Player {
  constructor() {
    this.maxHp = 100;
    this.hp = 100;
    this.x = 0; this.y = 0; this.z = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.bobPhase = 0;
    this.bobY = 0;
    this.recoilOffset = 0;
    this.recoilVel = 0;
    this.eye = 1.66;
    this.radius = 0.35;
    this.speed = 4.3;
    this.moving = false;
  }

  reset() {
    this.hp = this.maxHp;
    this.x = 0; this.y = 0; this.z = 0;
    this.yaw = Math.PI / 2; this.pitch = 0;
    this.bobPhase = 0; this.bobY = 0;
    this.recoilOffset = 0; this.recoilVel = 0;
  }

  addRecoil(amount) {
    this.recoilVel += amount * 3.2;
  }

  updateRecoil(dt) {
    const stiffness = 55, damping = 9;
    this.recoilVel += (-stiffness * this.recoilOffset - damping * this.recoilVel) * dt;
    this.recoilOffset += this.recoilVel * dt;
  }

  damage(n) {
    this.hp = Math.max(0, this.hp - n);
    return this.hp <= 0;
  }
}
