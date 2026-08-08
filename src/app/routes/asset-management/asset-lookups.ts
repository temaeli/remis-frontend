import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import {
  defineLookup,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  Lookup,
  LookupModule,
} from '@shared/lookup';

/**
 * The asset registry, every table of it.
 *
 * Like the project registry these are all `CoreNamedEntity` in the DBA-owned
 * `remis_core_schema` on the same five operations, so they are configs rather
 * than four files each. The one thing this module has that the others do not is
 * a status an asset moves through, which is a mutation of its own.
 */

/** Lifecycle status of an asset — mirrors `AssetStatus` on the backend. */
export enum AssetStatus {
  DRAFT = 'DRAFT',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  ALLOCATED = 'ALLOCATED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DISPUTED = 'DISPUTED',
  DISPOSED = 'DISPOSED',
  INACTIVE = 'INACTIVE',
}

export const ASSET_STATUS_OPTIONS: Option[] = Object.values(AssetStatus).map((value) => ({
  value,
  label: getDisplayName(value) as string,
}));

/** A select over another registry table, which all of these key on `id`. */
const parentSelect = (key: string, label: string, query: unknown, hint?: string): FieldConfig => ({
  key,
  label,
  hint,
  type: FieldType.select,
  optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query } },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/** A yes/no column, the shape the registry's flags take on a list. */
const flagColumn = (field: string, header?: string): GridKeyColumn => ({
  field,
  header,
  valueFn: (row) => (row?.[field] ? 'Yes' : 'No'),
  valueClassMapper: (row) => (row?.[field] ? 'text-success' : 'text-danger'),
});

//  The taxonomy that classifies the register.

export const ASSET_TYPE = defineLookup({
  slug: 'asset-types',
  entity: 'AssetType',
  entityPlural: 'AssetTypes',
  permission: 'ASSET_TYPE',
  label: 'Asset Type',
  pluralLabel: 'Asset Types',
  subtitle: 'Broadest grouping of assets — land types carry land registrations',
  icon: 'category',
  extraGqlFields: `
  forLand
`,
  extraFields: [
    {
      key: 'forLand',
      label: 'Land Asset Type',
      type: FieldType.toggle,
      hint: 'Only assets under a land type may hold a land registration',
      class: 'col-span-full',
    },
  ],
  extraColumns: [flagColumn('forLand', 'For Land')],
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => ASSET_CATEGORY, ASSET_CATEGORIES_BY_TYPE, {
      assetTypeUid: record?.id,
    }),
  ],
});

export const ASSET_CATEGORY = defineLookup({
  slug: 'asset-categories',
  entity: 'AssetCategory',
  entityPlural: 'AssetCategories',
  permission: 'ASSET_CATEGORY',
  label: 'Asset Category',
  pluralLabel: 'Asset Categories',
  subtitle: 'Divisions of an asset type',
  icon: 'list',
  extraGqlFields: `
  assetType {
    ${lookupRefGqlFields}
    forLand
  }
`,
  extraFields: [parentSelect('assetTypeUid', 'Asset Type', ASSET_TYPE.gql.all)],
  extraColumns: ['assetType.name as Type'],
  toModel: (data) => ({ assetTypeUid: data?.assetType?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => ASSET_SUBCATEGORY, ASSET_SUBCATEGORIES_BY_CATEGORY, {
      assetCategoryUid: record?.id,
    }),
  ],
});

export const ASSET_SUBCATEGORY = defineLookup({
  slug: 'asset-subcategories',
  entity: 'AssetSubcategory',
  entityPlural: 'AssetSubcategories',
  permission: 'ASSET_SUBCATEGORY',
  label: 'Asset Subcategory',
  pluralLabel: 'Asset Subcategories',
  subtitle: 'Divisions of an asset category — every asset is registered under one',
  icon: 'list',
  extraGqlFields: `
  assetCategory {
    ${lookupRefGqlFields}
    assetType {
      ${lookupRefGqlFields}
    }
  }
`,
  extraFields: [parentSelect('assetCategoryUid', 'Asset Category', ASSET_CATEGORY.gql.all)],
  extraColumns: ['assetCategory.name as Category'],
  toModel: (data) => ({ assetCategoryUid: data?.assetCategory?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => ASSET, ASSETS_BY_SUBCATEGORY, {
      assetSubcategoryUid: record?.id,
    }),
  ],
});

//  The operational register.

