import { gql } from '@apollo/client/core';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import {
  assetProjectsPanel,
  openAttachProjectForm,
  projectAsset$,
} from '@routes/project-management/project-asset';
import { recordLinkConfigs, recordLinkPanels } from '@routes/unit-management/unit-links';
import { ParcelMapComponent } from './parcel-map.component';
import { coreAttachmentPanels } from '@routes/settings/attachment-lookups';
import { intendedUseFields, registerAssetBtn } from './asset-register';
import { AssetLinkTarget, assetActions } from './asset-actions';
import { AssetSummaryComponent } from './asset-summary.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  coordinateFields,
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
  landRegistrationPointPanel,
} from './land-registration-panels';
import {
  defineLookup,
  EntityLinkConfig,
  entityLink$,
  entityLinkPanels,
  openEntityLinkForm,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  Lookup,
  LookupModule,
  openLookupForm,
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
  generatedNumber: true,
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
  generatedNumber: true,
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
  generatedNumber: true,
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
  generatedNumber: true,
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
  forDevelopment
  forSelling
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
  // No Reserved toggle: reserved is a status, set through Change Status, and a
  // second control for the same fact would let the two disagree.
  extraFields: [
    parentSelect('assetSubcategoryUid', 'Asset Subcategory', ASSET_SUBCATEGORY.gql.all),
    ...intendedUseFields(),
  ],
  // The overview the summary and the tabs read. Computed per asset on the
  // backend, so only the asset's own page asks for it.
  detailGqlFields: `
  linkedKinds
  landRegistration {
    ${lookupRefGqlFields}
    parcelNumber
    titleNumber
    plotNumber
    blockNumber
    surveyPlanNumber
    grossArea
    netArea
    latitude
    longitude
    tenureType
    permittedUse
    leaseStartDate
    leaseEndDate
    leaseTermYears
    street { id name }
  }
  acquisition { id acquisitionValue acquisitionDate }
  latestValuation { id value valuedAt valuer { id name } }
  latestVerification { id outcome verifiedAt verifiedBy { id name } }
  disposal { id disposedAt description }
`,
  summary: AssetSummaryComponent,
  extraColumns: [
    'assetSubcategory.name as Sub Category',
    {
      field: 'status',
      header: 'Status',
      valueFn: (row) => getDisplayName(row?.status),
      valueClassMapper: (row) => statusClass(row?.status),
    },
  ],
  toModel: (data) => ({ assetSubcategoryUid: data?.assetSubcategory?.id }),
  // A disposed asset is closed: the backend refuses edits, so say so up front.
  lockedWhen: (record) => record?.['status'] === 'DISPOSED',
  lockedReason: 'This asset is disposed and can no longer be changed',
  extraActions: (comp, lookup) =>
    assetActions(comp, lookup, {
      verification: ASSET_VERIFICATION,
      disposal: DISPOSE,
      landRegistration: LAND_REGISTRATION,
      linkTargets: assetLinkTargets(comp),
    }),
  // One way in: Register Asset replaces the plain Create on the list.
  listActions: (comp, lookup) => [registerAssetBtn(comp, lookup)],
  replaceCreate: true,
  /**
   * Grouped so the page reads as a handful of questions rather than eighteen
   * tabs: where is it (Land), what is it worth (Money), what state is it in
   * (Condition), what has happened to it (History), its papers (Documents), and
   * what it is tied to (Links).
   *
   * Only what applies is shown: Land for land, and a link kind only once the
   * asset has one — new ones are added through the header's "Link to…". The land
   * registration is shown in place, owners and map included, rather than as a
   * list to open.
   *
   * Verifying and disposing are header buttons, so their tabs only list.
   */
  extraContents: (comp, record) => {
    const assetUid = record?.id;
    const forLand = !!record?.['assetSubcategory']?.assetCategory?.assetType?.forLand;
    const linked: string[] = record?.['linkedKinds'] ?? [];
    const has = (kind: string) => linked.includes(kind);
    const linkedOf = (kinds: string[]) => assetLinkPanels(comp, assetUid, kinds.filter(has));

    const condition = linkedOf([
      'AssetQualitativeParameter',
      'AssetQualitativeParameterValue',
      'AssetQuantitativeParameter',
      'AssetQuantitativeParameterValue',
    ]);
    const links = [
      ...(has('Connection')
        ? [
            lookupChildPanel(
              comp,
              () => ASSET_CONNECTION,
              ASSET_CONNECTIONS_BY_PARENT,
              { parentUid: assetUid },
              { presetModel: { parentUid: assetUid } },
            ),
          ]
        : []),
      ...(has('Project') ? [assetProjectsPanel(comp, assetUid)] : []),
      ...(has('Unit') ? recordLinkPanels(comp, 'Asset', assetUid) : []),
      ...linkedOf(['AssetMasterPlan', 'InventoryAsset', 'AssetTask']),
    ];

    return [
      ...(forLand ? [landTab(comp, record, linkedOf(['AssetLandUse']))] : []),
      tabGroup('Money', 'payments', [
        lookupChildPanel(
          comp,
          () => ACQUISITION,
          ACQUISITIONS_BY_ASSET,
          { assetUid },
          {
            presetModel: { assetUid, name: record?.name },
            keyColumns: [
              'index',
              'acquisitionValue as Value',
              { field: 'acquisitionDate', header: 'Acquired' },
              'description',
              'actions',
            ],
          },
        ),
        // Valuations always: Value adds to them. Costs and expenses once there are some.
        ...assetLinkPanels(comp, assetUid, ['AssetValuation']),
        ...linkedOf(['AssetCost', 'ExpenseAsset']),
      ]),
      ...(condition.length ? [tabGroup('Condition', 'assessment', condition)] : []),
      tabGroup('History', 'history', [
        lookupChildPanel(
          comp,
          () => ASSET_VERIFICATION,
          ASSET_VERIFICATIONS_BY_ASSET,
          { assetUid },
          {
            keyColumns: [
              'index',
              outcomeColumn,
              'verifiedBy.name as Verified By',
              { field: 'verifiedAt', header: 'Verified' },
              'description as Remarks',
              'actions',
            ],
          },
        ),
        ...(record?.['disposal']
          ? [
              lookupChildPanel(
                comp,
                () => DISPOSE,
                DISPOSES_BY_ASSET,
                { assetUid },
                {
                  keyColumns: [
                    'index',
                    { field: 'disposedAt', header: 'Disposed' },
                    'name',
                    'description',
                    'actions',
                  ],
                },
              ),
            ]
          : []),
      ]),
      tabGroup('Documents', 'attachment', coreAttachmentPanels(comp, 'asset', assetUid)),
      ...(links.length ? [tabGroup('Links', 'link', links)] : []),
    ];
  },
});

