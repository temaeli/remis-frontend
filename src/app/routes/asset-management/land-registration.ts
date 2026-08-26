import { BehaviorSubject } from 'rxjs';

import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { lookupRefGqlFields } from '@shared/lookup';
import { Lookup } from '@shared/lookup/lookup.interface';

import {
  COUNCIL,
  COUNCILS_BY_DISTRICT,
  DISTRICTS_BY_REGION,
  PERSON,
  REGION,
  STREETS_BY_WARD,
  WARDS_BY_COUNCIL,
} from '@routes/settings/settings-lookups';

/**
 * The land registration form: the parcel, where it sits, who owns it and what is
 * registered against it.
 *
 * Split out of `asset-lookups.ts` because it is the one config in that file that
 * is not a flat table — it carries a five-step location cascade and two
 * repeatable sections, and inlining it would have doubled the file.
 *
 * Every enum below mirrors a native PostgreSQL enum. A value that is not in the
 * database type is rejected on insert, so these lists cannot drift ahead of the
 * schema.
 */

/** `remis_core_schema.tenure_types`. */
export enum TenureType {
  FREEHOLD = 'FREEHOLD',
  LEASEHOLD = 'LEASEHOLD',
  CUSTOMARY = 'CUSTOMARY',
  RIGHT_OF_OCCUPANCY = 'RIGHT_OF_OCCUPANCY',
}

/** `remis_core_schema.permitted_uses`. Only two values exist. */
export enum PermittedUse {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
}

/** `remis_core_schema.encumbrance_types`. */
export enum EncumbranceType {
  MORTGAGE = 'MORTGAGE',
  CAVEAT = 'CAVEAT',
  DISPUTE = 'DISPUTE',
  LIEN = 'LIEN',
  COURT_ORDER = 'COURT_ORDER',
}

/** `remis_core_schema.owner_types`. */
export enum OwnerType {
  INDIVIDUAL = 'INDIVIDUAL',
  JOINT_OWNERS = 'JOINT_OWNERS',
  FAMILY = 'FAMILY',
  COMPANY = 'COMPANY',
  GOVERNMENT = 'GOVERNMENT',
  LOCAL_GOVERNMENT = 'LOCAL_GOVERNMENT',
  INSTITUTION = 'INSTITUTION',
  COMMUNITY = 'COMMUNITY',
  TRUST = 'TRUST',
  OTHER = 'OTHER',
}

const toOptions = (values: Record<string, string>): Option[] =>
  Object.values(values).map((value) => ({ value, label: getDisplayName(value) as string }));

export const TENURE_TYPE_OPTIONS = toOptions(TenureType);
export const PERMITTED_USE_OPTIONS = toOptions(PermittedUse);
export const ENCUMBRANCE_TYPE_OPTIONS = toOptions(EncumbranceType);
export const OWNER_TYPE_OPTIONS = toOptions(OwnerType);

/**
 * The subjects that drive the location cascade.
 *
 * A select whose `fetchParameter.variables` holds an observable subscribes to it
 * and refetches on every emission — that is the mechanism `select.component.ts`
 * already implements, and what the self-registration form uses. Pushing a level's
 * uid here is therefore all it takes to reload the level below.
 *
 * Module-level rather than per-form: the config object these fields belong to is
 * built once at import time, so there is nowhere per-instance to hang them. The
 * form seeds all four on open, so a stale value from a previous edit cannot
 * survive into the next one.
 */
const regionUid$ = new BehaviorSubject<string | null>(null);
const districtUid$ = new BehaviorSubject<string | null>(null);
const councilUid$ = new BehaviorSubject<string | null>(null);
const wardUid$ = new BehaviorSubject<string | null>(null);

/** Clears every level below the one that changed, so a stale child cannot be submitted. */
const clearBelow = (level: 'region' | 'district' | 'council' | 'ward', form?: any) => {
  const below: Record<string, string[]> = {
    region: ['districtUid', 'councilUid', 'wardUid', 'streetUid'],
    district: ['councilUid', 'wardUid', 'streetUid'],
    council: ['wardUid', 'streetUid'],
    ward: ['streetUid'],
  };
  below[level].forEach((key) => form?.get(key)?.reset());
  if (level === 'region') {
    districtUid$.next(null);
    councilUid$.next(null);
    wardUid$.next(null);
  }
  if (level === 'district') {
    councilUid$.next(null);
    wardUid$.next(null);
  }
  if (level === 'council') wardUid$.next(null);
};

