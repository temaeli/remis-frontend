import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { Lookup } from '@shared/lookup';

/**
 * The asset at a glance, above its tabs: what it is, where it is, what it cost,
 * what it is worth now, and whether it has been checked. Each answer would
 * otherwise be a tab, a list and a click away.
 *
 * Reads the overview fields the backend computes for the asset's own page
 * (landRegistration, acquisition, latestValuation, latestVerification,
 * disposal). A part the user may not view arrives empty and shows as not
 * recorded.
 */
@Component({
  selector: 'app-asset-summary',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      aria-label="Asset summary"
      class="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
    >
      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">What it is</h3>
        <p class="font-medium">{{ classification() || 'Not classified' }}</p>
        <p class="text-sm">
          <span class="font-semibold" [class]="statusClass()">{{ status() }}</span>
        </p>
        <p class="text-sm text-gray-700">Intended for: {{ intendedFor() }}</p>
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Where it is</h3>
        @if (land(); as l) {
          <p class="font-medium">{{ l.street?.name ?? 'Street not set' }}</p>
          <p class="text-sm text-gray-700">
            Parcel {{ l.parcelNumber }} · Title {{ l.titleNumber }}
          </p>
          @if (hasPoint()) {
            <p class="text-sm text-gray-700">{{ l.latitude }}, {{ l.longitude }}</p>
          }
        } @else if (isLand()) {
          <p class="text-sm text-gray-700">Land not registered yet</p>
        } @else {
          <p class="text-sm text-gray-700">Not a land asset</p>
        }
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Acquired</h3>
        @if (record()['acquisition']; as a) {
          <p class="font-medium">{{ a.acquisitionValue | number: '1.0-2' }}</p>
          <p class="text-sm text-gray-700">{{ a.acquisitionDate | date: 'd MMM y' }}</p>
        } @else {
          <p class="text-sm text-gray-700">Not recorded</p>
        }
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Latest value</h3>
        @if (record()['latestValuation']; as v) {
          <p class="font-medium">{{ v.value | number: '1.0-2' }}</p>
          <p class="text-sm text-gray-700">
            {{ v.valuedAt | date: 'd MMM y' }}{{ v.valuer?.name ? ' · ' + v.valuer.name : '' }}
          </p>
        } @else {
          <p class="text-sm text-gray-700">Not valued yet</p>
        }
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        @if (record()['disposal']; as d) {
          <h3 class="text-xs font-semibold uppercase text-gray-600">Disposed</h3>
          <p class="font-medium text-danger">{{ d.disposedAt | date: 'd MMM y' }}</p>
          <p class="text-sm text-gray-700">{{ d.description }}</p>
        } @else {
          <h3 class="text-xs font-semibold uppercase text-gray-600">Last checked</h3>
          @if (record()['latestVerification']; as c) {
            <p class="font-medium" [class]="outcomeClass(c.outcome)">
              {{ label(c.outcome) }}
            </p>
            <p class="text-sm text-gray-700">
              {{ c.verifiedAt | date: 'd MMM y'
              }}{{ c.verifiedBy?.name ? ' · ' + c.verifiedBy.name : '' }}
            </p>
          } @else {
            <p class="text-sm text-gray-700">Never verified</p>
          }
        }
      </div>
    </section>
  `,
})
export class AssetSummaryComponent {
  readonly record = input.required<Lookup>();

  readonly land = computed(() => this.record()['landRegistration']);

  /** 0 is a real coordinate, so this checks for a value rather than truthiness. */
  readonly hasPoint = computed(() => {
    const l = this.land();
    return (
      l?.latitude !== null &&
      l?.latitude !== undefined &&
      l?.longitude !== null &&
      l?.longitude !== undefined
    );
  });

  readonly isLand = computed(
    () => !!this.record()['assetSubcategory']?.assetCategory?.assetType?.forLand,
  );

  /** "Land › Residential › Plot". */
  readonly classification = computed(() => {
    const sub = this.record()['assetSubcategory'];
    return [sub?.assetCategory?.assetType?.name, sub?.assetCategory?.name, sub?.name]
      .filter(Boolean)
      .join(' › ');
  });

  readonly status = computed(() => this.label(this.record()['status']));

  readonly intendedFor = computed(() => {
    const uses = [
      this.record()['forDevelopment'] ? 'development' : '',
      this.record()['forSelling'] ? 'sale' : '',
    ].filter(Boolean);
    return uses.length ? uses.join(' and ') : 'not set';
  });

  /** Green in use, red out of use, amber on its way. Mirrors the list's status column. */
  readonly statusClass = computed(() => {
    const s = this.record()['status'] ?? '';
    if (['AVAILABLE', 'ALLOCATED', 'RESERVED', 'VERIFIED'].includes(s)) return 'text-success';
    if (['DISPOSED', 'DISPUTED', 'INACTIVE'].includes(s)) return 'text-danger';
    return 'text-warning';
  });

  label(value?: string): string {
    return value ? ((getDisplayName(value) as string) ?? value) : '';
  }

  outcomeClass(outcome?: string): string {
    if (outcome === 'PASSED') return 'text-success';
    if (outcome === 'FAILED') return 'text-danger';
    return 'text-warning';
  }
}
