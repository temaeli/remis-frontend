import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet-fullscreen';

import { FetchService } from '@shared/fetch/fetch.service';

import { POINTS_OF_REGISTRATION, pointReloaded$ } from './land-registration-panels';
import { ParcelPoint, areaDifferencePercent, parcelShape } from './parcel-map.helpers';

const TZ_CENTER: L.LatLngTuple = [-6.369, 34.888];

/** Beyond this, the drawn area is flagged against the registered gross area. */
const AREA_TOLERANCE_PERCENT = 5;

/**
 * The parcel drawn from its surveyed corners, in `point_order`.
 *
 * Three or more corners make an outline; fewer are shown as numbered beacons
 * only. The area and perimeter are worked out from the corners on the page, and
 * the area is compared with the registration's gross area, so a mistyped or
 * out-of-order corner shows as a shape that is plainly wrong.
 *
 * Redraws whenever a corner is recorded, amended or deleted on the Parcel Points
 * tab.
 */
@Component({
  selector: 'parcel-map',
  imports: [DecimalPipe],
  template: `
    <div class="flex flex-col gap-3 p-4">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm" aria-live="polite">
        @if (loading()) {
          <span class="text-gray-500">Loading the parcel's corners…</span>
        } @else if (error()) {
          <span class="text-red-600" role="alert">{{ error() }}</span>
        } @else if (!shape().ring.length) {
          <span class="text-gray-500">
            No corners recorded yet. Add them on the Parcel Points tab, numbered in order around the
            boundary, and the parcel is drawn here.
          </span>
        } @else {
          <span
            ><strong>{{ shape().ring.length }}</strong> corner(s)</span
          >
          @if (shape().ring.length >= 3) {
            <span
              >Drawn area <strong>{{ shape().areaSqm | number: '1.0-2' }} sqm</strong></span
            >
            @if (grossArea()) {
              <span>Registered gross area {{ grossArea() | number: '1.0-2' }} sqm</span>
            }
            @if (areaDiff() !== null) {
              <span [class.text-amber-600]="areaOff()" [class.text-green-700]="!areaOff()">
                {{ areaDiff()! > 0 ? '+' : '' }}{{ areaDiff() | number: '1.0-1' }}%
                {{ areaOff() ? '— check the corners' : '— matches' }}
              </span>
            }
          } @else {
            <span class="text-amber-600">At least 3 corners are needed to draw the outline</span>
          }
          @if (shape().perimeterM) {
            <span>Perimeter {{ shape().perimeterM | number: '1.0-1' }} m</span>
          }
          @if (shape().crossesItself) {
            <span class="text-red-600" role="alert">
              The outline crosses itself: the corners are probably numbered out of order
            </span>
          }
        }
      </div>
      <div
        #mapHost
        class="h-[480px] w-full overflow-hidden rounded-lg border border-gray-200"
        role="application"
        [attr.aria-label]="'Map of parcel ' + (title() ?? '')"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParcelMapComponent {
  /** The registration whose corners are drawn. */
  readonly landRegistrationUid = input<string>();
  /** Registered gross area in square metres, compared with the drawn area. */
  readonly grossArea = input<number | string | null>();
  /** Shown in the map's accessible label and the outline's popup. */
  readonly title = input<string | null>();

  private readonly fs = inject(FetchService);
  private readonly mapHost = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  private readonly points = signal<ParcelPoint[]>([]);

  protected readonly shape = computed(() => parcelShape(this.points()));
  protected readonly areaDiff = computed(() =>
    this.shape().ring.length >= 3
      ? areaDifferencePercent(this.shape().areaSqm, this.grossArea())
      : null,
  );
  protected readonly areaOff = computed(
    () => Math.abs(this.areaDiff() ?? 0) > AREA_TOLERANCE_PERCENT,
  );

  private map?: L.Map;
  private layer = L.featureGroup();
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => this.initMap());

    effect(() => {
      const uid = this.landRegistrationUid();
      if (uid) void this.load(uid);
    });

    effect(() => {
      this.shape();
      this.draw();
    });

    const reloaded = pointReloaded$.subscribe(() => {
      const uid = this.landRegistrationUid();
      if (uid) void this.load(uid);
    });

    inject(DestroyRef).onDestroy(() => {
      reloaded.unsubscribe();
      this.resizeObserver?.disconnect();
      this.map?.remove();
    });
  }

  private async load(uid: string): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const rows = await this.fs.fetch({
        query: POINTS_OF_REGISTRATION,
        variables: { landRegistrationUid: uid },
        showLoading: false,
      });
      this.points.set(rows ?? []);
    } catch {
      this.error.set(
        "The parcel's corners could not be read. Reopen the registration to try again.",
      );
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
    // A plot is small, so the photo is what people recognise it by.
    satellite.addTo(this.map);
    L.control
      .layers({ Satellite: satellite, Streets: streets }, undefined, { position: 'topright' })
      .addTo(this.map);
    (L.control as any).fullscreen?.({ position: 'topleft' })?.addTo(this.map);
    L.control.scale({ imperial: false }).addTo(this.map);
    this.layer.addTo(this.map);

    // The tab may be hidden when this renders, leaving Leaflet a 0x0 box. Resize
    // and refit whenever the container actually gets a size.
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
      this.fit();
    });
    this.resizeObserver.observe(host);

    this.draw();
  }

  private draw(): void {
    if (!this.map) return;
    this.layer.clearLayers();

    const { ring, areaSqm, crossesItself } = this.shape();
    const rows = [...this.points()].sort((a, b) => Number(a.pointOrder) - Number(b.pointOrder));

    if (ring.length >= 3) {
      L.polygon(ring, {
        color: crossesItself ? '#dc2626' : '#f59e0b',
        weight: 3,
        fillOpacity: 0.2,
      })
        .bindPopup(
          `<strong>${this.escape(this.title() ?? 'Parcel')}</strong><br>${areaSqm.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
            },
          )} sqm drawn`,
        )
        .addTo(this.layer);
    } else if (ring.length === 2) {
      L.polyline(ring, { color: '#f59e0b', weight: 3, dashArray: '6 6' }).addTo(this.layer);
    }

    ring.forEach((latLng, i) => {
      const row = rows[i];
      L.marker(latLng, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:24px;height:24px;border-radius:50%;background:#1f2937;color:#fff;border:2px solid #fff;font:600 11px/20px sans-serif;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.5)">${row?.pointOrder ?? i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
        title: row?.name,
      })
        .bindTooltip(
          `${this.escape(row?.name ?? '')}<br>${latLng[0].toFixed(6)}, ${latLng[1].toFixed(6)}`,
          { direction: 'top', offset: [0, -12] },
        )
        .addTo(this.layer);
    });

    this.fit();
  }

  private fit(): void {
    if (!this.map) return;
    const bounds = this.layer.getBounds();
    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 19 });
  }

  private escape(text: string): string {
    return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }
}