/** A tab that holds other tabs. */
function tabGroup(name: string, icon: string, children: ContentParameter[]): ContentParameter {
  return { name, label: name, icon, children };
}

/**
 * The Land tab. With a registration, the registration itself — its parcel, its
 * owners, encumbrances, map and corners — rather than a list to open. Without
 * one, the list with its Add, the asset already chosen.
 */
function landTab(
  comp: BaseComponent,
  asset: Lookup | undefined,
  landUses: ContentParameter[],
): ContentParameter {
  const registration: Lookup | undefined = asset?.['landRegistration'];
  const registrations = lookupChildPanel(
    comp,
    () => LAND_REGISTRATION,
    LAND_REGISTRATIONS_BY_ASSET,
    { assetUid: asset?.id },
    registration
      ? {}
      : {
          presetModel: { assetUid: asset?.id, name: asset?.name, description: asset?.description },
        },
  );

  if (!registration) return tabGroup('Land', 'land_administration', [registrations, ...landUses]);

  return tabGroup('Land', 'land_administration', [
    {
      type: 'details',
      name: 'Parcel',
      label: 'Parcel',
      icon: 'straighten',
      entity: {
        street: registration['street']?.name,
        parcelNumber: registration['parcelNumber'],
        titleNumber: registration['titleNumber'],
        plotNumber: registration['plotNumber'],
        blockNumber: registration['blockNumber'],
        surveyPlanNumber: registration['surveyPlanNumber'],
        grossArea: registration['grossArea'],
        netArea: registration['netArea'],
        tenureType: getDisplayName(registration['tenureType']),
        permittedUse: getDisplayName(registration['permittedUse']),
        leaseStartDate: registration['leaseStartDate'],
        leaseEndDate: registration['leaseEndDate'],
        leaseTermYears: registration['leaseTermYears'],
      },
    },
    // Owners, encumbrances, map and corners: the registration's own tabs.
    ...(LAND_REGISTRATION.extraContents?.(comp, registration) ?? []),
    ...landUses,
    // The record itself, for editing the parcel.
    { ...registrations, name: 'Registration', label: 'Registration' },
  ]);
}

/**
 * What "Link to…" offers: each kind of link an asset can have, opening its link
 * form on this asset. Whatever a link emits on save reloads the asset, so a
 * kind's tab appears as soon as it has a first link.
 */
