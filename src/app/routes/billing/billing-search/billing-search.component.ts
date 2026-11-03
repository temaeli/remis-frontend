import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridParameter } from '@shared/components/data-grid/data-grid.interfaces';
import { FilesService } from '@shared/components/data-grid/files.service';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MatSelectSearchComponent } from '@shared/components/generic-form/mat-select-search/mat-select-search.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

import { CORE_STATUS_OPTIONS } from '../../settings/settings-lookups';
import { NamedOption } from '../bill-options.graphql';
import {
  OPTION_QUERIES,
  OptionKey,
  SEARCH_TABLES,
  SearchColumn,
  SearchTable,
} from './billing-search.config';

/** A picked day as the start or end of a LocalDateTime range, in local time. */
const toDateTime = (value: unknown, end: boolean): string | null => {
  if (!(value instanceof Date) || isNaN(value.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  return `${day}T${end ? '23:59:59' : '00:00:00'}`;
};

/**
 * Search a billing table by one column: pick the table, the column and its
 * value, and see what matches and how many.
 *
 * One column at a time, as the DBA's list of repository methods has it — each
 * column is one `findBy…` and one `countBy…` on the backend. The value control
 * follows the column: dates for a range, a searchable list for a link, a number
 * box for an amount, Yes/No for a flag, a text box for the rest.
 */
@Component({
  selector: 'app-billing-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSelectSearchComponent,
    PageHeaderComponent,
    DataGridComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './billing-search.component.html',
})
export class BillingSearchComponent extends BaseComponent {
  override title = 'Billing Search';
  override subtitle =
    'Find bills, items, statuses, amounts, expiry dates, control numbers and payments by any one column';

  private fb = inject(FormBuilder);
  private files = inject(FilesService);

  /** Only the tables this user may read. */
  readonly tables = SEARCH_TABLES.filter((t) =>
    HasPermissionDirective.hasPermission(t.permissions),
  );

  readonly table = signal<SearchTable | undefined>(this.tables[0]);
  readonly column = signal<SearchColumn | undefined>(undefined);

  /** Option lists for link columns, fetched the first time a column needs one. */
  readonly options = signal<Partial<Record<OptionKey, NamedOption[]>>>({});
  readonly optionTerm = signal('');

  readonly columnOptions = computed<NamedOption[]>(() => {
    const key = this.column()?.options;
    const all = (key && this.options()[key]) || [];
    const term = this.optionTerm().trim().toLowerCase();
    if (!term) return all;
    return all.filter((o) =>
      [o.name, o.assignedNumber].some((v) => (v ?? '').toLowerCase().includes(term)),
    );
  });

  readonly loading = signal(false);
  readonly problem = signal<string | null>(null);
  /** Null until a search has run. */
  readonly found = signal<number | null>(null);

  /** The CoreStatus labels, for a status column. */
  readonly statuses = CORE_STATUS_OPTIONS;

  form = this.fb.group({
    text: [''],
    number: [null as number | null],
    bool: ['true'],
    uuid: [''],
    status: [''],
    from: [null as Date | null],
    to: [null as Date | null],
    amountFrom: [null as number | null],
    amountTo: [null as number | null],
  });

  private readonly emptyForm = {
    text: '',
    number: null,
    bool: 'true',
    uuid: '',
    status: '',
    from: null,
    to: null,
    amountFrom: null,
    amountTo: null,
  };

  private rows: unknown[] = [];
  private readonly rows$ = new BehaviorSubject<unknown[]>([]);

  /** One grid per table: rebuilt when the table changes, since the columns do. */
  readonly grids = computed<GridParameter[]>(() => {
    const t = this.table();
    if (!t) return [];
    return [
      {
        title: t.label,
        icon: 'search',
        theme: 'simple',
        keyColumns: t.keyColumns,
        gridData: this.rows$,
        pageSize: 20,
        noContentLabel: 'Choose a column and a value, then Search.',
      },
    ];
  });

  headerActions: ActionButton[] = [
    {
      icon: 'excel',
      label: 'Export',
      toolTip: 'Export the results to Excel',
      click: () => this.export(),
    },
  ];

  chooseTable(key: string): void {
    this.table.set(this.tables.find((t) => t.key === key));
    this.column.set(undefined);
    this.resetResults();
  }

  async chooseColumn(value: string): Promise<void> {
    const column = this.table()?.columns.find((c) => c.value === value);
    this.column.set(column);
    this.optionTerm.set('');
    this.form.reset(this.emptyForm);
    this.resetResults();
    if (column?.options) await this.loadOptions(column.options);
  }

  async search(): Promise<void> {
    const table = this.table();
    const column = this.column();
    if (!table || !column) {
      this.problem.set('Choose a column and a value, then Search.');
      return;
    }

    const variables = this.variables(column);
    if (!variables) return;

    this.loading.set(true);
    this.problem.set(null);
    const failed = (res: { message?: string } | undefined) =>
      this.problem.set(res?.message ?? 'The search could not be run');

    const [rows, count] = await Promise.all([
      this.fs.fetch({
        query: table.list,
        variables,
        loadingOn: 'billing-search',
        failedFn: failed,
      }),
      this.fs.fetch({ query: table.count, variables, showLoading: false }).catch(() => null),
    ]);

    this.rows = Array.isArray(rows) ? rows : [];
    this.rows$.next(this.rows);
    // The count comes from countBy…; where a column has none, the list says how many.
    this.found.set(typeof count === 'number' ? count : this.rows.length);
    this.loading.set(false);
    this.cdr.detectChanges();
  }

  clear(): void {
    this.column.set(undefined);
    this.form.reset(this.emptyForm);
    this.resetResults();
  }

  /** The column's value as the backend reads it: always a string, dates as a range. */
  private variables(column: SearchColumn): Record<string, unknown> | null {
    const v = this.form.getRawValue();
    const base = { field: column.value, value: null as string | null, from: null, to: null };

    switch (column.kind) {
      case 'range': {
        const from = toDateTime(v.from, false);
        const to = toDateTime(v.to, true);
        if (!from || !to) {
          this.problem.set('Choose both the From and To dates.');
          return null;
        }
        return { ...base, from, to };
      }
      case 'number':
      case 'integer': {
        if (v.number === null || v.number === undefined || `${v.number}` === '') {
          this.problem.set('Type a number to search for.');
          return null;
        }
        return { ...base, value: String(v.number) };
      }
      case 'bool':
        return { ...base, value: v.bool ?? 'true' };
      case 'status': {
        if (!v.status) {
          this.problem.set('Choose a status.');
          return null;
        }
        return { ...base, value: v.status };
      }
      case 'amountRange': {
        const blank = (n: unknown) => n === null || n === undefined || `${n}` === '';
        if (blank(v.amountFrom) || blank(v.amountTo)) {
          this.problem.set('Type both the From and To amounts.');
          return null;
        }
        if (Number(v.amountTo) < Number(v.amountFrom)) {
          this.problem.set('The To amount cannot be less than the From amount.');
          return null;
        }
        return { ...base, amountFrom: v.amountFrom, amountTo: v.amountTo };
      }
      case 'uuid': {
        const id = (column.options ? v.uuid : v.text)?.trim();
        if (!id) {
          this.problem.set(column.options ? 'Choose one from the list.' : 'Paste the record id.');
          return null;
        }
        return { ...base, value: id };
      }
      default: {
        const text = v.text?.trim();
        if (!text) {
          this.problem.set('Type something to search for.');
          return null;
        }
        return { ...base, value: text };
      }
    }
  }

  private async loadOptions(key: OptionKey): Promise<void> {
    if (this.options()[key]) return;
    const rows = await this.fs
      .fetch({ query: OPTION_QUERIES[key], showLoading: false })
      .then((r: unknown) => (Array.isArray(r) ? (r as NamedOption[]) : []))
      .catch(() => [] as NamedOption[]);
    this.options.update((all) => ({ ...all, [key]: rows }));
    this.cdr.detectChanges();
  }

  private resetResults(): void {
    this.rows = [];
    this.rows$.next([]);
    this.found.set(null);
    this.problem.set(null);
  }

  private export(): void {
    const table = this.table();
    if (!table || !this.rows.length) {
      this.notify.info('There is nothing to export yet');
      return;
    }
    // The helper reads "field as Header" strings.
    const keyColumns = table.keyColumns.map((c) =>
      typeof c === 'string' ? (c === 'index' ? 'index as S/N' : c) : `${c.field} as ${c.header}`,
    );
    this.files.exportGridExcel({
      data: this.rows.map((row, i) => ({ ...(row as object), index: i + 1 })),
      keyColumns,
      fileName: `${table.label} - ${this.column()?.label ?? 'search'}`,
      sheetName: table.label,
      title: table.label.toUpperCase(),
    });
  }
}
