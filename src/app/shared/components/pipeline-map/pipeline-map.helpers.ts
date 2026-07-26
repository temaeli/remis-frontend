import type { Feature, FeatureCollection } from 'geojson';

export type GeoJsonInput = string | Feature | FeatureCollection | null | undefined;

/**
 * True if the feature has geometry AND that geometry carries usable coordinates.
 * Backends sometimes emit one Feature per section even when no points have been
 * uploaded yet — those land as `{type:'LineString', coordinates: []}` and must
 * not pollute `getBounds()` or fly the map to nowhere.
 */
function hasUsableGeometry(f: Feature | null | undefined): boolean {
  const g: any = f?.geometry;
  if (!g) return false;
  const coords = g.coordinates;
  if (!Array.isArray(coords) || coords.length === 0) return false;
  // LineString needs ≥ 2 points to draw; a single coord is degenerate.
  if (g.type === 'LineString' && coords.length < 2) return false;
  return true;
}

export function normalizeGeoJson(input: GeoJsonInput): FeatureCollection | null {
  if (input == null || input === '') return null;
  let parsed: any = input;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (parsed?.type === 'Feature') {
    return { type: 'FeatureCollection', features: [parsed as Feature] };
  }
  if (parsed?.type === 'FeatureCollection') {
    const fc = parsed as FeatureCollection;
    return { ...fc, features: (fc.features ?? []).filter(hasUsableGeometry) };
  }
  return null;
}

export function hasFeatures(fc: FeatureCollection | null): boolean {
  return !!fc?.features?.some(hasUsableGeometry);
}

export const SECTION_PALETTE = [
  '#FF6B1A', // gas-flame orange (primary)
  '#FFD23D', // safety yellow
  '#34D399', // cool mint
  '#5DD0F3', // ice cyan
  '#A78BFA', // dusk violet
  '#F87171', // alert red
  '#F0A04B', // amber
  '#94A3B8', // cool slate
] as const;

export function sectionColor(index: number): string {
  const len = SECTION_PALETTE.length;
  return SECTION_PALETTE[((index % len) + len) % len];
}

const EARTH_RADIUS_M = 6371008.8;

function haversineMeters(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function lineStringLengthMeters(coords: [number, number][]): number {
  let sum = 0;
  for (let i = 1; i < coords.length; i++) sum += haversineMeters(coords[i - 1], coords[i]);
  return sum;
}

export function extractStats(fc: FeatureCollection | null): {
  sectionCount: number;
  totalLengthMeters: number;
} {
  if (!fc?.features?.length) return { sectionCount: 0, totalLengthMeters: 0 };
  let sectionCount = 0;
  let totalLengthMeters = 0;
  for (const f of fc.features) {
    if (f?.geometry?.type !== 'LineString') continue;
    const coords = (f.geometry.coordinates ?? []) as [number, number][];
    if (coords.length < 2) continue;
    sectionCount++;
    // Prefer the backend-authoritative length (PostGIS ST_Length on the
    // stored geometry) when present; fall back to Haversine on the rendered
    // coords. Haversine differs from ST_Length on a projected geometry, so
    // computing client-side would silently disagree with reports.
    const backendLen = (f.properties as any)?.length;
    if (typeof backendLen === 'number' && Number.isFinite(backendLen)) {
      totalLengthMeters += backendLen;
    } else {
      totalLengthMeters += lineStringLengthMeters(coords);
    }
  }
  return { sectionCount, totalLengthMeters };
}
