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
import { assetProjectsPanel } from '@routes/project-management/project-asset';
import { recordLinkPanels } from '@routes/unit-management/unit-links';
import { coreAttachmentPanels } from '@routes/settings/attachment-lookups';
import {
  encumbranceFields,
  landRegistrationGqlFields,
  landRegistrationSteps,
  landRegistrationToModel,
  locationCascadeFields,
  ownerFields,
  parcelFields,
  tenureFields,
} from './land-registration';
import {
  landRegistrationEncumbrancePanel,
  landRegistrationOwnerPanel,
} from './land-registration-panels';
import {
  defineLookup,
  entityLinkPanels,
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

/**
 * The survey point the located tables carry. Both are required and stored as
 * `numeric(9,6)`, so the controls round to six places to match rather than
 * letting the database truncate, and the hints mirror the CHECK constraints.
 */
const coordinateFields = (): FieldConfig[] => [
  {
    key: 'latitude',
    label: 'Latitude',
    hint: 'Between -90 and 90',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'longitude',
    label: 'Longitude',
    hint: 'Between -180 and 180',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
];

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
    ...recordLinkPanels(comp, 'Asset', record?.id),
    lookupChildPanel(comp, () => LAND_REGISTRATION, LAND_REGISTRATIONS_BY_ASSET, {
      assetUid: record?.id,
    }),
    assetProjectsPanel(comp, record?.id),
    ...assetLinkPanels(comp, record?.id),
    ...coreAttachmentPanels(comp, 'asset', record?.id),
  ],
});

export const LAND_REGISTRATION = defineLookup({
  slug: 'land-registrations',
  entity: 'LandRegistration',
  entityPlural: 'LandRegistrations',
  permission: 'LAND_REGISTRATION',
  label: 'Land Registration',
  pluralLabel: 'Land Registrations',
  subtitle: 'Registered parcels — their title, tenure, owners and encumbrances',
  icon: 'land_administration',
  extraGqlFields: landRegistrationGqlFields,
  extraFields: [
    // Every asset is listed, but the backend rejects any whose type is not
    // flagged forLand — the error comes back on submit.
    parentSelect('assetUid', 'Asset', ASSET.gql.all),
    ...locationCascadeFields(),
    ...coordinateFields(),
    ...parcelFields(),
    ...tenureFields(),
    ownerFields(),
    encumbranceFields(),
  ],
  // Twenty-odd required fields is a wall as one page. The steps group them into
  // six questions and give the location cascade a page of its own, so revealing
  // ward and street as you go reads as progress rather than the form growing.
  formSteppers: landRegistrationSteps(),
  stepperAppearance: 'fill',
  // Six steps, and the widest of them puts four identifiers and two areas on one
  // page. MatDialog
  // caps dialogs at 80vw, so the ceiling has to be lifted too or the width below
  // is ignored.
  modalWidth: '90%',
  modalMaxWidth: '1200px',
  modalMaxHeight: '90vh',
  // Owners and encumbrances are on the form as well as here. The form takes what
  // is known while the title is being entered and replaces the whole set; these
  // tabs take what arrives afterwards — a co-owner, a caveat lodged months later
  // — one row at a time.
  extraContents: (comp, record) => [
    landRegistrationOwnerPanel(comp, record?.id),
    landRegistrationEncumbrancePanel(comp, record?.id),
  ],
  extraColumns: [
    'asset.name as Asset',
    'parcelNumber as Parcel',
    'titleNumber as Title',
    'street.name as Street',
    { field: 'tenureType', header: 'Tenure', valueFn: (row) => getDisplayName(row?.tenureType) },
  ],
  toModel: landRegistrationToModel,
});

/**
 * How an asset entered the register: what it cost, when, and where.
 *
 * Carries the coordinate pair the location hierarchy uses, with the same
 * `numeric(9,6)` type and the same bounds, so the controls round to six places
 * to match rather than letting the database truncate.
 */
