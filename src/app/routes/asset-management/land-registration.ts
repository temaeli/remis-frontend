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
    // dateTime, not date: land_encumbrances.registered_date and resolved_date are
    // timestamp columns and the DTO takes LocalDateTime, so a date-only value
    // fails to coerce. Same pairing Acquisition and Dispose already use.
    { key: 'registeredDate', label: 'Registered On', type: FieldType.dateTime },
    {
      key: 'resolvedDate',
      label: 'Resolved On',
      type: FieldType.dateTime,
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
    // Not prefilled from the record. Owners and encumbrances are read through
    // their own queries for the tabs, so there is nothing nested here to seed
    // from — both sections open blank, and a blank section leaves whatever is
    // already saved untouched.
    owners: [],
    encumbrances: [],
  };
};

/**
 * The six steps the form is broken into.
 *
 * A land registration is twenty-odd required fields. Flat, it is a wall that
 * gives no indication of what belongs with what, and the location cascade in the
 * middle of it reveals four more controls as you go — which reads as the form
 * growing while you fill it in. Grouped, each step is one question: which asset,
 * where is it, what is the parcel, how is it held, who owns it, what is against
 * it.
 *
 * Owners and encumbrances are here *and* on tabs of the saved registration — see
 * land-registration-panels. Both are legitimate: what is known while the title
 * is being typed goes in here, and what arrives afterwards — a co-owner, a
 * caveat lodged months later — goes in through the tab. The two write through
 * different endpoints, and this one replaces the whole set while the tab touches
 * one row.
 *
 * The last two are marked optional so the stepper does not block on them. Their
 * rows carry no required validators either, because the section always renders
 * one row and an edit that does not touch ownership must stay submittable — a
 * blank row is dropped by the backend and a half-filled one is rejected there by
 * name.
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
  {
    name: 'Owners',
    icon: 'users',
    keys: ['owners'],
    optional: true,
    submitLabel: 'Save Registration',
  },
  {
    name: 'Encumbrances',
    icon: 'assignment',
    keys: ['encumbrances'],
    optional: true,
    submitLabel: 'Save Registration',
  },
];
