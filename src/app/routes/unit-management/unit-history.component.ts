import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { getDisplayName } from '@shared/components/view-component/view.helpers';

interface Activity {
  kind: string;
  uid: string;
  name: string;
  at?: string;
}

interface Filter {
  name: string;
  kinds: string[] | null;
}

/** The same groups as the action menus, so a reader finds a record where they made it. */
const FILTERS: Filter[] = [
  { name: 'All', kinds: null },
  {
    name: 'Tenancy',
    kinds: ['Reservation', 'Booking', 'Lease', 'Handover', 'Entry', 'Exit', 'Return', 'Visit'],
  },
  { name: 'Care', kinds: ['Inspection', 'Maintenance', 'Problem'] },
  { name: 'Services', kinds: ['ServiceConnection', 'ServiceDisconnection', 'Reading'] },
  { name: 'Closing', kinds: ['Notice', 'Termination', 'Eviction'] },
  { name: 'Ownership', kinds: ['Sell', 'Purchase', 'TitleDeed', 'Liability', 'Loan'] },
  { name: 'Status', kinds: ['UnitStatusRecord', 'UnitFlag'] },
];

/**
 * Everything that happened to a unit as one list, newest first: the
 * reservation, the lease, the inspections, the notice. Read in one place instead
 * of across a tab per kind of record; the chips narrow it down.
 *
 * Clicking an entry opens that record.
 */
@Component({
  selector: 'app-unit-history',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Unit history" class="flex flex-col gap-3 p-2">
      <div role="group" aria-label="Show" class="flex flex-wrap gap-2">
        @for (f of filters; track f.name) {
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-sm"
            [class.bg-primary]="f.name === filter()"
            [class.text-white]="f.name === filter()"
            [attr.aria-pressed]="f.name === filter()"
            (click)="filter.set(f.name)"
          >
            {{ f.name }} ({{ count(f) }})
          </button>
        }
      </div>

      @if (shown().length) {
        <ol class="flex flex-col">
          @for (a of shown(); track a.uid) {
            <li class="flex gap-3 border-l-2 border-gray-300 pl-3 pb-3">
              <span class="w-24 shrink-0 text-sm text-gray-700">
                {{ a.at ? (a.at | date: 'd MMM y') : 'No date' }}
              </span>
              <button
                type="button"
                class="text-left hover:underline"
                [attr.aria-label]="'Open ' + label(a.kind) + ' ' + (a.name || '')"
                (click)="openRecord(a)"
              >
                <span class="font-medium">{{ label(a.kind) }}</span>
                @if (a.name) {
                  <span class="text-gray-700"> · {{ a.name }}</span>
                }
              </button>
            </li>
          }
        </ol>
      } @else {
        <p class="text-sm text-gray-700">
          Nothing recorded yet — the buttons at the top of the page add the first one.
        </p>
      }
    </section>
  `,
})
export class UnitHistoryComponent {
  readonly history = input<Activity[]>([]);
  readonly open = input<(kind: string, uid: string) => void>();

  readonly filters = FILTERS;
  readonly filter = signal('All');

  readonly shown = computed(() => {
    const f = FILTERS.find((x) => x.name === this.filter());
    const history = this.history() ?? [];
    return f?.kinds ? history.filter((a) => f.kinds!.includes(a.kind)) : history;
  });

  count(f: Filter): number {
    const history = this.history() ?? [];
    return f.kinds ? history.filter((a) => f.kinds!.includes(a.kind)).length : history.length;
  }

  label(kind?: string): string {
    if (kind === 'Sell') return 'Sale';
    return kind ? ((getDisplayName(kind) as string) ?? kind) : '';
  }

  openRecord(a: Activity): void {
    this.open()?.(a.kind, a.uid);
  }
}
