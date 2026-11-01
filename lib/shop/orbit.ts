import type { FigureAngle } from "@/lib/shop/wardrobe";

/**
 * The dressing-room camera.
 *
 * The figure is four drawings. Between them the silhouette narrows, like a
 * character turning past the camera, and the next drawing takes over at the
 * thin point so the width never jumps.
 */
const POSES: { angle: FigureAngle; label: string }[] = [
  { angle: "front", label: "Front" },
  { angle: "right", label: "Right side" },
  { angle: "back", label: "Back" },
  { angle: "left", label: "Left side" },
];

const MIN_SQUEEZE = 0.2;

export interface OrbitLayer {
  angle: FigureAngle;
  squeeze: number;
}

export interface OrbitFrame {
  /** Yaw wrapped to 0–360. */
  yaw: number;
  layer: OrbitLayer;
  label: string;
}

export function normalizeYaw(yaw: number): number {
  return ((yaw % 360) + 360) % 360;
}

export function orbitFrame(yaw: number): OrbitFrame {
  const wrapped = normalizeYaw(yaw);
  const segment = Math.floor(wrapped / 90) % 4;
  const t = (wrapped % 90) / 90;
  const turningAway = t < 0.5;
  const pose = turningAway ? POSES[segment] : POSES[(segment + 1) % 4];
  const along = turningAway ? t / 0.5 : (t - 0.5) / 0.5;
  const width = turningAway ? Math.cos(along * (Math.PI / 2)) : Math.sin(along * (Math.PI / 2));
  const squeeze = MIN_SQUEEZE + (1 - MIN_SQUEEZE) * width;
  return {
    yaw: wrapped,
    layer: { angle: pose.angle, squeeze },
    label: squeeze < 0.55 ? "Turning" : pose.label,
  };
}

/** Cardinal yaw (0, 90, 180, 270) closest to this angle. */
export function nearestPose(yaw: number): number {
  const wrapped = normalizeYaw(yaw);
  const snapped = Math.round(wrapped / 90) * 90;
  return snapped === 360 ? 0 : snapped;
}

/** Signed degrees from `from` to `to`, the short way around the circle. */
export function shortestTurn(from: number, to: number): number {
  let delta = normalizeYaw(to) - normalizeYaw(from);
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}
