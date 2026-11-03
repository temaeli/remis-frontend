import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import {
  ToggleButton,
  ToggleButtonsComponent,
} from '@shared/components/toggle-buttons/toggle-buttons.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { NoContentComponent } from '@shared/components/no-content/no-content.component';

interface Activity {
  kind: string;
  uid: string;
  name: string;
  at?: string;
}

interface Filter {
  name: string;
  icon: string;
  kinds: string[] | null;
}

/** The same groups as the action menus, so a reader finds a record where they made it. */
const FILTERS: Filter[] = [
  { name: 'All', icon: 'history', kinds: null },
  {
    name: 'Tenancy',
    icon: 'key',
    kinds: ['Reservation', 'Booking', 'Lease', 'Handover', 'Entry', 'Exit', 'Return', 'Visit'],
  },
  { name: 'Care', icon: 'build', kinds: ['Inspection', 'Maintenance', 'Problem'] },
  {
    name: 'Services',
    icon: 'electrical_services',
    kinds: ['ServiceConnection', 'ServiceDisconnection', 'Reading'],
  },
  { name: 'Closing', icon: 'event_busy', kinds: ['Notice', 'Termination', 'Eviction'] },
  {
    name: 'Ownership',
    icon: 'workspace_premium',
    kinds: ['Sell', 'Purchase', 'TitleDeed', 'Liability', 'Loan'],
  },
  { name: 'Status', icon: 'flag', kinds: ['UnitStatusRecord', 'UnitFlag'] },
];

/**
 * Everything that happened to a unit as one list, newest first: the
 * reservation, the lease, the inspections, the notice. Read in one place instead
 * of across a tab per kind of record; the filters narrow it down.
 *
 * Built from the app's own parts so it reads like the rest of the page: the
 * filters are the tabs' toggle buttons, with a count badge, and the list sits in
 * a white card like the summary cards. Clicking an entry opens that record.
 */
@Component({
  selector: 'app-unit-history',
  imports: [DatePipe, ToggleButtonsComponent, IconComponent, NoContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Unit history" class="flex flex-col gap-2">
      <toggle-buttons
        class="p-2 bg-white rounded-lg inline-flex flex-wrap self-start max-w-full"
        [toggleButtons]="buttons"
        [initialValue]="'All'"
        (value)="onFilter($event)"
      />

      <div class="rounded-lg bg-white p-3">
        <h3 class="mb-1 text-xs font-semibold uppercase text-gray-600">
          {{ filter() }} · {{ shown().length }}
        </h3>

        @if (shown().length) {
          <ol class="flex flex-col divide-y divide-gray-100">
            @for (a of shown(); track a.uid) {
              <li>
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary"
                  [attr.aria-label]="'Open ' + label(a.kind) + ' ' + (a.name || '')"
                  (click)="openRecord(a)"
                >
                  <span
                    class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <app-icon [icon]="iconOf(a.kind)" />
                  </span>
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="font-medium">{{ label(a.kind) }}</span>
                    @if (a.name) {
                      <span class="truncate text-sm text-gray-700">{{ a.name }}</span>
                    }
                  </span>
                  <span class="shrink-0 text-sm text-gray-600">
                    {{ a.at ? (a.at | date: 'd MMM y') : 'No date' }}
                  </span>
                </button>
              </li>
            }
          </ol>
        } @else {
          <no-content
            icon="history"
            [slim]="true"
            outerClass="min-h-[160px] size-full"
            label="Nothing recorded yet — the buttons at the top of the page add the first one."
          />
        }
      </div>
    </section>
  `,
})
export class UnitHistoryComponent {
  readonly history = input<Activity[]>([]);
  readonly open = input<(kind: string, uid: string) => void>();

  readonly filter = signal('All');

  readonly shown = computed(() => {
    const f = FILTERS.find((x) => x.name === this.filter());
    const history = this.history() ?? [];
    return f?.kinds ? history.filter((a) => f.kinds!.includes(a.kind)) : history;
  });

  /**
   * Made once: the toggle buttons keep their first list unless a label or icon
   * changes, so each count is a live badge rather than a fixed number.
   */
  readonly buttons: ToggleButton[] = FILTERS.map((f) => ({
    value: f.name,
    label: f.name,
    icon: f.icon,
    badge: toObservable(computed(() => this.count(f))),
  }));

  onFilter(name?: string): void {
    if (name) this.filter.set(name);
  }

  count(f: Filter): number {
    const history = this.history() ?? [];
    return f.kinds ? history.filter((a) => f.kinds!.includes(a.kind)).length : history.length;
  }

  label(kind?: string): string {
    if (kind === 'Sell') return 'Sale';
    return kind ? ((getDisplayName(kind) as string) ?? kind) : '';
  }

  /** The icon of the group a record belongs to. */
  iconOf(kind: string): string {
    return FILTERS.find((f) => f.kinds?.includes(kind))?.icon ?? 'history';
  }

  openRecord(a: Activity): void {
    this.open()?.(a.kind, a.uid);
  }
}
