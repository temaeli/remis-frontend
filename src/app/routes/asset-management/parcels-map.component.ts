import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { gql } from '@apollo/client/core';
import * as L from 'leaflet';
import 'leaflet-fullscreen';

import { FetchService } from '@shared/fetch/fetch.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

const TZ_CENTER: L.LatLngTuple = [-6.369, 34.888];

const PARCEL_BOUNDARIES = gql`
  query parcelBoundariesGeoJson {
    parcelBoundariesGeoJson
  }
`;

/**
 * Every registered parcel on one map.
 *
 * <p>The outlines are the ones the database built from each parcel's corners, so
 * this shows what is actually registered — a parcel whose corners have not been
 * entered, or do not yet form a valid boundary, is simply not here.
 */
@Component({
  selector: 'app-parcels-map',
  imports: [DecimalPipe, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-4">
      <page-header [title]="title" [subtitle]="subtitle" />

      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm" aria-live="polite">
        @if (loading()) {
          <span class="text-gray-500">Loading parcels…</span>
        } @else if (error()) {
          <span class="text-red-600" role="alert">{{ error() }}</span>
        } @else if (!count()) {
          <span class="text-gray-500">
            No parcel has a boundary yet. A boundary appears once a registration's corners are
            entered on its Parcel Points tab.
          </span>
        } @else {
          <span
            ><strong>{{ count() }}</strong> parcel(s) mapped</span
          >
          <span>Total area {{ totalArea() | number: '1.0-2' }} sqm</span>
        }
      </div>

      <div
        #mapHost
        class="min-h-[520px] flex-1 w-full overflow-hidden rounded-lg border border-gray-200"
        role="application"
        aria-label="Map of every registered parcel"
      ></div>
    </div>
  `,
})
export class ParcelsMapComponent {
  protected readonly title = 'Plots Map';
  protected readonly subtitle = 'Every registered parcel, drawn from its surveyed corners';

  private readonly fs = inject(FetchService);
  private readonly mapHost = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  private readonly parcels = signal<any | null>(null);

  protected readonly count = computed(() => this.parcels()?.features?.length ?? 0);
  protected readonly totalArea = computed(() =>
    (this.parcels()?.features ?? []).reduce(
      (sum: number, f: any) => sum + Number(f?.properties?.areaSqm ?? 0),
      0,
    ),
  );

  private map?: L.Map;
  private layer = L.featureGroup();
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.initMap();
      void this.load();
    });

    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.map?.remove();
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const geoJson = await this.fs.fetch({ query: PARCEL_BOUNDARIES, showLoading: false });
      this.parcels.set(this.parse(geoJson));
      this.draw();
    } catch {
      this.error.set('The parcels could not be read. Reload the page to try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private initMap(): void {
    const host = this.mapHost().nativeElement;
    this.map = L.map(host, { center: TZ_CENTER, zoom: 6, attributionControl: true });

    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    });
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' },
    );
    satellite.addTo(this.map);
    L.control
      .layers({ Satellite: satellite, Streets: streets }, undefined, { position: 'topright' })
      .addTo(this.map);
    (L.control as any).fullscreen?.({ position: 'topleft' })?.addTo(this.map);
    L.control.scale({ imperial: false }).addTo(this.map);
    this.layer.addTo(this.map);

    // The page may lay out after the map is created, leaving Leaflet a 0x0 box.
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
      this.fit();
    });
    this.resizeObserver.observe(host);
  }

  private draw(): void {
    if (!this.map) return;
    this.layer.clearLayers();

    const parcels = this.parcels();
    if (!parcels) return;

    L.geoJSON(parcels, {
      style: { color: '#16a34a', weight: 2, fillOpacity: 0.15 },
      onEachFeature: (feature, layer) => {
        const p = (feature.properties ?? {}) as Record<string, any>;
        const rows: [string, unknown][] = [
          ['Plot', p['plotNumber']],
          ['Parcel', p['parcelNumber']],
          ['Title', p['titleNumber']],
          ['Tenure', p['tenureType']],
          ['Use', p['permittedUse']],
          ['Area', `${Number(p['areaSqm'] ?? 0).toLocaleString()} sqm`],
          ['Gross area', `${Number(p['grossArea'] ?? 0).toLocaleString()} sqm`],
        ];
        const body = rows
          .filter(([, value]) => value !== undefined && value !== null && value !== '')
          .map(
            ([label, value]) =>
              `<div><span class="faded">${label}:</span> ${this.escape(String(value))}</div>`,
          )
          .join('');
        layer.bindPopup(`<strong>${this.escape(String(p['name'] ?? 'Parcel'))}</strong>${body}`);
        layer.bindTooltip(String(p['plotNumber'] ?? p['parcelNumber'] ?? p['name'] ?? ''));
      },
    }).addTo(this.layer);

    this.fit();
  }

  private fit(): void {
    if (!this.map) return;
    const bounds = this.layer.getBounds();
    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
  }

  private parse(geoJson: unknown): any | null {
    if (typeof geoJson !== 'string' || !geoJson.trim()) return null;
    try {
      const parsed = JSON.parse(geoJson);
      return parsed?.features?.length ? parsed : null;
    } catch {
      return null;
    }
  }

  private escape(text: string): string {
    return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }
}