const cascadeSelect = (
  key: string,
  label: string,
  query: unknown,
  variables: Record<string, unknown>,
  dependsOn: string,
): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query, variables } },
  validations: [VALIDATOR_REQUIRED],
  // Hidden until its parent is chosen: an empty select with no explanation reads
  // as a broken form.
  showWhen: [{ key: dependsOn, checker: (v: any) => !!v }],
  class: 'col-span-full md:col-span-1',
});

/**
 * Region → District → Council → Ward → Street.
 *
 * Only `streetUid` is submitted. The four above it exist to narrow the list: the
 * street row already resolves to a ward, council, district and region, which is
 * why the table keeps a single `streets_id` rather than five columns that could
 * disagree with each other.
 */
export const locationCascadeFields = (): FieldConfig[] => [
  {
    key: 'regionUid',
    label: 'Region',
    type: FieldType.select,
    optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query: REGION.gql.all } },
    validations: [VALIDATOR_REQUIRED],
    onChange: (value: any, form?: any) => {
      regionUid$.next(value ?? null);
      clearBelow('region', form);
    },
    class: 'col-span-full md:col-span-1',
  },
  {
    ...cascadeSelect('districtUid', 'District', DISTRICTS_BY_REGION, { regionUid: regionUid$ }, 'regionUid'),
    onChange: (value: any, form?: any) => {
      districtUid$.next(value ?? null);
      clearBelow('district', form);
    },
  },
  {
    ...cascadeSelect('councilUid', 'Council', COUNCILS_BY_DISTRICT, { districtUid: districtUid$ }, 'districtUid'),
    onChange: (value: any, form?: any) => {
      councilUid$.next(value ?? null);
      clearBelow('council', form);
    },
  },
  {
    ...cascadeSelect('wardUid', 'Ward', WARDS_BY_COUNCIL, { councilUid: councilUid$ }, 'councilUid'),
    onChange: (value: any, form?: any) => {
      wardUid$.next(value ?? null);
      clearBelow('ward', form);
    },
  },
  cascadeSelect('streetUid', 'Street', STREETS_BY_WARD, { wardUid: wardUid$ }, 'wardUid'),
];

/**
 * Who holds the registration, and for what share.
 *
 * The owner is an existing person on the register, chosen by uid — there is no
 * owner table of its own, so there is nothing to type a name into. The backend
 * rejects any set whose shares do not total exactly 100, which is why the hint
 * says so before the submit does.
 */
export const ownerFields = (): FieldConfig => ({
  key: 'owners',
  label: 'Owners',
  icon: 'users',
  type: FieldType.formGroupArray,
  itemLabelTemplate: '{{ownerType}}',
  class: 'col-span-full',
  hint: 'Shares must add up to exactly 100%. Leave blank when editing to keep the current owners.',
  // No required validators on these three. The section always renders one row, so
  // an edit that does not touch ownership would otherwise be unsubmittable until
  // every owner was typed in again. A row left blank is dropped by the backend;
  // a row half-filled is rejected there with a message naming the person.
  fields: [
    {
      key: 'bioDataUid',
      label: 'Owner',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: PERSON.gql.all },
      },
    },
    {
      key: 'ownerType',
      label: 'Held As',
      type: FieldType.select,
      options: OWNER_TYPE_OPTIONS,
    },
    {
      key: 'ownershipSharePercent',
      label: 'Share (%)',
      type: FieldType.decimal,
      decimals: 2,
      min: 0,
      max: 100,
    },
  ],
});

/**
 * What is registered against the parcel.
 *
 * Optional — a clean title has none. Note `resolvedDate`: the column is NOT NULL,
 * so there is no way to store "still outstanding". Left blank, the backend stores
 * the registered date, and that is what an open encumbrance looks like until the
 * column is made nullable.
 */
