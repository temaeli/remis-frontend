import { describe, it, expect } from 'vitest';
import {
  SECTION_PALETTE,
  extractStats,
  hasFeatures,
  normalizeGeoJson,
  sectionColor,
} from './pipeline-map.helpers';

describe('normalizeGeoJson', () => {
  it('passes a FeatureCollection through unchanged', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[36, -6], [37, -7]] }, properties: { name: 's1' } },
      ],
    } as const;
    expect(normalizeGeoJson(fc as any)).toEqual(fc);
  });

  it('wraps a single Feature in a FeatureCollection', () => {
    const feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[36, -6], [37, -7]] },
      properties: { name: 'section-1' },
    };
    expect(normalizeGeoJson(feature as any)).toEqual({
      type: 'FeatureCollection',
      features: [feature],
    });
  });

  it('parses a JSON-string FeatureCollection', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [36, -6] }, properties: {} }],
    };
    expect(normalizeGeoJson(JSON.stringify(fc))).toEqual(fc);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['empty string', ''],
    ['malformed JSON', '{not json'],
    ['object with no type', { features: [] }],
    ['object with foreign type', { type: 'Polygon', coordinates: [] }],
  ])('returns null for %s', (_label, input) => {
    expect(normalizeGeoJson(input as any)).toBeNull();
  });

  it('drops features whose LineString has empty coordinates', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: { name: 'AA' } },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[36, -6], [36.001, -6]] }, properties: { name: 'AC' } },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: { name: 'AD' } },
      ],
    };
    const out = normalizeGeoJson(fc as any);
    expect(out?.features.map((f: any) => f.properties.name)).toEqual(['AC']);
  });

  it('drops features whose LineString has a single coord (degenerate)', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[36, -6]] }, properties: {} },
      ],
    };
    expect(normalizeGeoJson(fc as any)?.features).toEqual([]);
  });
});

describe('hasFeatures', () => {
  it('returns false for null', () => {
    expect(hasFeatures(null)).toBe(false);
  });

  it('returns false for FeatureCollection with no features', () => {
    expect(hasFeatures({ type: 'FeatureCollection', features: [] } as any)).toBe(false);
  });

  it('returns false when every feature lacks geometry', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: null, properties: {} },
        { type: 'Feature', geometry: undefined, properties: {} },
      ],
    };
    expect(hasFeatures(fc as any)).toBe(false);
  });

  it('returns true when at least one feature has geometry', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: null, properties: {} },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[36, -6], [37, -7]] }, properties: {} },
      ],
    };
    expect(hasFeatures(fc as any)).toBe(true);
  });
});

describe('sectionColor', () => {
  it('returns a palette color at every index', () => {
    for (let i = 0; i < 32; i++) {
      expect(SECTION_PALETTE).toContain(sectionColor(i));
    }
  });

  it('cycles deterministically (idx and idx + palette.length yield the same color)', () => {
    const len = SECTION_PALETTE.length;
    for (let i = 0; i < len; i++) {
      expect(sectionColor(i)).toBe(sectionColor(i + len));
      expect(sectionColor(i)).toBe(sectionColor(i + len * 3));
    }
  });

  it('returns distinct colors for the first N consecutive indices (N = palette size)', () => {
    const len = SECTION_PALETTE.length;
    const colors = new Set(Array.from({ length: len }, (_, i) => sectionColor(i)));
    expect(colors.size).toBe(len);
  });

  it('handles negative indices by wrapping into the palette', () => {
    expect(SECTION_PALETTE).toContain(sectionColor(-1));
    expect(SECTION_PALETTE).toContain(sectionColor(-7));
  });
});

describe('extractStats', () => {
  it('returns zeros for null / empty', () => {
    expect(extractStats(null)).toEqual({ sectionCount: 0, totalLengthMeters: 0 });
    expect(extractStats({ type: 'FeatureCollection', features: [] } as any)).toEqual({
      sectionCount: 0,
      totalLengthMeters: 0,
    });
  });

  it('counts only features with LineString geometry', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[36, -6], [36.001, -6]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Point', coordinates: [36, -6] }, properties: {} },
        { type: 'Feature', geometry: null, properties: {} },
      ],
    };
    expect(extractStats(fc as any).sectionCount).toBe(1);
  });

  it('approximates length via Haversine across consecutive coords (~111 m for 0.001° at equator)', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          // ~0.001° latitude step at ~6°S ≈ ~111 m per step
          geometry: { type: 'LineString', coordinates: [[36, -6], [36, -6.001], [36, -6.002]] },
          properties: {},
        },
      ],
    };
    const { totalLengthMeters } = extractStats(fc as any);
    // Two 111 m segments → ~222 m. Allow 10% margin for spherical math.
    expect(totalLengthMeters).toBeGreaterThan(200);
    expect(totalLengthMeters).toBeLessThan(245);
  });

  it('prefers backend-supplied properties.length over Haversine compute', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [[36, -6], [36.001, -6]] },
          properties: { length: 2519.12 }, // backend says 2.5 km
        },
      ],
    };
    expect(extractStats(fc as any).totalLengthMeters).toBe(2519.12);
  });

  it('falls back to Haversine when properties.length is null/missing/non-numeric', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[36, -6], [36, -6.001]] }, properties: { length: null } },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[37, -7], [37, -7.001]] }, properties: {} },
      ],
    };
    const { totalLengthMeters } = extractStats(fc as any);
    expect(totalLengthMeters).toBeGreaterThan(200);
    expect(totalLengthMeters).toBeLessThan(245);
  });

  it('sums across multiple LineString features', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[36, -6], [36, -6.001]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[37, -7], [37, -7.001]] }, properties: {} },
      ],
    };
    const { sectionCount, totalLengthMeters } = extractStats(fc as any);
    expect(sectionCount).toBe(2);
    expect(totalLengthMeters).toBeGreaterThan(200);
    expect(totalLengthMeters).toBeLessThan(245);
  });
});
