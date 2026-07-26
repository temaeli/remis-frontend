import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { DataGridClass } from './data-grid.class';
import { Column } from 'exceljs';
import { GridTheme, HeaderCell, HeaderRow } from './data-grid.interfaces';
import { GridColumn, RowSelectionFormatter } from './data-grid.interfaces';
import { RowClassFormatter, GridOption } from './data-grid.interfaces';
import { CellProperties, CellPropertiesMap, DateRange } from './data-grid.interfaces';
import { TableAppearance, GridParameter } from './data-grid.interfaces';
import {
  BehaviorSubject,
  isObservable,
  lastValueFrom,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';
import { OnInit, Output, Signal, SimpleChanges, TrackByFunction } from '@angular/core';
import { Input, isSignal, OnChanges, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter } from '@angular/core';
import { SEARCH_HIDDEN_KEYS } from './data-grid.constants';
import { ROW_SELECTION_FORMATTER } from './data-grid.constants';
import { TABLE_TOGGLES } from './data-grid.constants';
import { END_USER_HIDDEN_FIELDS } from './data-grid.constants';
import { INDEX_FIELD_KEYS } from './data-grid.constants';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTableDataSource } from '@angular/material/table';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { DetailsParameter } from '../details/details.interface';
import { ANIMATION_MODAL, UNDEFINED_VALUES } from '../details/util/field/field.constants';
import { getNameField, keys, nameFromFieldString } from '../details/util/field/fields.helper';
import { formatDate_, getFields, key } from '../details/util/field/fields.helper';
import { Field } from '../details/util/field/field.interface';
import { mapVisibleItem, mergeUnique, removeMod, setFieldsWidths } from './data-grid.helpers';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { CommonModule } from '@angular/common';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { LabelPipe } from '../details/util/pipes/label.pipe';
import { RowClassesPipe } from './pipes/row-class.pipe';
import { AnyPipe } from '../../pipes/any.pipe';
import { TypeOfIsPipe } from './pipes/type-of-is.pipe';
import { PathValuePipe } from '../../pipes/path-value.pipe';
import { IntToRomanPipe } from '../../pipes/int-to-roman.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContrastGrayPipe } from '../details/util/color/contrast-gray.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { DetailsHeaderComponent } from '../details/details-header/details-header.component';
import { NoContentComponent } from '../no-content/no-content.component';
import { DataLabelComponent } from '../utility-components/data-label/data-label.component';
import { DataInputComponent } from '../utility-components/data-inputs/data-input/data-input.component';
import { ToFixedPipe } from '../../pipes/to-fixed.pipe';
import { RoundPipe } from '../../pipes/round.pipe';
import { SearchFieldsComponent } from '../utility-components/search-fields/search-fields.component';
import { SearchStatesComponent } from '../utility-components/search-states/search-states.component';
import { DateFilterComponent } from '../utility-components/date-filter/date-filter.component';
import { ToggleButtonsComponent } from '../toggle-buttons/toggle-buttons.component';
import { SignalPipe } from '../details/util/pipes/signal.pipe';
import { ScrollbarDetectorDirective } from './scroll-bar-detector.directive';
import { BgIconMarkComponent } from '../details/bg-icon-mark/bg-icon-mark.component';
import {
  areObjectsEqual,
  getPathsToObject,
  getPathValue,
  setPathValue,
  slugify,
} from '@core/helpers';
import { objectHasKeys, getFirstKeyValue, uniqueSet } from '@core/helpers';
import { removeLast, isValidDate, replaceWords } from '@core/helpers';
import { valueIncludes, copyObjectValues, valueIsEither, isValue } from '@core/helpers';
import { isObject } from '@ngx-translate/core';
import { ClickAction } from '@shared/services/view.service';
import { LocalStorageEnum } from '@core/settings/local-storage.service';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { APP_VARIABLES } from '@core/settings/app-variables';
import {
  PageableResponse,
  SearchState,
  PageableParam,
  SearchOperationType,
  SearchCombinationType,
  CurrentSort,
  SearchField,
} from '@shared/fetch/fetch.interface';
import { INITIAL_PAGE_PARAMETER, PAGEABLE_RESULT_KEYS } from '@shared/fetch/fetch.constants';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { Animation_, settings$ } from '@core/settings/settings.store';

const statesKey = 'activeSearchStates';

