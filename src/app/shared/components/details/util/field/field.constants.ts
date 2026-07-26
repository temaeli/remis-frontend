import { Obj } from '../util.interface';
import { CompoundParameter } from './field.interface';

export const ANIMATION = 'move-left';
export const ANIMATION_MODAL = 'fade-on'; // avoid transformation as they will disable been draggable
export const ANIMATION_BUTTON = 'move-left';
export const ANIMATION_ICON = 'scale-up';

export const FIELD_PROPS = [
  'type type(string)', ////// number,string,boolean,array,object,null,-----? date
  'semanticType type(string)', //('attachmentField','commentField','commentArray','attachmentArray','percentage','image' 'pdf)

  'name type(string)',
  'pipe type(string)',
  'layout type(string)',

  'icon type(string)',
  'toolTip type(string)',

  'class mergeWith(fieldsClass) type(string)',
  'iconClass mergeWith(iconsClass) type(string)',
  'valueClass mergeWith(valuesClass) type(string)',
  'innerClass mergeWith(fieldsInnerClass) type(string)',
  'outerClass mergeWith(fieldsOuterClass) type(string)',
  'labelClass mergeWith(labelsClass) type(string)',

  'nameKey type(string)',
  'spread type(boolean)', // spread inner fields to parrent field
  'sensitive type(boolean)',

  'expanded type(boolean)',
  'hidden type(boolean)',
  // 'showFn type(string)', //TODO : parse string fn
  'showLabel type(boolean)',
  'showColon type(boolean)',
  'showUnderline type(boolean)',

  'truncate type(number)',
  'order type(number)',

  'layout type(string)',
  'visibleKeys type(stringArray)',
  'sortedKeys type(stringArray)',
  'validBase64 type(boolean)',
  'extension type(string)',
];

// let x = 'detail showFn((type === WATER_LICENCE) || tin)'

export const GROUP_PROPS = [
  'class',
  'fieldsClass',
  'titleClass',
  'headerClass',
  'fieldsContainerClass',
  'groupsContainerClass',
  'icon',
  'showHeader type(boolean)',
  'slug',
  'labelClass',
  'labelsClass',
  'groupsClass',
  'headerClass',
];

//. for exact match e.g(title.), * for likeness (nam*)
export const KEYS_DISPLAY_NAMES_MAP = ['createdAt as Created Date', 'updatedAt as Last Update'];

export const HELPER_KEYS = ['typename', '__typename', '$', 'mod'];

export const NAME_KEYS = [
  'displayName',
  'fullName',
  'display',
  'name',
  'title',
  'label',
  'message',
  'status',
  'comment',
  'details',
  'plant',
  'pipeline',
  'attachmentTitle',
  'facilityName',
  'companyName',
  'description',
  'value',
  'amount',
  'type',
  'location',
  'council',
  'district',
  'office',
  'permission',
  'class',
  'data',
  'user',
];

export const DATE_KEYS_SUFFIX = ['at', 'date'];

export const STATUS_KEYS = [];

export const USE_TABLE_THRES = 11;

export const DEFAULT_TOP_KEYS = [
  'name',
  'title',
  'user',
  'type',
  'category',
  'code',
  'status',
  'level',
  'role',
];

export const BASE_KEYS = [
  'id',
  'uid',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deleted',
  'active',
  'migrated',
];

export const SENSITIVE_KEYS = ['typename', '__typename', 'id', 'uid'];

export const PERCENTAGE_KEYS = ['score', 'weight', 'percent', 'percentage'];

export const USER_ID_KEYS = ['userId', 'userUid'];

export const COMMENT_KEYS = ['comment', 'remarks', 'notes', 'review', 'feedback'];

export const NUMBER_KEYS = [
  'price',
  'amount',
  'size',
  'value',
  'balance',
  'totalAmmount',
  'total',
  'cost',
  'quantity',
  'age',
  'count',
  'score',
  'weight',
  'percent',
  'percentage',
];

export const ATTACHMENT_KEYS = [
  'pdf',
  'fileName',
  'filePath',
  'mapFile',
  'reportFile',
  'path',
  'proofAttachment',
  'evidence',
  'cvAttachment',
  'manualUrl',
  'documentUrl',
];

export const COMPOUND_NAMED_KEYS: CompoundParameter[] = [
  { keys: ['firstName', 'middleName', 'lastName'], separator: ' ' },
  { keys: ['chainLevel', 'orderIndex'], separator: ' : Level ' },
];

export const UNDEFINED_VALUES = ['--', 'N/A', undefined];

export const FORMAT_THOUSANDS_KEYS = ['price', 'amount', 'size', 'value'];

export const DATE_KEYS = [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'startDate',
  'endDate',
  'dateOfBirth',
  'at',
  'date',
  'dob',
  'timestamp',
  'requestedAt',
  'expireDate',
];

export const DEFAULT_FIELD_STRINGS = [
  `description,messageContent,comment,remarks class(col-span-full) order(100)`,
  `${DATE_KEYS.join(', ')} pipe(date)`,
  `${NUMBER_KEYS.join(', ')} pipe(number)`,
];

export const HIGHLIGHT = 'bg-light p-1 px-2 pt-2 rounded-r-md border-left-primary';

export const HIGHLIGHT_WARNING = 'bg-light p-1 px-2 pt-2 rounded-r-md border-left-warning';

export const HIGHLIGHT_DANDER = 'bg-light p-1 px-2 pt-2 rounded-r-md border-left-danger';

export const HIGHLIGHT_SUCCESS = 'bg-light p-1 px-2 pt-2 rounded-r-md border-left-success';

export const SUFFIX_PIPE_MAP: Obj = {
  Date: 'date',
  date: 'date',
  Amount: 'number',
  amount: 'number',
  At: 'date',
  dateOfBirth: 'date',
};
