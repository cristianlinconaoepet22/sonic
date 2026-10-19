/**
 * Level Geometry & Stage Definition for Sonic Arcade 2D
 * Green Hill Arcade Zone Act 1 with checkered terrain, loops, ramps, rings, springs, and goal post.
 */

import { Rect, Slope, LoopDeLoop } from './Physics';
import { Ring } from './Ring';
import { Enemy } from './Enemy';
import { Sprites } from '../assets/proceduralSprites';

export interface SpringEntity {
  x: number;
  y: number;
  type: 'up' | 'right';
  extendedTimer: number;
}

export interface ItemBoxEntity {
  x: number;
  y: number;
  type: 'ring' | 'speed' | 'shield';
  broken: boolean;
}

export interface GoalSignpost {
  x: number;
  y: number;
  spinning: boolean;
  spinProgress: number; // 0 to 1
  triggered: boolean;
}

export class Level {
  public platforms: Rect[] = [];
  public slopes: Slope[] = [];
  public loops: LoopDeLoop[] = [];
  public springs: SpringEntity[] = [];
  public itemBoxes: ItemBoxEntity[] = [];
  public rings: Ring[] = [];
  public enemies: Enemy[] = [];
  public signpost: GoalSignpost;
  public levelWidth: number = 4200;
  public levelHeight: number = 700;

  constructor() {
    this.signpost = {
      x: 3950,
      y: 440,
      spinning: false,
      spinProgress: 0,
      triggered: false,
    };
    this.buildGreenHillZone();
  }

  buildGreenHillZone() {
    // --- SECTION 1: Flat Start & Badnik Patrols ---
    this.platforms.push({ x: 0, y: 440, width: 700, height: 260 });

    // Initial rings in clean horizontal line
    for (let x = 180; x <= 340; x += 32) {
      this.rings.push(new Ring(x, 410));
    }

    // Badniks in first zone (Robotic crabs & bees for rolling practice!)
    this.enemies.push(new Enemy('crabmeat', 360, 440, 80));
    this.enemies.push(new Enemy('buzzbomber', 440, 280, 90));
    this.enemies.push(new Enemy('crabmeat', 540, 440, 90));
    this.enemies.push(new Enemy('crabmeat', 650, 440, 70));

    // Item Box (10 Rings)
    this.itemBoxes.push({ x: 620, y: 412, type: 'ring', broken: false });

    // --- SECTION 2: First Ramp and High Floating Platform ---
    // Upward slope
    this.slopes.push({ x1: 700, y1: 440, x2: 950, y2: 320 });
    this.platforms.push({ x: 700, y: 440, width: 250, height: 260 }); // Fill underneath

    // High elevated platform
    this.platforms.push({ x: 950, y: 320, width: 450, height: 380 });

    // Ring arch over elevated platform
    for (let i = 0; i < 7; i++) {
      const rx = 1000 + i * 36;
      const ry = 270 - Math.sin((i / 6) * Math.PI) * 40;
      this.rings.push(new Ring(rx, ry));
    }

    // Robotic bees and crabs patrolling section 2
    this.enemies.push(new Enemy('buzzbomber', 820, 220, 110));
    this.enemies.push(new Enemy('crabmeat', 1060, 320, 80));
    this.enemies.push(new Enemy('crabmeat', 1230, 320, 80));
    this.enemies.push(new Enemy('buzzbomber', 1340, 200, 100));

    // Downward slope
    this.slopes.push({ x1: 1400, y1: 320, x2: 1600, y2: 440 });
    this.platforms.push({ x: 1400, y: 440, width: 200, height: 260 });

    // --- SECTION 3: High-Speed Spring & The 360-Degree Loop-de-Loop! ---
    this.platforms.push({ x: 1600, y: 440, width: 900, height: 260 });

    // Horizontal launch spring to blast player through the loop!
    this.springs.push({ x: 1680, y: 440, type: 'right', extendedTimer: 0 });

    // Robotic crabs on the approach before the loop (can be rolled through cleanly!)
    this.enemies.push(new Enemy('crabmeat', 1760, 440, 50));
    this.enemies.push(new Enemy('crabmeat', 1860, 440, 50));

    // Loop-de-loop at X = 2050, radius 80
    const loopRadius = 80;
    const loopCenterX = 2050;
    const loopCenterY = 440 - loopRadius;
    this.loops.push({
      cx: loopCenterX,
      cy: loopCenterY,
      radius: loopRadius,
      entryLeft: loopCenterX - loopRadius,
      entryRight: loopCenterX + loopRadius,
    });

    // Circular ring pattern inside the loop
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx = loopCenterX + Math.cos(angle) * (loopRadius - 18);
      const ry = loopCenterY + Math.sin(angle) * (loopRadius - 18);
      this.rings.push(new Ring(rx, ry));
    }

