/**
 * Sonic Player Entity for Sonic Arcade 2D
 * Implements full 16-bit physics, state machine, Spin Dash, rolling, jumping, damage & invulnerability.
 */

import { Sprites } from '../assets/proceduralSprites';
import { PHYSICS, Rect, Slope, PhysicsHelper, LoopDeLoop } from './Physics';
import { Ring } from './Ring';
import { sounds } from './SoundEngine';
import { Particle } from './Enemy';

export type PlayerState =
  | 'IDLE'
  | 'WALK'
  | 'RUN'
  | 'SPRINT'
  | 'SKID'
  | 'JUMP'
  | 'ROLL'
  | 'SPINDASH'
  | 'HURT'
  | 'DEAD'
  | 'VICTORY';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  spinDashButton?: boolean;
  rollButton?: boolean;
}

export class Player {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public state: PlayerState = 'IDLE';
  public facingRight: boolean = true;
  public onGround: boolean = false;
  public rollAngle: number = 0;
  public animFrame: number = 0;

  // Spin Dash mechanics
  public spinRevLevel: number = 0;
  public spinChargeTimer: number = 0;

  // Invulnerability & Damage
  public invulnerableTimer: number = 0;
  public hurtTimer: number = 0;
  public lives: number = 3;
  public rings: number = 0;
  public score: number = 0;

  // Loop-de-loop state
  public inLoop: boolean = false;
  public loopProgress: number = 0; // 0 to 1
  public activeLoop: LoopDeLoop | null = null;
  public loopDirection: number = 1; // 1 = clockwise (left-to-right), -1 = counter-clockwise
  public loopCooldown: number = 0;

  // Hitbox
  public width: number = 24;
  public height: number = 36;

  // Checkpoint spawn
  public spawnX: number;
  public spawnY: number;

  constructor(spawnX: number, spawnY: number) {
    this.x = spawnX;
    this.y = spawnY;
    this.spawnX = spawnX;
    this.spawnY = spawnY;
  }

  reset(full: boolean = false) {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.state = 'IDLE';
    this.facingRight = true;
    this.onGround = true;
    this.rollAngle = 0;
    this.spinRevLevel = 0;
    this.hurtTimer = 0;
    this.invulnerableTimer = 1.0;
    this.inLoop = false;
    this.activeLoop = null;
    this.loopCooldown = 0;
    this.rings = 0;
    if (full) {
      this.lives = 3;
      this.score = 0;
    }
  }

  getHitbox(): Rect {
    const isBall = this.state === 'JUMP' || this.state === 'ROLL' || this.state === 'SPINDASH';
    const h = isBall ? 28 : this.height;
    return {
      x: this.x - this.width / 2,
      y: this.y - h,
      width: this.width,
      height: h,
    };
  }

  update(
    dt: number,
    input: InputState,
    platforms: Rect[],
    slopes: Slope[],
    loops: LoopDeLoop[],
    addParticle: (p: Particle) => void
  ): { scatteredRings?: Ring[]; reachedGoal?: boolean } {
    this.animFrame += dt;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }
    if (this.loopCooldown > 0) {
      this.loopCooldown -= dt;
    }

    // Dead state animation (fall off screen)
    if (this.state === 'DEAD') {
      this.vy += PHYSICS.GRAVITY;
      this.y += this.vy;
      return {};
    }

    // Hurt recoil state
    if (this.state === 'HURT') {
      this.hurtTimer -= dt;
      this.vy += PHYSICS.GRAVITY;
      this.x += this.vx;
      this.y += this.vy;

      const ground = PhysicsHelper.resolveGround(this.x, this.y, this.y - this.vy, this.height, platforms, slopes);
      if (ground.onGround && this.vy >= 0) {
        this.y = ground.resolvedY;
        this.vy = 0;
        this.vx = 0;
        this.onGround = true;
        if (this.hurtTimer <= 0) {
          this.state = 'IDLE';
        }
      }
      return {};
    }

    // Victory state (Sonic stops, poses at goal)
    if (this.state === 'VICTORY') {
      if (!this.onGround) {
        this.vy += PHYSICS.GRAVITY;
        this.y += this.vy;
        const ground = PhysicsHelper.resolveGround(this.x, this.y, this.y - this.vy, this.height, platforms, slopes);
        if (ground.onGround) {
          this.y = ground.resolvedY;
          this.vy = 0;
          this.onGround = true;
        }
      }
      this.vx *= 0.8;
      this.x += this.vx;
      return {};
    }

