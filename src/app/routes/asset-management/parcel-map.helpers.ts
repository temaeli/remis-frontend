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
  /** Point numbers held by more than one corner, so the drawing order is a guess. */
  repeatedNumbers: number[];
}

const EARTH_RADIUS_M = 6_378_137;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** The corners in order, dropping any whose coordinates do not parse. */
export function orderedRing(points: ParcelPoint[]): [number, number][] {
  return [...points]
    .sort((a, b) => Number(a.pointOrder) - Number(b.pointOrder) || a.name.localeCompare(b.name))
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

/** Point numbers used by more than one corner, lowest first. */
export function repeatedNumbers(points: ParcelPoint[]): number[] {
  const counts = new Map<number, number>();
  points.forEach((p) =>
    counts.set(Number(p.pointOrder), (counts.get(Number(p.pointOrder)) ?? 0) + 1),
  );
  return [...counts]
    .filter(([, count]) => count > 1)
    .map(([n]) => n)
    .sort((a, b) => a - b);
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
    repeatedNumbers: repeatedNumbers(points),
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

/** One corner as typed into the Enter All Corners box. */
export interface CornerLine {
  name: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * One corner per line: name, latitude, longitude — separated by commas, tabs or
 * semicolons, so a copy from a spreadsheet works. Blank lines are skipped, and so
 * is a first line whose coordinates are not numbers (a header). A coordinate that
 * does not parse comes back null and the backend says which corner it is.
 */
export function parseCornerLines(text: string): CornerLine[] {
  const rows = (text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const cells = line.split(/\s*[,;\t]\s*/);
      // The name may itself contain a separator; the last two cells are the coordinates.
      const lng = cells.length >= 3 ? cells.pop()! : '';
      const lat = cells.length >= 2 ? cells.pop()! : '';
      const toNumber = (value: string) =>
        value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
      return { name: cells.join(', ').trim(), latitude: toNumber(lat), longitude: toNumber(lng) };
    });
  if (rows.length && rows[0].latitude === null && rows[0].longitude === null) rows.shift();
  return rows;
}

/** The corners back as lines, in order, for editing. */
export function cornerLines(points: ParcelPoint[]): string {
  return [...points]
    .sort((a, b) => Number(a.pointOrder) - Number(b.pointOrder) || a.name.localeCompare(b.name))
    .map((p) => `${p.name}, ${Number(p.latitude).toFixed(6)}, ${Number(p.longitude).toFixed(6)}`)
    .join('\n');
}