@Component({
  selector: 'data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],

  imports: [
    ActionButtonsComponent,
    CommonModule,
    MergeClassesPipe,
    MatIconModule,
    MatCheckboxModule,
    FormsModule,
    LabelPipe,
    RowClassesPipe,
    AnyPipe,
    TypeOfIsPipe,
    MatPaginatorModule,
    PathValuePipe,
    IntToRomanPipe,
    MatDividerModule,
    MatTooltipModule,
    ContrastGrayPipe,
    TruncatePipe,
    MatSortModule,
    MatSort,
    MatMenuModule,
    DragDropModule,
    DetailsHeaderComponent,
    DataLabelComponent,
    DataInputComponent,
    ToFixedPipe,
    RoundPipe,
    SearchFieldsComponent,
    SearchStatesComponent,
    DateFilterComponent,
    ToggleButtonsComponent,
    SignalPipe,
    ScrollbarDetectorDirective,
    NoContentComponent,
    BgIconMarkComponent,
    SafeHtmlPipe,
  ],
})
//
//
export class DataGridComponent
  extends DataGridClass
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  //to hold all properties if table in on a generic component // only assings to initialized members
  @Input() gridParameter?: GridParameter | Partial<DataGridComponent> = undefined;

  @Input() title: string | Signal<string> | undefined = '';
  @Input() autoHideTitle = true;
  @Input() icon: string | undefined = '';
  @Input() showBgIconMark = false;
  @Input() bgIconMarkClass = '';
  @Input() keysNotChangedByOptions: string[] = [];
  @Input() headerClass = '';
  @Input() animation: Animation_ = settings$.value.animations?.pages;
  @Input() animationRow: Animation_ = settings$.value.animations?.tableRow;
  animation_: any = '';

  @Input() gridClass = ' ';
  @Input() footerClass = ' ';
  @Input() contentClass = ' ';
  @Input() containerClass = ' ';

  @Input() appearance: TableAppearance = 'default';
  @Input() theme?: GridTheme = undefined;
  @Input() renderType: 'default' | 'grid' | 'table' | 'list' = 'default';
  @Input() noContentClass?: string = undefined;
  @Input() noContentClick?: (data?: any) => any = undefined;
  @Input() noContentLabel: string | undefined = undefined;

  filtersContainerClass = `bg-white rounded-lg border-gray-300/50 p-2 pt-1 flex flex-wrap items-center w-full`;

  @Input() gridData: any = new BehaviorSubject([]);
  @Input() alldata = [];
  @Input() reloadActions$: Observable<any>[] = [];
  @Input() mapFunction?: (item: any, index?: number) => {};
  @Input() onDataChange?: (data?: DataGridComponent) => void = undefined;
  @Input() dataFunction?: (data?: any) => any[] = undefined;

  @Input() uniqueIdKey = 'id';

  @ViewChild('hybridGrid', { static: false }) hybridGridElm!: ElementRef;

  listData!: MatTableDataSource<any>;

  pageIndex = 0;
  dataLength = 0;
  pagesLength = 0;
  displayedPageIndex = 0;

  selectedColumnsKeys: string[] = [];
  defaultColumnsKeys: string[] = [];

  selectedExportKeys: string[] = [];
  allFieldsKeys: string[] = [];
  originalFieldsKeys: string[] = [];

  visibleItemsMod: any[] = [];
  visibleItems: any[] = [];
  exportPageIndex = 0;

  @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100, 250, 300, 500];
  @Input() pageSize = 10;
  hadData = false;

  @Input() fetchParameter?: FetchParameter;

  @Input() isPageable = false;
  @Output() pageable = new EventEmitter<any>(); //PageableParam

  // for single item action when the list has few fields //
  @Input() itemQuery = undefined;
  @Input() itemQueryKey = 'uid';
  itemsCached: any[] = [];

  @Input() undefinedValue = '--';

  isLoading = true;
  isFetching = false;
  isAnimating = true;
  @Input() showLoading = false; // to hide showing loading

  pageDetails?: PageableResponse<any> = undefined;
  searchInputStates: SearchState[] = [];

  @Input() pageableParam: PageableParam = INITIAL_PAGE_PARAMETER;
  @Input() searchOperationType = SearchOperationType.Like;
  @Input() searchCombinationType = SearchCombinationType.And;
  @Input() searchDelayTime = 2000;
  @Input() searchFields: SearchField[] = [];
  @Input() paginatorClass?: string;

  @Input() searchStates: SearchState[] = [];
  @Input() searchStatesValues: SearchState[] = [];

  searchTimer = undefined;
  currentSearch: SearchField[] = [];
  hasTouchedSearchInput = false;
  hasTouchedPageInput = false;
  selectedSearchKeys: string[] = [];
  searchHiddenKeys: string[] = SEARCH_HIDDEN_KEYS;

  @Input() currentSort?: CurrentSort = undefined;
  @Input() initialSorts?: CurrentSort[] = [];

  @Output() onDataLength = new EventEmitter();
  @Output() onLoadData = new EventEmitter();
  @Input() onLoadDataFn?: (data: any[]) => any = undefined;
  @Output() rowSelectionChange = new EventEmitter<any[]>();
  @Input() rowSelection?: (rows?: any[]) => any;
  @Output() cellSelectionChange = new EventEmitter<any[]>();

  @Input() multiSelectable = true;
  @Input() rowSelectable = false;
  @Input() initialSelected = [];
  @Input() hideRowSelectionCheckbox = false;
  @Input() checkBoxFn?: (row?: any) => boolean = undefined;
  @Input() trackBy: TrackByFunction<any> = (index, item) => item.uid;
  @Input() selectFirstRow = false;
  @Input() rowSelectionFormatter: RowSelectionFormatter = ROW_SELECTION_FORMATTER;
  @Input() multiSelectionWithClick = false;
  selectedRows: any[] = [];
  selectedCells: any[] = [];

  @Input() dateFilterKeys: string[] = [];
  @Input() dateRange?: DateRange = undefined;

  selectedDateRangeKey: string | undefined = undefined;
  selectedDateKey: string | undefined = undefined;
  allDateKeys: string[] = [];

  dateValue: any;
  startDateValue = undefined;
  endDateValue = undefined;

  @Input() exportAllFields = false;
  @Input() searchByAllFields = false;
  @Input() exportAllData = false;
  @Input() searchByMultipleKeys = false;

  matSort?: { active: string; direction: any }; // track internally current sort
  @ViewChild(MatSort, { static: true }) sort?: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  // @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;

  @ContentChild('actions', { static: true }) actions?: TemplateRef<any>;
  @ContentChild('sidebar', { static: true }) sidebar?: TemplateRef<any>;
  @ContentChild('expansion', { static: true }) expansion?: TemplateRef<any>;
  @ContentChild('listItem', { static: true }) listItem?: TemplateRef<any>;

  @ViewChild('defaultHeaderTpl', { static: true }) defaultHeaderTpl?: TemplateRef<any>;
  @ViewChild('defaultSidebarTpl', { static: true }) defaultSidebarTpl?: TemplateRef<any>;
  @ViewChild('defaultNestedListsTpl', { static: false }) defaultNestedListsTpl?: TemplateRef<any>;
  @ViewChild('defaultCellTpl', { static: false }) defaultCellTpl?: TemplateRef<any>;
  @ViewChild('defaultActionsTpl', { static: true }) defaultActionsTpl?: TemplateRef<any>;
  @ViewChild('defaultIndexTpl', { static: true }) defaultIndexTpl?: TemplateRef<any>;

  @Input() cellsTemplates: Record<string, TemplateRef<any> | undefined> = {};
  @Input() cellsButtons: Record<string, ActionButton[]> = {};
  @Input() headerCellsButtons: Record<string, ActionButton[]> = {};
  hasNestedCells = false;

  @Input() queryColumnKeysOnly = false;
  @Input() includeDefaultQueryKeys = true;
  @Input() queryFieldsKeys: string[] = [];
  tableTogglesFields: Field[] = [];

  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() expansionTemplate?: TemplateRef<any>;
  @Input() headerTemplate?: TemplateRef<any>;
  @Input() sidebarTemplate?: TemplateRef<any>;

  lastOpenedUids = this.storage.getItem(LocalStorageEnum.VISITED_IDS)?.reverse();

  @Input() rowClassFormatter: RowClassFormatter = this.lastOpenedUids?.reduce(
    (p: any, u: any, i: number) => {
      return { ...p, [`last-visited-row-${i + 1}`]: (x: any) => x?.uid === u };
    },
    {},
  );

  @Input() optionsOnRight = true;

  objectKeys = (obj = { index: 'S/N' }) => Object.keys(obj);
  columnIsHidden = (key: string) => valueIncludes(key, this.hiddenKeys ?? []);

  // Subscriptions
  subs: Subscription = new Subscription();
  dataSub?: Subscription = undefined;

  // Filter by Active status // and other generic values
  @Input() gridOptions: GridOption[] = [];
  @Output() gridOptionChange = new EventEmitter();
  @Input() selectedGridOption?: GridOption = undefined;

  @Input() viewDetailsClicks = 5;
  @Input() rowClickActions: ClickAction[] = [];

  canShowFilters = true;
  canShowToolbar = true;
  autoNestArrayColumns = false;
  canNestArrayColumns = true;

  firstDataLoad = true;
  pageSelectedRows: Record<number, any[]> = {};

  @Input() filtersClass = '';
  @Input() toolbarClass = '';
  @Input() searchInputClass = '';
  @Input() searchStatesClass = '';

  //cell merges
  @Input() groupByKeys: string[] = [];
  @Input() cellPropertiesMap?: CellPropertiesMap;
  spanTracker = new Map<string, [number, number]>(); // Track covered cells
  valueSpanTracker = new Map<string, [number, any]>();

  exportButtons: ActionButton[] = [
    {
      // type: 'icon',
      icon: 'excel',
      toolTip: 'Export Excel',
      class: 'border-on-hover bg-slightly-faded-gradient padding-1 ms-0',
      outerClass: 'm-0 padding-1',
      click: () => this.exportExel(),
    },
    {
      // type: 'icon',
      icon: 'pdf',
      toolTip: 'Export Pdf',
      class: 'border-on-hover bg-slightly-faded-gradient padding-1 ms-0',
      outerClass: 'm-0 padding-1',
      click: () => this.exportExel('pdf'),
    },
  ];

  ngOnInit() {
    this.setTheme();
    this.setParameters();
    this.loadData();

    this.listenToActions();
    this.setTableToggles();
  }

  setTheme() {
    if (this.theme == 'simple') {
      this.appearance = 'plain';
      this.noContentClass = 'size-full flex items-center justify-center p-5 slim(false)';
      this.toolbarClass = 'mb-1 bg-white rounded-t-lg';
      this.gridClass = 'bg-white';
      this.contentClass = 'full-grid';
      this.containerClass = 'size-full ';
      this.footerClass = '!bg-white mt-1';
      this.showBgIconMark = true;
      this.showTotal = true;
    }
  }

  setParameters() {
    this.animation_ = this.animation;
    if (this.gridParameter) copyObjectValues(this, this.gridParameter, false);

    if (!isObservable(this.gridData)) {
      this.gridData = of(Array.isArray(this.gridData) ? this.gridData : [this.gridData]);
    }

    if (this.gridOptions.length) this.loadOption();

    this.setRowClickActions();
    this.initialColumns = this.columns;
    if (this.expansionTemplate) this.expandable = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setParameters();
    this.loadData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onAfterFirstDataLoad() {
    // Select first component

    if (this.selectFirstRow) this.checkFirstOption();
    if (this.initialSelected?.length) this.initialSelect(this.initialSelected);
    this.firstDataLoad = false;
    this.updateRowsClassWithUid();
    // console.log('firsty');
  }

  initialSelect(selected = []) {
    this.selectedRows = selected;
    this.rowSelectionChange.emit(this.selectedRows);
    if (this.rowSelection) this.rowSelection(this.selectedRows);
    this.cdr.detectChanges();
  }

  checkFirstOption() {
    const item = this.listData?.data?.[0];
    if (item) this.rowSelectionChange_(item, true);
  }

  updateRowsClassWithUid() {
    const uidClassFormatter: RowClassFormatter = {};

    this.listData?.data?.forEach((data) => {
      const uid = data[this.uniqueIdKey] ?? data?.id ?? data?.value;
      const uidString = `row-uid-${uid}`;

      if (uid && !this.rowClassFormatter?.hasOwnProperty(uidString)) {
        uidClassFormatter[uidString] = (row?: any, index?: number) => {
          return (row[this.uniqueIdKey] ?? data?.id ?? data?.value) === uid;
        };
      }
    });

    this.rowClassFormatter = { ...this.rowClassFormatter, ...uidClassFormatter };
  }

  gridOptionChanged(name: string) {
    // prevent emitting same value twice
    const sameName = name === this.selectedGridOption?.title;
    if (name === undefined || sameName) return;
    this.selectedGridOption = this.gridOptions.find((x) => x.title === name);
    if (this.selectedGridOption?.callback) this.selectedGridOption?.callback(this);
    this.gridOptionChange.emit(this.selectedGridOption);

    copyObjectValues(this, (this.selectedGridOption as any), true, this.keysNotChangedByOptions);
    this.loadData();
  }

  loadOption() {
    let storedOption: GridOption | undefined = this.storage?.getItem('selectedGridOption');

    const isOption = this.gridOptions.find((o) => o.title === storedOption?.title);
    if (!isOption) storedOption = undefined;

    const firstOption = this.gridOptions?.[0];
    this.selectedGridOption = storedOption ?? this.selectedGridOption ?? firstOption;
    copyObjectValues(this, this.selectedGridOption, true, this.keysNotChangedByOptions);
    this.gridOptionChange.emit(this.selectedGridOption);
  }

  loadData() {
    this.currentSort = this.currentSort ?? { sortBy: 'id', sortDirection: 'DESC' };

    //set search fields // start with previous search data
    this.setSearchParemeters();

    // load and set page details form storage
    this.loadPageDetails();

    if (this.fetchParameter) {
      // initialize only once
      if (!this.dataSub) this.gridData = new BehaviorSubject([]);
      // ignore large and small sizes from local storage
      if (this.pageDetails?.size && this.pageDetails?.size > 50) this.pageDetails.size = 50;
      // if(this.pageDetails?.size < 10) this.pageDetails.size = 10;
      if (this.pageDetails?.size) this.loadFromPreviousPageEvent(this.pageDetails);
      else this.fetchData(this.fetchParameter);
    }

    // only subscribe once until destroy
    if (!this.dataSub || this.dataSub?.closed) {
      this.dataSub = this.gridData?.pipe(tap((data) => this.handledata(data))).subscribe();
      this.subs.add(this.dataSub);
    }
  }

  listenToActions() {
    this.reloadActions$.forEach((action) => {
      this.subs.add(action.subscribe(() => this.loadData()));
    });

    this.fetchParameter?.refetchActions?.forEach((action) => {
      this.subs.add(action.subscribe(() => this.loadData()));
    });

    // listen to keydownevents
    // this.subs.add(listenToShortcuts('data-table-hybrid', this));
  }

  loadPageDetails() {
    const details = this.storage.find('pageDetails', 'slug', this.getSlug());
    this.pageDetails = details ?? this.pageDetails;
  }

  setVisibleItemsMod(data: any[]) {
    // modify objects, arrays, boolean by adding a Mod suffix to original key
    // track the key been Moded
    let columnKeys: string[] = [...this.columnsKeys];
    if (!columnKeys.length) columnKeys = this.columns.map((c) => c.field) as any;

    [this.visibleItemsMod, this.autoMappedKeys] = mapVisibleItem([...data], columnKeys);
  }

  sortItems(data: any[]) {
    this.initialSorts?.forEach((s) => {
      const d = UNDEFINED_VALUES;
      const compare = (a: any, b: any) => stringFromField(a)?.localeCompare(stringFromField(b));

      const hasValues = (a: any, b: any) => {
        return (valueIsEither(a.value, d) as any) - (valueIsEither(b.value, d) as any);
      };

      const stringFromField = (f: any) => f?.[(s.sortBy as any)]?.toString();
      data.sort((a, b) => (s.sortBy === 'value' ? hasValues(a, b) : compare(a, b)));
      if (s.sortDirection == 'DESC') data.reverse();
    });
  }

  isTableUpdating = false;

  handledata(data_: any[] | any) {
    this.isTableUpdating = true;
    if (Array.isArray(data_)) data_ = [...data_].filter((d) => !!d);

    if (this.onDataChange) this.onDataChange(this);
    if (this.showOptionsFn) this.showGridOptions = this.showOptionsFn(data_);
    if (this.dataFunction) data_ = this.dataFunction(data_);

    this.isLoading = true;
    this.hadData = this.hadData || !!data_?.length;

    // if data is single item array
    if (valueIncludes(typeof data_?.[0], ['string', 'number', 'boolean'])) {
      data_ = data_.map((d: any) => ({ ['data']: d }));
      this.keyColumns = [];
      this.columns = [];
    }

    //perform local search if initialized with state values;
    // using exactness for now // ignoring searchType
    if (!this.isPageable) {
      // this.currentSearch?.forEach((field) => {
      //   let hasKey = data_?.[0]?.[<any>field?.fieldName];
      //   hasKey && (data_ = data_.filter((f: any) => f[<any>field.fieldName] === field.fieldValue));
      // });
    }

    // map data
    const data = [...(Array.isArray(data_) ? data_ : [])]?.map((item, index) =>
      this.mapFunction ? this.mapFunction(item, index) : item,
    );

    this.visibleItems = data;
    //TODO: fix auto mapped data
    // this.useAutoMappedColumns ? this.setVisibleItemsMod(data) : (this.visibleItemsMod = data);

    this.setAllFieldsKeys(data?.[0], data_?.[0]);
    this.setSearchFields();

    // set columnHeader before assigning values to paginator/ // cell templates
    this.setGridColumns(this.keyColumns, data[0]);

    this.setDefaultColumnsKeys();
    this.setCellsTemplates();
    this.setHeaderTemplate();
    if (this.rowSelectable) this.updateRowsClassWithUid();

    //TODO: fix auto mapped data
    // let visibleData = this.useAutoMappedColumns ? this.visibleItemsMod : data;
    // if (!this.isPageable && this.initialSorts?.length) this.sortItems(visibleData);

    this.listData = new MatTableDataSource(data);
    this.updateDisplayedData();

    this.listData.sort = this.sort;
    this.loadPageDetails();
    this.hasTouchedPageInput = !!this.pageIndex;

    if (this.paginator && this.listData) {
      if (!this.isPageable) {
        if (this.pageIsInIndex()) this.paginator.pageIndex = this.pageIndex;
        this.listData.paginator = this.paginator;
      }

      this.paginator.pageSize = this.pageSize;
    }

    // page Details
    this.pageIndex = this.pageDetails?.number ?? this.pageIndex;
    if (this.pageDetails?.size && this.pageDetails?.size > this.pageSize) {
      this.pageSize = this.pageDetails?.size ?? this.pageSize;
    }
    this.dataLength = this.pageDetails?.totalElements ?? data?.length ?? this.dataLength;

    this.updatePageDetails();
    this.onDataLength.emit(this.dataLength);
    this.onLoadData.emit(this.visibleItems);
    if (this.onLoadDataFn) this.onLoadDataFn(this.visibleItems);
    this.setTableDefaults();

    if (this.firstDataLoad && data.length) this.onAfterFirstDataLoad();

    // allow table to render for width adjustments
    const t = setTimeout(() => (this.isTableUpdating = false), 0);
    const a = setTimeout(() => (this.isAnimating = false), 600);

    const v = setTimeout(() => {
      this.animation_ = '';
      this.cdr.detectChanges();
    }, 2000);

    this.isLoading = false;
  }

  setTableDefaults() {
    this.canShowPaginator = this.dataLength > this.pageSize - 1 || this.hasTouchedSearchInput;
    this.canShowSearchInput =
      this.forceShowSearchInput ||
      this.dataLength > this.pageSize - 1 ||
      this.hasTouchedSearchInput;

    this.setCanShowFilters();
    this.setCanShowToolbar();
  }

  loadFromPreviousPageEvent(pageDetails: any) {
    if (!this.isPageable) this.isPageable = true;

    const prevTableEvent: PageEvent = {
      length: pageDetails.totalElements,
      pageIndex: pageDetails.number,
      pageSize: pageDetails.size,
      previousPageIndex: pageDetails.number > 0 ? pageDetails.number - 1 : 0,
    };

    this.handlePage(prevTableEvent);
  }

  pageIsInIndex() {
    if (!this.paginator) return false;
    const p_size = this.paginator.pageSize;
    const p_index = this.paginator.pageIndex;
    return p_size * (p_index + 1) < this.dataLength;
  }

  setSearchFields() {
    this.searchFields.forEach((f) => {
      const present = valueIsEither(key((f.fieldName as any)), keys(this.searchKeys));
      if (!present) this.searchKeys.push((f.fieldName as any));
    });

    if (this.searchByAllFields) {
      const isSearchable = (k: string) => !valueIncludes(k, this.searchHiddenKeys);
      this.searchKeys = this.originalFieldsKeys?.filter((k) => isSearchable(k)) ?? [];
    }
  }

  setCellsTemplates() {
    let tmp: Record<string, TemplateRef<any> | undefined> = {
      actions: this.actionsTemplate ?? this.defaultActionsTpl,
      index: this.defaultIndexTpl,
    };

    //update also from col themselves
    const indextmp = tmp['index'];
    tmp = { ...tmp, sn: indextmp, sno: indextmp, no: indextmp };

    this.columns.forEach((c) => {
      // assing nested list tmpl
      if (c?.['nested']) {
        tmp[c.field] = this.defaultNestedListsTpl;
        c.class = 'border-left-pale border-right-pale nested-cells-holder';
        this.hasNestedCells = true;
      }

      // assign give tmp from col props
      else if (c.cellTemplate) tmp[c.field] = c.cellTemplate;
      // if no assigned tmp give default
      else if (!tmp.hasOwnProperty(c.field)) tmp[c.field] = this.defaultCellTpl;
    });

    this.cellsTemplates = { ...this.cellsTemplates, ...tmp };
  }

  setHeaderTemplate() {
    if (!this.headerTemplate && (Object.keys(this.headerCellsButtons).length || true)) {
      this.headerTemplate = this.defaultHeaderTpl;
    }
  }

  setSearchParemeters() {
    // set the already predifined values else use loaded from storage
    let activeStates: SearchState[] = [];

    const similarityKeys = ['key', 'value'];

    if (this.searchStatesValues?.length) {
      // locked search states are hidden, and not removed on clear
      const lockeState = (s: any) => ({ ...s, active: true, locked: true });
      let states: SearchState[] = this.searchStatesValues?.map((s) => lockeState(s));

      if (this.searchStates.length) states = mergeUnique(similarityKeys, states, this.searchStates);
      this.searchStates = states;

      //by default stateValues are active
      activeStates = this.searchStatesValues ?? [];
    }

    // set default value to value
    this.searchStates = this.searchStates.map((s) => ({ ...s, value: s.value ?? s.defualtValue }));

    // get search states from ls / filter the ones actually present in the provide searchStates
    let storageStates: SearchState[] = [];

    const temp = (this.storage.getItem(statesKey) ?? [])?.filter(
      (x: any) => x.url === this.router.url,
    );

    const canUpdateStates = this.searchStates?.length && Array.isArray(temp);

    if (canUpdateStates) {
      storageStates = temp;
      const isValid = (s: any) => valueIsEither(s.key, keys(this.searchStates));
      storageStates = storageStates?.filter((state) => isValid(state));

      // copy states values from storage to states
      const setActive = (s_: any, s: any) =>
        s_.key === s.key && (s.value = s_.value) && (s.active = true);

      this.searchStates?.forEach((s) => storageStates?.find((s_) => setActive(s_, s)));

      // if active  // update storage states to active only
      const isActive = (s: any) => s.active || isValue(s.value);
      const hasActive = (storageStates = this.searchStates.filter((s) => isActive(s)))?.length;
      if (hasActive && !!this.searchStates.find((s) => !s.locked))
        this.hasTouchedSearchInput = true;
    }

    const initialStates = this.searchStates.filter(
      (s) => !s.ignoreValues?.includes(s.value) && isValue(s.value),
    );

    // intitialize current search if provided predefined values
    this.currentSearch = initialStates
      ?.filter((s) => !s?.isQueryVariable)
      ?.map((state) => ({
        fieldName: state.key,
        fieldValue: state.value,
        searchType: state.searchType ?? this.searchOperationType,
      }));

    //combine from storage with provided states
    storageStates = storageStates?.filter((s) => !valueIncludes((s.key as any), keys(activeStates)));
    if (storageStates?.length) activeStates = mergeUnique(undefined, activeStates, storageStates);

    //get user typed key from storage // if there is search key show filter nomara wah
    // only use states from this url
    let ss = this.storage.getItem('searchInputStates') as SearchState[] ?? [];
    ss = ss?.filter((s) => s.url === this.router.url);
    const mergS = ss?.length && (this.searchInputStates = ss);
    if (mergS) activeStates = mergeUnique(undefined, activeStates, this.searchInputStates);

    if (
      activeStates
        .filter((s) => !this.searchStatesValues.find((l) => l.key === s.key))
        .find((s) => !s.locked)
    ) {
      this.hasTouchedSearchInput = true;
    }

    //updates the above intilized currentsearch  with states so far // ignore none values in states
    if (activeStates?.length) {
      const inVal = (s: any) => !!this.searchStatesValues.find((s_) => s_.key == s.key);
      const trulyActive = activeStates.filter((s) => !inVal(s) && !s.ignoreValues?.includes(s.value));
      trulyActive?.forEach((state) => this.updateCurrentSearch((state.key as any), state.value));
    }

    // if loading with a specified daterange // add to currentSearch and set locked on states
    if (this.dateRange?.fromDate && this.dateRange?.toDate && this.dateRange.key) {
      const keyInSearch = this.currentSearch.find((f) => f.fieldName === this.dateRange?.key);
      const keyInStates = this.searchStates.find((s) => s.key === this.dateRange?.key);

      const fieldName = this.dateRange.key;
      const searchType = SearchOperationType.Between;
      const fieldValues = [this.dateRange?.fromDate, this.dateRange?.toDate];
      const fieldValue = this.dateRange?.toDate;

      const state = { key: fieldName, value: fieldValue, locked: true, searchType };
      if (!keyInSearch) this.currentSearch.push({ fieldName, searchType, fieldValue, fieldValues });
      if (!keyInStates) this.searchStates.push(state);
    }

    // update the searchDto to include values assigned
    const searchFields = this.currentSearch;

    this.pageableParam = { ...this.pageableParam, size: this.pageableParam?.size, searchFields };
  }

  log(...$event: any) {
    console.log($event);
    return true;
  }

  searchCustomState(e: { state: SearchState; value: any }) {
    this.hasTouchedSearchInput = true;
    const state: SearchState = e.state;
    const value = e.value;
    const ignore = state?.ignoreValues?.includes(value);

    if (!state) return;

    // (clicked twice) remove the value  // else assign the new value // remove if is none
    value === state?.value ? (state.value = undefined) : (state.value = value);
    if (state.value === undefined || ignore) this.removeSearchFields(state);

    //handle if is queryvariable
    if (!!this.fetchParameter && state?.isQueryVariable) {
      if (!this.fetchParameter?.variables) this.fetchParameter.variables = {};
      const value_ = this.fetchParameter.variables[state.key] === value ? undefined : value;
      // (clicked twice) remove the value
      this.fetchParameter.variables[state.key] = value_ ?? state.defualtValue;
    }

    //rerender the states
    this.searchStates = [...this.searchStates];

    // mark active states// values in storage, // if user's input is present add it to active
    let activeStates: SearchState[] = this.searchStates.filter(
      (s) => (!!s.value || s.value === false) && !s?.locked,
    );

    // mark active state active true
    activeStates?.forEach((state) => (state.active = true));

    let activeStates_ = activeStates?.filter((s) => isValue(s.value));
    activeStates_ = activeStates_.map((s) => ({ ...s, url: s.url ?? this.router.url }));
    this.storage.setItem(statesKey, activeStates_);

    if (this.searchInputStates.length) activeStates = activeStates.concat(this.searchInputStates);

    // remove all none options after saving to storage  // upate current search
    activeStates = activeStates.filter((s) => !s?.ignoreValues?.includes(s.value));
    activeStates?.forEach((state) => this.updateCurrentSearch(state.key, state.value));

    // allways start search on first page
    // proceed to query search if pageable or can search local // else just use native filter
    const reRun = this.isPageable || this.alldata.length || state.isQueryVariable;
    if (reRun) this.handlePage({ pageIndex: 0 });
    else if (this.listData) this.listData.filter = state?.value?.toString()?.trim()?.toLowerCase();
  }

  searchAlldataLocally(currentSearch: SearchField[]) {
    let resultSet = [...(this.alldata ?? [])];
    const searchFields = [...currentSearch];
    if (!this.hasActiveStates()) return this.gridData.next(resultSet);

    searchFields.forEach(
      (f) =>
        (resultSet = resultSet.filter((r) => {
          if (typeof f.fieldValue === 'number') return r[f.fieldName] === f.fieldValue;
          const typeIsNotEqual = f.searchType === SearchOperationType.NotEquals;
          if (typeIsNotEqual) return valueIncludes(r[f.fieldName], (f.fieldValue as any));
          else return valueIncludes(r[f.fieldName], (f.fieldValue as any));
        })),
    );

    this.gridData.next(resultSet);
  }

  hasActiveStates(): boolean {
    return !!this.searchStates
      ?.filter((s) => !s?.isQueryVariable)
      ?.concat(this.searchInputStates)
      ?.find((state) => !state.locked && (!!state.value || state.value === false));
  }

  updateCurrentSearch(key: string, value: number | string | boolean | any) {
    if (!key) return;
    const state: SearchState | undefined = this.searchStates?.find((state) => state.key === key);

    //don't include queryvariables passed in search states;
    if (state?.isQueryVariable) return;

    const searchStateValue = this.searchStatesValues?.find((s) => s.key === key);
    let searchType = searchStateValue?.searchType ?? state?.searchType ?? this.searchOperationType;

    // remove inactive states;  // remove the selected search field from current search fields
    if (!searchStateValue)
      this.currentSearch = this.currentSearch.filter((s) => s.fieldName !== key);

    //set search field // handle if date range
    const fieldName = key;
    const fieldValue = Array.isArray(value) ? value?.[0] : value;

    if (Array.isArray(value)) {
      if (isValue(value?.[0]) && isValue(value?.[1])) searchType = SearchOperationType.Between;
      else if (isValue(value?.[0])) searchType = SearchOperationType.GreaterThan;
      else if (isValue(value?.[1])) searchType = SearchOperationType.LessThan;
    }

    const pushField = (field: SearchField) => {
      if (this.currentSearch.find((f) => areObjectsEqual(f, field))) return;
      this.currentSearch.push(field);
    };

    const searchField: SearchField = { fieldName, searchType, fieldValue };
    if (Array.isArray(value)) searchField.fieldValues = value;

    // add the field back with the new values
    if (!this.currentSearch.find((s) => s.fieldName === key)) pushField(searchField);
  }

  clearSearchCustomState() {
    // only remove the states that are not locked (not in searchStateValues)
    const removeValue = (s: any) =>
      !s.locked && ((s.value = undefined) || (s.active = false) || true);

    this.searchStates
      .filter((s) => !s?.isQueryVariable)
      .forEach((state) => removeValue(state) && this.removeSearchFields(state));

    let activeOnly = this.searchStates.filter((s) => s.active);
    activeOnly = activeOnly.map((s) => ({ ...s, url: s.url ?? this.router.url }));
    this.storage.setItem(statesKey, activeOnly);

    if (this.isPageable || this.alldata.length) this.handlePage();
    else this.listData.filter = ''.trim().toLowerCase();
  }

  updateSearchInputStates(states: SearchState[]) {
    let states_: any = [];

    if (this.searchCombinationType === 'Or') {
      states_ = this.searchKeys.map((k) => ({ ...states[0], key: k.split(' ')[0] }));
    } else states_ = states.filter((s) => isValue(s.value?.trim()));

    this.searchInputStates = states_.map((s: any) => ({ ...s, url: this.router.url }));
    this.storage.setItem('searchInputStates', states);
    this.filterTable();
  }

  sortData(e: { active: string; direction: any }) {
    if (!this.isPageable) this.listData?.sortData(this.listData.data, (e as any));
    this.sortChange(e);
  }

  sortChange(e: { active: string; direction: any }) {
    this.matSort = e; // set manually since sort is not found in tpl due to conditional rendering

    let direction = this.isPageable ? e?.direction?.toUpperCase() : e?.direction;

    if (
      this.currentSort?.sortBy === removeMod(e.active) &&
      this.currentSort?.sortDirection === direction
    ) {
      if (direction.toLowerCase() === 'asc') direction = 'Desc';
      else if (direction.toLowerCase() === 'desc') direction = 'Asc';
      direction = this.isPageable ? direction?.toUpperCase() : direction;
    }

    this.currentSort = { sortBy: removeMod(e.active), sortDirection: direction };
    this.handlePage();
  }

  onCellSelectionChange(e: any[]) {
    // console.log('selection: ', e);
    this.cellSelectionChange.emit((this.selectedCells = e));
  }

  filterTable() {
    this.removeSearchInputs();
    this.hasTouchedSearchInput = true;

    if (!this.isPageable || !this.searchKeys.length) {
      const str = this.searchInputStates?.[0]?.value?.toLowerCase();
      this.listData.filter = str;
      this.listData = new MatTableDataSource(this.listData._filterData(this.alldata));
      this.updateDisplayedData();
      return;
    }

    this.pageIndex = 0;
    this.pageableParam = { ...this.pageableParam, first: 0 };
    this.paginator?.firstPage();

    this.searchInputStates?.forEach((state) => this.updateCurrentSearch(state.key, state.value));
    this.handlePage();
  }

  removeSearchInputs() {
    const keys_ = keys(this.searchKeys);
    this.currentSearch = this.currentSearch.filter((s) => !valueIsEither(s.fieldName, keys_));
  }

  removeSearchFields(keys_: any | SearchState[] | any[]) {
    if (!Array.isArray(keys_)) keys_ = [keys_];
    keys_ = keys_.map((key: any) => key?.fieldName ?? key?.key ?? key);
    this.currentSearch = this.currentSearch.filter((s) => !valueIsEither(s.fieldName, keys_));
  }

  onSearchClear() {
    //get all, remove in the current url, save back
    let allStates: SearchState[] = this.storage.getItem('searchInputStates');
    allStates = allStates.filter((s) => s.url !== this.router.url);
    this.searchInputStates = [];
    this.storage.setItem('searchInputStates', allStates);
    this.filterTable();
  }

  async handlePage(e?: Partial<PageEvent>) {
    if (e) {
      if (this.paginator) {
        if (isValue(e.pageIndex)) this.paginator.pageIndex = this.pageIndex = e.pageIndex ?? 0;
        if (isValue(e.pageSize)) this.paginator._changePageSize((this.pageSize = e.pageSize ?? 0));
      }

      if (!this.isPageable) {
        this.storage.upsert('pageDetails', 'slug', { slug: this.getSlug(), ...e });
      }

      this.updatePageDetails();
    }

    const searchLocal = !this.isPageable && this.alldata.length && this.currentSearch?.length;
    if (searchLocal) return this.searchAlldataLocally(this.currentSearch);

    const currentSort = this.currentSort?.sortDirection.trim() ? this.currentSort : {};

    //first: practically should be named page
    this.pageableParam = {
      ...this.pageableParam,
      ...currentSort,
      searchFields: this.currentSearch,
      first: (this.pageIndex = e?.pageIndex ?? this.pageIndex ?? 0),
      size: e?.pageSize ?? this.pageSize,
    };

    // remove props if not used
    const sorts = ['sortBy', 'sortDirection'];
    if (!Object.keys(currentSort).length) sorts.forEach((s) => delete (this.pageableParam as any)[s]);

    const noSearch = !this.currentSearch?.length && !this.searchInputStates.length;
    if (noSearch) delete this.pageableParam.searchFields;

    //invoke to query data
    this.pageable.emit(this.pageableParam);
    this.hasTouchedPageInput = true;
    if (this.fetchParameter) await this.fetchData(this.fetchParameter);
  }

  viewDetails(data: any) {
    // Remove the direct import and use dynamic import
    import('../details/details.component').then(({ DetailsComponent }) => {
      const dialogData: DetailsParameter = {
        entity: data,
        showHeader: true,
        animation: this.animation,
        showFieldsInGroups: true,
        showFirstGroupHeader: false,
        addAutoPipe: true,
        layout: 'list',
      };

      this.vs.openDialog({
        component: DetailsComponent,
        panelClass: [ANIMATION_MODAL],
        width: '80%',
        data: dialogData,
      });
    });
  }

  rowClick(data: { rowData: any; index: number }) {
    this.vs.onMultipleEvent(this.rowClickActions, data?.rowData);
  }

  setRowClickActions() {
    const queryMapFunction = async (d: any) => {
      if (!this.itemQuery) return d;

      // if in cache return it
      const item = this.itemsCached.find((i) => i?.[this.itemQueryKey] === d?.[this.itemQueryKey]);
      if (item) return item;

      // if not cached go fetch it
      const id = d?.[this.itemQueryKey];
      // item = await this.fetchService.getDataFromQuery_prom({}, this.itemQuery, id); TODO: impl fetch service
      this.itemsCached.push(item);
      return item;
    };

    const defaultActions: ClickAction[] = [
      {
        callback: (data) => this.viewDetails(data),
        threshold: this.viewDetailsClicks,
        slug: 'openAllDetails',
      },
    ];

    defaultActions[0].queryMapFunction = queryMapFunction;

    this.actionButtons = this.actionButtons.map((btn) => {
      const paths = getPathsToObject(btn, { queryFirst: true });
      paths.forEach((path) => setPathValue(btn, `${path}.queryMapFunction`, queryMapFunction));
      return btn;
    });

    const notInDef = (action: any) => !defaultActions.find((a) => a.slug === action.slug);
    this.rowClickActions = this.rowClickActions.filter(notInDef).concat(defaultActions);
  }

  getSlug() {
    return slugify(
      this.fetchParameter?.url ??
        JSON.stringify(this.fetchParameter?.fetchFn?.toString()) ??
        this.router.url,
    );
  }

  async fetchData(fp: FetchParameter) {
    if (!fp?.url && !fp?.fetchFn && !fp?.mutation && !fp?.query) return;
    const allowLoader = this.showLoading !== false;
    this.isFetching = allowLoader;

    const nextFp: FetchParameter = {
      ...fp,
    };

    if (!nextFp.loadingOn && !!this.slug) nextFp.loadingOn = this.slug;
    else if (!nextFp.loadingOn) nextFp.loadingOn = 'data-loader';

    const variables = this.getFetchVariables();

    const res = await this.fs.fetch({
      ...nextFp,
      variables: { ...nextFp.variables, ...variables },
    });

    let data = res?.content ? res?.content : res;
    if (!Array.isArray(data)) data = [];

    const res_: any = isObject(res) ? res : {};
    const pageDetails: PageableResponse = { slug: this.getSlug(), ...res_, ...res_?.pageResponse };

    delete pageDetails.content;
    delete pageDetails.pageResponse;

    if (!this.isPageable) this.isPageable = objectHasKeys(res, PAGEABLE_RESULT_KEYS);
    if (!Array.isArray(getFirstKeyValue(res, 'content'))) this.resetPageDetails(pageDetails.slug);
    this.storage.upsert('pageDetails', 'slug', pageDetails);

    if (!this.isPageable) {
      this.alldata = data;
      this.searchAlldataLocally(this.currentSearch);
    } else this.gridData.next(data);
    this.isFetching = false;
  }

  getFetchVariables() {
    const svs = this.searchStates.filter((s) => s?.isQueryVariable);

    let variables: any = {
      ...svs?.reduce((p, c) => ({ ...p, [c.key]: c.value ?? c.defualtValue }), {}),
    };

    // update query variables in the table options
    if (this.selectedGridOption?.queryVariables) {
      variables = { ...variables, ...this.selectedGridOption.queryVariables };
    }

    if (this.isPageable) {
      const type = this.pageableParam.searchCombinationType ?? this.searchCombinationType;
      this.pageableParam.searchCombinationType = type ?? SearchCombinationType.And;

      //set pageParams
      const { searchFields, ...pageDetails } = this.pageableParam;
      const safePage = Math.max(0, Number(pageDetails.page ?? 0));
      const safeSize = Number(pageDetails.size ?? this.pageSize ?? 10);

      variables = {
        ...variables,
        pageableParam: {
          ...pageDetails,
          page: safePage,
          size: safeSize,
          searchFields,
        },
      };
    }

    return variables;
  }

  resetPageDetails(slug: any) {
    let pageDetails = this.storage.find('pageDetails', 'slug', slug);
    if (!pageDetails) pageDetails = this.storage.find('pageDetails', 'slug');

    if (pageDetails) {
      if (pageDetails?.pagination) pageDetails.pagination.totalElements = 0;
      this.storage.upsert('pageDetails', 'slug', pageDetails);
    }

    return [];
  }

  setDefaultColumnsKeys() {
    if (this.selectedColumnsKeys.length) return;
    let keys: string[] = this.columnsKeys;
    if (this.columns.length) keys = this.columns.map((c) => c.field) as any;
    const notCol = ['action', 'query', 'actions', 'sno', 'index', 'no'];
    this.selectedColumnsKeys = keys.filter((k) => !valueIsEither(k, notCol));
    const hasDefCols = this.defaultColumnsKeys.length;
    if (!hasDefCols) this.defaultColumnsKeys = this.selectedColumnsKeys.reverse();
  }

  changeDisplayedColumns(keys: string[]) {
    this.selectedColumnsKeys = keys.length ? keys : this.defaultColumnsKeys;
    this.setGridColumns(this.selectedColumnsKeys);
  }

  // update positions of columns if change is from the grid
  columnChange(columns: GridColumn[]) {
    const findIndex = (x: any) => columns.map((c) => c.field).findIndex((k) => k === x);
    this.selectedColumnsKeys.sort((a, b) => findIndex(b) - findIndex(a));
    this.sortAllFieldsKeys(this.selectedColumnsKeys);
  }

  sortAllFieldsKeys(keys: string[]) {
    this.allFieldsKeys.sort((a, b) => a?.localeCompare(b));
    const getIndex = (k: any) => keys?.findIndex((k_) => k_ == k);
    this.allFieldsKeys.sort((a, b) => getIndex(b) - getIndex(a));
  }

  setAllFieldsKeys(sampleModItem: any, sampleItem: any) {
    if (!sampleModItem) return;
    const hidden = ['sn', 'id', 'actions', 'reportQuery'];
    let allKeys = Object.keys(sampleModItem);
    allKeys = allKeys?.filter((k) => !valueIncludes(k, hidden));

    allKeys = uniqueSet(allKeys.concat(this.defaultColumnsKeys));

    this.modedKeys = [...allKeys].filter((k) => k.endsWith('Mod')).map((k) => removeLast(k, 'Mod'));
    allKeys = allKeys.filter((k) => !k.endsWith('Mod'));

    //TODO : hide some cols from ext user
    if (1) this.allFieldsKeys = allKeys;
    else if (this.hiddenKeys.concat(END_USER_HIDDEN_FIELDS).length) {
      const notHidden = (k: string) => !valueIncludes(k, this.hiddenKeys);
      this.allFieldsKeys = allKeys?.filter((key) => notHidden(key));
    } else this.allFieldsKeys = this.defaultColumnsKeys;

    // sort keys // by alphabet  // by keys included in columns
    this.sortAllFieldsKeys(this.defaultColumnsKeys);

    const notHidden = (k: string) => !valueIncludes(k, hidden);
    const allOgKeys = getFields(sampleItem).map((f) => f.key);
    this.originalFieldsKeys = allOgKeys?.filter((k) => notHidden(k));

    // set search key and default exported columns
    if (!this.selectedExportKeys?.length) {
      const keys = this.exportAllFields
        ? this.originalFieldsKeys
        : this.columns.map((c) => c.field).filter((k) => !['actions', '#'].includes(k));

      this.selectedExportKeys = keys;
    }

    const isDateKey = (k: any) => valueIncludes(k, [(this.selectedDateRangeKey as any), 'date']);
    const hasDateValue = (k: any) => isValidDate(sampleItem[k]);

    this.allDateKeys = this.originalFieldsKeys.filter((k) => isDateKey(k) || hasDateValue(k));
    this.dateFilterKeys = mergeUnique(this.dateFilterKeys, this.allDateKeys);

    if (this.dateFilterKeys.length) {
      if (!this.selectedDateRangeKey) this.selectedDateRangeKey = this.dateFilterKeys[0];
      if (!this.selectedDateKey) this.selectedDateKey = this.dateFilterKeys[0];
    }
  }

  //TODO: implement export
  async exportExel(exportType = 'excel') {
    const thres = 100;
    const size = this.isPageable ? this.pageSize : this.dataLength;

    return this.exportExcelRecursively(size, this.exportAllData, exportType);
  }

  /** Title used for both the PDF heading and the Excel title row. */
  getExportTitle(): string {
    const title = isSignal(this.title) ? this.title() : this.title;
    return String(title ?? '').toUpperCase();
  }

  async exportExcelRecursively(size: number, exportAll: boolean, exportType = 'excel') {
    const visibleItems = this.listData?.data;
    const exportTitle = this.getExportTitle();

    // field (if any) that renders the on-screen S/No/index column - keep exports in sync with it
    const indexField = this.columns.find((c) =>
      INDEX_FIELD_KEYS.includes(String(c.field).toLowerCase()),
    )?.field;

    const withRowIndex = (item: any, index: number) =>
      indexField ? { ...item, [indexField]: index + 1 + this.exportPageIndex * size } : item;

    // only include fields that are selected for export
    const exportItems = visibleItems.map((item, index) => {
      const itemMod: any = {};
      // no declared index/sno column on this grid - fall back to a synthetic numbered column
      if (!indexField) itemMod['#'] = index + 1 + this.exportPageIndex * size;
      const sourceItem = withRowIndex(item, index);

      this.selectedExportKeys.forEach(async (k) => {
        const key = this.modedKeys.includes(k) ? `${k}Mod` : k;
        const column = this.columns.find((c) => c.field === k);
        const header = column?.header;
        const header_: any = (isObservable(header) ? await lastValueFrom(header) : header) ?? k;
        let value = getNameField(getPathValue(sourceItem, key))?.value;

        //formatings
        if (exportType == 'pdf' && column?.['type'] == 'number') {
          value = Number(value)?.toLocaleString();
        }

        itemMod[header_] = value;
      });
      return itemMod;
    });

    const columns: any[] = [];
    const allFields = setFieldsWidths(exportItems);
    const getColumn = (header: any, key: any, width: any): any => ({ header, key, width });

    allFields.forEach((field: any) => columns.push(getColumn(field.name, field.key, field.length)));
    const fileName = this.getExportedFileName(size, exportItems.length);

    if (exportType === 'pdf') {
      this.filesService.exportListToPDF(exportItems, exportTitle, fileName);
    } else if (this.hasMergedCells || true) {
      await this.filesService.exportGridExcel({
        data: this.displayedData.map((item, index) => withRowIndex(item, index)),
        keyColumns: this.keyColumns as any,
        columns: this.columns,
        fileName,
        sheetName: fileName,
        undefinedValue: this.undefinedValue,
        title: exportTitle,
      });
    } else await this.filesService.exportExcel(exportItems, columns, fileName, (this.title as any));
    // loop for all remaining pages if available
    // let thereIsMore = exportAll && ++this.exportPageIndex < this.dataLength / size;
    // if (thereIsMore) this.exportExcelRecursively(size, exportAll, exportType);
    // else this.exportPageIndex = 0;
  }

  getExportedFileName(size: number, length?: number) {
    const title = isSignal(this.title) ? this.title() : this.title;

    let fileName = `${APP_VARIABLES.name}_${this.title}`;
    const slug = this.router?.url?.split('/').pop();
    if (!slug?.includes(title?.toLowerCase() ?? 'data')) fileName = `${fileName}_${slug}`;

    if (this.fetchParameter?.variables) {
      Object.keys(this.fetchParameter.variables).forEach(
        (k) =>
          isValue(this.fetchParameter?.variables?.[k]) &&
          !k?.toLowerCase()?.endsWith('uid') &&
          !title?.includes(k) &&
          !k.includes('active') && //ignore ative
          (fileName = `${fileName}_${k}=${this.fetchParameter?.variables?.[k]}`),
      );
    }

    this.searchInputStates.forEach((s) => (fileName = `${fileName} - (${s.key}=${s.value})`));

    if (this.dateValue) fileName = `${fileName} on ${this.dateValue}`;
    const date1 = formatDate_(this.startDateValue, 'dd-MMM-y');
    if (this.startDateValue && !this.endDateValue) fileName = `${fileName} on ${date1}`;
    if (this.startDateValue && this.endDateValue) fileName = `${fileName} from ${date1}`;

    const date2 = formatDate_(this.endDateValue, 'dd-MMM-y');
    if (this.endDateValue) fileName = `${fileName} to ${date2}`;
    if (length) fileName = `${fileName} (${length})`;
    fileName = `${replaceWords(fileName, ' ', '_')}`;

    const inMultiples = this.exportAllData && this.isPageable && this.dataLength !== size;
    if (inMultiples) fileName = `${fileName}-page-${this.exportPageIndex + 1}`;
    return fileName;
  }

  clearFilterDate() {
    this.dateValue = undefined;
    this.removeSearchFields(this.selectedDateKey);
    this.handlePage();
  }

  filterByDate($event: any) {
    this.removeSearchFields(this.selectedDateKey);
    const fieldValue = (this.dateValue = formatDate_($event, 'yyyy-MM-dd'));
    const searchType = SearchOperationType.Like;
    this.currentSearch.push({ fieldName: this.selectedDateKey as any, searchType, fieldValue });
    this.handlePage();
  }

  clearDateRangeFilter() {
    this.startDateValue = undefined;
    this.endDateValue = undefined;
    this.removeSearchFields(this.selectedDateRangeKey);
    this.handlePage();
  }

  filterByDateRange(): any {
    this.removeSearchFields(this.selectedDateRangeKey);
    let fromDate, toDate;

    if (this.startDateValue) fromDate = formatDate_(this.startDateValue, 'yyyy-MM-dd');
    if (this.endDateValue) toDate = formatDate_(this.endDateValue, 'yyyy-MM-dd');

    const err_msg = 'You have to fill in Start Date or End Date first';
    const hasNotSet = !this.startDateValue || !this.endDateValue;
    if (hasNotSet) return this.notify.error(err_msg);

    const fieldName: string = this.selectedDateRangeKey as any;
    const searchType = SearchOperationType.Between;
    const fieldValues: any[] = [fromDate, toDate];
    const fieldValue = toDate;
    const canSearch = fromDate && toDate && fieldName;

    if (canSearch) this.currentSearch.push({ fieldName, searchType, fieldValue, fieldValues });
    this.handlePage();
  }

  setPageSize(value: any) {
    value = +value;
    if (!value || Number.isNaN(value)) return;

    if (value < 1) return;
    this.paginator.pageSize = this.pageSize = value;
    this.paginator._changePageSize(this.pageSize);
    this.updatePageDetails();
    this.handlePage();
  }

  setPageIndex(value: any, loadData = true) {
    value = +value;
    if (Number.isNaN(value)) return;
    const notValid = Number.isNaN(value) || value > this.pagesLength || value < 0;
    if (notValid) return this.updatePageDetails();

    this.paginator.pageIndex = this.pageIndex = value - 1;
    this.paginator._changePageSize(this.pageSize);
    this.updatePageDetails();
    this.handlePage();
  }

  updatePageDetails() {
    this.displayedPageIndex = this.pageIndex + 1;
    this.pagesLength = Number((this.dataLength / this.pageSize).toFixed(0));
    if (this.dataLength && this.pagesLength < 1) this.pagesLength = 1;
  }

  setCanShowToolbar() {
    this.canShowToolbar =
      this.showToolbar &&
      (this.canExportData ||
        this.canToggleColumns ||
        this.canChangeDisplayedColumns ||
        (this.showPaginator && this.showPaginatorButtons) ||
        (this.showFiltersInToolbar && this.canShowFilters));
  }

  setCanShowFilters() {
    if (!this.showToolbar && this.showSearchInput) this.showFiltersInToolbar = false;

    this.canShowFilters =
      (this.showFilters &&
        (this.canShowSearchInput ||
          this.hasTouchedSearchInput ||
          !!this.searchStates.find((s) => !s.locked) ||
          this.hasActiveStates() ||
          (this.showGridOptions && !!this.gridOptions?.length) ||
          this.showDateFilter ||
          this.showTitle ||
          this.showDateRangeFilter)) ||
      (!!this.gridOptions.length && !this.showFiltersInToolbar && !!this.selectedGridOption);
  }

  setTableToggles() {
    const presentKeys = TABLE_TOGGLES.filter((t) => this.hasOwnProperty(t.split(' ')[0]));

    this.tableTogglesFields = presentKeys.map((s) => ({
      key: s.split(' ')[0],
      name: nameFromFieldString(s),
    }));
  }

  toggleChange(key: any, value: any) {
    (this as any)[key] = value;
    if (key === 'expandable') this.updateXpCol();
    if (key === 'queryColumnKeysOnly') this.loadData();
  }

  headerRows: HeaderRow[] = [];
  maxHeaderDepth = 1;

  private initializeHeaderStructure() {
    this.headerRows = [];
    this.maxHeaderDepth = 1;

    // Calculate max depth from all columns
    this.columns.forEach((col) => {
      if (!col.hide) {
        const depth = col.headers?.length || 1;
        this.maxHeaderDepth = Math.max(this.maxHeaderDepth, depth);
      }
    });

    // Build header rows from top to bottom
    for (let level = 0; level < this.maxHeaderDepth; level++) this.headerRows.push({ cells: [] });

    // Process each visible column
    let colIndex = 0;
    while (colIndex < this.columns.length) {
      const col = this.columns[colIndex];

      if (col.hide) {
        colIndex++;
        continue;
      }

      this.processColumnHeaders(col, colIndex);
      colIndex++;
    }

    // Calculate rowspans for leaf headers that don't have nested levels
    this.calculateHeaderRowspans();
    // Initialize header span tracking for rendering
    this.initializeHeaderSpanTracking();
    // Trigger change detection
    this.cdr.detectChanges();
  }

  private processColumnHeaders(column: GridColumn, startColIndex: number) {
    const hasHeaders = column.headers && column.headers.length > 0;
    const headerLevels: GridColumn[] = hasHeaders ? column.headers as any : [column];
    const colDepth = headerLevels.length;

    // Add cells for each level of this column
    for (let level = 0; level < this.maxHeaderDepth; level++) {
      if (level < colDepth) {
        // This column has content at this level
        const label: string = headerLevels[level]?.header || '';

        // Check if we can merge with previous cell at same level
        const currentRow = this.headerRows[level];
        const lastCell = currentRow.cells[currentRow.cells.length - 1];

        if (lastCell && lastCell.label === label && !lastCell.isLeaf) {
          // Merge with previous cell
          lastCell.colspan++;
        } else {
          // Create new cell
          const isLeaf = level === colDepth - 1;

          currentRow.cells.push({
            label,
            colspan: 1,
            rowspan: 1,
            column: isLeaf ? column : undefined,
            isLeaf,
          });
        }
      } else {
        // Column doesn't have content at this level (shouldn't render)
        // This is handled by rowspan calculation below
      }
    }
  }

  private calculateHeaderRowspans() {
    // For each column, if it doesn't reach max depth, extend its last header cell
    let processedCols = 0;

    this.columns.forEach((col) => {
      if (col.hide) return;

      const hasHeaders = col.headers && col.headers.length > 0;
      const colDepth = hasHeaders ? (col.headers?.length ?? 0) : 1;

      if (colDepth < this.maxHeaderDepth) {
        // Find this column's last header cell and extend its rowspan
        const lastLevel = colDepth - 1;
        const rowspan = this.maxHeaderDepth - lastLevel;

        // Find the cell that corresponds to this column at lastLevel
        // We need to find it by tracking column positions
        let cellColCount = 0;
        for (const cell of this.headerRows[lastLevel].cells) {
          if (cellColCount === processedCols) {
            cell.rowspan = rowspan;
            break;
          }
          cellColCount += cell.colspan;
        }
      }

      processedCols++;
    });
  }

  // Tracking helper for header cell positions
  getHeaderCellKey(rowIndex: number, cellIndex: number): string {
    return `h-${rowIndex}-${cellIndex}`;
  }

  // Track which cells to skip in rendering (covered by colspan/rowspan)
  headerSpanTracker = new Map<string, [number, number]>(); // [rowspan, colspan]

  private initializeHeaderSpanTracking() {
    this.headerSpanTracker.clear();

    this.headerRows.forEach((row, rowIndex) => {
      let colPosition = 0; // Actual column position accounting for colspan

      row.cells.forEach((cell, cellIndex) => {
        const key = this.getHeaderCellKey(rowIndex, colPosition);

        // Store the cell's span
        this.headerSpanTracker.set(key, [cell.rowspan, cell.colspan]);

        // Mark covered cells as [0, 0] to skip rendering
        for (let r = rowIndex; r < rowIndex + cell.rowspan; r++) {
          for (let c = colPosition; c < colPosition + cell.colspan; c++) {
            if (r !== rowIndex || c !== colPosition) {
              this.headerSpanTracker.set(this.getHeaderCellKey(r, c), [0, 0]);
            }
          }
        }

        colPosition += cell.colspan;
      });
    });
  }

  // Get header cell at position
  getHeaderCell(rowIndex: number, colIndex: number): HeaderCell | null {
    if (rowIndex >= this.headerRows.length) return null;

    const row = this.headerRows[rowIndex];
    let colPosition = 0;

    for (const cell of row.cells) {
      if (colPosition === colIndex) return cell;
      colPosition += cell.colspan;
    }

    return null;
  }

  // Track streak repetition of column values across rows
  setValueSpanTracker() {
    this.valueSpanTracker.clear();
    const processedCells = new Set(); // track which cells have been processed

    // Process each row and column
    this.displayedData.forEach((row, rowIndex, items) => {
      this.columns.forEach((colDef, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        const key = colDef.field;

        // Skip if this cell was already processed as part of a previous streak // and not set one
        const isGrouped = this.groupByKeys.includes(removeMod(key)) || !!colDef['grouped'];
        if (!isGrouped || processedCells.has(cellKey)) return;

        const currValue = row?.[key];
        if (!row.hasOwnProperty(key)) return;
        // Compare resolved display values (not object references) so grouping
        // works for nested-object fields (e.g. a category relation) regardless
        // of whether the source data happens to share object identity.
        const currComparable = currValue && typeof currValue === 'object'
          ? getNameField(currValue)?.value
          : currValue;

        let streak = 1;
        let streakEndIndex = rowIndex;

        // Look ahead to find consecutive matching values
        for (let r = rowIndex + 1; r < items.length; r++) {
          const nextValue = items[r]?.[key];
          const nextComparable = nextValue && typeof nextValue === 'object'
            ? getNameField(nextValue)?.value
            : nextValue;
          if (currComparable !== nextComparable) break; // Streak is broken
          streak++;
          streakEndIndex = r;
        }

        // only record spans of 2 or more //  record processed cells to skip in future iterations
        if (streak >= 2) this.valueSpanTracker.set(cellKey, [streak, currValue]);
        for (let r = rowIndex; r <= streakEndIndex; r++) processedCells.add(`${r}-${colIndex}`);
      });
    });
  }

  hasMergedCells = false;

  private initializeSpanTracking() {
    this.spanTracker.clear();
    const hasGrouping = this.groupByKeys.length || this.columns.find((c) => !!c['grouped']);
    this.hasMergedCells = false;
    if (hasGrouping) this.setValueSpanTracker();

    this.columns.forEach((colDef, colIndex) => (colDef['hasMergedCells'] = false));

    // Pre-calculate which cells are covered by spans
    this.displayedData.forEach((row, rowIndex, items) => {
      const cellProps_ = row?.['_cellsProps'] ?? row?.['cellsProps'] ?? {};

      this.columns.forEach((colDef, colIndex) => {
        const key = colDef.field;
        const cellKey = `${rowIndex}-${colIndex}`;

        //record cellSpans   // Priority order: field-specific > item-level > column-level > default
        const vs = this.valueSpanTracker.get(cellKey)?.[0];
        const rowspan =
          vs ??
          cellProps_[key]?.rowspan ??
          row[`${key}_rowspan`] ??
          row['rowspan'] ??
          colDef['rowspan'] ??
          1;

        const colspan =
          cellProps_[key]?.colspan ??
          row[`${key}_colspan`] ??
          row['colspan'] ??
          colDef['colspan'] ??
          1;

        let cell: CellProperties = { rowspan, colspan, ...this.cellPropertiesMap?.[key] };
        cell = { ...cell, ...cell?.mapFn?.(key, row) };

        //avoid updating cells marked [0,0] / to be skipped
        const hasCell = this.spanTracker.has(cellKey);
        if (!hasCell) this.spanTracker.set(cellKey, [(cell.rowspan as any), (cell.colspan as any)]);

        if ((cell.colspan ?? 1) > 1 || (cell.rowspan ?? 1) > 1) {
          colDef['hasMergedCells'] = true;
          this.hasMergedCells = true;
        }

        // Mark covered cells (skip the origin cell itself)
        for (let r = rowIndex; r < rowIndex + (cell.rowspan ?? 1); r++) {
          for (let c = colIndex; c < colIndex + (cell.colspan ?? 1); c++) {
            if (r !== rowIndex || c !== colIndex) this.spanTracker.set(`${r}-${c}`, [0, 0]);
          }
        }
      });
    });

    this.initializeHeaderStructure();
  }

  // Get total number of visible columns
  get visibleColumnCount(): number {
    return this.columns.filter((col) => !col.hide).length;
  }

  trackByColumn(index: number, column: any): any {
    return column.field || index;
  }

  trackByItem(index: number, item: any): any {
    return item.id || index;
  }

  private resizingColumn: any = null;
  private startX = 0;
  private startWidth = 0;
  hasResizedColumn = false;
  hasScrollbar = false;
  setHasScrollbar = (event: any) => (this.hasScrollbar = event['horizontal']);

  startResize(event: MouseEvent, column: any) {
    this.hasResizedColumn = true;
    this.resizingColumn = column;
    this.resizingColumn.resizing = true;
    this.startX = event.pageX;
    this.startWidth = column.width || 150;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    if (this.resizingColumn) {
      const diffX = event.pageX - this.startX;
      this.resizingColumn.width = Math.max(50, this.startWidth + diffX); // min width = 50px
    }
  };

  onMouseUp = () => {
    this.resizingColumn.resizing = false;
    this.resizingColumn = null;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    if (!this.selectedRows.length) this.selectedRows.push(this.displayedData[2] ?? []);
  };

  isSelected(item: any) {
    return !!this.selectedRows.find((i) => i[this.uniqueIdKey] === item[this.uniqueIdKey]);
  }

  selectDeselectAll(checked: boolean) {
    if (checked && this.displayedData) this.selectedRows = this.displayedData;
    else this.selectedRows = [];
    this.rowSelectionChange.emit(this.selectedRows);
    if (this.rowSelection) this.rowSelection(this.selectedRows);
  }

  rowSelectionChange_(item: any, checked: boolean) {
    if (!this.multiSelectable) this.selectedRows = [];
    const id_ = () => item[this.uniqueIdKey];
    if (checked) this.selectedRows.push(item);
    else this.selectedRows = this.selectedRows.filter((i) => i[this.uniqueIdKey] !== id_());
    this.rowSelectionChange.emit(this.selectedRows);
    if (this.rowSelection) this.rowSelection(this.selectedRows);
    this.cdr.detectChanges();
  }

  drop(event: CdkDragDrop<GridColumn[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  togglePin(col: GridColumn) {
    if (!col) return;
    if (col.pinned === undefined) col.pinned = 'left';
    else if (col.pinned === 'left') col.pinned = 'right';
    else col.pinned = undefined;
  }

  ngAfterViewInit() {
    // CRITICAL: Subscribe to paginator page changes
    this.subs.add(this.paginator.page.subscribe((e: PageEvent) => this.updateDisplayedData()));

    // Subscribe to sort changes
    if (this.sort) {
      this.subs.add(
        this.sort.sortChange.subscribe(() => {
          this.updateDisplayedData();
          if (this.paginator) this.paginator.firstPage();
        }),
      );
    }

    // Subscribe to data changes
    this.subs.add(
      this.listData.connect().subscribe(() => {
        if (this.paginator) this.paginator.length = this.listData.filteredData.length;
        this.updateDisplayedData();
      }),
    );

    // Initial update
    this.updateDisplayedData();
  }

  displayedData: any[] = [];

  updateDisplayedData(): any {
    const filteredData = this.listData.filteredData;

    if (!this.paginator) return (this.displayedData = filteredData);

    // Apply pagination
    if (!this.isPageable) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      const endIndex = startIndex + this.paginator.pageSize;

      this.displayedData = filteredData.slice(startIndex, endIndex);
    } else this.displayedData = filteredData;

    // Rowspan/colspan tracking is keyed by index within displayedData, so it
    // must be rebuilt whenever the page/sort/filter changes what's shown.
    this.initializeSpanTracking();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  applyFilter(filterValue: string) {
    this.listData.filter = filterValue.trim().toLowerCase();
    // Reset to first page when filtering
    if (this.paginator) this.paginator.firstPage();
    // Update displayed data after filter
    this.updateDisplayedData();
  }

  // Custom filter predicate (optional)
  setupCustomFilter() {
    this.listData.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.name.toLowerCase().includes(searchStr) || data.email.toLowerCase().includes(searchStr)
      );
    };
  }
}