function assetLinkTargets(comp: BaseComponent): AssetLinkTarget[] {
  const byEntity = (entity: string) => ASSET_LINK_CONFIGS.find((c) => c.entity === entity);
  const entityTarget = (entity: string): AssetLinkTarget[] => {
    const config = byEntity(entity);
    if (!config) return [];
    return [
      {
        label: config.label,
        icon: config.icon,
        saved$: entityLink$,
        permissions: [`ROLE_CREATE_${config.permission}`, `ROLE_UPDATE_${config.permission}`],
        open: (assetUid) => openEntityLinkForm(comp, config, assetUid),
      },
    ];
  };

  return [
    {
      label: 'Project',
      icon: 'project',
      saved$: projectAsset$,
      open: (assetUid) => openAttachProjectForm(comp, assetUid),
    },
    ...recordLinkConfigs('Asset').map((config) => ({
      label: config.label,
      icon: config.icon,
      saved$: entityLink$,
      permissions: [`ROLE_CREATE_${config.permission}`, `ROLE_UPDATE_${config.permission}`],
      open: (assetUid: string) => openEntityLinkForm(comp, config, assetUid),
    })),
    {
      label: 'Another Asset',
      icon: 'link',
      saved$: ASSET_CONNECTION.changed$,
      permissions: ASSET_CONNECTION.upsertPermissions,
      open: (assetUid) => openLookupForm(comp, ASSET_CONNECTION, { parentUid: assetUid }),
    },
    ...entityTarget('AssetCost'),
    ...entityTarget('ExpenseAsset'),
    ...entityTarget('AssetLandUse'),
    ...entityTarget('AssetMasterPlan'),
    ...entityTarget('InventoryAsset'),
    ...entityTarget('AssetTask'),
    ...entityTarget('AssetQualitativeParameter'),
    ...entityTarget('AssetQualitativeParameterValue'),
    ...entityTarget('AssetQuantitativeParameter'),
    ...entityTarget('AssetQuantitativeParameterValue'),
  ];
}

/** Where an asset stands, at a glance: green in use, amber on its way, red out. */
function statusClass(status?: string): string {
  if (['AVAILABLE', 'ALLOCATED', 'RESERVED', 'VERIFIED'].includes(status ?? ''))
    return 'text-success';
  if (['DISPOSED', 'DISPUTED', 'INACTIVE'].includes(status ?? '')) return 'text-danger';
  return 'text-warning';
}