    // Robotic enemies exiting the loop
    this.enemies.push(new Enemy('crabmeat', 2240, 440, 70));
    this.enemies.push(new Enemy('buzzbomber', 2360, 300, 110));
    this.enemies.push(new Enemy('crabmeat', 2440, 440, 60));

    // Vertical booster spring to reach upper route
    this.springs.push({ x: 2480, y: 440, type: 'up', extendedTimer: 0 });

    // --- SECTION 4: Dual Path (High Route vs Low Valley Route) ---
    // Upper floating platforms (High Route)
    this.platforms.push({ x: 2540, y: 260, width: 240, height: 24 });
    this.itemBoxes.push({ x: 2660, y: 232, type: 'speed', broken: false });

    // Rings on upper path
    for (let x = 2560; x <= 2740; x += 36) {
      this.rings.push(new Ring(x, 230));
    }

    this.enemies.push(new Enemy('crabmeat', 2620, 260, 70));
    this.enemies.push(new Enemy('buzzbomber', 2760, 150, 90));

    this.platforms.push({ x: 2850, y: 220, width: 220, height: 24 });
    this.enemies.push(new Enemy('crabmeat', 2920, 220, 70));
    this.enemies.push(new Enemy('buzzbomber', 3020, 140, 80));

    // Low Route Valley
    this.platforms.push({ x: 2500, y: 480, width: 600, height: 220 });
    this.enemies.push(new Enemy('crabmeat', 2590, 480, 80));
    this.enemies.push(new Enemy('buzzbomber', 2720, 360, 100));
    this.enemies.push(new Enemy('crabmeat', 2880, 480, 80));
    this.enemies.push(new Enemy('crabmeat', 3040, 480, 70));

    // Ramp coming out of valley
    this.slopes.push({ x1: 3100, y1: 480, x2: 3350, y2: 440 });
    this.platforms.push({ x: 3100, y: 480, width: 250, height: 220 });

    // --- SECTION 5: Final Straightaway & Goal Signpost ---
    this.platforms.push({ x: 3350, y: 440, width: 850, height: 260 });

    // Final ring stretch
    for (let x = 3450; x <= 3750; x += 35) {
      this.rings.push(new Ring(x, 410));
    }

