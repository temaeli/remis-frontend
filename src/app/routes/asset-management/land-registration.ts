import { BehaviorSubject } from 'rxjs';

import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  FieldConfig,
  FieldType,
  FormStepper,
  Option,
} from '@shared/components/generic-form/field.interface';
import { lookupRefGqlFields } from '@shared/lookup';
import { Lookup } from '@shared/lookup/lookup.interface';

import {
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
  /**
   * Whether the value is sent. Only the street is: the four levels above it
   * exist to narrow the list, and LandRegistrationDtoInput has no field for
   * them — submitting one is rejected outright by GraphQL, which is what
   * "field name 'regionUid' is not defined for input object type" means.
   */
  submitted = false,
): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query, variables } },
  validations: [VALIDATOR_REQUIRED],
  ignoreOnSubmit: !submitted,
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
    // Narrows the list below it and goes no further. See cascadeSelect.
    ignoreOnSubmit: true,
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
  // The only level of the cascade the DTO has a field for.
  cascadeSelect('streetUid', 'Street', STREETS_BY_WARD, { wardUid: wardUid$ }, 'wardUid', true),
];

const HALF = 'col-span-full md:col-span-1';

/** The parcel's identifiers and extent — step three. */
export const parcelFields = (): FieldConfig[] => [
  { key: 'parcelNumber', label: 'Parcel Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED], class: HALF },
  { key: 'titleNumber', label: 'Title Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED], class: HALF },
  { key: 'plotNumber', label: 'Plot Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED], class: HALF },
  { key: 'blockNumber', label: 'Block Number', type: FieldType.input, validations: [VALIDATOR_REQUIRED], class: HALF },
  {
    key: 'surveyPlanNumber',
    label: 'Survey Plan Number',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  // Both numeric(15,2). Net is the usable part of gross, and the backend rejects
  // a net that exceeds it — hence the hint rather than a surprise on submit.
  {
    key: 'grossArea',
    label: 'Gross Area (sqm)',
    type: FieldType.decimal,
    decimals: 2,
    validations: [VALIDATOR_REQUIRED],
    class: HALF,
  },
  {
    key: 'netArea',
    label: 'Net Area (sqm)',
    hint: 'The usable part of the gross area — cannot exceed it',
    type: FieldType.decimal,
    decimals: 2,
    validations: [VALIDATOR_REQUIRED],
    class: HALF,
  },
];

/** How the land is held and what it may be used for — step four. */
export const tenureFields = (): FieldConfig[] => [
  {
    key: 'tenureType',
    label: 'Tenure Type',
    type: FieldType.select,
    options: TENURE_TYPE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
    class: HALF,
  },
  {
    key: 'permittedUse',
    label: 'Permitted Use',
    type: FieldType.select,
    options: PERMITTED_USE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
    class: HALF,
  },
  {
    key: 'leaseStartDate',
    label: 'Lease Start',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
    class: HALF,
  },
  {
    key: 'leaseEndDate',
    label: 'Lease End',
    hint: 'Cannot fall before the start date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
    class: HALF,
  },
  // numeric(9,2), not an integer: the column allows part-years, so a six-month
  // lease is 0.5 rather than an impossible 0.
  {
    key: 'leaseTermYears',
    label: 'Lease Term (years)',
    hint: 'Part-years allowed — six months is 0.5',
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
  };
};

/**
 * The four steps the form is broken into.
 *
 * A land registration is twenty-odd required fields. Flat, it is a wall that
 * gives no indication of what belongs with what, and the location cascade in the
 * middle of it reveals four more controls as you go — which reads as the form
 * growing while you fill it in. Grouped, each step is one question: which asset,
 * where is it, what is the parcel, how is it held.
 *
 * Owners and encumbrances used to be a fifth and sixth step. They are tabs on
 * the saved registration now — see land-registration-panels — because both are
 * things added to a registration that already exists rather than facts known
 * while it is being typed.
 *
 * Steps address fields by key, so the field configs above are untouched. Every
 * key that exists must appear in exactly one step: a field in none of them still
 * submits — the form group holds every control regardless — but it renders
 * nowhere, so the user could never fill it in.
 */
export const landRegistrationSteps = (): FormStepper[] => [
  {
    name: 'Asset',
    icon: 'home_work',
    keys: ['id', 'assetUid', 'name', 'assignedNumber', 'description'],
  },
  {
    name: 'Location',
    icon: 'location_on',
    keys: ['regionUid', 'districtUid', 'councilUid', 'wardUid', 'streetUid', 'latitude', 'longitude'],
  },
  {
    name: 'Parcel',
    icon: 'straighten',
    keys: [
      'parcelNumber',
      'titleNumber',
      'plotNumber',
      'blockNumber',
      'surveyPlanNumber',
      'grossArea',
      'netArea',
    ],
  },
  {
    name: 'Tenure',
    icon: 'gavel',
    keys: ['tenureType', 'permittedUse', 'leaseStartDate', 'leaseEndDate', 'leaseTermYears'],
  },
];
