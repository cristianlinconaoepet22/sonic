/**
 * Ring entity & Ring Scatter System for Sonic Arcade 2D
 * Manages collectible rings and scattered bounce physics when Sonic takes damage.
 */

import { Sprites } from '../assets/proceduralSprites';
import { Rect, Slope, PhysicsHelper } from './Physics';
import { sounds } from './SoundEngine';

export class Ring {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public isScattered: boolean = false;
  public collected: boolean = false;
  public lifeTimer: number = 0; // seconds remaining
  public pickupCooldown: number = 0; // seconds before Sonic can recollected
  public radius: number = 10;

  constructor(x: number, y: number, isScattered: boolean = false, vx: number = 0, vy: number = 0) {
    this.x = x;
    this.y = y;
    this.isScattered = isScattered;
    this.vx = vx;
    this.vy = vy;
    if (isScattered) {
      this.lifeTimer = 4.5;
      this.pickupCooldown = 0.45;
    }
  }

  update(dt: number, platforms: Rect[], slopes: Slope[]): boolean {
    if (this.collected) return false;

    if (this.isScattered) {
      this.lifeTimer -= dt;
      if (this.pickupCooldown > 0) {
        this.pickupCooldown -= dt;
      }
      if (this.lifeTimer <= 0) {
        return false; // Despawn
      }

      // Gravity and movement
      this.vy += 0.28;
      this.x += this.vx;
      const prevY = this.y;
      this.y += this.vy;

      // Platform ground collision & bounce
      const ground = PhysicsHelper.resolveGround(this.x, this.y, prevY, 10, platforms, slopes);
      if (ground.onGround) {
        this.y = ground.resolvedY - 8;
        this.vy = -this.vy * 0.72; // Bounce restitution
        this.vx *= 0.88; // Friction
        if (Math.abs(this.vy) < 0.8) {
          this.vy = 0;
        }
      }
    }

    return true;
  }

  draw(ctx: CanvasRenderingContext2D, animFrame: number) {
    if (this.collected) return;

    // If scattered and about to expire, flash visibility
    if (this.isScattered && this.lifeTimer < 1.5) {
      if (Math.floor(this.lifeTimer * 12) % 2 === 0) {
        return;
      }
    }

    Sprites.drawRing(ctx, this.x, this.y, animFrame);
  }

  // Create scattered burst of rings when damaged
  static createScatterExplosion(originX: number, originY: number, count: number): Ring[] {
    sounds.playRingLoss();
    const scattered: Ring[] = [];
    const ringCount = Math.min(count, 24); // Limit to 24 for performance and classic feel

    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const speed = 3.5 + Math.random() * 4.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 3.5; // Bias upward

      scattered.push(new Ring(originX, originY - 12, true, vx, vy));
    }

    return scattered;
  }
}