export const ASSET = defineLookup({
  slug: 'assets',
  entity: 'Asset',
  entityPlural: 'Assets',
  permission: 'ASSET',
  label: 'Asset',
  pluralLabel: 'Assets',
  subtitle: 'Registered assets',
  icon: 'suitcase',
  extraGqlFields: `
  status
  reserved
  assetSubcategory {
    ${lookupRefGqlFields}
    assetCategory {
      ${lookupRefGqlFields}
      assetType {
        ${lookupRefGqlFields}
        forLand
      }
    }
  }
`,
  extraFields: [
    parentSelect('assetSubcategoryUid', 'Asset Subcategory', ASSET_SUBCATEGORY.gql.all),
    {
      key: 'reserved',
      label: 'Reserved',
      type: FieldType.toggle,
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    'assetSubcategory.name as Sub Category',
    { field: 'status', header: 'Status', valueFn: (row) => getDisplayName(row?.status) },
    flagColumn('reserved'),
  ],
  toModel: (data) => ({ assetSubcategoryUid: data?.assetSubcategory?.id }),
  extraActions: (comp, lookup) => [assetStatusBtn(comp, lookup)],
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => LAND_REGISTRATION, LAND_REGISTRATIONS_BY_ASSET, {
      assetUid: record?.id,
    }),
  ],
});

export const LAND_REGISTRATION = defineLookup({
  slug: 'land-registrations',
  entity: 'LandRegistration',
  entityPlural: 'LandRegistrations',
  permission: 'LAND_REGISTRATION',
  label: 'Land Registration',
  pluralLabel: 'Land Registrations',
  subtitle: 'Registrations held against land assets',
  icon: 'land_administration',
  extraGqlFields: `
  asset {
    ${lookupRefGqlFields}
    status
  }
`,
  extraFields: [
    // Every asset is listed, but the backend rejects any whose type is not
    // flagged forLand — the error comes back on submit.
    parentSelect('assetUid', 'Asset', ASSET.gql.all),
  ],
  extraColumns: ['asset.name as Asset'],
  toModel: (data) => ({ assetUid: data?.asset?.id }),
});

/**
 * How a piece of land is used. Owned by the asset registry, which already owns
 * land, and classified alongside the taxonomy rather than under it — nothing
 * points at a land use, so it has no parent and no children.
 */
export const LAND_USE = defineLookup({
  slug: 'land-uses',
  entity: 'LandUse',
  entityPlural: 'LandUses',
  permission: 'LAND_USE',
  label: 'Land Use',
  pluralLabel: 'Land Uses',
  subtitle: 'How a piece of land is put to use',
  icon: 'land_administration',
  extraGqlFields: `
  landUses
`,
  extraFields: [
    {
      key: 'landUses',
      label: 'Land Use Value',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [{ field: 'landUses', header: 'Land Use Value' }],
});

export const ASSET_VERIFICATION = defineLookup({
  slug: 'asset-verifications',
  entity: 'AssetVerification',
  entityPlural: 'AssetVerifications',
  permission: 'ASSET_VERIFICATION',
  label: 'Asset Verification',
  pluralLabel: 'Asset Verifications',
  subtitle: 'Verifications recorded against assets',
  icon: 'check',
  extraColumns: ['createdAt'],
});

//  The queries and the mutation that are this module's own. Exported so they can
//  be checked against the schema alongside the generated ones.

export const ASSET_CATEGORIES_BY_TYPE = gql`
  query assetCategoriesByType($assetTypeUid: String) {
    assetCategoriesByType(assetTypeUid: $assetTypeUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const ASSET_SUBCATEGORIES_BY_CATEGORY = gql`
  query assetSubcategoriesByCategory($assetCategoryUid: String) {
    assetSubcategoriesByCategory(assetCategoryUid: $assetCategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const ASSETS_BY_SUBCATEGORY = gql`
  query assetsBySubcategory($assetSubcategoryUid: String) {
    assetsBySubcategory(assetSubcategoryUid: $assetSubcategoryUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const LAND_REGISTRATIONS_BY_ASSET = gql`
  query landRegistrationsByAsset($assetUid: String) {
    landRegistrationsByAsset(assetUid: $assetUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const UPDATE_ASSET_STATUS = gql`
  mutation updateAssetStatus($uid: String, $status: AssetStatus) {
    updateAssetStatus(uid: $uid, status: $status) {
      ${responseGqlFields(lookupChildGqlFields)}
    }
  }
`;

/**
 * An asset's status moves through a lifecycle rather than being edited, so the
 * backend gives it a mutation of its own and the screen a button of its own.
 */
function assetStatusBtn(comp: BaseComponent, lookup: LookupModule): ActionButton {
  return {
    icon: 'sync',
    label: 'Change Status',
    click: (data: Lookup) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { status: data?.status },
        title: `Change Status — ${data?.name ?? ''}`,
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: FieldType.select,
            options: ASSET_STATUS_OPTIONS,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { uid: data?.id, status: value?.status },
            mutation: UPDATE_ASSET_STATUS,
            successFn: (res) => {
              lookup.changed$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: lookup.upsertPermissions,
  };
}

/** The operational screens, which lead the menu. */
export const ASSET_LOOKUPS: LookupModule[] = [ASSET, LAND_REGISTRATION, ASSET_VERIFICATION];

/** The taxonomy that classifies them, grouped behind one menu and kept last. */
export const ASSET_CONFIGURATION_LOOKUPS: LookupModule[] = [
  ASSET_TYPE,
  ASSET_CATEGORY,
  ASSET_SUBCATEGORY,
  LAND_USE,
];
