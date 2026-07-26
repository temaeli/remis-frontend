import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { GridOption } from './data-grid.interfaces';

export const END_USER_HIDDEN_FIELDS = [];

export const DEFAULT_QUERY_KEYS = ['createdByUser', 'currentUser', 'active'];

export const DEFAULT_TABLE_OPTIONS: GridOption[] = [
  { title: 'Active', label: 'Active', queryVariables: { active: true } },
  { title: 'In Active', label: 'In Active', queryVariables: { active: false } },
];

export const ROW_SELECTION_FORMATTER = {
  //TODO: set formatter type
  disabled: (row?: any, index?: number) => false,
  hideCheckbox: (row?: any, index?: number) => false,
};

export const SEARCH_HIDDEN_KEYS = ['sn', 'id', 'actions', 'reportQuery'];

/** Field keys treated as an auto-numbered row index/serial-number column (matches setCellsTemplates). */
export const INDEX_FIELD_KEYS = ['index', 'sno', 'sn', 'no'];

export const MORE_ACTIONS_BTN: Partial<ActionButton> = {
  icon: 'more_actions',
  type: 'icon',
};

export const MORE_BTN = MORE_ACTIONS_BTN;

export const ID_KEYS = ['id', 'uid', 'code'];

export const TABLE_TOGGLES = [
  'queryColumnKeysOnly',
  'expandable as Row Expandable  ',
  'multiSelectable as Multi Selectable',
  'rowSelectable as Row Selectable',
  'hideRowSelectionCheckbox as Hide checkbox ',
  'showToolbar as Show Toolbar',
  'columnHideable as Column Hiding',
  'columnSortable as Column Sorting',
  'columnPinnable as Column Pinning',
  'rowHover as Hover',
  'rowStriped as Striped',
  'showPaginator as Show Paginator',
  'isLoading as Loading Status',
  'columnResizable as Column Resizable',
  'contentEditable as Content Editable',
];

export const GRID_COLUMN_PROPS = [
  'width',
  'minWidth',
  'maxWidth',
  'type',
  'class type(string | function)',
  'summary',
  'description',
  'sortable type(boolean)',
  'showExpand type(boolean)',
  'pinned',
  'left',
  'right',
  'resizable type(boolean)',
  'hide type(boolean)',
  'show type(boolean)',
  'disabled type(boolean)',

  // non native
  'filter type(boolean)',
  'grouped type(boolean)',
  'nested type(boolean)',
  'showIndex type(boolean)',
  'nestedClass',
  'semanticType',

  'preventDefault type(boolean)',
  'stopPropagation type(boolean)',
  'sortSequence type(number)',
  'truncate type(number)',

  'icon',
  'iconClass',
  'valueClass',
  'toolTip',

  'headerTooltip',
];
