import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef, SimpleChanges, inject } from '@angular/core';
import { OnChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatLabel, MatHint, MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { Subscription, BehaviorSubject, Observable, isObservable } from 'rxjs';
import { FieldConfig, OptionsVariable } from '../field.interface';
import { MatSelectSearchComponent } from '../mat-select-search/mat-select-search.component';
import { ReplacePipe } from '@shared/pipes/replace.pipe';
import { SearchPipe } from '../mat-select-search/search.pipe';
import { ViewService } from '@shared/services/view.service';
import { mapOptions } from '../form.helpers';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { AnyPipe } from '@shared/pipes/any.pipe';
import { copyObjectValues, cloneDeep, getFields, isValue } from '@core/helpers';
import { FetchService } from '@shared/fetch/fetch.service';

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    // CdkVirtualScrollViewport,
    MatFormFieldModule,
    MatIconModule,
    // ModalHeaderComponent,
    // TruncatePipe,
    ReactiveFormsModule,
    CommonModule,
    // DataTableHybridComponent,
    // AppSettingsPipe,
    MatLabel,
    MatSelectModule,
    MatSelectSearchComponent,
    FormsModule,
    SearchPipe,
    MatHint,
    MatError,
    AnyPipe,
    ReplacePipe,
    IconComponent,
    MergeClassesPipe,
  ], //
  template: `
    <!-- <app-modal-header
      *ngIf="showModalHeader"
      class=" text-uppercase"
      (closeModal)="closeDialog($event)"
      [title]="field.label ?? '' | truncate: 40"
    ></app-modal-header> -->

    <div
      class=" {{
        ' ' + (field.useTable ? 'bg-whitesmoke p-2 rounded-slight' : '')
          | mergeClasses: field.innerClass
      }}"
    >
      <mat-form-field
        class="w-full margin-top w-full flex"
        [class.table-select]="field.useTable"
        [style]="field.innerStyle"
        [hideRequiredMarker]="field.hideRequiredMarker"
        [formGroup]="group"
        [appearance]="field.appearance ?? 'outline'"
      >
        @if (field.icon) {
          <app-icon
            matPrefix
            [icon]="field.icon"
            iconClass="{{ 'mx-3' | mergeClasses: field.iconClass }}"
          />
        }

        <mat-label>{{ field.label ?? '' }}</mat-label>
        <!-- TODO impl table select -->
        <mat-icon *ngIf="field.useTable" matSuffix svgIcon="search" />

        <!-- view in table -->
        <button
          (click)="openTable($event)"
          type="button"
          matSuffix
          mat-icon-button
          *ngIf="field.showToggleTable"
        >
          <mat-icon svgIcon="table" />
        </button>

        <mat-select
          #select
          [placeholder]="field.label ?? ''"
          [formControlName]="field.key"
          [multiple]="field.multiple"
          (selectionChange)="selectionChange($event)"
          (focus)="focus()"
        >
          @if (!field.useTable) {
            <app-mat-select-search
              [reset]="false"
              (ngModelChange)="handleSearch()"
              [(ngModel)]="searchValue"
              ngDefaultControl
              [ngModelOptions]="{ standalone: true }"
            />
          }

          <!-- NORMAL OPTIONS -->
          <ng-container>
            <!-- none option -->
            @if (field.hasNoneOption) {
              <mat-option class="{{ optionClass }} mt-2 bg-white" [value]="null"> NONE </mat-option>
            }

            @for (o of options | search: searchKeys : searchValue; track o; let i = $index) {
              <ng-container
                [ngTemplateOutlet]="optionTpl"
                [ngTemplateOutletContext]="{ option: o, i }"
              />
            }

            <!-- option -->
            <ng-template #optionTpl let-i="i" let-o="option">
              <mat-option
                [hidden]="field.useTable"
                class="{{ optionClass }} bg-white"
                [class.mt-2]="i === 0 && !field.hasNoneOption"
                [value]="o.value ?? o[o.valueKey] ?? o.uid"
              >
                @if (field.removeUnderscore === false) {
                  {{ o.label ?? o[field.labelKey | any] ?? o.title | replace: '_' : ' ' }}
                } @else {
                  {{ o.label ?? o[field.labelKey | any] ?? o.title }}
                }
              </mat-option>
            </ng-template>
          </ng-container>
        </mat-select>

        @if (field.hint) {
          <mat-hint align="start"> {{ field.hint }} </mat-hint>
        }

        @if (getErrorFn(field, group); as error) {
          <mat-error>{{ error }}</mat-error>
        }
      </mat-form-field>

      <!-- <app-data-table-hybrid
        *ngIf="field.useTable"
        [tableData]="options"
        [tableParameter]="field.tableParameter ?? {}"
        [rowSelectable]="true"
        [multiSelectable]="!!field.multiple"
        [hiddenKeys]="['value']"
        [pinFirstColumn]="false"
        [multiSelectionWithClick]="true"
        [showFilters]="true"
        [hasActionsColumn]="false"
        [checkFirstRow]="false"
        [initialSelected]="selectedObjects"
        [uniqueIdKey]="'value'"
        icon="menu"
        appearance="plain"
        noContentClass="my-2 h-full w-full flex items-center justify-center"
        (rowSelectionChange)="setSelectedOptions($event)"
      ></app-data-table-hybrid> -->
    </div>
  `,
  // host: {'class': 'col-md-6'},
  styles: ['.additional-selection { opacity: 0.75; font-size: 0.75em; }'],
})
export class SelectComponent implements OnInit, OnDestroy, OnChanges {
  fs = inject(FetchService);

