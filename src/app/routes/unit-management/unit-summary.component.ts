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

interface Stage {
  code: string;
  label: string;
  after?: string;
  since?: string;
  next?: string[];
}

interface Money {
  rentAmount?: number;
  rentSince?: string;
  bills?: number;
  billedAmount?: number;
  payments?: number;
  lastPaymentAt?: string;
}

/**
 * The unit at a glance, above its tabs: where it is and how big, where its
 * tenancy stands, what it earns, and what happened to it last. Each answer
 * would otherwise be a tab, a list and a click away.
 *
 * Reads the overview fields the backend computes for the unit's own page. A
 * part the user may not view arrives empty and shows as not recorded.
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
        <p class="text-sm text-gray-700">
          @if (has('netArea')) {
            {{ record()['netArea'] | number: '1.0-2' }} net
          }
          @if (has('grossArea')) {
            · {{ record()['grossArea'] | number: '1.0-2' }} gross
          }
        </p>
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Tenancy</h3>
        @if (stage(); as s) {
          <p class="font-semibold" [class]="stageClass(s.code)">{{ s.label }}</p>
          @if (s.after) {
            <p class="text-sm text-gray-700">
              After {{ label(s.after) }}@if (s.since) { · {{ s.since | date: 'd MMM y' }} }
            </p>
          }
        }
        @if (status(); as st) {
          <p class="text-sm text-gray-700">Status: {{ label(st.value) }}</p>
        }
      </div>

      <div class="rounded-lg bg-white p-3 flex flex-col gap-1">
        <h3 class="text-xs font-semibold uppercase text-gray-600">Money</h3>
        @if (money(); as m) {
          @if (m.rentAmount !== null && m.rentAmount !== undefined) {
            <p class="font-medium">Rent {{ m.rentAmount | number: '1.0-2' }}</p>
          } @else {
            <p class="text-sm text-gray-700">No rent set</p>
          }
          @if (m.bills !== null && m.bills !== undefined) {
            <p class="text-sm text-gray-700">
              {{ m.bills }} {{ m.bills === 1 ? 'bill' : 'bills' }}
              @if (m.billedAmount) {
                · TZS {{ m.billedAmount | number: '1.0-2' }}
              }
            </p>
          }
          @if (m.payments !== null && m.payments !== undefined) {
            <p class="text-sm text-gray-700">
              {{ m.payments }} {{ m.payments === 1 ? 'payment' : 'payments' }}
              @if (m.lastPaymentAt) {
                · last {{ m.lastPaymentAt | date: 'd MMM y' }}
              }
            </p>
          }
        } @else {
          <p class="text-sm text-gray-700">Not recorded</p>
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

  /** Where the tenancy stands, read from the newest occupancy record. */
  readonly stage = computed((): Stage | null => this.record()['stage'] ?? null);

  readonly money = computed((): Money | null => this.record()['money'] ?? null);

  /**
   * The status as recorded by hand: the newer of the latest status record and
   * the latest status change, as the two are kept apart.
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

  /** The three latest, newest first, as the backend sorts them. */
  readonly activity = computed((): Activity[] => (this.record()['recentActivity'] ?? []).slice(0, 3));

  /** Whether the unit has a value for this field; 0 counts. */
  has(key: string): boolean {
    const value = this.record()[key];
    return value !== null && value !== undefined;
  }

  label(value?: string): string {
    if (value === 'Sell') return 'Sale';
    return value ? ((getDisplayName(value) as string) ?? value) : '';
  }

  /** Green when it can be let, red when it is ending, amber while in between. */
  stageClass(code?: string): string {
    if (['VACANT', 'OCCUPIED'].includes(code ?? '')) return 'text-success';
    if (['ON_NOTICE', 'ENDED', 'MOVED_OUT'].includes(code ?? '')) return 'text-danger';
    return 'text-warning';
  }
}