    // Loop-de-loop traversing logic (Smooth, glitch-free 360-degree traversal)
    if (this.inLoop && this.activeLoop) {
      const loop = this.activeLoop;
      const speed = Math.max(Math.abs(this.vx), 9.0);
      const circumference = 2 * Math.PI * loop.radius;
      // Step progress along circumference based on speed and delta-time
      const progressStep = (speed / circumference) * (dt * 60);

      this.loopProgress += progressStep;
      this.rollAngle += 0.45 * this.loopDirection;

      // Calculate position around loop circle:
      // At p = 0: angle is PI/2 (bottom center ground: x = cx, y = cy + radius = 440)
      // As p increases, sweeps 360 degrees around the loop
      const angle = Math.PI * 0.5 - this.loopDirection * (this.loopProgress * Math.PI * 2);
      this.x = loop.cx + Math.cos(angle) * loop.radius;
      this.y = loop.cy + Math.sin(angle) * loop.radius;

      // Blue energy speed particles inside loop
      if (Math.random() > 0.35) {
        addParticle({
          x: this.x,
          y: this.y,
          vx: -Math.cos(angle) * 3,
          vy: -Math.sin(angle) * 3,
          color: '#38bdf8',
          size: 4 + Math.random() * 3,
          alpha: 0.85,
          life: 0.22,
          maxLife: 0.22,
        });
      }

      // Finished loop (completed 360 degrees) -> cleanly eject with good momentum!
      if (this.loopProgress >= 1.0) {
        this.inLoop = false;
        this.activeLoop = null;
        this.loopCooldown = 0.8; // Prevent re-triggering!
        // Place Sonic safely at the exit side of the loop on the ground
        this.x = loop.cx + (this.loopDirection === 1 ? loop.radius + 15 : -loop.radius - 15);
        this.y = loop.cy + loop.radius;
        this.vx = this.loopDirection * Math.max(speed, 10.5); // Boost out of loop
        this.vy = 0;
        this.onGround = true;
        sounds.playSpring();
      }
      return {};
    }

    // Check entry into loop-de-loop
    if (this.loopCooldown <= 0 && this.onGround && !this.inLoop) {
      for (const loop of loops) {
        const groundY = loop.cy + loop.radius;
        if (Math.abs(this.y - groundY) < 22) {
          // Entering from left moving right
          if (this.vx > 2.5 && this.x >= loop.cx - loop.radius - 15 && this.x <= loop.cx - 5) {
            this.inLoop = true;
            this.activeLoop = loop;
            this.loopProgress = 0;
            this.loopDirection = 1;
            this.state = 'ROLL';
            sounds.playJump();
            return {};
          }
          // Entering from right moving left
          else if (this.vx < -2.5 && this.x <= loop.cx + loop.radius + 15 && this.x >= loop.cx + 5) {
            this.inLoop = true;
            this.activeLoop = loop;
            this.loopProgress = 0;
            this.loopDirection = -1;
            this.state = 'ROLL';
            sounds.playJump();
            return {};
          }
        }
      }
    }

    // --- SPIN DASH MECHANIC ---
    if (this.state === 'SPINDASH') {
      this.rollAngle += 0.4 + this.spinRevLevel * 0.1;

      // Charging: Pressing Jump while holding down revs up
      if (input.jumpJustPressed) {
        this.spinRevLevel = Math.min(this.spinRevLevel + 1, 6);
        sounds.playSpinRev(this.spinRevLevel);

        // Spawn dust puff
        addParticle({
          x: this.x + (this.facingRight ? -14 : 14),
          y: this.y - 2,
          vx: (this.facingRight ? -1 : 1) * (1.5 + Math.random() * 2),
          vy: -Math.random() * 2,
          color: '#cbd5e1',
          size: 4 + Math.random() * 3,
          alpha: 0.8,
          life: 0.35,
          maxLife: 0.35,
        });
      }

      // Releasing DOWN triggers the Spin Dash blast-off!
      if (!input.down) {
        const launchSpeed = PHYSICS.SPIN_DASH_MIN_RELEASE + this.spinRevLevel * PHYSICS.SPIN_DASH_CHARGE_POWER;
        this.vx = (this.facingRight ? 1 : -1) * launchSpeed;
        this.state = 'ROLL';
        this.spinRevLevel = 0;
        sounds.playSpinRelease();

        // Release smoke burst
        for (let i = 0; i < 8; i++) {
          addParticle({
            x: this.x + (this.facingRight ? -12 : 12),
            y: this.y - 4,
            vx: (this.facingRight ? -1 : 1) * (2 + Math.random() * 3),
            vy: -Math.random() * 2.5,
            color: '#e2e8f0',
            size: 5 + Math.random() * 4,
            alpha: 0.9,
            life: 0.4,
            maxLife: 0.4,
          });
        }
      }
      return {};
    }

