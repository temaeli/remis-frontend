import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { gql } from '@apollo/client/core';

import { AuthService } from 'app/routes/auth';
import { FetchService } from '@shared/fetch/fetch.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { NoContentComponent } from '@shared/components/no-content/no-content.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';

import { GEPG_TRAIL_OF_BILL_HEADER } from './bill-gepg.graphql';
import {
  escapeHtml,
  gepgLogText,
  GepgLogHeader,
  GepgLogStep,
  isFailure,
  prettyXml,
  shortenSignature,
} from './gepg-log.helpers';

/**
 * GePG Log: everything that passed between one bill header and GePG, as one
 * timeline, with the XML of each step, and a way to print it or save it.
 *
 * Read from the database (`gepgTrailOfBillHeader`, all four flows), not from
 * the server's log files: those rotate, mix every bill, and are not something
 * to serve to a browser.
 *
 * Works as a popup (opened from a bill, data from MAT_DIALOG_DATA) and inside
 * the GePG Log search page (inputs).
 */

export type { GepgLogHeader } from './gepg-log.helpers';

type Step = GepgLogStep;

const FLOWS: { value: string; label: string }[] = [
  { value: 'CONTROL_NUMBER', label: 'Control number' },
  { value: 'CONTROL_NUMBER_REUSE', label: 'Reuse' },
  { value: 'BILL_CHANGE', label: 'Expiry change' },
  { value: 'CANCELLATION', label: 'Cancellation' },
];

const STEP_ICON: Record<string, string> = {
  Reason: 'info',
  Request: 'send',
  Payload: 'description',
  Acknowledgement: 'done_all',
  Response: 'reply',
  Result: 'verified',
};

