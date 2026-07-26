import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { TANZANIA_BOUNDARY } from '@shared/data/tanzania-boundary';
import * as L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet-measure';
import 'leaflet-boundary-canvas';

import {
  GeoJsonInput,
  extractStats,
  hasFeatures,
  normalizeGeoJson,
  sectionColor,
} from './pipeline-map.helpers';
import { coordinateDisplay } from './plugins/coordinate-display';

interface Basemap { label: string; layer: L.TileLayer }

const TZ_CENTER: L.LatLngTuple = [-6.369, 34.888]; // Tanzania centroid
const TZ_DEFAULT_ZOOM = 6;

@Component({
  selector: 'pipeline-map',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pipeline-map.component.html',
  styleUrls: ['./pipeline-map.component.scss'],
})
export class PipelineMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() geoJson: GeoJsonInput = null;
  @Input() title = 'Pipeline Spatial View';
  @Input() subtitle: string | null = null;
  @Input() emptyTitle = 'No spatial data yet';
  @Input() emptyBody =
    'Upload section coordinates via the Excel uploader on a pipeline section to see the line rendered here.';

  @ViewChild('mapHost', { static: true }) mapHost!: ElementRef<HTMLDivElement>;

  /** Public for template binding only — not part of the component's API. */
  stats: { sectionCount: number; totalLengthMeters: number } = {
    sectionCount: 0,
    totalLengthMeters: 0,
  };
  hasData = false;

  private map?: L.Map;
  private dataLayer?: L.GeoJSON;
  private hasInit = false;

  ngAfterViewInit(): void {
    this.initMap();
    this.hasInit = true;
    this.applyGeoJson();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['geoJson']) {
      // Recompute template-facing state synchronously so the first OnPush CD
      // pass sees the correct hasData/stats — even before the Leaflet map
      // has been initialized in ngAfterViewInit.
      const fc = normalizeGeoJson(this.geoJson);
      this.hasData = hasFeatures(fc);
      this.stats = extractStats(fc);
      if (this.hasInit) this.applyGeoJson();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  formatLength(meters: number): string {
    if (!meters) return '0 m';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(meters >= 10_000 ? 1 : 2)} km`;
  }

  private initMap(): void {
    const el = this.mapHost.nativeElement;

    this.map = L.map(el, {
      center: TZ_CENTER,
      zoom: TZ_DEFAULT_ZOOM,
      minZoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    // Fullscreen — register explicitly. The L.Map `fullscreenControl: true`
    // option is unreliable in our bundler setup (side-effect import gets
    // partially shaken / sequenced before the plugin augments L), so we add
    // the control after the map exists.
    (L.control as any)
      .fullscreen({
        position: 'topleft',
        title: 'Fullscreen',
        titleCancel: 'Exit fullscreen',
      })
      .addTo(this.map);

    const basemaps = this.buildBasemaps();
    basemaps[0].layer.addTo(this.map);

    L.control
      .layers(
        basemaps.reduce<Record<string, L.Layer>>((acc, b) => ({ ...acc, [b.label]: b.layer }), {}),
        undefined,
        { position: 'bottomleft', collapsed: false },
      )
      .addTo(this.map);

    // Measure tool disabled for now — re-enable by un-commenting. SCSS for the
    // dark-themed panel + narrow interaction list is preserved below.
    // (L.control as any)
    //   .measure({
    //     position: 'topleft',
    //     primaryLengthUnit: 'meters',
    //     secondaryLengthUnit: 'kilometers',
    //     primaryAreaUnit: 'sqmeters',
    //     secondaryAreaUnit: 'sqkilometers',
    //     activeColor: '#FF6B1A',
    //     completedColor: '#FFD23D',
    //   })
    //   .addTo(this.map);

    coordinateDisplay({ position: 'bottomright' }).addTo(this.map);
  }

  private buildBasemaps(): Basemap[] {
    const clip = TANZANIA_BOUNDARY as any;
    const make = (
      url: string,
      attribution: string,
      opts: Partial<L.TileLayerOptions> = {},
    ) =>
      (L.TileLayer as any).boundaryCanvas(url, {
        attribution,
        boundary: clip,
        maxZoom: 19,
        // Do NOT set crossOrigin here. The plugin uses createPattern + fill
        // (no pixel reads), so a tainted canvas renders fine. Forcing CORS
        // makes Esri/Google's edge servers blank tiles whenever they reply
        // without the Access-Control-Allow-Origin header.
        ...opts,
      }) as L.TileLayer;

    const osm = make(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      '© OpenStreetMap contributors',
    );
    const esri = make(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'Imagery © Esri, Maxar, Earthstar Geographics',
    );
    const blank = L.tileLayer('', { attribution: '' });

    return [
      { label: 'Streets (OSM)', layer: osm },
      { label: 'Satellite (Esri)', layer: esri },
      { label: 'Blank', layer: blank },
    ];
  }

  private applyGeoJson(): void {
    if (!this.map) return;

    if (this.dataLayer) {
      this.map.removeLayer(this.dataLayer);
      this.dataLayer = undefined;
    }

    const fc = normalizeGeoJson(this.geoJson);
    this.hasData = hasFeatures(fc);
    this.stats = extractStats(fc);

    if (!fc || !this.hasData) {
      this.map.flyTo(TZ_CENTER, TZ_DEFAULT_ZOOM, { animate: true, duration: 0.6 });
      return;
    }

    let idx = 0;
    this.dataLayer = L.geoJSON(fc, {
      style: feature => ({
        color: sectionColor(idx++),
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }),
      onEachFeature: (feature, layer) => {
        const popup = this.renderPopup(feature);
        if (popup) layer.bindPopup(popup, { className: 'pm-popup', maxWidth: 320 });
        layer.on('mouseover', () => (layer as L.Path).setStyle({ weight: 6, opacity: 1 }));
        layer.on('mouseout', () => (layer as L.Path).setStyle({ weight: 4, opacity: 0.95 }));
      },
    }).addTo(this.map);

    const bounds = this.dataLayer.getBounds();
    if (bounds.isValid()) {
      this.map.flyToBounds(bounds, { animate: true, duration: 0.6, padding: [40, 40] });
    }
  }

  private renderPopup(feature: GeoJSON.Feature): string | null {
    const p = (feature.properties ?? {}) as Record<string, any>;
    const rows: [string, string | number | undefined][] = [
      ['Section', p.sectionId ?? p.name],
      ['Length', p.length != null ? `${Number(p.length).toFixed(1)} m` : undefined],
      ['Diameter', p.diameter != null ? `${p.diameter} mm` : undefined],
      ['Design pressure', p.designPressure != null ? `${p.designPressure} bar` : undefined],
      ['Max pressure', p.maxPressure != null ? `${p.maxPressure} bar` : undefined],
      ['Material', p.materialUsed],
      ['Installed', p.installationDate],
    ];

    const filled = rows.filter(([, v]) => v != null && v !== '');
    if (!filled.length) return null;

    const body = filled
      .map(
        ([k, v]) =>
          `<dt class="pm-popup__k">${k}</dt><dd class="pm-popup__v">${String(v)}</dd>`,
      )
      .join('');

    return `
      <div class="pm-popup__inner">
        <header class="pm-popup__title">${p.sectionId ?? p.name ?? 'Section'}</header>
        <dl class="pm-popup__grid">${body}</dl>
      </div>`;
  }
}
