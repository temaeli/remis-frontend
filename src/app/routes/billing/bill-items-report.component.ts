import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { GridKeyColumn, GridParameter } from '@shared/components/data-grid/data-grid.interfaces';
import { FilesService } from '@shared/components/data-grid/files.service';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

import { BILL_ITEMS_REPORT, BILL_STATUSES } from './bill-items-report.graphql';
import { BILL_OPTION_QUERIES, NamedOption } from './bill-options.graphql';

/** A picked date as the backend's LocalDate wants it, "YYYY-MM-DD", in local time. */
const toLocalDate = (value: unknown): string | null => {
  if (!(value instanceof Date) || isNaN(value.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

/** Money as it is read: thousands separated, two decimals. Empty stays empty. */
const money = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return isNaN(n)
    ? String(value)
    : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/** The date range filters: a label, and the two form controls each one fills. */
const DATE_RANGES = [
  { label: 'Bill Item Created', from: 'billItemCreatedFrom', to: 'billItemCreatedTo' },
  { label: 'Bill Created', from: 'billCreatedFrom', to: 'billCreatedTo' },
  { label: 'Bill Generated', from: 'generatedFrom', to: 'generatedTo' },
  { label: 'Bill Approved', from: 'approvedFrom', to: 'approvedTo' },
  { label: 'Bill Expires', from: 'expiredFrom', to: 'expiredTo' },
  { label: 'Payment Date', from: 'paymentDateFrom', to: 'paymentDateTo' },
] as const;

/** Exact-match text filters. The function compares with "=", so no partial matches. */
const TEXT_FILTERS = [
  { control: 'controlNumber', label: 'Control Number' },
  { control: 'billId', label: 'Bill ID' },
  { control: 'billHeaderNumber', label: 'Bill Header No.' },
  { control: 'billItemNumber', label: 'Bill Item No.' },
  { control: 'currencyCode', label: 'Currency Code' },
  { control: 'trxId', label: 'Transaction ID' },
  { control: 'payRefId', label: 'Payment Reference' },
  { control: 'payerName', label: 'Payer Name' },
  { control: 'payerEmail', label: 'Payer Email' },
  { control: 'payerCellNumber', label: 'Payer Phone' },
] as const;

/** The selects, and which option list each chooses from. */
const SELECT_FILTERS = [
  { control: 'collectionCenterUid', label: 'Collection Centre', source: 'collectionCenters' },
  { control: 'feeUid', label: 'Fee', source: 'fees' },
  { control: 'financialYearUid', label: 'Financial Year', source: 'financialYears' },
  { control: 'currencyUid', label: 'Currency', source: 'currencies' },
  { control: 'payerUid', label: 'Payer (Bill)', source: 'people' },
] as const;

type OptionSource = (typeof SELECT_FILTERS)[number]['source'];

/**
 * The bill items report: every bill item with its bill, header, latest status,
 * control number and payments, read from the DBA's report function.
 *
 * Paged on the server. The function gives no total, so the pager only knows
 * whether there is a next page; Next is off when there is not.
 */
@Component({
  selector: 'app-bill-items-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    PageHeaderComponent,
    DataGridComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './bill-items-report.component.html',
})
export class BillItemsReportComponent extends BaseComponent implements OnInit {
  override title = 'Bill Items Report';
  override subtitle = 'Bill items with their bill, status, control number and payments';

  private fb = inject(FormBuilder);
  private files = inject(FilesService);

  readonly dateRanges = DATE_RANGES;
  readonly textFilters = TEXT_FILTERS;
  readonly selectFilters = SELECT_FILTERS;
  readonly statuses = BILL_STATUSES;

  // Up to 50: the grid shows a page of at most that many without paging it again.
  readonly pageSizes = [10, 20, 50];

  readonly options = signal<Record<OptionSource, NamedOption[]>>({
    collectionCenters: [],
    fees: [],
    financialYears: [],
    currencies: [],
    people: [],
  });

  /** Zero-based, as the backend counts. */
  readonly page = signal(0);
  readonly size = signal(20);
  readonly hasNext = signal(false);
  readonly loading = signal(false);
  readonly problem = signal<string | null>(null);

  private rows: any[] = [];
  private readonly rows$ = new BehaviorSubject<any[]>([]);

  form: FormGroup = this.fb.group({
    ...Object.fromEntries(DATE_RANGES.flatMap((r) => [[r.from, null], [r.to, null]])),
    ...Object.fromEntries(TEXT_FILTERS.map((f) => [f.control, ''])),
    ...Object.fromEntries(SELECT_FILTERS.map((f) => [f.control, ''])),
    status: [''],
  });

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'billItemNumber', header: 'Item No.' },
    { field: 'billItemName', header: 'Item' },
    { field: 'feeName', header: 'Fee' },
    { field: 'quantity', header: 'Qty', type: 'number' },
    { field: 'finalBillItemAmount', header: 'Amount', valueFn: (r) => money(r?.finalBillItemAmount) },
    { field: 'currencyCode', header: 'Currency' },
    {
      field: 'finalBillItemEqvAmount',
      header: 'Amount (TZS)',
      valueFn: (r) => money(r?.finalBillItemEqvAmount),
    },
    { field: 'billId', header: 'Bill ID' },
    { field: 'billHeaderNumber', header: 'Bill Header No.' },
    { field: 'controlNumber', header: 'Control Number' },
    { field: 'status', header: 'Status' },
    { field: 'statusAt', header: 'Status Date', type: 'dateTime' },
    { field: 'billExpiryDate', header: 'Expires', type: 'date' },
    { field: 'payerName', header: 'Payer' },
    { field: 'trxId', header: 'Transaction ID' },
    { field: 'trxDate', header: 'Paid On', type: 'dateTime' },
    { field: 'paidAmount', header: 'Paid', valueFn: (r) => money(r?.paidAmount) },
    { field: 'totalBalance', header: 'Balance', valueFn: (r) => money(r?.totalBalance) },
    { field: 'billItemCreatedAt', header: 'Created', type: 'dateTime' },
  ];

  gridParameter: GridParameter = {
    title: 'Bill Items',
    icon: 'reports',
    theme: 'simple',
    keyColumns: this.keyColumns,
    gridData: this.rows$,
    // Paged by the report, not the grid: the grid shows the whole page it is given.
    pageSize: 50,
    showPaginator: false,
    noContentLabel: 'No bill items match these filters',
  };

  headerActions: ActionButton[] = [
    {
      icon: 'excel',
      label: 'Export Page',
      toolTip: 'Export the rows on this page to Excel',
      click: () => this.exportPage(),
    },
  ];

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadOptions(), this.load()]);
  }

  /** Runs the filters from the first page. */
  search(): void {
    this.page.set(0);
    this.load();
  }

  clear(): void {
    this.form.reset();
    this.search();
  }

  next(): void {
    if (!this.hasNext() || this.loading()) return;
    this.page.update((p) => p + 1);
    this.load();
  }

  previous(): void {
    if (this.page() === 0 || this.loading()) return;
    this.page.update((p) => p - 1);
    this.load();
  }

  changeSize(size: number): void {
    this.size.set(size);
    this.search();
  }

  /** One page of the report for the current filters. */
  async load(): Promise<void> {
    this.loading.set(true);
    this.problem.set(null);

    const result = await this.fs.fetch({
      query: BILL_ITEMS_REPORT,
      variables: { filter: this.filter(), page: this.page(), size: this.size() },
      loadingOn: 'bill-items-report',
      failedFn: (res: any) => this.problem.set(res?.message ?? 'The report could not be loaded'),
    });

    this.rows = result?.rows ?? [];
    this.hasNext.set(!!result?.hasNext);
    this.rows$.next(this.rows);
    this.loading.set(false);
    this.cdr.detectChanges();
  }

  /** The form as the backend's filter: empty fields left out, dates as plain days. */
  private filter(): Record<string, unknown> {
    const value = this.form.getRawValue();
    const dateKeys: string[] = DATE_RANGES.flatMap((r) => [r.from, r.to]);
    const filter: Record<string, unknown> = {};

    Object.entries(value).forEach(([key, v]) => {
      const out = dateKeys.includes(key) ? toLocalDate(v) : typeof v === 'string' ? v.trim() : v;
      if (out !== null && out !== undefined && out !== '') filter[key] = out;
    });
    return filter;
  }

  /** What the selects choose from, fetched together. A list the user cannot read stays empty. */
  private async loadOptions(): Promise<void> {
    const sources = [...new Set(SELECT_FILTERS.map((f) => f.source))];
    const entries = await Promise.all(
      sources.map(async (key) => {
        const rows = await this.fs
          .fetch({ query: BILL_OPTION_QUERIES[key], showLoading: false })
          .then((r: any) => (Array.isArray(r) ? r : (r?.data ?? [])))
          .catch(() => []);
        return [key, rows] as const;
      }),
    );
    this.options.set(Object.fromEntries(entries) as Record<OptionSource, NamedOption[]>);
    this.cdr.detectChanges();
  }

  /** The rows on screen, through the grid's Excel helper. */
  private exportPage(): void {
    if (!this.rows.length) {
      this.notify.info('There is nothing on this page to export');
      return;
    }
    // The helper reads "field as Header" strings; amounts go out as numbers, unformatted.
    const exportColumns = this.keyColumns.map((c) =>
      typeof c === 'string' ? (c === 'index' ? 'index as S/N' : c) : `${c.field} as ${c.header}`,
    );
    this.files.exportGridExcel({
      data: this.rows.map((row, i) => ({ ...row, index: this.page() * this.size() + i + 1 })),
      keyColumns: exportColumns,
      fileName: `Bill Items Report - page ${this.page() + 1}`,
      sheetName: 'Bill Items',
      title: 'BILL ITEMS REPORT',
    });
  }
}
