import {
  DetailGroup,
  FieldsGroupsMap,
  FieldsProperties,
  FieldsSort,
  KeyField,
} from './util/field/field.interface';

export type FieldLayout = 'table' | 'list' | 'inline-list' | 'palletes';

export interface DetailsParameter {
  title?: string;
  animation?: string;
  sortby?: FieldsSort | FieldsSort[];
  entity?: any;

  titleClass?: string;

  maxTableColumns?: number;
  defaultArraysName?: string;
  moreDetailsFields?: string[];

  tableViewDetailsClicks?: number;

  showHeader?: boolean;
  showColon?: boolean;
  visibleKeys?: string[];
  keyFields?: KeyField[];
  hiddenKeys?: string[];
  hiddenKeysExtra?: string[];
  showFieldsInGroups?: boolean;
  fieldsGroupsMap?: FieldsGroupsMap;
  fieldsGroups?: any | { name: string; keys: string[] }[];
  detailsGroups?: DetailGroup[];
  showFirstGroupHeader?: boolean;

  viewInnerObjects?: boolean;
  hideSensitiveFields?: boolean;
  viewDetailsFields?: string[];

  expandLists?: boolean;
  showArraysHeaders?: boolean;
  stringArrayIndexClass?: string;

  addAutoPipe?: boolean;

  headerClass?: string;

  hasLeftFieldsMark?: boolean;
  leftFieldMarkOffset?: string;
  iconsClass?: string;
  dividerClass?: string;

  // [''] | [{key:'', fields}] for objects withs arrays
  fieldsInnerKeys?: any[] | { key: string; fields: [] }[];
  hideArrays?: boolean;
  innerArraysClass?: string;

  showGroupLabels?: boolean;
  showUnderlines?: boolean;
  showEmptyArrays?: boolean;

  layout?: FieldLayout;
  labelsClass?: string;
  valuesClass?: string;

  groupsContainerClass?: string;
  groupsClass?: string;
  fieldsClass?: string;
  fieldsInnerClass?: string;
  hideUndefined?: boolean;

  arraysFieldsClass?: string;

  tableHeadersClass?: string;
  tableCellsClass?: string;
  tableIndexCellsClass?: string;
  tableHeaderCellsClass?: string;
  tableRowsClass?: string;

  innerClass?: string;
  groupLabelsClass?: string;
  showUndefined?: boolean;
  fieldsProperties?: FieldsProperties;
  fieldsStrings?: string[];
}
