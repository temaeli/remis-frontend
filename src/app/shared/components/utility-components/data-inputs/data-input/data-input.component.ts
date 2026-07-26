import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { isObservable, Subscription } from 'rxjs';
import { DataInput, DateRangeProps } from '../../inputs.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { InputType, mapOptions } from '@shared/components/generic-form/form.helpers';
import { formatDate_, getFields } from '@shared/components/details/util/field/fields.helper';
import { OptionsVariable } from '@shared/components/generic-form/field.interface';
import { Field } from '@shared/components/details/util/field/field.interface';
import { MergeClassesPipe } from '../../../details/util/class-name/merge-classes.pipe';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SearchPipe } from '../../../generic-form/mat-select-search/search.pipe';
import { DataLabelComponent } from '../../data-label/data-label.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectSearchComponent } from '@shared/components/generic-form/mat-select-search/mat-select-search.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CamelToTitleCasePipe } from '../../../../pipes/camel-to-title-case.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { NumberCounterComponent } from '@shared/components/number-counter/number-counter.component';
import { AnyPipe } from '../../../../pipes/any.pipe';
import { copyObjectValues, camelToSpaced, isValue } from '@core/helpers';
import { SettingsService } from '@core/settings/settings.service';
import { isObject } from '@ngx-translate/core';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { FetchService } from '@shared/fetch/fetch.service';
import { SearchCombinationType } from '@shared/fetch/fetch.interface';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.scss'],
  imports: [
    MergeClassesPipe,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule,
    MatAutocompleteModule,
    SearchPipe,
    DataLabelComponent,
    ActionButtonsComponent,
    IconComponent,
    MatSelectSearchComponent,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    CamelToTitleCasePipe,
    MatRadioModule,
    NumberCounterComponent,
    AnyPipe,
  ],
})
export class DataInputComponent implements OnInit, OnDestroy {
  fs = inject(FetchService);
  cdr = inject(ChangeDetectorRef);
  st = inject(SettingsService);

  @Input() dataInput?: DataInput = undefined;

  @Input() label: any = undefined;
  @Input() labelPosition: 'after' | 'before' = 'before';
  @Input() key = undefined;
  @Input() model: any = undefined;
  @Input() subLabel: string | number | undefined = undefined;
  @Input() animation = settings$.value.animations?.pages;
  @Input() active = false;

  @Input() useDigitCouter = false;
  @Input() digitSize = '18px';

  @Input() fieldClass = '';
  @Input() innerClass = '';
  @Input() iconClass = '';
  @Input() containerClass = '';

  @Input() toolTip: string | undefined = undefined;
  @Input() labelToolTip: string | undefined = undefined;
  @Input() showOptionIndex = false;
  @Input() icon: string | undefined = undefined;

  @Input() prefixIcon: string | undefined = undefined;
  @Input() suffixIcon: string | undefined = undefined;
  @Input() order = 2;

  @Input() value: any = undefined;
  @Input() showLabel = true;
  @Input() format = 'yyyy-MM-dd';
  @Input() placeholder: any = '';
  @Input() maxWidth: string | undefined = '320px';
  @Input() minWidth: string | undefined = undefined;
  @Input() width: string | undefined = undefined;
  @Input() actionButtons: ActionButton[] = [];
  @Input() actionButtonsValue = undefined;

  @Input() type: InputType = 'text';
  @Input() min?: number;
  @Input() max?: number;

  @Input() multiple = true;
  @Input() options: any[] = [];

  @Input() inContainer = true;
  @Input() dateRangeProps: DateRangeProps | undefined = undefined;
  @Input() hasClear = false;
  @Input() optionsVariables?: OptionsVariable = undefined;

  @Output() onLabelClick = new EventEmitter<boolean>(true);
  @Output() onKeyup = new EventEmitter<any>();
  @Output() onClear = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();

  dataFieldClass = `custom-fill hide-arrow bg-none material-form my-0`;
  inputContainerClass = `thin-form-fields mat-form-field-no-margin rounded-lg mat-form-field-no-padding
  inline-flex items-center border border-gray-200/50 bg-gradient-very-faded p-[1px] m-1 mx-0`;

  subs = new Subscription();
  selectedIndex = 0;
  searchValue?: string;

  fetchTimer: any = undefined;
  queryVariables: any = {};
  searchCombinationType = SearchCombinationType.And;