    // Dense gauntlet of robotic crabs and cyber bees leading to Goal!
    this.enemies.push(new Enemy('crabmeat', 3420, 440, 70));
    this.enemies.push(new Enemy('buzzbomber', 3520, 280, 120));
    this.enemies.push(new Enemy('crabmeat', 3620, 440, 80));
    this.enemies.push(new Enemy('crabmeat', 3740, 440, 70));
    this.enemies.push(new Enemy('buzzbomber', 3840, 270, 90));
  }

  update(dt: number) {
    // Update springs expansion cooldown
    for (const spring of this.springs) {
      if (spring.extendedTimer > 0) {
        spring.extendedTimer -= dt;
      }
    }

    // Update goal signpost rotation
    if (this.signpost.spinning) {
      this.signpost.spinProgress += dt * 0.9;
      if (this.signpost.spinProgress >= 1.0) {
        this.signpost.spinProgress = 1.0;
        this.signpost.spinning = false;
      }
    }
  }

  drawBackground(ctx: CanvasRenderingContext2D, camX: number, camY: number, viewW: number, viewH: number, time: number) {
    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    skyGrad.addColorStop(0, '#0284c7'); // Deep azure sky
    skyGrad.addColorStop(0.5, '#38bdf8'); // Cyan horizon
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    // 2. Parallax Floating Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const cloudParallax = (camX * 0.08) % 400;
    for (let i = -1; i < 5; i++) {
      const cx = i * 320 - cloudParallax;
      const cy = 40 + (i % 2) * 30;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy - 10, 36, 0, Math.PI * 2);
      ctx.arc(cx + 60, cy, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Parallax Distant Mountains
    const mountainParallax = (camX * 0.18) % 600;
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(0, viewH);
    for (let i = -1; i < 6; i++) {
      const mx = i * 220 - mountainParallax;
      ctx.lineTo(mx, 260 + (i % 3) * 40);
      ctx.lineTo(mx + 110, 340);
    }
    ctx.lineTo(viewW, viewH);
    ctx.closePath();
    ctx.fill();

    // 4. Parallax Shimmering Ocean
    const oceanY = 320;
    const oceanGrad = ctx.createLinearGradient(0, oceanY, 0, 420);
    oceanGrad.addColorStop(0, '#0ea5e9');
    oceanGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, oceanY, viewW, 100);

    // Water wave highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    const waveOffset = (time * 40) % 60;
    for (let row = 0; row < 4; row++) {
      const wy = oceanY + 15 + row * 20;
      ctx.beginPath();
      for (let x = -50; x < viewW + 50; x += 40) {
        ctx.moveTo(x + waveOffset, wy);
        ctx.lineTo(x + waveOffset + 20, wy);
      }
      ctx.stroke();
    }

    // 5. Parallax Distant Palm Trees
    const palmParallax = (camX * 0.4) % 450;
    ctx.fillStyle = '#15803d';
    for (let i = -1; i < 6; i++) {
      const px = i * 280 - palmParallax;
      const py = 360;
      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 4, py, 6, 60);
      // Leaves
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(px + 7, py - 4, 28, 12, -0.3, 0, Math.PI * 2);
      ctx.ellipse(px + 7, py - 4, 28, 12, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawTerrain(ctx: CanvasRenderingContext2D, camX: number, camY: number, viewW: number, viewH: number) {
    const TILE = 32;

    // 1. Draw solid platforms with classic Green Hill checkered pattern
    for (const plat of this.platforms) {
      if (plat.x + plat.width < camX - 50 || plat.x > camX + viewW + 50) continue;

      ctx.save();
      // Grass Top
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(plat.x, plat.y, plat.width, 14);

      // Grass detail tufts
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(plat.x, plat.y, plat.width, 4);

      // Checkered Soil Body
      const startCol = Math.floor(plat.x / TILE);
      const endCol = Math.ceil((plat.x + plat.width) / TILE);
      const startRow = Math.floor((plat.y + 14) / TILE);
      const endRow = Math.ceil((plat.y + plat.height) / TILE);

      for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
          const tileX = c * TILE;
          const tileY = r * TILE;
          const isDark = (r + c) % 2 === 0;

          // Clip to platform boundaries
          const drawX = Math.max(plat.x, tileX);
          const drawY = Math.max(plat.y + 14, tileY);
          const drawW = Math.min(plat.x + plat.width, tileX + TILE) - drawX;
          const drawH = Math.min(plat.y + plat.height, tileY + TILE) - drawY;

          if (drawW > 0 && drawH > 0) {
            ctx.fillStyle = isDark ? '#b45309' : '#d97706';
            ctx.fillRect(drawX, drawY, drawW, drawH);

            // Soil highlight bevel
            ctx.strokeStyle = isDark ? '#92400e' : '#f59e0b';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, drawW, drawH);
          }
        }
      }
      ctx.restore();
    }

    // 2. Draw slopes
    for (const slope of this.slopes) {
      ctx.save();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(slope.x1, slope.y1);
      ctx.lineTo(slope.x2, slope.y2);
      ctx.lineTo(slope.x2, slope.y2 + 60);
      ctx.lineTo(slope.x1, slope.y1 + 60);
      ctx.closePath();
      ctx.fill();

      // Sloped green grass top
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(slope.x1, slope.y1);
      ctx.lineTo(slope.x2, slope.y2);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(slope.x1, slope.y1 - 2);
      ctx.lineTo(slope.x2, slope.y2 - 2);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Draw 360-Degree Loop-de-Loop structure
    for (const loop of this.loops) {
      ctx.save();
      // Outer ring structure
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 36;
      ctx.beginPath();
      ctx.arc(loop.cx, loop.cy, loop.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Green grass rim on the loop track
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(loop.cx, loop.cy, loop.radius + 14, 0, Math.PI * 2);
      ctx.stroke();

      // Inner checkered segments around loop
      const segments = 16;
      for (let s = 0; s < segments; s++) {
        const a1 = (s / segments) * Math.PI * 2;
        const a2 = ((s + 1) / segments) * Math.PI * 2;
        ctx.strokeStyle = s % 2 === 0 ? '#d97706' : '#92400e';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(loop.cx, loop.cy, loop.radius - 4, a1, a2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 4. Draw Springs
    for (const spring of this.springs) {
      Sprites.drawSpring(ctx, spring.x, spring.y, spring.type, spring.extendedTimer > 0);
    }

    // 5. Draw Item Boxes
    for (const box of this.itemBoxes) {
      if (!box.broken) {
        Sprites.drawItemBox(ctx, box.x, box.y, box.type, performance.now() / 1000);
      }
    }

    // 6. Draw Goal Signpost
    Sprites.drawSignpost(ctx, this.signpost.x, this.signpost.y, this.signpost.spinProgress, true);
  }
}
