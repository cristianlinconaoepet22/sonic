/**
 * Procedural Sprite Generator for Sonic Arcade 2D
 * Renders authentic retro characters, items and enemies directly via HTML5 Canvas API
 * Eliminates external image dependencies, ensuring 100% offline and zero-404 reliability.
 */

export interface SpriteRenderer {
  drawSonic(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    state: string,
    frame: number,
    facingRight: boolean,
    rollAngle: number,
    invulnerable: boolean
  ): void;
  drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, scale?: number): void;
  drawMotobug(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, frame: number): void;
  drawBuzzBomber(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, frame: number): void;
  drawCrabmeat(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, frame: number): void;
  drawSpring(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'up' | 'right', extended: boolean): void;
  drawSignpost(ctx: CanvasRenderingContext2D, x: number, y: number, spinProgress: number, isSonic: boolean): void;
  drawItemBox(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'ring' | 'speed' | 'shield', frame: number): void;
  drawAnimalBuddy(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, frame: number): void;
}

export const Sprites: SpriteRenderer = {
  // Sonic procedural rendering with authentic colors: cobalt blue, peach muzzle/belly, red sneakers with white strap & buckle
  drawSonic(ctx, x, y, state, frame, facingRight, rollAngle, invulnerable) {
    // If invulnerable and flashing, skip rendering on alternate frames
    if (invulnerable && Math.floor(frame * 4) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    const BLUE = '#1a55db';
    const BLUE_DARK = '#0b3294';
    const PEACH = '#f9be8e';
    const RED = '#e5192e';
    const WHITE = '#ffffff';
    const GOLD = '#facc15';
    const BLACK = '#111827';

    if (state === 'ROLL' || state === 'SPINDASH') {
      // Sonic rolling ball form
      ctx.save();
      ctx.rotate(rollAngle);

      // Outer blur aura for fast roll
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DARK;
      ctx.fill();

      // Main blue sphere
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = BLUE;
      ctx.fill();

      // Spinning white / light blue highlight streaks
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 0.75);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 10, Math.PI, Math.PI * 1.75);
      ctx.stroke();

      // Central core
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = PEACH;
      ctx.fill();

      ctx.restore();
      ctx.restore();
      return;
    }

    // Normal standing / running / jumping Sonic
    // Center is around Sonic's hip/feet
    const bounce = state === 'RUN' || state === 'SPRINT' ? Math.sin(frame * 12) * 2 : 0;
    const runFrame = Math.floor(frame * 10) % 4;

    // Quills (Back)
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.moveTo(-4, -18 + bounce);
    ctx.quadraticCurveTo(-22, -22 + bounce, -16, -10 + bounce);
    ctx.quadraticCurveTo(-24, -10 + bounce, -18, 0 + bounce);
    ctx.quadraticCurveTo(-22, 2 + bounce, -6, -2 + bounce);
    ctx.closePath();
    ctx.fill();

    // Body (Torso)
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.ellipse(0, -10 + bounce, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Peach Belly
    ctx.fillStyle = PEACH;
    ctx.beginPath();
    ctx.ellipse(2, -9 + bounce, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(4, -22 + bounce, 11, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.moveTo(2, -31 + bounce);
    ctx.lineTo(8, -35 + bounce);
    ctx.lineTo(9, -28 + bounce);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PEACH;
    ctx.beginPath();
    ctx.moveTo(4, -31 + bounce);
    ctx.lineTo(7, -33 + bounce);
    ctx.lineTo(8, -29 + bounce);
    ctx.closePath();
    ctx.fill();

    // Peach Muzzle
    ctx.fillStyle = PEACH;
    ctx.beginPath();
    ctx.ellipse(9, -19 + bounce, 7, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(15, -20 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye (White)
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(7, -24 + bounce, 4, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Pupil (Black with white gleam)
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(8, -24 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(7.5, -25 + bounce, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Mouth / Smirk
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (state === 'HURT') {
      ctx.arc(10, -15 + bounce, 3, Math.PI, 0);
    } else {
      ctx.arc(10, -17 + bounce, 3, 0.2, Math.PI * 0.8);
    }
    ctx.stroke();

    // Legs and iconic Red Shoes
    if (state === 'SPRINT') {
      // Super peel-out / high speed blur infinity legs
      ctx.strokeStyle = RED;
      ctx.lineWidth = 6;
      ctx.beginPath();
      const legRot = (frame * 25) % (Math.PI * 2);
      ctx.ellipse(3, 2, 14, 7, legRot, 0, Math.PI * 2);
      ctx.stroke();

      // White center streak
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (state === 'RUN' || state === 'WALK') {
      // Animated running legs
      const cycle = (frame * (state === 'RUN' ? 14 : 8)) % (Math.PI * 2);
      const leg1X = Math.cos(cycle) * 11;
      const leg1Y = Math.sin(cycle) * 4;
      const leg2X = Math.cos(cycle + Math.PI) * 11;
      const leg2Y = Math.sin(cycle + Math.PI) * 4;

      // Leg 1 (Back)
      ctx.fillStyle = BLUE_DARK;
      ctx.fillRect(-2 + leg2X * 0.5, -4 + bounce, 3, 6);
      // Shoe 1
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect(-4 + leg2X, 0 + leg2Y, 12, 6, 3);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.fillRect(-1 + leg2X, 0 + leg2Y, 2.5, 6);

      // Leg 2 (Front)
      ctx.fillStyle = BLUE;
      ctx.fillRect(0 + leg1X * 0.5, -4 + bounce, 3, 6);
      // Shoe 2
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect(-2 + leg1X, 2 + leg1Y, 13, 6, 3);
      ctx.fill();
      // White strap & gold buckle
      ctx.fillStyle = WHITE;
      ctx.fillRect(1 + leg1X, 2 + leg1Y, 3, 6);
      ctx.fillStyle = GOLD;
      ctx.fillRect(2 + leg1X, 3 + leg1Y, 1.5, 2.5);
    } else if (state === 'SKID') {
      // Sonic skidding / braking with dust
      ctx.fillStyle = BLUE;
      ctx.fillRect(-4, -4, 4, 8);
      ctx.fillRect(2, -4, 4, 8);
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect(-8, 3, 13, 5, 2);
      ctx.roundRect(1, 3, 14, 5, 2);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.fillRect(-3, 3, 3, 5);
      ctx.fillRect(5, 3, 3, 5);
    } else {
      // Idle / Default standing stance
      ctx.fillStyle = BLUE;
      ctx.fillRect(-3, -2, 3, 7);
      ctx.fillRect(3, -2, 3, 7);

      // Shoes
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect(-6, 3, 12, 6, 3);
      ctx.roundRect(1, 4, 13, 6, 3);
      ctx.fill();
      // White strap & buckle
      ctx.fillStyle = WHITE;
      ctx.fillRect(-2, 3, 2.5, 6);
      ctx.fillRect(5, 4, 2.5, 6);
      ctx.fillStyle = GOLD;
      ctx.fillRect(5.5, 5, 1.5, 2.5);
    }

    // White Gloves / Hands
    ctx.fillStyle = WHITE;
    if (state === 'SKID') {
      // Hands held forward balancing
      ctx.beginPath();
      ctx.arc(8, -8 + bounce, 4.5, 0, Math.PI * 2);
      ctx.arc(-8, -6 + bounce, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (state === 'RUN' || state === 'SPRINT') {
      // Arms pumping back and forth
      const armCycle = (frame * 12) % (Math.PI * 2);
      const armX = Math.cos(armCycle) * 8;
      ctx.beginPath();
      ctx.arc(2 - armX, -6 + bounce, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (state === 'VICTORY') {
      // Thumbs up / peace sign pose
      ctx.beginPath();
      ctx.arc(10, -26, 4.5, 0, Math.PI * 2);
      ctx.arc(-6, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = GOLD;
      ctx.fillRect(10, -32, 2, 7);
    } else {
      // Idle arms resting on hip
      ctx.beginPath();
      ctx.arc(7, -6 + bounce, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  // 3D-perspective rotating gold ring with glowing inner reflection
  drawRing(ctx, x, y, frame, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Dynamic horizontal compression to simulate 3D rotation
    const rot = (frame * 5) % (Math.PI * 2);
    const widthFactor = Math.abs(Math.cos(rot));
    const isEdgeOn = widthFactor < 0.15;

    const GOLD = '#facc15';
    const GOLD_DARK = '#b45309';
    const GOLD_LIGHT = '#fef08a';

    // Outer glow
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 6;

    if (isEdgeOn) {
      // Edge-on thin vertical bar
      ctx.fillStyle = GOLD_LIGHT;
      ctx.fillRect(-1.5, -9, 3, 18);
      ctx.shadowBlur = 0;
      ctx.restore();
      return;
    }

    const outerRx = Math.max(2, 9 * widthFactor);
    const innerRx = Math.max(1, 5 * widthFactor);
    const outerRy = 9;
    const innerRy = 5;

    // Outer Ring
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.ellipse(0, 0, outerRx, outerRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker inner rim
    ctx.fillStyle = GOLD_DARK;
    ctx.beginPath();
    ctx.ellipse(0, 0, outerRx - 1, outerRy - 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hollow center
    ctx.fillStyle = '#0f172a'; // Cutout with sky/backdrop or destination-out
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(0, 0, innerRx, innerRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Bright shine highlight
    ctx.fillStyle = GOLD_LIGHT;
    ctx.beginPath();
    ctx.ellipse(outerRx * 0.4, -outerRy * 0.4, 2 * widthFactor, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // Motobug (Badnik: wheeled ladybug with exhaust pipe and spinning wheel)
  drawMotobug(ctx, x, y, facingRight, frame) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    const RED = '#dc2626';
    const RED_DARK = '#991b1b';
    const GREY = '#64748b';
    const BLACK = '#0f172a';
    const YELLOW = '#fbbf24';

    // Exhaust pipe at back
    ctx.fillStyle = GREY;
    ctx.fillRect(-16, -10, 8, 4);
    ctx.fillRect(-18, -13, 4, 7);

    // Main red shell
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(0, -8, 14, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Black spots on shell
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(-4, -14, 3, 0, Math.PI * 2);
    ctx.arc(4, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Face / Head
    ctx.fillStyle = RED_DARK;
    ctx.beginPath();
    ctx.ellipse(11, -7, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Green/Yellow Eye
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(13, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(14, -10, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Antenna
    ctx.strokeStyle = GREY;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, -14);
    ctx.lineTo(16, -20);
    ctx.stroke();
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(16, -20, 2, 0, Math.PI * 2);
    ctx.fill();

    // Animated rolling black wheel at bottom
    const wheelRot = (frame * 15) % (Math.PI * 2);
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(wheelRot);
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GREY;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.stroke();
    ctx.restore();

    // Front claws
    ctx.fillStyle = GREY;
    ctx.beginPath();
    ctx.moveTo(14, -2);
    ctx.lineTo(18, 3);
    ctx.lineTo(12, 1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  // Buzz Bomber (Abeja / Avispa Robotizada: Cybernetic Badnik with jet thrusters and cyber wings)
  drawBuzzBomber(ctx, x, y, facingRight, frame) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    const YELLOW = '#f59e0b';
    const BLACK_METAL = '#1e293b';
    const STEEL = '#64748b';
    const CHROME = '#94a3b8';
    const RED_LASER = '#ef4444';
    const CYAN_CYBER = '#38bdf8';

    // Aerodynamic hover & bob
    const bob = Math.sin(frame * 7) * 3.5;
    ctx.translate(0, bob);

    // 1. Jet Thruster Flame (Pulsing underneath fuselage)
    const thrusterPulse = Math.sin(frame * 24);
    const flameH = 6 + Math.abs(thrusterPulse) * 4;
    ctx.fillStyle = CYAN_CYBER;
    ctx.beginPath();
    ctx.moveTo(-7, 7);
    ctx.lineTo(-4, 7 + flameH);
    ctx.lineTo(-1, 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-6, 7);
    ctx.lineTo(-4, 7 + flameH * 0.6);
    ctx.lineTo(-2, 7);
    ctx.closePath();
    ctx.fill();

    // 2. High-Frequency Cybernetic Wings (Translucent with neon cyber lines)
    const wingCycle = Math.sin(frame * 38);
    ctx.save();
    ctx.scale(1, wingCycle);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -18, 14, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner wing circuit vein
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(10, -18);
    ctx.stroke();
    ctx.restore();

    // 3. Robotic Head (Gunmetal mecha helmet)
    ctx.fillStyle = BLACK_METAL;
    ctx.beginPath();
    ctx.roundRect(4, -9, 13, 14, 3);
    ctx.fill();
    ctx.strokeStyle = STEEL;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Red Glowing Cyclops Optical Visor (Scanning laser)
    ctx.fillStyle = RED_LASER;
    ctx.shadowColor = RED_LASER;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(11, -7, 6, 4, 1.5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Laser emitter cannon / antenna needle
    ctx.strokeStyle = CHROME;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(17, -5);
    ctx.lineTo(24, -5);
    ctx.stroke();
    ctx.fillStyle = CYAN_CYBER;
    ctx.beginPath();
    ctx.arc(24, -5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Armored Striped Fuselage (Yellow and Black Hazard Segments)
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.ellipse(-6, 1, 12, 8, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Black metal armor bands
    ctx.fillStyle = BLACK_METAL;
    ctx.fillRect(-12, -4, 4, 11);
    ctx.fillRect(-5, -2, 4, 10);

    // Mechanical rivets
    ctx.fillStyle = CHROME;
    ctx.beginPath();
    ctx.arc(-10, -2, 1, 0, Math.PI * 2);
    ctx.arc(-3, 0, 1, 0, Math.PI * 2);
    ctx.fill();

    // 5. Sharpened Titanium Tail Stinger
    ctx.fillStyle = STEEL;
    ctx.beginPath();
    ctx.moveTo(-16, -1);
    ctx.lineTo(-26, 4);
    ctx.lineTo(-16, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = CHROME;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  },

  // Crabmeat (Cangrejo Robotizado: Heavy mecha crab with hydraulic legs and snapping metal claws)
  drawCrabmeat(ctx, x, y, facingRight, frame) {
    ctx.save();
    ctx.translate(x, y);

    const RED = '#dc2626';
    const RED_DARK = '#991b1b';
    const STEEL = '#475569';
    const CHROME = '#94a3b8';
    const YELLOW = '#facc15';
    const BLACK = '#0f172a';
    const GREEN_CORE = '#22c55e';

    // 1. Hydraulic Walking Cyber-Legs (4 articulated legs with pistons)
    const legCycle = Math.sin(frame * 12);
    ctx.strokeStyle = STEEL;
    ctx.lineWidth = 3;

    // Outer leg pairs (Left and Right)
    ctx.beginPath();
    // Far left leg
    ctx.moveTo(-10, -3);
    ctx.lineTo(-19, 0 + legCycle * 3.5);
    ctx.lineTo(-22, 7);
    // Mid left leg
    ctx.moveTo(-5, -3);
    ctx.lineTo(-13, 0 - legCycle * 3.5);
    ctx.lineTo(-15, 7);
    // Mid right leg
    ctx.moveTo(5, -3);
    ctx.lineTo(13, 0 + legCycle * 3.5);
    ctx.lineTo(15, 7);
    // Far right leg
    ctx.moveTo(10, -3);
    ctx.lineTo(19, 0 - legCycle * 3.5);
    ctx.lineTo(22, 7);
    ctx.stroke();

    // Hydraulic piston highlights
    ctx.strokeStyle = CHROME;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 2. Heavy Crimson Mecha Armor Shell
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.roundRect(-16, -14, 32, 16, 6);
    ctx.fill();
    ctx.strokeStyle = RED_DARK;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lower armor plate
    ctx.fillStyle = RED_DARK;
    ctx.beginPath();
    ctx.roundRect(-14, -2, 28, 5, 2);
    ctx.fill();

    // Rivet bolts on shell
    ctx.fillStyle = CHROME;
    ctx.beginPath();
    ctx.arc(-11, -10, 1.2, 0, Math.PI * 2);
    ctx.arc(11, -10, 1.2, 0, Math.PI * 2);
    ctx.arc(-8, -4, 1.2, 0, Math.PI * 2);
    ctx.arc(8, -4, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Mecha Energy Core in center of shell
    ctx.fillStyle = GREEN_CORE;
    ctx.shadowColor = GREEN_CORE;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(0, -6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. Robotic Periscope Eyestalks (Twin scanning sensors)
    ctx.strokeStyle = STEEL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(-8, -23);
    ctx.moveTo(6, -14);
    ctx.lineTo(8, -23);
    ctx.stroke();

    // Scanning Sensor Eyes (with animated optical pupil)
    const eyeShift = Math.sin(frame * 5) * 1.5;
    // Left eye
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(-8, -23, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(-8 + eyeShift, -23, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(8, -23, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(8 + eyeShift, -23, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 4. Snapping Industrial Scissor Pincers / Claws
    const snap = Math.sin(frame * 10);
    const clawAngle = Math.max(0, snap) * 0.35; // Actively snaps open and shut

    // Left Claw Unit
    ctx.save();
    ctx.translate(-16, -9);
    // Upper jaw
    ctx.save();
    ctx.rotate(-0.35 - clawAngle);
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, -8);
    ctx.lineTo(2, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = STEEL;
    ctx.fillRect(-4, -6, 2, 4); // Metal tooth
    ctx.restore();

    // Lower jaw
    ctx.save();
    ctx.rotate(0.25 + clawAngle);
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, 3);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Claw gear joint
    ctx.fillStyle = STEEL;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Claw Unit
    ctx.save();
    ctx.translate(16, -9);
    // Upper jaw
    ctx.save();
    ctx.rotate(0.35 + clawAngle);
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, -8);
    ctx.lineTo(-2, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = STEEL;
    ctx.fillRect(2, -6, 2, 4); // Metal tooth
    ctx.restore();

    // Lower jaw
    ctx.save();
    ctx.rotate(-0.25 - clawAngle);
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 3);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Claw gear joint
    ctx.fillStyle = STEEL;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  },

  // Bumper / Spring (Vertical or Diagonal/Horizontal)
  drawSpring(ctx, x, y, type, extended) {
    ctx.save();
    ctx.translate(x, y);

    const RED = '#e11d48';
    const YELLOW = '#eab308';
    const GREY = '#94a3b8';

    if (type === 'up') {
      // Base plate
      ctx.fillStyle = GREY;
      ctx.fillRect(-16, 8, 32, 6);

      // Spring coil
      const height = extended ? 24 : 10;
      ctx.strokeStyle = YELLOW;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(8, 4);
      ctx.lineTo(-8, 0);
      if (extended) {
        ctx.lineTo(8, -6);
        ctx.lineTo(-8, -12);
        ctx.lineTo(8, -18);
      }
      ctx.lineTo(0, -height);
      ctx.stroke();

      // Top red bounce plate
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect(-16, -height - 5, 32, 8, 3);
      ctx.fill();

      // White highlight stripe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -height - 3, 24, 2);
    } else {
      // Right-facing launch spring
      ctx.fillStyle = GREY;
      ctx.fillRect(-14, -16, 6, 32);

      const width = extended ? 24 : 10;
      ctx.strokeStyle = YELLOW;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(0, 8);
      ctx.lineTo(width, 0);
      ctx.stroke();

      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect(width, -16, 8, 32, 3);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width + 2, -12, 2, 24);
    }

    ctx.restore();
  },

  // Goal Signpost (Eggman on one side, Sonic on the other, spins upon passing)
  drawSignpost(ctx, x, y, spinProgress, isSonic) {
    ctx.save();
    ctx.translate(x, y);

    // Pole
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-3, 0, 6, 48);

    // Plate rotation width
    const angle = spinProgress * Math.PI * 8; // Multiple rotations
    const scaleX = spinProgress >= 1 ? 1 : Math.cos(angle);
    const showSonicSide = spinProgress >= 1 ? isSonic : Math.sin(angle) > 0;

    ctx.save();
    ctx.translate(0, -16);
    ctx.scale(Math.abs(scaleX) < 0.1 ? 0.1 : scaleX, 1);

    // Signpost plate frame
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (showSonicSide) {
      // Sonic Icon on Signpost
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Peach face
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(4, 2, 9, 0, Math.PI * 2);
      ctx.fill();

      // Quills
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.lineTo(-15, -4);
      ctx.lineTo(-8, 2);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(5, -2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Eggman / Robotnik Icon on Signpost
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Big yellow mustache
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-12, 3);
      ctx.quadraticCurveTo(0, -3, 12, 3);
      ctx.quadraticCurveTo(0, 9, -12, 3);
      ctx.fill();

      // Dark goggles
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, -6, 6, 4);
      ctx.fillRect(2, -6, 6, 4);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(-8, -6, 6, 4);
      ctx.strokeRect(2, -6, 6, 4);
    }

    ctx.restore();
    ctx.restore();
  },

  // Classic Item Box monitor (Shield, 10 Rings, Speed Shoes)
  drawItemBox(ctx, x, y, type, frame) {
    ctx.save();
    ctx.translate(x, y);

    // Outer CRT box
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 28, 4);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dark screen
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -10, 20, 20);

    // Glowing icon inside
    if (type === 'ring') {
      Sprites.drawRing(ctx, 0, 0, frame, 0.7);
    } else if (type === 'speed') {
      // Red speed shoe icon
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-7, -2, 14, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -2, 3, 6);
    } else {
      // Blue Shield ball
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  },

  // Animal buddies (Flickie bird / Pocky rabbit freed from Badniks)
  drawAnimalBuddy(ctx, x, y, facingRight, frame) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    // Little blue flickie bird
    const hop = Math.abs(Math.sin(frame * 10)) * 6;
    ctx.translate(0, -hop);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Tiny orange beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(5, -1);
    ctx.lineTo(8, 0);
    ctx.lineTo(5, 2);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(2, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
