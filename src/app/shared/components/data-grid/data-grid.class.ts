import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ViewService } from '@shared/services/view.service';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { GRID_COLUMN_PROPS, ID_KEYS } from './data-grid.constants';
import { GridColumn, GridKeyColumn } from './data-grid.interfaces';
import { flattenColumns, formatFields, parseKeyColumns } from './data-grid.helpers';
import { nameFromFieldString, propsFromString } from '../details/util/field/fields.helper';
import { getFields, keyFromFieldString } from '../details/util/field/fields.helper';
import { mergeClasses } from '../details/util/class-name/class-name.helpers';
import { valueEndsWith, endsWith, camelToSpaced } from '@core/helpers';
import { LocalStorageService } from '@core/settings/local-storage.service';
import { FetchService } from '@shared/fetch/fetch.service';
import { NotificationService } from '@shared/services/notification.service';
import { FilesService } from './files.service';

@Component({
  selector: 'data-grid-class',
  template: '',
})
export class DataGridClass {
  storage = inject(LocalStorageService);
  notify = inject(NotificationService);
  filesService = inject(FilesService);

  router = inject(Router);
  route = inject(ActivatedRoute);
  cdr = inject(ChangeDetectorRef);
  fs = inject(FetchService);
  vs = inject(ViewService);

  //  properties
  @Input() columns: GridColumn[] = [];
  initialColumns: GridColumn[] = [];

  @Input() borderedColumns = false;

  // functionalities
  @Input() showToolbar = true;
  @Input() canToggleColumns = false;
  @Input() showFilters = true;
  @Input() columnHideable = true;
  @Input() columnSortable = true;
  @Input() columnPinnable = true;
  @Input() rowHover = true;
  @Input() rowStriped = false;
  @Input() showPaginator = true;
  canShowPaginator = true;
  @Input() showPaginatorButtons = false;
  @Input() expandable = false;
  @Input() columnResizable = true;

  @Input() showTableControls = false;
  @Input() canChangeDisplayedColumns = false;

  @Input() showDateRangeFilter = false;
  @Input() showDateFilter = false;
  @Input() showSearchInput = true;
  canShowSearchInput = true;
  /** Keep the search input visible even when the current page has too few
   * rows to normally show it (e.g. an "Inactive" tab with a small result set). */
  @Input() forceShowSearchInput = false;

  @Input() canExportData = false;
  @Input() showSidebar = false;

  @Input() contentEditable = false;
  @Input() actionButtons: ActionButton[] = [];
  @Input() headerButtons: ActionButton[] = [];
  @Input() dataInputs: any[] = []; //DataInput[] = [];

  @Input() showTitle = true;
  @Input() showTotal = false;
  @Input() showIcon = true;
  @Input() showFiltersInToolbar = true;

  @Input() showOptionsFn?: (data: any) => boolean = undefined;
  @Input() showGridOptions = true;

  @Input() useAutoMappedColumns = false;
  autoMappedKeys: string[] = [];

  @Input() useModifiedColumns = true;
  @Input() hiddenKeys = [];
  modedKeys: string[] = [];

  @Input() keyColumns: GridKeyColumn[] = [];
  columnsKeys: string[] = [];
  showControls = false;

  indexKeys = ['index', 'no.', 'sno.', 'sn.', '#', 'S/NO', 's/no', 'S/No'];
  actionKeys = ['action', 'actions'];
  slug?: string;

  @Input() minColumnWidth? = undefined;
  @Input() pinIndexColumn = true;
  @Input() pinFirstColumn = true;
  @Input() pinActionColumn = true;
  @Input() maxColumnCount = 4;
  @Input() hasActionsColumn = true;
  @Input() lastDotAsName = false;
  @Input() nestedChildren = true;

  @Input() searchKeys: string[] = [];

  // col to host expansion toggle
  updateXpCol() {
    if (this.columns?.[1]) this.columns[1].showExpand = this.expandable;
  }

