import { Signal, TemplateRef } from '@angular/core';
import { ClickAction } from '@shared/services/view.service';
import { Observable } from 'rxjs';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import type { DataGridComponent } from './data-grid.component';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageableParam, SearchState } from '@shared/fetch/fetch.interface';
import { CurrentSort, SearchField } from '@shared/fetch/fetch.interface';
import { SearchCombinationType, SearchOperationType } from '@shared/fetch/fetch.interface';

export type TableAppearance = 'plain' | 'default';

export interface DateRange {
  key?: string;
  fromDate?: string;
  toDate?: string;
}

export interface Option {
  name?: string;
  value?: any;
}

export type CellPropertiesMap = Record<string, CellProperties>;
export interface CellProperties {
  key?: string;
  value?: any;
  rowspan?: number;
  colspan?: number;
  mapFn?: (key: string, row: Record<string, any>) => CellProperties;
}

export type RowClassFormatter<T = any> = Record<string, (row?: any, index?: number) => boolean>;

export type RowSelectionFormatter = Record<string, (row?: any, index?: number) => boolean>;

export interface GridColumn {
  field: string;
  header?: string;
  headers?: GridColumn[];

  width?: string;
  minWidth?: string;
  maxWidth?: string;
  type?: string;
  class?: string;
  checkBoxFn?: (row: any) => boolean;

  replace?: [string, string];

  valueFn?: (row: any, gridData: any[]) => any;

  sortable?: boolean;
  filter?: boolean;
  globalFilter?: boolean;
  showExpand?: boolean;
  pinned?: string;
  left?: any;
  right?: any;
  resizable?: boolean;
  hide?: boolean;
  show?: boolean;
  disabled?: boolean;

  grouped?: boolean;
  nested?: boolean;
  showIndex?: boolean;
  nestedClass?: string;
  semanticType?: string;

  preventDefault?: boolean;
  stopPropagation?: boolean;
  sortSequence?: number;
  truncate?: number;

  DataInputs?: any; // DataInput[];
  actionButtons?: ActionButton[];

  innerclass?: string;
  innerClassMapper?: (row: any) => string;

  valueClass?: string;
  valueClassMapper?: (row: any) => string;

  toolTip?: string;
  toolTipMapper?: (row: any) => string;

  icon?: string;
  iconclass?: string;
  iconMapper?: (row: any) => string;
  iconClassMapper?: (row: any) => string;

  cellTemplate?: TemplateRef<any>;
  hasMergedCells?: boolean;

  rowspan?: number;
  colspan?: number;
  resizing?: boolean;

  columns?: GridColumn[];

  headerTooltip?: string;
}

export type GridKeyColumn = string | (GridColumn & { keyColumns?: GridKeyColumn[] });

export type GridTheme = 'default' | 'simple';

export interface GridParameter {
  title?: string | Signal<string> | any;
  icon?: string;
  slug?: string;
  animation?: string;
  noContentLabel?: string;

  toolbarClass?: string;
  gridClass?: string;
  headerClass?: string;
  keysNotChangedByOptions?: string[];
  noContentClass?: string;

  showTitle?: boolean;
  showHeaderIcon?: boolean;
  theme?: GridTheme;

  onLoadDataFn?: (data: any[]) => any;
  // reloadActions?: Action[];

  // reloadPolicy?: FetchPolicy;
  // fetchPolicy?: FetchPolicy;

  noContentClick?: (data?: any) => any;
  showFunction?: (data: any, contextData?: any) => boolean;
  hideFunction?: (data: any, contextData?: any) => boolean;

  gridData?: Observable<any[]> | any[];
  alldata?: any[];
  // upsertAction?: Action;
  mapFunction?: (item: any) => {};
  columnHeader?: {};
  hiddenFieldsKeys?: string[];
  keyColumns?: GridKeyColumn[];
  uniqueIdKey?: string[];
  columns?: any; // MtxGridColumn[];
  lastDotAsName?: boolean;
  showTotalWithName?: boolean;

  appearance?: TableAppearance;

  fetchParameter?: FetchParameter;

  reloadActions$?: Observable<any>[];

  showFilters?: boolean;

  hasActionsColumn?: boolean;
  pageSizeOptions?: number[];
  pageSize?: number;

  query?: any;
  isPageable?: boolean;
  queryVariables?: {};

  pageableParam?: PageableParam;
  searchOperationType?: SearchOperationType;
  searchCombinationType?: SearchCombinationType;
  searchDelayTime?: number;
  searchFields?: SearchField[];
  searchKeys?: string[];
  searchStates?: SearchState[];
  searchStatesValues?: SearchState[];

  sortKeys?: string[];
  currentSort?: CurrentSort;
  sortKeysMap?: string[];

  dateFilterKeys?: string[];
  dateRange?: DateRange;

  exportAllFields?: boolean;
  searchByAllFields?: boolean;
  exportAllData?: boolean;
  maxColumnCount?: number;
  searchByMultipleKeys?: boolean;

  multiSelectable?: boolean;
  rowSelectable?: boolean;
  initialSelected?: any[];
  rowSelection?: (rows?: any[]) => any;
  hideRowSelectionCheckbox?: boolean;
  selectFirstRow?: boolean;

  showToolbar?: boolean;
  paginatorClass?: string;
  columnHideable?: boolean;
  columnSortable?: boolean;
  columnPinnable?: boolean;
  rowHover?: boolean;
  rowStriped?: boolean;
  showPaginator?: boolean;
  expandable?: boolean;
  columnResizable?: boolean;

  showTableControls?: boolean;
  showTableFilters?: boolean;
  canChangeDisplayedColumns?: boolean;

  containerClass?: string;

  showDateRangeFilter?: boolean;
  showDateFilter?: boolean;
  showSearchInput?: boolean;
  forceShowSearchInput?: boolean;
  canExportData?: boolean;

  showSidebar?: boolean;

  rowClassFormatter?: any; //MtxGridRowClassFormatter;
  contentEditable?: boolean;

  showGridOptions?: boolean;
  selectedGridOption?: GridOption;
  gridOptions?: GridOption[];

  headerButtons?: ActionButton[];
  actionButtons?: ActionButton[];
  rowClickActions?: ClickAction[];
  viewDetailsClicks?: number;

  view?: any; // generic use in view calling the table

  /** Column field keys whose consecutive equal-value cells should be merged (rowspan) in already-sorted data. */
  groupByKeys?: string[];
  cellPropertiesMap?: CellPropertiesMap;
}

export interface GridOption extends GridParameter {
  //
  badge?: any | Observable<any>;
  callback?: (data?: DataGridComponent) => void;
  label?: any;
}

export interface HeaderCell {
  label: string;
  colspan: number;
  rowspan: number;
  column?: any; // Reference to original column if leaf node
  isLeaf: boolean;
}

export interface HeaderRow {
  cells: HeaderCell[];
}