  field!: FieldConfig;
  group!: FormGroup;
  getErrorFn!: (field: FieldConfig, group: FormGroup) => string;

  @Output() selectedValue = new EventEmitter();
  @Output() scrolledToBottom = new EventEmitter();
  @Output() scrolledToTop = new EventEmitter();

  @ViewChild('select', { static: true }) select!: MatSelect;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll!: CdkVirtualScrollViewport;

  setSelectedOptions(options: any[]) {
    this.select.value = this.field.multiple
      ? options.map((o: any) => o?.value)
      : options?.[0]?.value;
  }

  closeDialog = (close = true) => close && this.dialogRef?.close();

  searchValue = '';
  searchKeys!: string[];
  hasFocus = false;
  hasManyOptions = false;

  options: any[] = [];
  selectedObjects = [];

  visitedPages: (number | undefined)[] = [];
  currentPage = 0;
  totalPages = undefined;
  hasFetched = false;
  fetchTimer = undefined;
  value = undefined;

  optionClass = `scroll-viewport-item border-bottom-faded`;

  sub = new Subscription();
  searchVariables$ = new BehaviorSubject(undefined);

  queryVariables = {};
  showModalHeader = false;

  dialogueData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<SelectComponent>, { optional: true });
  scrollDispatcher = inject(ScrollDispatcher);

  vs = inject(ViewService);
  cdr = inject(ChangeDetectorRef);
  // fs = inject(FetchService)

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit() {
    if (this.dialogueData?.field) copyObjectValues(this, cloneDeep(this.dialogueData), false);
    //get initial items

    const vars = this.field?.optionsVariables;
    const canFetch = vars?.fetchParameter && !this.hasFetched;
    if (canFetch && vars) this.fetchItems(vars);
    else if (this.field.options) this.setItems(this.field.options);

    const searchKeys = this.field.searchKeys;
    this.searchKeys = searchKeys ? searchKeys : ['name'];
  }

  handleSearch() {
    // let x = this.field?.optionsVariables;
    // let search = x?.searchKeys?.length && this.searchValue?.length;
    // clearTimeout(this.fetchTimer);
    // if (!search) return;
    // this.fetchTimer = <any>setTimeout(() => {
    //   if (!x) return;
    //   x.searchStates = x.searchKeys?.map((key) => ({ key: key, value: this.searchValue }));
    //   x.pageableParam = { ...x.pageableParam, first: 0 };
    //   this.fetchItems(x);
    // }, 700);
  }

  async setItems(options: any[] | Observable<any[]>) {
    if (isObservable(options)) this.sub.add(options.subscribe((x) => this.setItems(x)));
    else this.options = mapOptions((options as any), this.field?.optionsVariables);

    if (!isObservable(this.field.options)) this.field.options = this.options;

    //if field has value simulate on change (but don't call onChange during init)
    const value = this.group.get(this.field.key)?.value;
    if (value) this.selectionChange({ value }, false);

    // set selected objects for table use
    let objs = [];
    if (Array.isArray(value)) objs = value.map((v) => this.options.find((o) => o.value === v));
    else objs = [this.options.find((o) => o.value === value)];
    this.selectedObjects = objs.filter((o) => !!o).map((o) => ({ value: o.value })) as any;
    this.cdr.detectChanges();
  }

  selectionChange(event: any, onChange = true) {
    this.searchValue = undefined as any;
    this.options = this.options.concat([]); // dectect changes
    const getValue = (option: any) => option.value ?? option[(this.field.valueKey as any)] ?? option?.uid;

    const object = this.options.find((option) => getValue(option) === event.value);
    this.selectedValue.emit({ value: event.value, field: this.field, object });

    this.field.value = event.value;
    // if present call the onChange method directly with the value
    if (this.field.onChange && onChange) {
      this.field.onChange(event.value, this.group, this.field, object);
    }
  }

  async fetchItems(x: OptionsVariable) {
    const fields = getFields(x.fetchParameter?.variables);
    const observableFields = fields.filter((f) => isObservable(f.value));
    const normalFields = fields.filter((f) => !isObservable(f.value));
    if (observableFields?.length) this.listenToValues(x, observableFields, normalFields);
    else this.loadData(x);
  }

  listenToValues(x: OptionsVariable, obFields: any[], nmFields: any[]) {
    //set all the non observable props
    nmFields.forEach((f) => ((this.queryVariables as any)[f.key] = f.value));

    obFields.forEach((field) => {
      this.sub.add(
        field.value?.subscribe((v: any) => {
          // set all the observable values when found
          if (!Array.isArray(v) && !isValue(v)) return;

          (this.queryVariables as any)[field.key] = v;

          // load data with the last value if all observables are resolved
          if (
            Object.keys(this.queryVariables).length !==
            Object.keys(x.fetchParameter?.variables ?? {}).length
          ) {
            return;
          }

          this.loadData({
            ...x,
            fetchParameter: { ...x?.fetchParameter, variables: this.queryVariables },
          });
        }),
      );
    });
  }

  async loadData(x: OptionsVariable) {
    // don't query same page twice
    // let pageVisited = valueIncludes(<any>x?.pageableParam?.first, <any>this.visitedPages);
    // if (!x?.query || (!this.searchValue && pageVisited)) return;

    // let queryParameter: QueryParameter = {
    //   query: x.query,
    //   queryFieldsKeys: x.queryFieldsKeys ?? [],

    //   searchStates: x?.searchStates,
    //   variables: x?.variables,
    //   notify: false,
    //   ...x?.pageableParam,
    // };

    // let res = await lastValueFrom(this.fs.getResponseFromQuery(queryParameter));
    // let items = this.fs.getDataFromResponse(res);
    // if (x?.filterFunction && Array.isArray(items)) items = items.filter(x.filterFunction);
    // else this.totalPages = getFirstKeyValue(res, 'totalPages');
    // console.log(this.totalPages);

    // this.field.options = items;
    // this.setItems(<any>items);

    // if (<any>x?.pageableParam?.first >= 0 && !x?.filterFunction) {
    //   if (typeof x.pageableParam?.first === 'number') {
    //     this.visitedPages.push(x.pageableParam.first);
    //   }
    // }

    if (
      !x.fetchParameter?.url &&
      !x.fetchParameter?.fetchFn &&
      !x.fetchParameter?.query &&
      !x.fetchParameter?.mutation
    ) {
      return;
    }

    let res = await this.fs.fetch(x.fetchParameter);
    if (res.content) res = res.content;

    if (!Array.isArray(res)) return;

    if (typeof x.filterFunction === 'function') {
      res = res.filter(x.filterFunction);
    }

    this.field.options = res;
    this.setItems((res as any));
    this.hasFetched = true;
  }

  focus() {
    this.hasFocus = true;
  }

  openTable(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const initialField = { ...this.field };

    // open this same instance with some modification
    const selectRef_: Partial<SelectComponent> = {
      // ...this,
      group: this.group,
      showModalHeader: true,
      field: { ...this.field, useTable: true, showToggleTable: false },
    };

    // upon closing the above instance replace current with it

    const dialog = this.vs.openModal(SelectComponent, selectRef_, '90%');

    const selectRef: this = {
      ...dialog.componentInstance,
      showModalHeader: false,
      field: { ...this.field, useTable: false, showToggleTable: initialField.showToggleTable },
    };

    dialog.afterClosed().subscribe((x) => {
      this.group.get(this.field.key)?.setValue(selectRef.select.value);
      this.selectionChange({ value: (this.select.value = selectRef.select.value) }, false);
    });
  }
}