export const ACQUISITION = defineLookup({
  slug: 'acquisitions',
  entity: 'Acquisition',
  entityPlural: 'Acquisitions',
  permission: 'ACQUISITION',
  label: 'Acquisition',
  pluralLabel: 'Acquisitions',
  subtitle: 'How an asset was acquired, and for how much',
  icon: 'shopping_cart',
  extraGqlFields: `
  acquisitionValue
  acquisitionDate
  latitude
  longitude
  asset {
    ${lookupRefGqlFields}
    status
  }
`,
  extraFields: [
    parentSelect('assetUid', 'Asset', ASSET.gql.all),
    {
      key: 'acquisitionValue',
      label: 'Acquisition Value',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'acquisitionDate',
      label: 'Acquisition Date',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    ...coordinateFields(),
  ],
  extraColumns: [
    'asset.name as Asset',
    'acquisitionValue',
    { field: 'acquisitionDate', header: 'Acquired' },
  ],
  toModel: (data) => ({ assetUid: data?.asset?.id }),
});

/**
 * How an asset left the register. The counterpart to {@link ACQUISITION}, but
 * without its value or coordinate pair — the table records only when, and which
 * asset. Nothing here moves the asset's own status; that stays a separate action.
 */
export const DISPOSE = defineLookup({
  slug: 'disposes',
  entity: 'Dispose',
  entityPlural: 'Disposes',
  permission: 'DISPOSE',
  label: 'Disposal',
  pluralLabel: 'Disposals',
  subtitle: 'How an asset left the register',
  icon: 'delete_sweep',
  extraGqlFields: `
  disposedAt
  asset {
    ${lookupRefGqlFields}
    status
  }
`,
  extraFields: [
    parentSelect('assetUid', 'Asset', ASSET.gql.all),
    {
      key: 'disposedAt',
      label: 'Disposed At',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: ['asset.name as Asset', { field: 'disposedAt', header: 'Disposed' }],
  toModel: (data) => ({ assetUid: data?.asset?.id }),
});

/** The people register, which the valuer points at — bio_data, not a login. */
const ALL_PEOPLE = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

/**
 * What an asset has been valued at, by whom, where and when.
 *
 * Unlike an acquisition or a disposal this does not point at an asset: which
 * assets a valuation covers is `assets_valuations`, so one valuation can cover
 * several. It appears as a panel on the asset and as a screen of its own here.
 */
export const VALUATION = defineLookup({
  slug: 'valuations',
  entity: 'Valuation',
  entityPlural: 'Valuations',
  permission: 'VALUATION',
  label: 'Valuation',
  pluralLabel: 'Valuations',
  subtitle: 'What an asset has been valued at, and by whom',
  icon: 'linear_scale',
  extraGqlFields: `
  value
  valuedAt
  latitude
  longitude
  valuer {
    id
    uid: id
    name
  }
`,
  extraFields: [
    {
      key: 'value',
      label: 'Value',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'valuedAt',
      label: 'Valued At',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    parentSelect('valuerUid', 'Valuer', ALL_PEOPLE),
    ...coordinateFields(),
  ],
  extraColumns: [
    'valuer.name as Valuer',
    { field: 'value', header: 'Value' },
    { field: 'valuedAt', header: 'Valued' },
  ],
  toModel: (data) => ({ valuerUid: data?.valuer?.id }),
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'Valuation', record?.id),
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
  // The join read from this side — which units this applies to.
  extraContents: (comp, record) => recordLinkPanels(comp, 'LandUse', record?.id),
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

/**
 * The far sides of the asset link tables.
 *
 * Declared here rather than imported from the project settings registry, which
 * imports ASSET from this file — pulling it back the other way would be a cycle.
 * `task-links.ts` declares its own for the same reason.
 */
const allCosts = gql`
  query allCosts {
    allCosts {
      id
      name
    }
  }
`;

const allTasks = gql`
  query allTasks {
    allTasks {
      id
      name
    }
  }
`;

const allQualitativeParameters = gql`
  query allQualitativeParameters {
    allQualitativeParameters {
      id
      name
    }
  }
`;

const allQualitativeParameterValues = gql`
  query allQualitativeParameterValues {
    allQualitativeParameterValues {
      id
      name
    }
  }
`;

const allQuantitativeParameters = gql`
  query allQuantitativeParameters {
    allQuantitativeParameters {
      id
      name
    }
  }
`;

const allQuantitativeParameterValues = gql`
  query allQuantitativeParameterValues {
    allQuantitativeParameterValues {
      id
      name
    }
  }
`;

/**
 * What an asset links to. Eight two-column join tables, each with its own
 * link/unlink pair, so each is a panel on the asset's detail page.
 *
 * Costs, floors, net asset values and projects are deliberately not all here.
 * The DBA sent `assets_floors`, `assets_net_asset_values` and `assets_projects`
 * as well, but each contradicts a relationship that already exists — floors and
 * net asset values carry `assets_id` directly, and `projects_assets` is already
 * mapped and driven by attachAssetToProject. Those three are unmapped on the
 * backend until the DBA confirms which model wins.
 */
export const assetLinkPanels = (comp: BaseComponent, assetUid?: string) =>
  entityLinkPanels(
    comp,
    [
      {
        entity: 'AssetCost',
        byOwnerQuery: 'assetCostsByAsset',
        ownerArg: 'assetUid',
        targetArg: 'costUid',
        field: 'cost',
        label: 'Cost',
        pluralLabel: 'Costs',
        icon: 'receipt',
        permission: 'ASSET_COST',
        optionsQuery: allCosts,
      },
      {
        entity: 'AssetValuation',
        byOwnerQuery: 'assetValuationsByAsset',
        ownerArg: 'assetUid',
        targetArg: 'valuationUid',
        field: 'valuation',
        label: 'Valuation',
        pluralLabel: 'Valuations',
        icon: 'linear_scale',
        permission: 'ASSET_VALUATION',
        optionsQuery: VALUATION.gql.all,
      },
      {
        entity: 'AssetLandUse',
        byOwnerQuery: 'assetLandUsesByAsset',
        ownerArg: 'assetUid',
        targetArg: 'landUseUid',
        field: 'landUse',
        label: 'Land Use',
        pluralLabel: 'Land Uses',
        icon: 'land_administration',
        permission: 'ASSET_LAND_USE',
        optionsQuery: LAND_USE.gql.all,
      },
      {
        entity: 'AssetTask',
        byOwnerQuery: 'assetTasksByAsset',
        ownerArg: 'assetUid',
        targetArg: 'taskUid',
        field: 'task',
        label: 'Task',
        pluralLabel: 'Tasks',
        icon: 'assignment',
        permission: 'ASSET_TASK',
        optionsQuery: allTasks,
      },
      {
        entity: 'AssetQualitativeParameter',
        byOwnerQuery: 'assetQualitativeParametersByAsset',
        ownerArg: 'assetUid',
        targetArg: 'qualitativeParameterUid',
        field: 'qualitativeParameter',
        label: 'Qualitative Parameter',
        pluralLabel: 'Qualitative Parameters',
        icon: 'assessment',
        permission: 'ASSET_QUALITATIVE_PARAMETER',
        optionsQuery: allQualitativeParameters,
      },
      {
        entity: 'AssetQualitativeParameterValue',
        byOwnerQuery: 'assetQualitativeParameterValuesByAsset',
        ownerArg: 'assetUid',
        targetArg: 'qualitativeParameterValueUid',
        field: 'qualitativeParameterValue',
        label: 'Qualitative Judgement',
        pluralLabel: 'Qualitative Judgements',
        icon: 'assessment',
        permission: 'ASSET_QUALITATIVE_PARAMETER_VALUE',
        optionsQuery: allQualitativeParameterValues,
      },
      {
        entity: 'AssetQuantitativeParameter',
        byOwnerQuery: 'assetQuantitativeParametersByAsset',
        ownerArg: 'assetUid',
        targetArg: 'quantitativeParameterUid',
        field: 'quantitativeParameter',
        label: 'Quantitative Parameter',
        pluralLabel: 'Quantitative Parameters',
        icon: 'poll',
        permission: 'ASSET_QUANTITATIVE_PARAMETER',
        optionsQuery: allQuantitativeParameters,
      },
      {
        entity: 'AssetQuantitativeParameterValue',
        byOwnerQuery: 'assetQuantitativeParameterValuesByAsset',
        ownerArg: 'assetUid',
        targetArg: 'quantitativeParameterValueUid',
        field: 'quantitativeParameterValue',
        label: 'Quantitative Measurement',
        pluralLabel: 'Quantitative Measurements',
        icon: 'poll',
        permission: 'ASSET_QUANTITATIVE_PARAMETER_VALUE',
        optionsQuery: allQuantitativeParameterValues,
      },
    ],
    assetUid,
  );

/** The operational screens, which lead the menu. */
export const ASSET_LOOKUPS: LookupModule[] = [
  ASSET,
  LAND_REGISTRATION,
  ASSET_VERIFICATION,
  ACQUISITION,
  DISPOSE,
  VALUATION,
];

/** The taxonomy that classifies them, grouped behind one menu and kept last. */
export const ASSET_CONFIGURATION_LOOKUPS: LookupModule[] = [
  ASSET_TYPE,
  ASSET_CATEGORY,
  ASSET_SUBCATEGORY,
  LAND_USE,
];
