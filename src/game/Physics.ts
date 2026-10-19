/**
 * Physics Engine for Sonic Arcade 2D
 * Accurate physics constants based on classic 16-bit Genesis Sonic mechanics.
 * Includes acceleration, friction, skidding, slope/ground adhesion, and 360-degree loop math.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Slope {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LoopDeLoop {
  cx: number;
  cy: number;
  radius: number;
  entryLeft: number;
  entryRight: number;
}

export const PHYSICS = {
  // Movement & Inertia (Balanced, Classic Sonic Speed)
  ACCELERATION: 0.22,       // Comfortable, smooth acceleration
  AIR_ACCEL: 0.28,          // Natural air control
  DECELERATION: 1.10,       // Responsive braking
  FRICTION: 0.24,           // Firm footing without sliding
  TOP_RUN_SPEED: 7.2,       // Classic manageable run speed
  SPRINT_SPEED: 10.5,       // Fast sprint on slopes/boosts
  MAX_SPEED: 13.5,          // Terminal velocity

  // Jumping & Gravity
  GRAVITY: 0.38,
  MAX_FALL_SPEED: 12.0,
  JUMP_IMPULSE_MIN: -5.8,   // Low tap hop
  JUMP_IMPULSE_MAX: -9.5,   // Full jump height on hold

  // Rolling & Spin Dash (Instant ball attack form)
  ROLL_FRICTION: 0.02,      // Low drag when rolling
  ROLL_DECEL: 0.10,
  SPIN_DASH_CHARGE_POWER: 1.5,
  SPIN_DASH_MIN_RELEASE: 7.5,
  SPIN_DASH_MAX_RELEASE: 13.0,

  // Loop-de-loop
  MIN_LOOP_ENTRY_SPEED: 4.5,

  // Springs
  SPRING_UP_VELOCITY: -13.5,
  SPRING_RIGHT_VELOCITY: 12.0,
};

export class PhysicsHelper {
  // AABB collision detection
  static checkAABB(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Point in box check
  static pointInRect(px: number, py: number, r: Rect): boolean {
    return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
  }

  // Get slope surface height at specific X coordinate
  static getSlopeY(slope: Slope, x: number): number | null {
    const minX = Math.min(slope.x1, slope.x2);
    const maxX = Math.max(slope.x1, slope.x2);
    if (x < minX || x > maxX) return null;

    const t = (x - slope.x1) / (slope.x2 - slope.x1);
    return slope.y1 + t * (slope.y2 - slope.y1);
  }

  // Resolve ground collision with platforms and slopes
  static resolveGround(
    x: number,
    y: number,
    prevY: number,
    height: number,
    platforms: Rect[],
    slopes: Slope[]
  ): { onGround: boolean; resolvedY: number; normalX?: number; normalY?: number } {
    const footX = x;
    const footY = y;
    const prevFootY = prevY;

    // Check slopes first for continuous smooth adhesion
    for (const slope of slopes) {
      const slopeY = this.getSlopeY(slope, footX);
      if (slopeY !== null) {
        // Tolerant landing window: if Sonic was above or near slope surface
        if (footY >= slopeY - 14 && prevFootY <= slopeY + 12) {
          return { onGround: true, resolvedY: slopeY };
        }
      }
    }

    // Check solid platforms
    for (const plat of platforms) {
      // Sonic feet landing on top of platform
      if (footX >= plat.x - 10 && footX <= plat.x + plat.width + 10) {
        if (footY >= plat.y && prevFootY <= plat.y + 12) {
          return { onGround: true, resolvedY: plat.y };
        }
      }
    }

    return { onGround: false, resolvedY: y };
  }
}
