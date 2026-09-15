/** A surveyed corner as the Parcel Points read returns it. */
export interface ParcelPoint {
  id: string;
  name: string;
  pointOrder: number;
  latitude: number | string;
  longitude: number | string;
}

export interface ParcelShape {
  /** [lat, lng] in boundary order. */
  ring: [number, number][];
  /** Square metres; 0 when fewer than three corners. */
  areaSqm: number;
  /** Metres around the closed boundary; 0 when fewer than two corners. */
  perimeterM: number;
  /** True when two non-adjacent edges cross — the corners are out of order. */
  crossesItself: boolean;
}

const EARTH_RADIUS_M = 6_378_137;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** The corners in order, dropping any whose coordinates do not parse. */
export function orderedRing(points: ParcelPoint[]): [number, number][] {
  return [...points]
    .sort((a, b) => Number(a.pointOrder) - Number(b.pointOrder))
    .map((p) => [Number(p.latitude), Number(p.longitude)] as [number, number])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
}

/**
 * Area of a ring on the sphere (the same spherical-excess sum Leaflet.draw and
 * Google use). Accurate to well under a percent at plot scale.
 */
export function ringAreaSqm(ring: [number, number][]): number {
  if (ring.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [lat1, lng1] = ring[i];
    const [lat2, lng2] = ring[(i + 1) % ring.length];
    sum += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

/** Great-circle distance in metres. */
export function distanceM([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function segmentsCross(
  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  [cy, cx]: [number, number],
  [dy, dx]: [number, number],
): boolean {
  const side = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) =>
    Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
  return (
    side(ax, ay, bx, by, cx, cy) * side(ax, ay, bx, by, dx, dy) < 0 &&
    side(cx, cy, dx, dy, ax, ay) * side(cx, cy, dx, dy, bx, by) < 0
  );
}

export function ringCrossesItself(ring: [number, number][]): boolean {
  const n = ring.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // these two edges share the first corner
      if (segmentsCross(ring[i], ring[(i + 1) % n], ring[j], ring[(j + 1) % n])) return true;
    }
  }
  return false;
}

export function parcelShape(points: ParcelPoint[]): ParcelShape {
  const ring = orderedRing(points);
  let perimeterM = 0;
  if (ring.length >= 2) {
    for (let i = 0; i < ring.length; i++) {
      if (ring.length === 2 && i === 1) break;
      perimeterM += distanceM(ring[i], ring[(i + 1) % ring.length]);
    }
  }
  return {
    ring,
    areaSqm: ringAreaSqm(ring),
    perimeterM,
    crossesItself: ringCrossesItself(ring),
  };
}

/** How far the drawn area is from the registered gross area, as a signed percentage. */
export function areaDifferencePercent(
  drawnSqm: number,
  registeredSqm?: number | string | null,
): number | null {
  const registered = Number(registeredSqm);
  if (!drawnSqm || !Number.isFinite(registered) || registered <= 0) return null;
  return ((drawnSqm - registered) / registered) * 100;
}
