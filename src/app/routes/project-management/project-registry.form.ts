import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

/**
 * The form fields every project registry entity shares. Each entity's form
 * spreads these and appends its own — the parent selector, the coordinates, the
 * amount, and so on.
 *
 * `assignedNumber` is optional: leave it blank and the backend generates one
 * (`PRCT-…`, `PRJ-…`, `COST-…`), so it is only worth filling in when the number
 * comes from an existing paper record.
 */
export const projectRegistryBaseFields = (): FieldConfig[] => [
  // Hidden carrier for the record identifier, seeded from `id` when editing and
  // left blank when creating. Without it the backend cannot tell an update from
  // a create, and every edit would save as a new record.
  {
    key: 'id',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'name',
    label: 'Name',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'assignedNumber',
    label: 'Assigned Number',
    type: FieldType.input,
    hint: 'Leave blank to generate automatically',
    class: 'col-span-full',
  },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    rows: 3,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

/** A latitude/longitude pair, used by projects, cost types and master plans. */
export const coordinateFields = (): FieldConfig[] => [
  {
    key: 'latitude',
    label: 'Latitude',
    type: FieldType.input,
    inputType: 'number',
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'longitude',
    label: 'Longitude',
    type: FieldType.input,
    inputType: 'number',
    validations: [VALIDATOR_REQUIRED],
  },
];

/**
 * Maps a form value onto the mutation input.
 *
 * The form carries the identifier as `id`, matching the records these screens
 * read. The backend input still names it `uid` — a blank one creates, a populated
 * one updates — so it is renamed here, at the single point where the two meet.
 */
export const toProjectRegistryInput = (value: Record<string, unknown>) => {
  const { id, ...rest } = value ?? {};
  return id ? { ...rest, uid: id } : rest;
};

//  Permissions — mirrors the sets PermissionSeeder generates per entity.
export const PROJECT_CATEGORY_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_PROJECT_CATEGORY',
  'ROLE_VIEW_PROJECT_CATEGORY',
];
export const PROJECT_CATEGORY_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_PROJECT_CATEGORY',
  'ROLE_UPDATE_PROJECT_CATEGORY',
];
export const PROJECT_CATEGORY_DELETE_PERMISSIONS = ['ROLE_DELETE_PROJECT_CATEGORY'];

export const PROJECT_SUBCATEGORY_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_PROJECT_SUBCATEGORY',
  'ROLE_VIEW_PROJECT_SUBCATEGORY',
];
export const PROJECT_SUBCATEGORY_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_PROJECT_SUBCATEGORY',
  'ROLE_UPDATE_PROJECT_SUBCATEGORY',
];
export const PROJECT_SUBCATEGORY_DELETE_PERMISSIONS = ['ROLE_DELETE_PROJECT_SUBCATEGORY'];

export const PROJECT_VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_PROJECT', 'ROLE_VIEW_PROJECT'];
export const PROJECT_UPSERT_PERMISSIONS = ['ROLE_CREATE_PROJECT', 'ROLE_UPDATE_PROJECT'];
export const PROJECT_DELETE_PERMISSIONS = ['ROLE_DELETE_PROJECT'];

export const PROJECT_CONNECTION_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_PROJECT_CONNECTION',
  'ROLE_VIEW_PROJECT_CONNECTION',
];
export const PROJECT_CONNECTION_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_PROJECT_CONNECTION',
  'ROLE_UPDATE_PROJECT_CONNECTION',
];
export const PROJECT_CONNECTION_DELETE_PERMISSIONS = ['ROLE_DELETE_PROJECT_CONNECTION'];

export const PROJECT_ASSET_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_PROJECT_ASSET',
  'ROLE_VIEW_PROJECT_ASSET',
];
export const PROJECT_ASSET_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_PROJECT_ASSET',
  'ROLE_UPDATE_PROJECT_ASSET',
];
export const PROJECT_ASSET_DELETE_PERMISSIONS = ['ROLE_DELETE_PROJECT_ASSET'];

export const COST_TYPE_VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_COST_TYPE', 'ROLE_VIEW_COST_TYPE'];
export const COST_TYPE_UPSERT_PERMISSIONS = ['ROLE_CREATE_COST_TYPE', 'ROLE_UPDATE_COST_TYPE'];
export const COST_TYPE_DELETE_PERMISSIONS = ['ROLE_DELETE_COST_TYPE'];

export const COST_VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_COST', 'ROLE_VIEW_COST'];
export const COST_UPSERT_PERMISSIONS = ['ROLE_CREATE_COST', 'ROLE_UPDATE_COST'];
export const COST_DELETE_PERMISSIONS = ['ROLE_DELETE_COST'];

export const MASTER_PLAN_VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_MASTER_PLAN', 'ROLE_VIEW_MASTER_PLAN'];
export const MASTER_PLAN_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_MASTER_PLAN',
  'ROLE_UPDATE_MASTER_PLAN',
];
export const MASTER_PLAN_DELETE_PERMISSIONS = ['ROLE_DELETE_MASTER_PLAN'];