    // Initiate Spin Dash: Ducking (Down) on ground + Jump just pressed
    if (this.onGround && input.down && Math.abs(this.vx) < 1.0 && (input.jumpJustPressed || input.spinDashButton)) {
      this.state = 'SPINDASH';
      this.spinRevLevel = 1;
      this.vx = 0;
      sounds.playSpinRev(1);
      return {};
    }

    // --- HORIZONTAL MOVEMENT & INERTIA ---
    const accel = this.onGround ? PHYSICS.ACCELERATION : PHYSICS.AIR_ACCEL;
    const isRolling = this.state === 'ROLL';

    if (input.left) {
      if (this.vx > 4.5 && this.onGround && !isRolling) {
        // High speed skid / brake
        this.state = 'SKID';
        this.vx -= PHYSICS.DECELERATION;
        if (Math.random() > 0.5) {
          addParticle({
            x: this.x + 8,
            y: this.y - 2,
            vx: 1.5 + Math.random() * 2,
            vy: -1 - Math.random() * 1.5,
            color: '#e2e8f0',
            size: 3 + Math.random() * 3,
            alpha: 0.7,
            life: 0.25,
            maxLife: 0.25,
          });
        }
      } else if (this.vx > 0) {
        // Instant crisp reverse turn (no slow sliding)
        this.vx = -accel * 1.5;
        this.facingRight = false;
      } else {
        this.facingRight = false;
        this.vx -= accel;
        const maxSpd = -PHYSICS.TOP_RUN_SPEED;
        if (this.vx < maxSpd) this.vx = maxSpd;
      }
    } else if (input.right) {
      if (this.vx < -4.5 && this.onGround && !isRolling) {
        // High speed skid / brake
        this.state = 'SKID';
        this.vx += PHYSICS.DECELERATION;
        if (Math.random() > 0.5) {
          addParticle({
            x: this.x - 8,
            y: this.y - 2,
            vx: -1.5 - Math.random() * 2,
            vy: -1 - Math.random() * 1.5,
            color: '#e2e8f0',
            size: 3 + Math.random() * 3,
            alpha: 0.7,
            life: 0.25,
            maxLife: 0.25,
          });
        }
      } else if (this.vx < 0) {
        // Instant crisp reverse turn
        this.vx = accel * 1.5;
        this.facingRight = true;
      } else {
        this.facingRight = true;
        this.vx += accel;
        const maxSpd = PHYSICS.TOP_RUN_SPEED;
        if (this.vx > maxSpd) this.vx = maxSpd;
      }
    } else {
      // Natural firm friction when no horizontal keys pressed
      const friction = isRolling ? PHYSICS.ROLL_FRICTION : PHYSICS.FRICTION;
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - friction);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + friction);
      }
      // Stop firmly (prevent floating ice skating effect)
      if (!isRolling && Math.abs(this.vx) < 0.35) {
        this.vx = 0;
      }
    }

    // Direct Rolling steer: allow player to steer and boost roll speed with arrow keys
    if (isRolling && this.onGround) {
      if (input.right) {
        this.vx = Math.min(PHYSICS.TOP_RUN_SPEED, this.vx + 0.25);
        this.facingRight = true;
      } else if (input.left) {
        this.vx = Math.max(-PHYSICS.TOP_RUN_SPEED, this.vx - 0.25);
        this.facingRight = false;
      }
    }

    // Instant Pelota / Ball Attack Mechanic:
    // Pressing DOWN (↓), S, or Roll Button immediately curls Sonic into an attacking ball!
    if ((input.down || input.rollButton) && this.state !== 'ROLL') {
      this.state = 'ROLL';
      // If nearly standing still, give an immediate forward attack roll impulse!
      if (this.onGround && Math.abs(this.vx) < 1.5) {
        this.vx = (this.facingRight ? 1 : -1) * 6.2;
      }
      sounds.playJump();
    }

    // High-speed speed blur / afterimage particles
    if (Math.abs(this.vx) > 7.0) {
      if (Math.random() > 0.4) {
        addParticle({
          x: this.x + (Math.random() - 0.5) * 8,
          y: this.y - 12 + (Math.random() - 0.5) * 8,
          vx: -this.vx * 0.15,
          vy: (Math.random() - 0.5) * 1.5,
          color: isRolling ? '#38bdf8' : '#60a5fa',
          size: isRolling ? 6 : 4,
          alpha: 0.65,
          life: 0.2,
          maxLife: 0.2,
        });
      }
    }

    // Uncurl from ball when stopping and releasing Down, or pressing Up
    if (isRolling && this.onGround) {
      if (input.up || (Math.abs(this.vx) < 0.4 && !input.down && !input.rollButton)) {
        this.state = 'IDLE';
      }
    }

    // --- JUMPING MECHANIC ---
    if (this.onGround && input.jumpJustPressed) {
      this.vy = PHYSICS.JUMP_IMPULSE_MAX;
      this.onGround = false;
      this.state = 'JUMP';
      sounds.playJump();
    }

    // Variable jump height: release jump early to cut upward impulse
    if (!this.onGround && !input.jump && this.vy < PHYSICS.JUMP_IMPULSE_MIN) {
      this.vy = PHYSICS.JUMP_IMPULSE_MIN;
    }

    // --- GRAVITY & INTEGRATION ---
    if (!this.onGround) {
      this.vy += PHYSICS.GRAVITY;
      if (this.vy > PHYSICS.MAX_FALL_SPEED) {
        this.vy = PHYSICS.MAX_FALL_SPEED;
      }
    }

    // Apply velocities
    this.x += this.vx;
    const prevY = this.y;
    this.y += this.vy;

    // Rolling rotation angle
    if (this.state === 'ROLL' || this.state === 'JUMP') {
      this.rollAngle += (this.vx !== 0 ? this.vx : (this.facingRight ? 1 : -1) * 8) * 0.05;
    }

    // Resolve ground collision
    const ground = PhysicsHelper.resolveGround(this.x, this.y, prevY, this.height, platforms, slopes);
    if (ground.onGround && this.vy >= 0) {
      this.y = ground.resolvedY;
      this.vy = 0;
      this.onGround = true;

      if (this.state === 'JUMP') {
        this.state = Math.abs(this.vx) > 0.5 ? 'RUN' : 'IDLE';
      }
    } else {
      this.onGround = false;
      if (this.state !== 'ROLL' && this.state !== 'JUMP') {
        this.state = 'JUMP';
      }
    }

    // Determine current ground animation state
    if (this.onGround) {
      const absSpeed = Math.abs(this.vx);
      if (this.state !== 'ROLL') {
        if (absSpeed > PHYSICS.SPRINT_SPEED * 0.85) {
          this.state = 'SPRINT';
        } else if (absSpeed > 3.0) {
          this.state = 'RUN';
        } else if (absSpeed > 0.2) {
          this.state = 'WALK';
        } else if (this.state !== 'SKID') {
          this.state = 'IDLE';
        }
      }
    }

    // Check pit fall / death
    if (this.y > 1000) {
      this.takeDamage(true);
    }

    return {};
  }

  // Handle damage from Badniks or Spikes
  takeDamage(instantDeath: boolean = false): Ring[] {
    if (this.invulnerableTimer > 0 && !instantDeath) {
      return [];
    }

    if (instantDeath || this.rings === 0) {
      // Sonic dies: hops up and drops off screen
      this.state = 'DEAD';
      this.vy = -8.0;
      this.vx = 0;
      this.lives--;
      sounds.playGameOver();
      return [];
    }

    // Hurt recoil & ring scatter
    const scattered = Ring.createScatterExplosion(this.x, this.y, this.rings);
    this.rings = 0;
    this.state = 'HURT';
    this.vy = -6.5;
    this.vx = (this.facingRight ? -1 : 1) * 3.5;
    this.hurtTimer = 0.5;
    this.invulnerableTimer = 2.2;
    this.onGround = false;

    return scattered;
  }

  // Spring launch
  hitSpring(type: 'up' | 'right') {
    sounds.playSpring();
    if (type === 'up') {
      this.vy = PHYSICS.SPRING_UP_VELOCITY;
      this.onGround = false;
      this.state = 'JUMP';
    } else {
      this.vx = PHYSICS.SPRING_RIGHT_VELOCITY;
      this.facingRight = true;
      this.state = 'SPRINT';
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    Sprites.drawSonic(
      ctx,
      this.x,
      this.y,
      this.state,
      this.animFrame,
      this.facingRight,
      this.rollAngle,
      this.invulnerableTimer > 0
    );
  }
}