@Component({
  selector: 'app-gepg-log',
  imports: [DatePipe, MatButtonModule, IconComponent, NoContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="GePG log" class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2 rounded-lg bg-white p-3">
        <div class="flex min-w-0 flex-1 flex-col">
          <h2 class="text-lg font-semibold">GePG Log · {{ current()?.assignedNumber }}</h2>
          @if (current()?.grpBillId) {
            <span class="text-sm text-gray-700">Group bill id {{ current()?.grpBillId }}</span>
          }
        </div>
        <button mat-stroked-button type="button" [disabled]="!steps().length" (click)="print()">
          Print
        </button>
        <button
          mat-flat-button
          color="primary"
          type="button"
          [disabled]="!steps().length"
          (click)="download()"
        >
          Download
        </button>
        @if (dialogRef) {
          <button mat-stroked-button type="button" (click)="dialogRef.close()">Close</button>
        }
      </div>

      <div class="rounded-lg bg-white p-3">
        <h3 class="mb-1 text-xs font-semibold uppercase text-gray-600">
          Timeline · {{ steps().length }}
          @if (failures()) {
            <span class="text-danger"> · {{ failures() }} failed</span>
          }
        </h3>

        @if (steps().length) {
          <ol class="flex flex-col divide-y divide-gray-100">
            @for (s of steps(); track s.uid + s.step) {
              <li class="flex flex-col gap-1 px-2 py-2">
                <div class="flex items-center gap-3">
                  <span
                    class="inline-flex size-9 shrink-0 items-center justify-center rounded-full"
                    [class]="
                      isFailure(s) ? 'bg-red-50 text-danger' : 'bg-primary/10 text-primary'
                    "
                    aria-hidden="true"
                  >
                    <app-icon [icon]="isFailure(s) ? 'error' : icon(s.step)" />
                  </span>
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="font-medium">
                      {{ s.step }}
                      <span class="text-sm font-normal text-gray-700"> · {{ s.flow }}</span>
                      @if (isFailure(s)) {
                        <span class="ms-2 rounded-full bg-danger px-2 py-0.5 text-xs text-white">
                          Failed
                        </span>
                      }
                    </span>
                    <span class="break-words text-sm" [class.text-danger]="isFailure(s)">
                      {{ s.summary }}
                    </span>
                    @if (s.reference) {
                      <span class="text-xs text-gray-600">Ref {{ s.reference }}</span>
                    }
                  </span>
                  <span class="shrink-0 text-sm text-gray-600">
                    {{ s.occurredAt ? (s.occurredAt | date: 'd MMM y, HH:mm:ss') : 'No date' }}
                  </span>
                </div>
                @if (s.payload) {
                  <button
                    type="button"
                    class="self-start text-sm text-primary underline"
                    [attr.aria-expanded]="open().has(s.uid)"
                    (click)="toggle(s.uid)"
                  >
                    {{ open().has(s.uid) ? 'Hide XML' : 'Show XML' }}
                  </button>
                  @if (open().has(s.uid)) {
                    <pre
                      tabindex="0"
                      aria-label="XML"
                      class="max-h-96 overflow-auto rounded-md bg-gray-50 p-3 text-xs whitespace-pre-wrap break-all"
                      >{{ xmlOf(s.payload) }}</pre
                    >
                  }
                }
              </li>
            }
          </ol>
        } @else {
          <no-content
            icon="receipt_long"
            [slim]="true"
            outerClass="min-h-[160px] size-full"
            [label]="loading() ? 'Loading' : 'Nothing has passed between this bill and GePG yet.'"
          />
        }
      </div>
    </section>
  `,
})
export class GepgLogComponent {
  /** The bill header to show, when used inside a page. */
  readonly header = input<GepgLogHeader | undefined>();

  private readonly fs = inject(FetchService);
  private readonly auth = inject(AuthService);
  protected readonly dialogRef = inject(MatDialogRef, { optional: true });
  private readonly dialogData = inject<GepgLogHeader | null>(MAT_DIALOG_DATA, { optional: true });

  protected readonly current = computed(() => this.header() ?? this.dialogData ?? undefined);
  protected readonly steps = signal<Step[]>([]);
  protected readonly loading = signal(false);
  protected readonly open = signal(new Set<string>());
  protected readonly failures = computed(() => this.steps().filter(isFailure).length);

  protected readonly isFailure = isFailure;

  constructor() {
    effect(() => {
      const id = this.current()?.id;
      if (id) void this.load(id);
    });
  }

  protected icon(step: string): string {
    return STEP_ICON[step] ?? 'history';
  }

  protected xmlOf(payload: string): string {
    return prettyXml(shortenSignature(payload));
  }

  protected toggle(uid: string): void {
    this.open.update((set) => {
      const next = new Set(set);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  private async load(billHeaderUid: string): Promise<void> {
    this.loading.set(true);
    this.open.set(new Set());
    try {
      const perFlow = await Promise.all(
        FLOWS.map(async (flow) => {
          const rows: Omit<Step, 'flow'>[] =
            (await this.fs.fetch({
              query: GEPG_TRAIL_OF_BILL_HEADER,
              variables: { billHeaderUid, flow: flow.value },
              showLoading: false,
            })) ?? [];
          return rows.map((row) => ({ ...row, flow: flow.label }));
        }),
      );
      const all = perFlow
        .flat()
        .sort((a, b) => (a.occurredAt ?? '').localeCompare(b.occurredAt ?? ''));
      this.steps.set(all);
    } finally {
      this.loading.set(false);
    }
  }

  private text(): string {
    const header = this.current();
    return header ? gepgLogText(header, this.steps(), this.auth.user$.value?.name ?? '') : '';
  }

  private fileName(): string {
    return `gepg-log-${this.current()?.assignedNumber ?? this.current()?.id ?? 'bill'}`;
  }

  protected download(): void {
    const blob = new Blob([this.text()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.fileName()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Opens a plain printable page; where pop-ups are blocked, saves the file instead. */
  protected print(): void {
    const page = window.open('', '_blank');
    if (!page) {
      this.download();
      return;
    }
    page.document.write(`<!doctype html><html><head><meta charset="utf-8">
      <title>${escapeHtml(this.fileName())}</title>
      <style>
        body { font-family: Menlo, Consolas, monospace; font-size: 10px; margin: 16px; color: #000; }
        pre { white-space: pre-wrap; word-break: break-all; }
      </style></head><body><pre>${escapeHtml(this.text())}</pre></body></html>`);
    page.document.close();
    page.focus();
    page.print();
  }
}

// ----------------------------------------------------------------- opening --

export const GEPG_LOG_PERMISSIONS = ['ROLE_VIEW_ALL_BILL_HEADER', 'ROLE_VIEW_BILL_HEADER'];

/** Opens the log for one bill header in a popup. */
export function openGepgLog(comp: BaseComponent, header?: GepgLogHeader): void {
  if (!header?.id) {
    comp.notify.error('This bill has no header, so there is nothing from GePG to show.');
    return;
  }
  comp.vs?.openModal(GepgLogComponent, header, '90%', '90vh', { maxWidth: '1100px' });
}

/** A "GePG Log" button; `headerOf` says which bill header, from the record or the page. */
export function gepgLogBtn(
  comp: BaseComponent,
  headerOf: (record?: any) => GepgLogHeader | undefined,
): ActionButton {
  return {
    icon: 'receipt_long',
    label: 'GePG Log',
    toolTip: 'Everything sent to and received from GePG for this bill — print or download it',
    click: (record?: any) => openGepgLog(comp, headerOf(record)),
    permissions: GEPG_LOG_PERMISSIONS,
  };
}

// ----------------------------------------------------------------- finding --

/** Finds a bill header by its number, its group bill id, or a control number. */
const BILL_HEADERS_BY = gql`
  query billHeadersBy($field: BillHeaderSearchField, $value: String) {
    billHeadersBy(field: $field, value: $value) {
      id
      assignedNumber
      grpBillId
    }
  }
`;

const CONTROL_NUMBERS_BY = gql`
  query normalBillControlNumbersBy($field: NormalBillControlNumberSearchField, $value: String) {
    normalBillControlNumbersBy(field: $field, value: $value) {
      billHeader {
        id
        assignedNumber
        grpBillId
      }
    }
  }
`;

export async function findBillHeader(
  fs: FetchService,
  text: string,
): Promise<GepgLogHeader | undefined> {
  const value = text.trim();
  if (!value) return undefined;
  const first = async (query: unknown, field: string, pick: (row: any) => any) => {
    const rows = await fs.fetch({ query, variables: { field, value }, showLoading: false });
    return Array.isArray(rows) && rows.length ? pick(rows[0]) : undefined;
  };
  return (
    (await first(BILL_HEADERS_BY, 'ASSIGNED_NUMBER', (r) => r)) ??
    (await first(BILL_HEADERS_BY, 'GRP_BILL_ID', (r) => r)) ??
    (/^\d+$/.test(value)
      ? await first(CONTROL_NUMBERS_BY, 'CONTROL_NUMBER', (r) => r?.billHeader)
      : undefined)
  );
}
