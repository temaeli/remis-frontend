import { Option, FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { AssetStatus } from './asset-registry.interface';

/**
 * The form fields every asset registry entity shares. Each entity's form
 * spreads these and appends its own — the parent selector, the land flag,
 * the status, and so on.
 *
 * `assignedNumber` is optional: leave it blank and the backend generates one
 * (`ASTY-…`, `ASCT-…`, `ASST-…`), so it is only worth filling in when the
 * number comes from an existing paper record.
 */
export const assetRegistryBaseFields = (): FieldConfig[] => [
  {
    key: 'uid',
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

/** Labels for {@link AssetStatus}, used by the status selector and status change action. */
export const ASSET_STATUS_OPTIONS: Option[] = [
  { value: AssetStatus.DRAFT, label: 'Draft' },
  { value: AssetStatus.PENDING_VERIFICATION, label: 'Pending Verification' },
  { value: AssetStatus.VERIFIED, label: 'Verified' },
  { value: AssetStatus.AVAILABLE, label: 'Available' },
  { value: AssetStatus.RESERVED, label: 'Reserved' },
  { value: AssetStatus.ALLOCATED, label: 'Allocated' },
  { value: AssetStatus.UNDER_MAINTENANCE, label: 'Under Maintenance' },
  { value: AssetStatus.DISPUTED, label: 'Disputed' },
  { value: AssetStatus.DISPOSED, label: 'Disposed' },
  { value: AssetStatus.INACTIVE, label: 'Inactive' },
];

// Roles as declared on the controllers' @PreAuthorize, seeded by PermissionSeeder
// under the ASSET group.
export const ASSET_TYPE_VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_ASSET_TYPE', 'ROLE_VIEW_ASSET_TYPE'];
export const ASSET_TYPE_UPSERT_PERMISSIONS = ['ROLE_CREATE_ASSET_TYPE', 'ROLE_UPDATE_ASSET_TYPE'];
export const ASSET_TYPE_DELETE_PERMISSIONS = ['ROLE_DELETE_ASSET_TYPE'];

export const ASSET_CATEGORY_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_ASSET_CATEGORY',
  'ROLE_VIEW_ASSET_CATEGORY',
];
export const ASSET_CATEGORY_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_ASSET_CATEGORY',
  'ROLE_UPDATE_ASSET_CATEGORY',
];
export const ASSET_CATEGORY_DELETE_PERMISSIONS = ['ROLE_DELETE_ASSET_CATEGORY'];

export const ASSET_SUBCATEGORY_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_ASSET_SUBCATEGORY',
  'ROLE_VIEW_ASSET_SUBCATEGORY',
];
export const ASSET_SUBCATEGORY_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_ASSET_SUBCATEGORY',
  'ROLE_UPDATE_ASSET_SUBCATEGORY',
];
export const ASSET_SUBCATEGORY_DELETE_PERMISSIONS = ['ROLE_DELETE_ASSET_SUBCATEGORY'];

export const ASSET_VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_ASSET', 'ROLE_VIEW_ASSET'];
export const ASSET_UPSERT_PERMISSIONS = ['ROLE_CREATE_ASSET', 'ROLE_UPDATE_ASSET'];
export const ASSET_DELETE_PERMISSIONS = ['ROLE_DELETE_ASSET'];

export const LAND_REGISTRATION_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_LAND_REGISTRATION',
  'ROLE_VIEW_LAND_REGISTRATION',
];
export const LAND_REGISTRATION_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_LAND_REGISTRATION',
  'ROLE_UPDATE_LAND_REGISTRATION',
];
export const LAND_REGISTRATION_DELETE_PERMISSIONS = ['ROLE_DELETE_LAND_REGISTRATION'];

export const ASSET_VERIFICATION_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_ASSET_VERIFICATION',
  'ROLE_VIEW_ASSET_VERIFICATION',
];
export const ASSET_VERIFICATION_UPSERT_PERMISSIONS = [
  'ROLE_CREATE_ASSET_VERIFICATION',
  'ROLE_UPDATE_ASSET_VERIFICATION',
];
export const ASSET_VERIFICATION_DELETE_PERMISSIONS = ['ROLE_DELETE_ASSET_VERIFICATION'];
