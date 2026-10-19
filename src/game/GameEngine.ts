/**
 * Main Game Engine for Sonic Arcade 2D
 * Controls 60FPS loop, camera lerping, collisions, particle systems, HUD, and game state transitions.
 */

import { Player, InputState } from './Player';
import { Level } from './Level';
import { Ring } from './Ring';
import { Particle, FreedAnimal } from './Enemy';
import { PhysicsHelper } from './Physics';
import { sounds } from './SoundEngine';
import { Sprites } from '../assets/proceduralSprites';

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_CLEAR' | 'GAME_OVER';

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  life: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public state: GameState = 'TITLE';

  // Core entities
  public player: Player;
  public level: Level;
  public scatteredRings: Ring[] = [];
  public particles: Particle[] = [];
  public animals: FreedAnimal[] = [];
  public scorePopups: ScorePopup[] = [];

  // Camera viewport
  public camX: number = 0;
  public camY: number = 0;
  public viewWidth: number = 640;
  public viewHeight: number = 360;

  // Game timing & metrics
  public gameTime: number = 0; // seconds
  public lastTimestamp: number = 0;
  public animFrameId: number | null = null;

  // Level Clear Tally
  public timeBonus: number = 0;
  public ringBonus: number = 0;
  public totalTallyBonus: number = 0;
  public tallyCounted: boolean = false;

  // Rolling Enemy Combo system
  public rollComboCount: number = 0;
  public rollComboTimer: number = 0;

  // Input state
  public input: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    spinDashButton: false,
    rollButton: false,
  };

  private prevJumpState: boolean = false;
  private keydownListener: (e: KeyboardEvent) => void;
  private keyupListener: (e: KeyboardEvent) => void;

  // State change notification callback for React UI
  public onStateChange?: (state: GameState, stats: { score: number; rings: number; lives: number; time: string }) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.player = new Player(100, 440);
    this.level = new Level();

    this.keydownListener = this.handleKeyDown.bind(this);
    this.keyupListener = this.handleKeyUp.bind(this);
    this.bindEvents();
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.viewWidth = 640;
    this.viewHeight = 360;
    this.canvas.width = this.viewWidth;
    this.canvas.height = this.viewHeight;
  }

  bindEvents() {
    window.addEventListener('keydown', this.keydownListener);
    window.addEventListener('keyup', this.keyupListener);
  }

  destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sounds.stopBGM();
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('keyup', this.keyupListener);
  }

  handleKeyDown(e: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.input.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.input.down = true;

    if (e.key === ' ' || e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      if (!this.input.jump) {
        this.input.jumpJustPressed = true;
      }
      this.input.jump = true;

      // Start game if on title screen
      if (this.state === 'TITLE') {
        this.startGame();
      }
    }

    // Direct Spin Dash trigger (X or Shift)
    if (e.key === 'x' || e.key === 'X' || e.key === 'Shift') {
      this.input.spinDashButton = true;
      this.input.down = true;
      this.input.jumpJustPressed = true;
    }

    // Direct Roll key (C)
    if (e.key === 'c' || e.key === 'C') {
      this.input.rollButton = true;
    }

    // Pause toggle (P or Escape)
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      this.togglePause();
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.input.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.input.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.input.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.input.down = false;

    if (e.key === ' ' || e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
      this.input.jump = false;
      this.input.jumpJustPressed = false;
    }

    if (e.key === 'x' || e.key === 'X' || e.key === 'Shift') {
      this.input.spinDashButton = false;
    }

    if (e.key === 'c' || e.key === 'C') {
      this.input.rollButton = false;
    }
  }

  // Set input from virtual mobile gamepad buttons
  setVirtualInput(key: keyof InputState, value: boolean) {
    if (key === 'jump' && value && !this.input.jump) {
      this.input.jumpJustPressed = true;
    }
    this.input[key] = value as never;

    if (this.state === 'TITLE' && key === 'jump' && value) {
      this.startGame();
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.gameTime = 0;
    this.player.reset(true);
    this.level = new Level();
    this.scatteredRings = [];
    this.particles = [];
    this.animals = [];
    this.scorePopups = [];
    this.tallyCounted = false;
    sounds.startBGM();
    this.notifyUI();
  }

  restartLevel() {
    if (this.player.lives > 0) {
      this.state = 'PLAYING';
      this.player.reset(false);
      this.scatteredRings = [];
      this.particles = [];
      this.notifyUI();
    } else {
      this.state = 'GAME_OVER';
      sounds.playGameOver();
      this.notifyUI();
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sounds.stopBGM();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      sounds.startBGM();
    }
    this.notifyUI();
  }

  addParticle(p: Particle) {
    this.particles.push(p);
  }

  addScorePopup(x: number, y: number, text: string) {
    this.scorePopups.push({ x, y, text, life: 0.8 });
  }

  notifyUI() {
    if (this.onStateChange) {
      this.onStateChange(this.state, {
        score: this.player.score,
        rings: this.player.rings,
        lives: this.player.lives,
        time: this.getFormattedTime(),
      });
    }
  }

  getFormattedTime(): string {
    const totalSeconds = Math.floor(this.gameTime);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((this.gameTime % 1) * 100);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}:${pad(centiseconds)}`;
  }

  start() {
    this.lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      const delta = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.update(delta);
      this.render();

      // Reset single-frame triggers
      this.input.jumpJustPressed = false;

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  update(dt: number) {
    if (this.state !== 'PLAYING' && this.state !== 'LEVEL_CLEAR') return;

    if (this.state === 'PLAYING') {
      this.gameTime += dt;
    }

    // Update combo timer
    if (this.rollComboTimer > 0) {
      this.rollComboTimer -= dt;
      if (this.rollComboTimer <= 0) {
        this.rollComboCount = 0;
      }
    }

    // 1. Update Player
    const playerResult = this.player.update(
      dt,
      this.input,
      this.level.platforms,
      this.level.slopes,
      this.level.loops,
      this.addParticle.bind(this)
    );

    // If player took damage and scattered rings
    if (playerResult.scatteredRings && playerResult.scatteredRings.length > 0) {
      this.scatteredRings.push(...playerResult.scatteredRings);
    }

    // Player fell into pit or died
    if (this.player.state === 'DEAD' && this.player.y > 600) {
      this.restartLevel();
      return;
    }

    // 2. Update Level & Elements
    this.level.update(dt);

    // 3. Ring Collisions (Static Level Rings)
    const pHitbox = this.player.getHitbox();
    for (const ring of this.level.rings) {
      if (!ring.collected) {
        const dist = Math.hypot(this.player.x - ring.x, this.player.y - 14 - ring.y);
        if (dist < 22) {
          ring.collected = true;
          this.player.rings++;
          this.player.score += 100;
          sounds.playRing();
          this.addScorePopup(ring.x, ring.y, '+100');

          // Ring sparkle particle
          for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.addParticle({
              x: ring.x,
              y: ring.y,
              vx: Math.cos(angle) * 1.5,
              vy: Math.sin(angle) * 1.5,
              color: '#fde047',
              size: 2.5,
              alpha: 1,
              life: 0.3,
              maxLife: 0.3,
            });
          }
        }
      }
    }

    // 4. Scattered Rings Update & Collection
    this.scatteredRings = this.scatteredRings.filter((ring) => {
      const alive = ring.update(dt, this.level.platforms, this.level.slopes);
      if (!alive) return false;

      // Pickup check
      if (ring.pickupCooldown <= 0) {
        const dist = Math.hypot(this.player.x - ring.x, this.player.y - 14 - ring.y);
        if (dist < 20) {
          ring.collected = true;
          this.player.rings++;
          sounds.playRing();
          return false;
        }
      }
      return true;
    });

    // 5. Spring Collisions
    for (const spring of this.level.springs) {
      if (spring.type === 'up') {
        const dist = Math.hypot(this.player.x - spring.x, this.player.y - spring.y);
        if (dist < 24 && this.player.vy >= 0) {
          spring.extendedTimer = 0.25;
          this.player.hitSpring('up');
        }
      } else {
        const dist = Math.hypot(this.player.x - spring.x, this.player.y - spring.y);
        if (dist < 24) {
          spring.extendedTimer = 0.25;
          this.player.hitSpring('right');
        }
      }
    }

    // 6. Item Boxes Collisions
    for (const box of this.level.itemBoxes) {
      if (!box.broken) {
        const boxHitbox = { x: box.x - 14, y: box.y - 14, width: 28, height: 28 };
        if (PhysicsHelper.checkAABB(pHitbox, boxHitbox)) {
          const isAttacking =
            this.player.state === 'JUMP' ||
            this.player.state === 'ROLL' ||
            this.player.state === 'SPINDASH' ||
            this.player.vy > 1;

          if (isAttacking) {
            box.broken = true;
            sounds.playDestroy();
            this.player.score += 200;
            this.addScorePopup(box.x, box.y, '+200');

            if (box.type === 'ring') {
              this.player.rings += 10;
              sounds.playRing();
            } else if (box.type === 'speed') {
              this.player.vx = (this.player.facingRight ? 1 : -1) * 14;
              this.player.state = 'SPRINT';
              sounds.playSpring();
            }

            // Explosion particles
            for (let i = 0; i < 10; i++) {
              this.addParticle({
                x: box.x,
                y: box.y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 4,
                color: '#cbd5e1',
                size: 3 + Math.random() * 3,
                alpha: 1,
                life: 0.4,
                maxLife: 0.4,
              });
            }
          }
        }
      }
    }

    // 7. Enemy Collisions & Defeat Mechanics
    for (const enemy of this.level.enemies) {
      if (!enemy.isDead) {
        enemy.update(dt);
        const eHitbox = enemy.getHitbox();

        if (PhysicsHelper.checkAABB(pHitbox, eHitbox)) {
          const isRolling = this.player.state === 'ROLL' || this.player.state === 'SPINDASH';
          const isAttacking = isRolling || this.player.state === 'JUMP' || this.player.vy > 0;

          if (isAttacking) {
            // Defeat Enemy Badnik!
            this.rollComboCount++;
            this.rollComboTimer = 1.2;

            let comboPoints = 100;
            if (this.rollComboCount === 2) comboPoints = 200;
            else if (this.rollComboCount === 3) comboPoints = 500;
            else if (this.rollComboCount >= 4) comboPoints = 1000;

            const destroyResult = enemy.destroy();
            this.player.score += comboPoints;
            this.particles.push(...destroyResult.particles);
            this.animals.push(destroyResult.animal);
            this.addScorePopup(enemy.x, enemy.y, `+${comboPoints}`);

            // Sonic Rolling Mechanics:
            // If Sonic is rolling on the ground, slice straight through the Badnik without stopping or bouncing!
            if (isRolling && this.player.onGround) {
              const dir = this.player.vx >= 0 ? 1 : -1;
              // Maintain momentum and give a satisfying mini-boost
              this.player.vx = dir * Math.max(Math.abs(this.player.vx), 11.0) + dir * 0.6;

              // Sparks & debris burst from the rolling slice
              for (let i = 0; i < 8; i++) {
                this.addParticle({
                  x: enemy.x,
                  y: enemy.y - 6,
                  vx: -dir * (2 + Math.random() * 4),
                  vy: -Math.random() * 3,
                  color: '#38bdf8',
                  size: 3 + Math.random() * 3,
                  alpha: 1,
                  life: 0.28,
                  maxLife: 0.28,
                });
              }
            } else {
              // Airborne jump hit -> bounce upward
              this.player.vy = -7.5;
              this.player.state = 'JUMP';
            }
          } else {
            // Sonic takes damage!
            const spilled = this.player.takeDamage(false);
            if (spilled.length > 0) {
              this.scatteredRings.push(...spilled);
            }
          }
        }
      }
    }

    // 8. Goal Signpost Collision & Victory Trigger
    if (!this.level.signpost.triggered && this.player.x >= this.level.signpost.x - 20) {
      this.level.signpost.triggered = true;
      this.level.signpost.spinning = true;
      this.player.state = 'VICTORY';
      this.state = 'LEVEL_CLEAR';
      sounds.playVictoryFanfare();

      // Calculate time bonus and ring bonus
      const timeSec = Math.floor(this.gameTime);
      this.timeBonus = Math.max(0, (300 - timeSec) * 10);
      this.ringBonus = this.player.rings * 100;
      this.totalTallyBonus = this.timeBonus + this.ringBonus;
      this.player.score += this.totalTallyBonus;

      // Confetti particles around signpost
      const colors = ['#38bdf8', '#facc15', '#f43f5e', '#22c55e', '#ffffff'];
      for (let i = 0; i < 40; i++) {
        this.addParticle({
          x: this.level.signpost.x,
          y: this.level.signpost.y - 30,
          vx: (Math.random() - 0.5) * 6,
          vy: -2 - Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 3,
          alpha: 1,
          life: 2.0,
          maxLife: 2.0,
        });
      }
      this.notifyUI();
    }

    // 9. Particles Update
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = Math.max(0, p.life / p.maxLife);
      return p.life > 0;
    });

    // 10. Animal Buddies Update
    this.animals = this.animals.filter((a) => {
      a.life -= dt;
      a.vy += 0.25;
      a.x += a.vx;
      a.y += a.vy;
      if (a.y > 440) {
        a.y = 440;
        a.vy = -3.5; // Hop along ground
      }
      return a.life > 0;
    });

    // 11. Score Popups Update
    this.scorePopups = this.scorePopups.filter((sp) => {
      sp.life -= dt;
      sp.y -= 0.6;
      return sp.life > 0;
    });

    // 12. Camera Tracking with Lookahead and Lerp
    // Smooth look ahead in direction of movement
    const lookahead = this.player.vx * 10;
    const targetCamX = this.player.x - this.viewWidth * 0.42 + lookahead;
    const targetCamY = Math.max(0, this.player.y - this.viewHeight * 0.55);

    // Smooth lerp
    this.camX += (targetCamX - this.camX) * 0.14;
    this.camY += (targetCamY - this.camY) * 0.12;

    // Clamp camera within level bounds
    this.camX = Math.max(0, Math.min(this.camX, this.level.levelWidth - this.viewWidth));
    this.camY = Math.max(0, Math.min(this.camY, this.level.levelHeight - this.viewHeight));
  }

  render() {
    this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);

    // 1. Draw Parallax Backgrounds
    this.level.drawBackground(
      this.ctx,
      this.camX,
      this.camY,
      this.viewWidth,
      this.viewHeight,
      this.gameTime
    );

    // 2. World Space Rendering
    this.ctx.save();
    this.ctx.translate(-Math.floor(this.camX), -Math.floor(this.camY));

    // Draw Terrain, Slopes, Loops, Springs, Signpost
    this.level.drawTerrain(this.ctx, this.camX, this.camY, this.viewWidth, this.viewHeight);

    // Draw Static Level Rings
    for (const ring of this.level.rings) {
      ring.draw(this.ctx, this.gameTime);
    }

    // Draw Scattered Rings
    for (const ring of this.scatteredRings) {
      ring.draw(this.ctx, this.gameTime);
    }

    // Draw Badnik Enemies
    for (const enemy of this.level.enemies) {
      enemy.draw(this.ctx, this.gameTime);
    }

    // Draw Freed Animal Buddies
    for (const animal of this.animals) {
      Sprites.drawAnimalBuddy(this.ctx, animal.x, animal.y, animal.facingRight, this.gameTime);
    }

    // Draw Sonic Player
    this.player.draw(this.ctx);

    // Draw Particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw Score Popups in world
    for (const sp of this.scorePopups) {
      this.ctx.save();
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillStyle = '#fde047';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(sp.text, sp.x - 14, sp.y);
      this.ctx.restore();
    }

    this.ctx.restore();

    // 3. Screen Space UI / HUD
    if (this.state === 'PLAYING' || this.state === 'LEVEL_CLEAR' || this.state === 'PAUSED') {
      this.renderHUD();
    }

    // 4. Overlay States
    if (this.state === 'TITLE') {
      this.renderTitleScreen();
    } else if (this.state === 'PAUSED') {
      this.renderPauseScreen();
    } else if (this.state === 'LEVEL_CLEAR') {
      this.renderLevelClearScreen();
    } else if (this.state === 'GAME_OVER') {
      this.renderGameOverScreen();
    }
  }

  renderHUD() {
    this.ctx.save();
    this.ctx.font = '11px "Press Start 2P", monospace';

    // Yellow retro arcade HUD labels
    const drawHudRow = (label: string, value: string, y: number, warn: boolean = false) => {
      this.ctx.fillStyle = warn && Math.floor(this.gameTime * 4) % 2 === 0 ? '#ef4444' : '#facc15';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 3;
      this.ctx.fillText(label, 16, y);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(value, 95, y);
    };

    drawHudRow('SCORE', this.player.score.toString(), 24);
    drawHudRow('TIME', this.getFormattedTime(), 42);
    drawHudRow('RINGS', this.player.rings.toString(), 60, this.player.rings === 0);

    // Lives counter in bottom-left
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('SONIC', 16, this.viewHeight - 16);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`× ${this.player.lives}`, 85, this.viewHeight - 16);

    // Speedometer / Boost meter in bottom-right
    const currentSpeed = Math.abs(this.player.vx);
    const speedRatio = Math.min(1.0, currentSpeed / 10.5);
    const barW = 100;
    const barH = 10;
    const barX = this.viewWidth - barW - 18;
    const barY = this.viewHeight - 24;

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    this.ctx.fillRect(barX, barY, barW, barH);
    this.ctx.strokeStyle = '#64748b';
    this.ctx.strokeRect(barX, barY, barW, barH);

    const boostGrad = this.ctx.createLinearGradient(barX, barY, barX + barW, barY);
    boostGrad.addColorStop(0, '#38bdf8');
    boostGrad.addColorStop(0.7, '#facc15');
    boostGrad.addColorStop(1, '#ef4444');
    this.ctx.fillStyle = boostGrad;
    this.ctx.fillRect(barX + 2, barY + 2, (barW - 4) * speedRatio, barH - 4);

    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.fillText('SPEED', barX, barY - 4);

    this.ctx.restore();
  }

  renderTitleScreen() {
    this.ctx.save();

    // Dark backdrop overlay with vibrant accents
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    // Large Sonic Gold Ring Emblem
    const centerX = this.viewWidth / 2;
    const centerY = this.viewHeight / 2 - 30;

    // Glowing golden outer wing / crest
    this.ctx.shadowColor = '#0284c7';
    this.ctx.shadowBlur = 24;
    this.ctx.fillStyle = '#1d4ed8';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY - 10, 85, 45, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Main Logo Title
    this.ctx.font = '28px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 8;
    this.ctx.fillText('SONIC', centerX, centerY - 15);

    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('ARCADE 2D', centerX, centerY + 15);

    // Sonic character preview in center
    Sprites.drawSonic(this.ctx, centerX, centerY + 80, 'VICTORY', performance.now() / 1000, true, 0, false);

    // Blinking "PRESS START OR SPACE"
    if (Math.floor(performance.now() / 400) % 2 === 0) {
      this.ctx.font = '12px "Press Start 2P", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('PRESS START / SPACE', centerX, this.viewHeight - 48);
    }

    // Credits / Instruction footer
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText('ARROWS: MOVE · SPACE: JUMP · DOWN+JUMP: SPIN DASH', centerX, this.viewHeight - 20);

    this.ctx.restore();
  }

  renderPauseScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    this.ctx.font = '22px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#facc15';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.viewWidth / 2, this.viewHeight / 2 - 10);

    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('PRESS P OR ESC TO RESUME', this.viewWidth / 2, this.viewHeight / 2 + 25);
    this.ctx.restore();
  }

  renderLevelClearScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    const cx = this.viewWidth / 2;
    this.ctx.textAlign = 'center';

    this.ctx.font = '18px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillText('SONIC HAS PASSED', cx, 80);

    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('ACT 1', cx, 110);

    // Tally Breakdown
    this.ctx.font = '11px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    const leftX = cx - 140;

    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('TIME BONUS', leftX, 160);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`${this.timeBonus} PTS`, leftX + 180, 160);

    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText('RING BONUS', leftX, 190);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`${this.ringBonus} PTS`, leftX + 180, 190);

    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillText('TOTAL SCORE', leftX, 230);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`${this.player.score} PTS`, leftX + 180, 230);

    // Play again prompt
    if (Math.floor(performance.now() / 400) % 2 === 0) {
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '11px "Press Start 2P", monospace';
      this.ctx.fillText('PRESS SPACE TO PLAY AGAIN', cx, 290);
    }

    this.ctx.restore();
  }

  renderGameOverScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    const cx = this.viewWidth / 2;
    this.ctx.textAlign = 'center';

    this.ctx.font = '26px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillText('GAME OVER', cx, this.viewHeight / 2 - 20);

    this.ctx.font = '11px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillText(`FINAL SCORE: ${this.player.score}`, cx, this.viewHeight / 2 + 20);

    if (Math.floor(performance.now() / 400) % 2 === 0) {
      this.ctx.font = '11px "Press Start 2P", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('PRESS SPACE TO RETRY', cx, this.viewHeight / 2 + 60);
    }
    this.ctx.restore();
  }
}
