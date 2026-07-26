import { FormGroup } from '@angular/forms';
import { DateFilterFn } from '@angular/material/datepicker';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { Observable, BehaviorSubject } from 'rxjs';
import { ShowWhen, SetWhen } from './form.interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { DetailsParameter } from '../details/details.interface';
import { GridParameter } from '../data-grid/data-grid.interfaces';
import { BaseAttachment } from './attachment/attachment.interface';

export interface Validator {
  name: string;
  validator: any;
  message: string;
}

export interface Option {
  value: any;
  label: string;
}

export interface BaseConfig {
  label?: string;

  dateRangeFirstKey?: string;
  dateRangeFirstLabel?: string;
  dateRangeLastKey?: string;
  dateRangeLastLabel?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  min?: number;
  max?: number;

  key: string;
  attachment?: BaseAttachment;
  hint?: string;
  placeholder?: string;
  inputType?: string;
  /** Max fractional digits for FieldType.decimal. Defaults to 2 when omitted. */
  decimals?: number;
  rows?: number;
  collections?: any;
  type: FieldType;
  searchKeys?: string[];
  value?: any;
  disabled?: boolean;
  visible?: boolean;

  multiple?: boolean;
  hideRequiredMarker?: boolean;
  validations?: Validator[];
  defaultExpanded?: boolean;
  acceptType?: ('.pdf' | '.xls' | '.png' | '.jpg' | '.xlsx' | '.txt' | '.csv' | '.zip')[];

  colorFormat?: 'rgb' | 'hex' | 'hsv' | 'hsl';
  showCancel?: boolean;
  useObservable?: boolean;
  removeUnderscore?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  class?: string;
  valueKey?: string;
  labelKey?: string;
  nameKey?: string;
  itemLabelTemplate?: string;
  attachmentList?: any[];
  attachmentTypes?: BaseAttachment[];
  attachmentsClass?: string;
  searchFields?: string[];
  options?: Observable<Option[]> | Option[] | any[];
  optionsVariables?: OptionsVariable;
  optionsVariablesMapper?: (form: FormGroup, fields: FieldConfig[]) => OptionsVariable;

  fields?: FieldConfig[];
  fieldsClass?: string;
  labelClass?: string;
  base64only?: boolean;
  skipAutoUpload?: boolean;
  asFile?: boolean;
  innerClass?: string;
  style?: string;
  innerStyle?: string;
  hasNoneOption?: boolean;
  useTable?: boolean;
  showToggleTable?: boolean;
  ignoreOnSubmit?: boolean;
  canAddFormGroup?: boolean;

  click?: (formValue?: any) => any;

  entity?: any | Observable<any>;
  tableData?: any[] | Observable<any>;
  detailsParameter?: Partial<DetailsParameter>;
  tableParameter?: Partial<GridParameter>;

  appearance?: MatFormFieldAppearance;
  virtualScroll?: boolean;
  timer?: any;

  removeFieldsWhen?: { keys: string[]; value: any };
  showWhen?: ShowWhen[];
  setWhen?: SetWhen<ExtendedBaseConfig>[];
  disabledWhen?: ShowWhen[];

  isSaving$?: BehaviorSubject<boolean>;

  /** a function return boolean to filter date selections  */
  dateFilter?: DateFilterFn<any>;
  onChange?: (value: any, form?: FormGroup, field?: FieldConfig, object?: any) => any;

  icon?: string;
  iconClass?: string;
  sufficIcon?: string;

  fieldClass?: string;
  inputClass?: string;

  showGroupLabel?: boolean;
  expandable?: boolean;

  valueAsLabel?: boolean;
  showLabel?: boolean;
  itemLabelKey?: string;
  showIndex?: boolean;
  expanded?: boolean;
  itemClass?: string;
  /** Extra CSS classes for one row of a formGroupArray, computed from that row's current value. */
  rowClassFn?: (rowValue: any, index: number) => string;
}

export interface ExtendedBaseConfig extends BaseConfig {
  style_?: (...values: any) => any;
  innerStyle_?: (...values: any) => any;
  class_?: (...values: any) => any;
  innerClass_?: (...values: any) => any;
  value_?: (...values: any) => any;
  disabled_?: (...values: any) => any;
  visible_?: (...values: any) => any;
  label_?: (...values: any) => any;
  validation_?: (...values: any) => any;
  placeholder_?: (...values: any) => any;
  options_?: (...values: any) => any;
  queryVariables_?: (...values: any) => any;
  entity_?: (...values: any) => any;
  hint_?: (...values: any) => any;
  fields_?: (...values: any) => any;
  inputType_?: (...values: any) => any;
  type_?: (...values: any) => any;
}

export interface OptionsVariable {
  mapObject?: { label: string; value: string };
  mapFunction?: any;
  clearFirst?: boolean;
  sortBy?: string;
  labelKey?: string;
  valueKey?: string;
  sortDirection?: 'ASC' | 'DESC';
  filterFunction?: (op: any) => boolean;

  fetchParameter?: FetchParameter;
}

interface KeyedTypes extends BaseConfig {
  type:
    | FieldType.input
    | FieldType.textarea
    | FieldType.dateTime
    | FieldType.date
    | FieldType.monthYear
    | FieldType.checkbox
    | FieldType.number
    | FieldType.attachmentList
    | FieldType.toggle;
  key: string;
}