export const encumbranceFields = (): FieldConfig => ({
  key: 'encumbrances',
  label: 'Encumbrances',
  icon: 'gavel',
  type: FieldType.formGroupArray,
  itemLabelTemplate: '{{encumbranceType}} {{referenceNumber}}',
  expandable: true,
  expanded: false,
  class: 'col-span-full',
  fields: [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'encumbranceType',
      label: 'Type',
      type: FieldType.select,
      options: ENCUMBRANCE_TYPE_OPTIONS,
    },
    // The row is identified by its name: leave it blank and the whole row is
    // ignored, which is how "no encumbrances" is expressed through a section that
    // always renders one.
    { key: 'name', label: 'Name', type: FieldType.input },
    {
      key: 'referenceNumber',
      label: 'Reference Number',
      type: FieldType.input,
      hint: 'Leave blank to generate automatically',
    },
    { key: 'registeredDate', label: 'Registered On', type: FieldType.date },
    {
      key: 'resolvedDate',
      label: 'Resolved On',
      type: FieldType.date,
      hint: 'Leave blank while the encumbrance is still outstanding',
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      rows: 2,
      class: 'col-span-full',
    },
  ],
});

/** The parcel's own identifiers, extent and lease terms. */
export const parcelFields = (): FieldConfig[] => [
  { key: 'parcelNumber', label: 'Parcel Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
  { key: 'titleNumber', label: 'Title Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
  { key: 'plotNumber', label: 'Plot Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
  { key: 'blockNumber', label: 'Block Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
  {
    key: 'surveyPlanNumber',
    label: 'Survey Plan Number',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  // Both numeric(15,2). Net is the usable part of gross, and the backend rejects
  // a net that exceeds it.
  { key: 'grossArea', label: 'Gross Area (sqm)', type: FieldType.decimal, decimals: 2, validations: [VALIDATOR_REQUIRED] },
  { key: 'netArea', label: 'Net Area (sqm)', type: FieldType.decimal, decimals: 2, validations: [VALIDATOR_REQUIRED] },
  {
    key: 'tenureType',
    label: 'Tenure Type',
    type: FieldType.select,
    options: TENURE_TYPE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'permittedUse',
    label: 'Permitted Use',
    type: FieldType.select,
    options: PERMITTED_USE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
  },
  { key: 'leaseStartDate', label: 'Lease Start', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
  { key: 'leaseEndDate', label: 'Lease End', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
  // numeric(9,2), not an integer: the column allows part-years.
  {
    key: 'leaseTermYears',
    label: 'Lease Term (years)',
    type: FieldType.decimal,
    decimals: 2,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

/**
 * The nested reads the form needs back, on top of the base fields.
 *
 * The street is fetched with its whole parent chain so an edit can reopen the
 * cascade at the right level rather than making the user pick region to street
 * again.
 */
export const landRegistrationGqlFields = `
  asset {
    ${lookupRefGqlFields}
    status
  }
  street {
    ${lookupRefGqlFields}
    ward {
      ${lookupRefGqlFields}
      council {
        ${lookupRefGqlFields}
        district {
          ${lookupRefGqlFields}
          region { ${lookupRefGqlFields} }
        }
      }
    }
  }
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
`;

/**
 * Seeds the form from a saved record.
 *
 * Also pushes the location chain into the cascade subjects, so each select has
 * its options loaded before the control is populated. Creating a new record
 * clears them for the same reason — the subjects outlive any one form.
 */
export const landRegistrationToModel = (data?: Lookup): Record<string, unknown> => {
  const ward = data?.['street']?.ward;
  const council = ward?.council;
  const district = council?.district;
  const region = district?.region;

  regionUid$.next(region?.id ?? null);
  districtUid$.next(district?.id ?? null);
  councilUid$.next(council?.id ?? null);
  wardUid$.next(ward?.id ?? null);

  return {
    assetUid: data?.['asset']?.id,
    regionUid: region?.id,
    districtUid: district?.id,
    councilUid: council?.id,
    wardUid: ward?.id,
    streetUid: data?.['street']?.id,
    // Deliberately not seeded. Owners and encumbrances are read through
    // landRegistrationOwners / landRegistrationEncumbrances rather than nested on
    // the record, so there is nothing to prefill them from here. Both sections
    // open blank, and a blank section leaves what is already saved untouched.
    owners: [],
    encumbrances: [],
  };
};