  parseGridColumns(columns?: GridColumn[]) {
    if (!columns) columns = this.columns ?? [];

    const hasIndex = !!columns.find((c) => valueEndsWith((c.field as any), this.indexKeys));
    const pinColumns = columns.length > 3;

    columns = columns.map((column, index) => {
      const isIndex = hasIndex && index === 0;
      const isAction = valueEndsWith((column.field as any), this.actionKeys);
      const isFirst = hasIndex ? index === 1 : index === 0;
      const normal = !isIndex && !isAction;

      if (column?.actionButtons) column.type = 'actionButtons';

      // index column
      if (isIndex) {
        this.pinIndexColumn && (column.pinned = 'left');
        column.width = '64px';
        column.header = 'S/N';
        // template prefers headers[level]?.header over header — snapshot taken
        // pre-override in flattenColumns, so also rewrite the leaf entry.
        if (column.headers?.[0]) column.headers[0] = { ...column.headers[0], header: 'S/N' };
      }

      // action column
      if (isAction) {
        this.pinActionColumn && (column.pinned = 'right');
        column.width = '100px';
        column.class = `${mergeClasses('backdrop-blur-sm', column.class ?? '')} `;
      }

      // other columns other than index
      if (this.minColumnWidth && !isIndex) column.minWidth = this.minColumnWidth;

      // first column // pin if more thant 3 cols
      if (isFirst) {
        pinColumns && this.pinFirstColumn && (column.pinned = 'left');
      }

      // ohter props
      column.hide = !!this.hiddenKeys.find((k) => k === column.field);

      return (column = { ...column });
    });

    // if col is in autoMapped use the Mapped suffixed header
    if (this.autoMappedKeys?.length && this.useAutoMappedColumns) {
      columns = columns.map((c) => {
        if (this.autoMappedKeys.find((k) => k === c.field)) c.field = `${c.field}Mapped`;
        return c;
      });
    }

    // if col is in ModedKey use the Modded suffixed header
    if (this.modedKeys?.length && this.useModifiedColumns) {
      columns = columns.map((column) => {
        if (this.modedKeys.find((k) => k === column.field)) column.field = `${column.field}Mod`;
        return column;
      });
    }

    return (this.columns = columns);
  }

  columnKeysFromObject(object: any): string[] {
    if (!object) return [];

    let fields = formatFields(getFields(object, ID_KEYS));
    fields = fields.filter((f) => !endsWith(f.key, ID_KEYS));

    const keys: string[] = [];
    fields.forEach((field, i) => i <= this.maxColumnCount && keys.push(field.key));
    if (this.hasActionsColumn) keys.push('actions');
    return keys;
  }

  setGridColumns(keyColumns: GridKeyColumn[], item?: any) {
    const columns_: GridColumn[] = parseKeyColumns(
      keyColumns,
      this.lastDotAsName,
      this.nestedChildren,
    );

    // determine keys from keyColumns input or from object
    let keys = columns_.map((x) => x.field);
    if (!keys.length) keys = this.columnKeysFromObject(item);

    this.columnsKeys = keys;

    // build columns
    let cols: GridColumn[] = this.columnsKeys.map((key) => {
      // build column from initial, current and keyColumns inputs
      const column: GridColumn = {
        field: key,
        header: camelToSpaced(key),
        ...this.initialColumns?.find((c) => c.field === key),
        ...this.columns?.find((c) => c.field === key),
        ...columns_.find((c) => c.field === key),
      };

      // add search key if filter is on but key not yet in searchKeys
      const searchBy = column.filter && !this.searchKeys.find((k) => k.includes(column.field));
      if (searchBy) this.searchKeys.push(column.field);

      return column;
    });

    // flatten nested columns
    cols = flattenColumns(cols);
    this.columns = this.parseGridColumns(cols);

    this.updateXpCol();
  }

  toggleTableControls(show?: boolean) {
    this.showTableControls = show ?? !this.showTableControls;
  }

  toggleCanChangeDisplayedColumns(show?: boolean) {
    this.canChangeDisplayedColumns = show ?? !this.canChangeDisplayedColumns;
  }

  toggleControls() {
    this.vs.onMultiClick(() => {
      this.showControls = !this.showControls;
      this.toggleTableControls(this.showControls);
    }, 7);
  }

  toggleFilters() {
    this.vs.onMultiClick(() => {
      this.showControls = !this.showControls;
      this.toggleTableControls(this.showControls);
      this.toggleCanChangeDisplayedColumns(this.showControls);
      this.showDateRangeFilter = this.showControls;
      this.showDateFilter = this.showControls;
      this.canExportData = this.showControls;
      this.showToolbar = this.showToolbar;
      this.showFilters = this.showControls;
      this.showSearchInput = this.showControls;
    }, 7);
  }
}