export const LAND_REGISTRATION = defineLookup({
  slug: 'land-registrations',
  generatedNumber: true,
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
    {
      type: 'component',
      name: 'Map',
      label: 'Map',
      icon: 'map',
      componentType: ParcelMapComponent,
      componentInputs: {
        landRegistrationUid: record?.id,
        grossArea: record?.grossArea,
        title: record?.parcelNumber,
      },
    },
    landRegistrationPointPanel(comp, record?.id),
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
 * How an asset entered the register: what it cost and when. No coordinates —
 * where the asset is is recorded once, on its land registration (V84).
 */
export const ACQUISITION = defineLookup({
  slug: 'acquisitions',
  generatedNumber: true,
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
  ],
  extraColumns: [
    'asset.name as Asset',
    'acquisitionValue',
    { field: 'acquisitionDate', header: 'Acquired' },
  ],
  toModel: (data) => ({ assetUid: data?.asset?.id }),
});

/**
 * How an asset left the register: when. Recorded from the asset's own page
 * (Dispose), so the asset is carried in a hidden control, and the backend
 * writes the name, description and code. Saving it disposes the asset.
 */
export const DISPOSE = defineLookup({
  slug: 'disposes',
  generatedNumber: true,
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
  // Only the date: no name, description or code to type.
  baseFields: [{ key: 'id', type: FieldType.input, visible: false }],
  extraFields: [
    { key: 'assetUid', type: FieldType.input, visible: false },
    {
      key: 'disposedAt',
      label: 'Disposed At',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
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
 * What an asset has been valued at, by whom and when.
 *
 * Unlike an acquisition or a disposal this does not point at an asset: which
 * assets a valuation covers is `assets_valuations`, so one valuation can cover
 * several. It appears as a panel on the asset and as a screen of its own here.
 */
export const VALUATION = defineLookup({
  slug: 'valuations',
  generatedNumber: true,
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
  valuer {
    id
    uid: id
    name
  }
`,
  // No name or number: the backend issues both.
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'description',
      label: 'Description',
      hint: 'How it was valued — the method or the basis',
      type: FieldType.textarea,
      rows: 2,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
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
  generatedNumber: true,
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

/** The result of a verification — mirrors `VerificationOutcome` on the backend. */
export enum VerificationOutcome {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  NEEDS_CORRECTION = 'NEEDS_CORRECTION',
}

export const VERIFICATION_OUTCOME_OPTIONS: Option[] = Object.values(VerificationOutcome).map(
  (value) => ({ value, label: getDisplayName(value) as string }),
);

/** Green for passed, red for failed, amber for anything to fix. */
const outcomeClass = (outcome?: string): string =>
  outcome === VerificationOutcome.PASSED
    ? 'text-success'
    : outcome === VerificationOutcome.FAILED
      ? 'text-danger'
      : 'text-warning';

const verificationGqlFields = `
  verifiedAt
  outcome
  asset {
    ${lookupRefGqlFields}
  }
  verifiedBy {
    id
    uid: id
    name
  }
`;

const outcomeColumn: GridKeyColumn = {
  field: 'outcome',
  header: 'Outcome',
  valueFn: (row) => getDisplayName(row?.outcome),
  valueClassMapper: (row) => outcomeClass(row?.outcome),
};

/**
 * One check of an asset: what was found, and optionally who, when and why.
 *
 * Recorded from the asset's own page (Verify), so the asset is carried in a
 * hidden control rather than picked. The backend names the record and writes a
 * remark when none is given, so the form asks only for the outcome — the rest
 * is optional, with sensible defaults: the signed-in user, now.
 */
export const ASSET_VERIFICATION = defineLookup({
  slug: 'asset-verifications',
  generatedNumber: true,
  entity: 'AssetVerification',
  entityPlural: 'AssetVerifications',
  permission: 'ASSET_VERIFICATION',
  label: 'Asset Verification',
  pluralLabel: 'Asset Verifications',
  subtitle: 'Who checked each asset, when, and what they found',
  icon: 'check',
  extraGqlFields: verificationGqlFields,
  // No name or number: the backend issues both.
  baseFields: [{ key: 'id', type: FieldType.input, visible: false }],
  extraFields: [
    { key: 'assetUid', type: FieldType.input, visible: false },
    {
      key: 'outcome',
      label: 'Outcome',
      type: FieldType.select,
      options: VERIFICATION_OUTCOME_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'verifiedByUid',
      label: 'Verified By',
      hint: 'Leave blank if it was you',
      type: FieldType.select,
      optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query: ALL_PEOPLE } },
      class: 'col-span-full md:col-span-1',
    },
    {
      key: 'verifiedAt',
      label: 'Verified At',
      type: FieldType.dateTime,
      hint: 'Defaults to now when left blank',
      class: 'col-span-full md:col-span-1',
    },
    {
      key: 'description',
      label: 'Remarks',
      hint: 'Optional — what was found, especially when it did not pass',
      type: FieldType.textarea,
      rows: 3,
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    'asset.name as Asset',
    outcomeColumn,
    'verifiedBy.name as Verified By',
    { field: 'verifiedAt', header: 'Verified' },
  ],
  toModel: (data) => ({
    assetUid: data?.asset?.id,
    verifiedByUid: data?.verifiedBy?.id,
  }),
});

/** An asset's verifications, newest first, for the tab on the asset's own page. */
export const ASSET_VERIFICATIONS_BY_ASSET = gql`
  query assetVerificationsByAsset($assetUid: String) {
    assetVerificationsByAsset(assetUid: $assetUid) {
      ${lookupChildGqlFields}
      ${verificationGqlFields}
    }
  }
`;

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

export const ACQUISITIONS_BY_ASSET = gql`
  query acquisitionsByAsset($assetUid: String) {
    acquisitionsByAsset(assetUid: $assetUid) {
      ${lookupChildGqlFields}
      acquisitionValue
      acquisitionDate
    }
  }
`;

export const DISPOSES_BY_ASSET = gql`
  query disposesByAsset($assetUid: String) {
    disposesByAsset(assetUid: $assetUid) {
      ${lookupChildGqlFields}
      disposedAt
    }
  }
`;

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

const allExpenses = gql`
  query allExpenses {
    allExpenses {
      id
      name
    }
  }
`;

const allInventories = gql`
  query allInventories {
    allInventories {
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

const allMasterPlans = gql`
  query allRegistryMasterPlans {
    allRegistryMasterPlans {
      id
      name
    }
  }
`;

/**
 * What an asset links to. Nine two-column join tables, each with its own
 * link/unlink pair, so each is a panel on the asset's detail page.
 *
 * Costs, floors, net asset values and projects are deliberately not all here.
 * The DBA sent `assets_floors`, `assets_net_asset_values` and `assets_projects`
 * as well, but each contradicts a relationship that already exists — floors and
 * net asset values carry `assets_id` directly, and `projects_assets` is already
 * mapped and driven by attachAssetToProject. Those three are unmapped on the
 * backend until the DBA confirms which model wins.
 */
export const ASSET_LINK_CONFIGS: EntityLinkConfig[] = [
  {
    entity: 'AssetMasterPlan',
    byOwnerQuery: 'assetMasterPlansByAsset',
    ownerArg: 'assetUid',
    targetArg: 'masterPlanUid',
    field: 'masterPlan',
    label: 'Master Plan',
    pluralLabel: 'Master Plans',
    icon: 'map',
    permission: 'ASSET_MASTER_PLAN',
    optionsQuery: allMasterPlans,
  },
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
    entity: 'ExpenseAsset',
    byOwnerQuery: 'expenseAssetsByAsset',
    ownerArg: 'assetUid',
    targetArg: 'expenseUid',
    field: 'expense',
    label: 'Expense',
    pluralLabel: 'Expenses',
    icon: 'receipt',
    permission: 'EXPENSE_ASSET',
    optionsQuery: allExpenses,
  },
  {
    entity: 'InventoryAsset',
    byOwnerQuery: 'inventoryAssetsByAsset',
    ownerArg: 'assetUid',
    targetArg: 'inventoryUid',
    field: 'inventory',
    label: 'Inventory',
    pluralLabel: 'Inventories',
    icon: 'store',
    permission: 'INVENTORY_ASSET',
    optionsQuery: allInventories,
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
];

/**
 * The link panels for one asset. `only` picks them by entity, so the asset page
 * can spread them across its tab groups and leave out the empty ones; without
 * it every panel is returned.
 */
export const assetLinkPanels = (comp: BaseComponent, assetUid?: string, only?: string[]) =>
  entityLinkPanels(
    comp,
    ASSET_LINK_CONFIGS.filter((config) => !only || only.includes(config.entity)),
    assetUid,
  );

/**
 * A directed edge between two assets: the child hangs off the parent.
 *
 * A record in its own right rather than a link panel — it carries a name, a
 * description and who connected the two — so it gets a screen like any other
 * lookup, with a panel on the parent asset reading the same rows.
 */
export const ASSET_CONNECTION = defineLookup({
  slug: 'asset-connections',
  generatedNumber: true,
  entity: 'AssetToAssetConnection',
  entityPlural: 'AssetToAssetConnections',
  permission: 'ASSET_CONNECTION',
  label: 'Asset Connection',
  pluralLabel: 'Asset Connections',
  subtitle: 'Which asset hangs off which',
  icon: 'link',
  extraGqlFields: `
  connectedAt
  parent {
    ${lookupRefGqlFields}
  }
  child {
    ${lookupRefGqlFields}
  }
  connectedBy {
    id
    uid: id
    name
  }
`,
  extraFields: [
    parentSelect('parentUid', 'Parent Asset', ASSET.gql.all),
    parentSelect('childUid', 'Child Asset', ASSET.gql.all),
    parentSelect('connectedByUid', 'Connected By', ALL_PEOPLE),
    {
      key: 'connectedAt',
      label: 'Connected At',
      type: FieldType.dateTime,
      hint: 'Defaults to now when left blank',
    },
  ],
  extraColumns: [
    'parent.name as Parent',
    'child.name as Child',
    'connectedBy.name as Connected By',
    { field: 'connectedAt', header: 'Connected' },
  ],
  toModel: (data) => ({
    parentUid: data?.parent?.id,
    childUid: data?.child?.id,
    connectedByUid: data?.connectedBy?.id,
  }),
});

/** The assets hanging off one asset, for the panel on the asset's own page. */
export const ASSET_CONNECTIONS_BY_PARENT = gql`
  query assetToAssetConnectionsByParent($parentUid: String) {
    assetToAssetConnectionsByParent(parentUid: $parentUid) {
      ${lookupChildGqlFields}
    }
  }
`;

/** The operational screens, which lead the menu. */
export const ASSET_LOOKUPS: LookupModule[] = [ASSET];

/**
 * What is recorded against assets. Each is added from a tab on the asset's page;
 * these lists, grouped under Records, are for looking across all assets.
 */
export const ASSET_RECORD_LOOKUPS: LookupModule[] = [
  LAND_REGISTRATION,
  ASSET_VERIFICATION,
  ACQUISITION,
  DISPOSE,
  VALUATION,
  ASSET_CONNECTION,
];

/** The taxonomy that classifies them, grouped behind one menu and kept last. */
export const ASSET_CONFIGURATION_LOOKUPS: LookupModule[] = [
  ASSET_TYPE,
  ASSET_CATEGORY,
  ASSET_SUBCATEGORY,
  LAND_USE,
];