interface SubmitButton extends BaseConfig {
  type: FieldType.button;
  click?: (formValue?: any) => any;
}

interface Button extends BaseConfig {
  type: FieldType.button;
  click?: (event?: any, form?: FormGroup) => any;
  icon?: string;
  title?: string;
}

interface QuestionAttachment extends BaseConfig {
  type: FieldType.attachment;
  acceptType: ('.pdf' | '.xls' | '.png' | '.jpg' | '.xlsx' | '.txt')[];
  key: string;
}

interface OptionedTypes extends BaseConfig {
  type: FieldType.select | FieldType.radiobutton | FieldType.radioGroup;
  options: Option[] | any;
  key: string;
}
interface QuestionInput extends BaseConfig {
  type: FieldType.input;
  inputType: string;
  key: string;
}

interface OptionedTypes extends BaseConfig {
  type: FieldType.select | FieldType.radiobutton | FieldType.radioGroup;
  options: Observable<any[]> | any[] | Option[] | any;
  key: string;
}

interface QuestionGroupDropDown extends BaseConfig {
  type: FieldType.groupselect;
  groupOptions: Observable<{ groupItems: [] }[]>;
  key: string;
}

interface QuestionPaginatedDropdown extends BaseConfig {
  type: FieldType.paginatedselect;
  key: string;
  searchFields: string[];
  sortField: string;
  query: any;
  optionName: string;
  optionValue: string;
}

interface QuestionPhoneInputDropdown extends BaseConfig {
  type: FieldType.phoneInput;
  key: string;
  searchFields: string[];
  sortField: string;
  query: any;
  optionName: string;
  optionValue: string;
}

interface OtherTypeQuestions extends BaseConfig {
  type:
    | FieldType.input
    | FieldType.textarea
    | FieldType.date
    | FieldType.monthYear
    | FieldType.checkbox
    | FieldType.time24
    | FieldType.time
    | FieldType.editor;
  key: string;
}

interface QuestionPaginatedDropdownOut extends BaseConfig {
  key: string;
}

interface FormTable extends BaseConfig {
  type: FieldType.table;
  tableData?: any[] | Observable<any>;
  // tableParameter?: Partial<DataTableHybridComponent>;
}

export interface FormStepper {
  name?: string;
  icon?: string;
  keys?: string[];
  fields?: FieldConfig[];
  formGroup?: FormGroup;

  value?: Record<string, any>;
  optional?: boolean;
  visible?: boolean;
  showWhen?: ShowWhen[];

  fieldsClass?: string;
  submitLabel?: string;

  // proceedAction?: ActionCreator<string, Creator>;
  onSubmit?: (data: any, step?: FormStepper) => any;
}

export type FieldConfig =
  | KeyedTypes
  | QuestionAttachment
  | QuestionInput
  | OptionedTypes
  | SubmitButton
  | QuestionPaginatedDropdownOut
  | QuestionPhoneInputDropdown
  | OtherTypeQuestions
  | QuestionPaginatedDropdown
  | QuestionGroupDropDown
  | OptionedTypes
  | FormTable
  | Button;

export interface ObserverParameter {
  key?: string;
  observedKeys: string[];
  valueMapper: (...value: any) => any;
  useObservable: boolean;
  path?: string;
  formIndex?: number;
  observable?: BehaviorSubject<any>;
  map: Record<string, any>;
  values?: any[];
  value?: any;
  delay?: number;
}

export interface ModifierProps {
  childrenKey?: string;
  inherit?: boolean;
  defaults?: Record<string, any>;

  key?: string;
  label?: string;
  lastDotAsName?: boolean;
}

export interface FormChangeDetail {
  key: string;
  value?: any;
  form?: FormGroup;
  originalForm?: FormGroup;
  observers?: ObserverParameter[];
  fields?: FieldConfig[];
}

export interface FormFieldEvent {
  key?: string;
  value?: any;
  event?: Event;
  form?: FormGroup;
  field?: FieldConfig;
  object?: any;
}

export enum FieldType {
  input = 'input',
  toggle = 'toggle',
  toggleButtonsGroup = 'toggleButtonsGroup',
  textarea = 'textarea',
  dateRangeFirstKey = 'dateRangeFirstKey',
  dateRangeFirstLabel = 'dateRangeFirstLabel',
  dateRangeLastKey = 'dateRangeLastKey',
  dateRangeLastLabel = 'dateRangeLastLabel',
  radiobutton = 'radiobutton',
  radioGroup = 'radioGroup',
  select = 'select',
  date = 'date',
  dateTime = 'dateTime',
  time = 'time',
  time24 = 'time24',
  monthYear = 'monthYear',
  submit = 'submit',
  checkbox = 'checkbox',
  attachment = 'attachment',
  number = 'number',
  attachmentList = 'attachmentList',
  phoneInput = 'phoneInput',
  editor = 'editor',
  paginatedselect = 'paginatedselect',
  groupselect = 'groupselect',
  formGroupArray = 'formGroupArray',
  formGroup = 'formGroup',
  table = 'table',
  button = 'button',
  label = 'label',
  details = 'details',
  multiple_select = 'multiple_select',
  decimal = 'decimal',
  // color = 'color',
}