  constructor() {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    if (this.dataInput) copyObjectValues(this, this.dataInput);
    if (this.dataInput?.hasOwnProperty('onClear')) this.hasClear = true;
    // if (this.type == 'select' && !this.suffixIcon) this.suffixIcon = 'edit';
    if (this.type == 'date' && !this.placeholder) this.placeholder = formatDate_(new Date());
    if (this.options.length) this.options = mapOptions(this.options, this.optionsVariables);
    if (this.optionsVariables?.fetchParameter?.query) this.fetchItems(this.optionsVariables);
    if (!this.label && this.key) this.label = camelToSpaced(this.key);

    this.setInitialValue();
    this.selectedIndex = this.options?.findIndex((o) => o.value === this.value);
  }

  setInitialValue() {
    if (this.type == 'date-range') {
      const fromKey = this.dateRangeProps?.fromKey ?? 'startDate';
      const toKey = this.dateRangeProps?.toKey ?? 'endDate';
      this.value = { [fromKey]: this.model?.[fromKey], [toKey]: this.model?.[toKey] };
    } else if (this.model && this.key) this.value = this.model?.[this.key];
  }

  onKeyup_(event: any) {
    this.onKeyup.emit(event.target.value);
  }

  onChange_(value: any) {
    this.value = value;
    if (value && this.type == 'date') value = formatDate_(value, this.format);
    if (this.model && this.key) this.model[this.key] = value;
    if (this.dataInput?.onChange) (this.dataInput?.onChange as any)(value);

    try {
      this.onChange.emit(value);
    } catch (err) {}
  }

  onRangeChange_(value: any, key: string) {
    value = formatDate_(value, this.format);

    if (!isObject(this.value)) this.value = {};
    this.value[key] = value;

    if (this.model && key) this.model[key] = value;
    // if (this.model && this.key) this.model[this.key] = this.value;
    if (this.dataInput?.onChange) (this.dataInput?.onChange as any)(this.value);

    try {
      this.onChange.emit(this.value);
    } catch (err) {}
  }

  onLabelClick_() {
    if (this.dataInput?.onLabelClick) (this.onLabelClick as any)(true);
    else this.onLabelClick.emit(true);
  }

  onClear_() {
    if (this.dataInput?.onClear) (this.onClear as any)(true);
    else this.onClear.emit(true);
  }

  async loadOptions(x: OptionsVariable) {
    if (!x.fetchParameter?.url && !x.fetchParameter?.fetchFn) return;
    let res = await this.fs.fetch(x.fetchParameter);
    if (res.content) res = res.content;
    if (!Array.isArray(res)) return;

    const items = res;
    this.options = mapOptions(items, this.optionsVariables);
    this.cdr.detectChanges();
  }

  async fetchItems(x: OptionsVariable) {
    const fields = getFields(x.fetchParameter?.variables ?? {});
    const observableFields = fields.filter((f: any) => isObservable(f.value));
    const normalFields = fields.filter((f: any) => !isObservable(f.value));
    if (observableFields?.length) this.listenToValues(x, observableFields, normalFields);
    else this.loadOptions(x);
  }

  listenToValues(x: OptionsVariable, obFields: Field[], nmFields: Field[]) {
    //set all the non observable props
    nmFields.forEach((f) => (this.queryVariables[f.key] = f.value));

    obFields.forEach((field) => {
      this.subs.add(
        field.value?.subscribe((v: any) => {
          // set all the observable values when found
          if (!Array.isArray(v) && !isValue(v)) return;
          this.queryVariables[field.key] = v;
          // load data with the last value if all observables are resolved
          if (
            Object.keys(this.queryVariables).length !==
            Object.keys(x.fetchParameter?.variables ?? {}).length
          ) {
            return;
          }

          this.loadOptions({
            ...x,
            fetchParameter: { ...x?.fetchParameter, variables: this.queryVariables },
          });
        }),
      );
    });
  }

  handleSearch() {
    const x = this.optionsVariables;

    const search = x?.fetchParameter?.searchKeys?.length && this.searchValue?.length;
    clearTimeout(this.fetchTimer);
    if (!search) return;

    this.fetchTimer = setTimeout(() => {
      if (!x?.fetchParameter) return;

      x.fetchParameter.searchStates = x?.fetchParameter?.searchKeys?.map((key) => ({
        key,
        value: this.searchValue,
      }));
      // x.pageableParam.searchCombinationType = this.searchCombinationType;

      // x.pageableParam = { ...x.pageableParam, first: 0 };
      this.fetchItems(x);
    }, 700);
  }
}
