/**
 * Badnik Enemy System for Sonic Arcade 2D
 * Controls Motobug and Buzz Bomber AI behaviors, collision, and destruction mechanics.
 */

import { Sprites } from '../assets/proceduralSprites';
import { Rect, PhysicsHelper } from './Physics';
import { sounds } from './SoundEngine';

export type EnemyType = 'motobug' | 'buzzbomber' | 'crabmeat';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FreedAnimal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  facingRight: boolean;
}

export class Enemy {
  public x: number;
  public y: number;
  public type: EnemyType;
  public minX: number;
  public maxX: number;
  public vx: number;
  public facingRight: boolean = true;
  public isDead: boolean = false;
  public width: number = 32;
  public height: number = 24;

  constructor(type: EnemyType, x: number, y: number, patrolDist: number = 140) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.minX = x - patrolDist;
    this.maxX = x + patrolDist;
    if (type === 'motobug') {
      this.vx = 1.6;
    } else if (type === 'buzzbomber') {
      this.vx = 2.4;
    } else {
      this.vx = 1.0; // Crabmeat
    }
    this.facingRight = Math.random() > 0.5;
    if (!this.facingRight) this.vx = -this.vx;
  }

  update(dt: number) {
    if (this.isDead) return;

    this.x += this.vx;

    // Turn around at patrol limits
    if (this.vx > 0 && this.x >= this.maxX) {
      this.vx = -Math.abs(this.vx);
      this.facingRight = false;
    } else if (this.vx < 0 && this.x <= this.minX) {
      this.vx = Math.abs(this.vx);
      this.facingRight = true;
    }
  }

  getHitbox(): Rect {
    return {
      x: this.x - 16,
      y: this.y - 20,
      width: this.width,
      height: this.height,
    };
  }

  destroy(): { score: number; particles: Particle[]; animal: FreedAnimal } {
    this.isDead = true;
    sounds.playDestroy();

    // Create explosion puff particles
    const particles: Particle[] = [];
    const colors = ['#ffffff', '#facc15', '#f97316', '#64748b'];

    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particles.push({
        x: this.x,
        y: this.y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        life: 0.6,
        maxLife: 0.6,
      });
    }

    // Animal buddy freed
    const animal: FreedAnimal = {
      x: this.x,
      y: this.y - 12,
      vx: (Math.random() > 0.5 ? 1 : -1) * 2.2,
      vy: -5.0,
      life: 4.0,
      facingRight: Math.random() > 0.5,
    };

    return { score: 100, particles, animal };
  }

  draw(ctx: CanvasRenderingContext2D, animFrame: number) {
    if (this.isDead) return;

    if (this.type === 'motobug') {
      Sprites.drawMotobug(ctx, this.x, this.y, this.facingRight, animFrame);
    } else if (this.type === 'buzzbomber') {
      Sprites.drawBuzzBomber(ctx, this.x, this.y, this.facingRight, animFrame);
    } else {
      Sprites.drawCrabmeat(ctx, this.x, this.y, this.facingRight, animFrame);
    }
  }
}
