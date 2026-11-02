import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { Lookup } from '@shared/lookup';

interface Activity {
  kind: string;
  uid: string;
  name: string;
  at?: string;
}

/**
 * The unit at a glance, above its tabs: where it is, how big it is, where it
 * stands now, and what happened to it last. Each answer would otherwise be a
 * tab, a list and a click away.
 *
 * Reads the overview fields the backend computes for the unit's own page
 * (currentStatus, latestStatusChange, recentActivity). A part the user may not
 * view arrives empty and shows as not recorded.
 */
@Component({
  selector: 'app-unit-summary',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Unit summary" class="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Where it is</h3>
        <p class="font-medium">{{ place() || 'Floor not set' }}</p>
        @if (hasPoint()) {
          <p class="text-sm text-gray-700">{{ record()['latitude'] }}, {{ record()['longitude'] }}</p>
        }
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Size</h3>
        @if (has('netArea')) {
          <p class="font-medium">{{ record()['netArea'] | number: '1.0-2' }} net</p>
        } @else {
          <p class="text-sm text-gray-700">Net area not set</p>
        }
        <p class="text-sm text-gray-700">
          @if (has('grossArea')) {
            {{ record()['grossArea'] | number: '1.0-2' }} gross
          }
          @if (has('area')) {
            · {{ record()['area'] | number: '1.0-2' }} area
          }
        </p>
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Status</h3>
        @if (status(); as s) {
          <p class="font-semibold" [class]="statusClass(s.value)">{{ label(s.value) }}</p>
          @if (s.since) {
            <p class="text-sm text-gray-700">Since {{ s.since | date: 'd MMM y' }}</p>
          }
        } @else {
          <p class="text-sm text-gray-700">No status recorded</p>
        }
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Latest activity</h3>
        @if (activity().length) {
          <ul class="flex flex-col gap-1">
            @for (a of activity(); track a.uid) {
              <li class="text-sm">
                <span class="font-medium">{{ label(a.kind) }}</span>
                <span class="text-gray-700"> · {{ a.at | date: 'd MMM y' }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="text-sm text-gray-700">Nothing recorded yet — use the buttons above</p>
        }
      </div>
    </section>
  `,
})
export class UnitSummaryComponent {
  readonly record = input.required<Lookup>();

  /** "Block A › Floor 3". */
  readonly place = computed(() => {
    const floor = this.record()['floor'];
    return [floor?.asset?.name, floor?.name].filter(Boolean).join(' › ');
  });

  /** 0 is a real coordinate, so this checks for a value rather than truthiness. */
  readonly hasPoint = computed(
    () => this.record()['latitude'] != null && this.record()['longitude'] != null,
  );

  /**
   * Where it stands now: the newer of its latest status record and its latest
   * status change, as the two are kept apart.
   */
  readonly status = computed((): { value: string; since?: string } | null => {
    const record = this.record()['currentStatus'];
    const change = this.record()['latestStatusChange'];
    const fromRecord = record?.status ? { value: record.status, since: record.createdAt } : null;
    const fromChange = change?.status ? { value: change.status, since: change.since } : null;
    if (fromRecord && fromChange) {
      return (fromChange.since ?? '') > (fromRecord.since ?? '') ? fromChange : fromRecord;
    }
    return fromRecord ?? fromChange;
  });

  /** The four latest, newest first, as the backend sorts them. */
  readonly activity = computed((): Activity[] => (this.record()['recentActivity'] ?? []).slice(0, 4));

  /** Whether the unit has a value for this field; 0 counts. */
  has(key: string): boolean {
    const value = this.record()[key];
    return value !== null && value !== undefined;
  }

  label(value?: string): string {
    if (value === 'Sell') return 'Sale';
    return value ? ((getDisplayName(value) as string) ?? value) : '';
  }

  /** Green when it can be taken, red when it is out of use, amber otherwise. */
  statusClass(value?: string): string {
    if (['AVAILABLE', 'APPROVED', 'PASSED'].includes(value ?? '')) return 'text-success';
    if (['UNDER_MAINTENANCE', 'CANCELLED', 'EXPIRED', 'FAILED'].includes(value ?? '')) return 'text-danger';
    return 'text-warning';
  }
}
