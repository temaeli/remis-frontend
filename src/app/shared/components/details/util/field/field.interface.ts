import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FieldLayout } from '../../details.interface';
import { Obj } from '../util.interface';

export interface CompoundParameter {
  object?: any;
  keys?: string[];
  separator?: string;
  hasInitial?: boolean;
  mapper?: (item: CompoundParameter) => string;
}

export interface FieldsSort {
  sortby: 'key' | 'label' | 'value';
  direction?: 'ASC' | 'DESC';
}

export interface ModifierProps {
  childrenKey?: string;
  inherit?: boolean;
  defaults?: Record<string, any>;

  key?: string;
  label?: string;
  lastDotAsName?: boolean;
}

export interface FieldGroup {
  label?: string;
  class?: string;
  keys?: string[];
  slug?: string;
  fields?: Field[];
  object?: any;
  icon?: string;
  hasArray?: boolean;
  fieldsStrings?: string[];
  actionButtons?: ActionButton[];
  groups?: FieldGroup[];

  headerClass?: string;
  labelClass?: string;
  groupsClass?: string;
  showHeader?: boolean;
  groupsContainerClass?: string;
  fieldsContainerClass?: string;
}

export interface DetailGroup {
  label?: string;
  class?: string;
  slug?: string;
  icon?: string;
  labelClass?: string;
  groupsClass?: string;
  labelsClass?: string;
  showHeader?: boolean;
  fields?: KeyField[];
  groups?: DetailGroup[] | FieldsGroupsMap;
  actionButtons?: ActionButton[];
}

export interface FieldsGroupsMap {
  [label: string]: KeyField[] | FieldsGroupsMap;
}

export type FieldsProperties = Record<string, Partial<Field>>;

export type KeyField = string | (Field & FamilyField);

// a field that rep multiple fields have similar props
export interface FamilyField extends Field {
  siblings?: string[];
}

export interface Field {
  key: string;
  icon?: string;
  path?: string;
  type?: FieldType;
  labelKey?: string;
  labelIcon?: string;

  label?: string;
  value?: any;
  hidden?: boolean;
  showFn?: (data: any) => boolean;
  sensitive?: boolean;
  length?: number;
  useTable?: boolean;
  innerVisibleFields?: string[];
  fieldString?: string;
  order?: number;
  index?: number;

  layout?: FieldLayout;
  spread?: boolean;
  pipe?: string;

  nameField?: Field;
  object?: Field;
  fields?: Field[]; //for objects
  fieldGroups?: FieldGroup[]; // for arrays
  visibleKeys?: string[];
  keyFields?: KeyField[];
  sortedKeys?: string[];

  isObject?: boolean;

  class?: string;
  iconClass?: string;
  innerClass?: string;
  outerClass?: string;
  labelClass?: string;
  valueClass?: string;
  mergedClass?: string;

  validBase64?: boolean;
  extension?: string;
  isArray?: boolean;

  showLabel?: boolean;
  expanded?: boolean;
  showColon?: boolean;
  showUnderline?: boolean;

  actionButtons?: ActionButton[];
  listItemButtons?: ActionButton[];
  innerButtons?: ActionButton[];

  itemMapObject?: { key?: string; value?: string };
  itemMapFunction?: (item: any) => any;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
  //
  | 'pdf'
  | 'date'
  | 'image'
  | 'base64'
  | 'comment'
  | 'percentage'
  | 'attachment'
  //
  | 'array'
  | 'stringArray'
  | 'objectArray'
  | 'numberArray'
  | 'booleanArray'
  | 'hexColorCode'
  | 'commentArray'
  | 'attachmentArray';

export type ValueType = 'object' | 'number' | 'array' | 'string' | 'boolean';

export interface FieldsSpecs {
  //per field
  keyFields?: KeyField[];
  visibleKeys?: string[];
  sortedKeys?: string[];
  sortby?: FieldsSort | FieldsSort[];
  undefinedValue?: string;

  fieldGroupsMap?: FieldsGroupsMap; //for fieldstrings
  detailsGroups?: DetailGroup[];

  //global // keypart is full path
  hiddenKeys?: string[];
  fieldsStrings?: string[];
  fieldsProperties?: FieldsProperties;
  autoPipeValues?: boolean;
  hideUndefined?: boolean;

  useTableThres?: number;

  defaults?: Obj;
}
