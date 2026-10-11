import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { lookupRefGqlFields } from '@shared/lookup';
import { Lookup } from '@shared/lookup/lookup.interface';
import { PERSON } from '@routes/settings/settings-lookups';

import { ENCUMBRANCE_TYPE_OPTIONS, OWNER_TYPE_OPTIONS } from './land-registration';
import { ParcelPoint, cornerLines, parseCornerLines } from './parcel-map.helpers';

/**
 * The three tabs a land registration carries: who owns it, what is registered
 * against it, and where its corners are.
 *
 * Both were fields on the registration form, submitted with it as a whole set.
 * That is the wrong shape for how either actually happens — a co-owner is added
 * to a registration that already has two, and a caveat is lodged months after
 * the title was registered. Neither should mean resubmitting the registration.
 *
 * So both moved here: a panel on the registration's own page, each row added,
 * amended and removed on its own.
 */

const ownerReloaded$ = new Subject<unknown>();
const encumbranceReloaded$ = new Subject<unknown>();
/** Exported so the Map tab redraws when a corner changes. */
export const pointReloaded$ = new Subject<unknown>();

// ---------------------------------------------------------------- documents

const ownerFieldsGql = `
  id
  uid: id
  ownerType
  ownershipSharePercent
  owner { id name }
`;

const encumbranceFieldsGql = `
  id
  uid: id
  active
  isDeleted
  createdAt
  assignedNumber
  name
  description
  encumbranceType
  registeredDate
  resolvedDate
`;

const parcelPointFieldsGql = `
  id
  uid: id
  active
  isDeleted
  createdAt
  assignedNumber
  name
  description
  pointOrder
  latitude
  longitude
`;

export const OWNERS_OF_REGISTRATION = gql`
  query landRegistrationOwnersByRegistration($landRegistrationUid: String) {
    landRegistrationOwnersByRegistration(landRegistrationUid: $landRegistrationUid) {
      ${ownerFieldsGql}
    }
  }
`;

export const SAVE_REGISTRATION_OWNER = gql`
  mutation saveLandRegistrationOwner($input: LandRegistrationOwnerDtoInput) {
    saveLandRegistrationOwner(input: $input) {
      ${responseGqlFields(ownerFieldsGql)}
    }
  }
`;

export const REMOVE_REGISTRATION_OWNER = gql`
  mutation removeLandRegistrationOwner($uid: String) {
    removeLandRegistrationOwner(uid: $uid) {
      ${responseGqlFields(ownerFieldsGql)}
    }
  }
`;

/** What is left to allocate, so the form can say so instead of the user working it out. */
export const UNALLOCATED_SHARE = gql`
  query unallocatedOwnershipShare($landRegistrationUid: String) {
    unallocatedOwnershipShare(landRegistrationUid: $landRegistrationUid)
  }
`;

export const ENCUMBRANCES_OF_REGISTRATION = gql`
  query landEncumbrancesByRegistration($landRegistrationUid: String) {
    landEncumbrancesByRegistration(landRegistrationUid: $landRegistrationUid) {
      ${encumbranceFieldsGql}
    }
  }
`;

export const SAVE_LAND_ENCUMBRANCE = gql`
  mutation saveLandEncumbrance($input: LandEncumbranceDtoInput) {
    saveLandEncumbrance(input: $input) {
      ${responseGqlFields(encumbranceFieldsGql)}
    }
  }
`;

export const DELETE_LAND_ENCUMBRANCE = gql`
  mutation deleteLandEncumbrance($uid: String) {
    deleteLandEncumbrance(uid: $uid) {
      ${responseGqlFields(encumbranceFieldsGql)}
    }
  }
`;

export const POINTS_OF_REGISTRATION = gql`
  query landParcelPointsByRegistration($landRegistrationUid: String) {
    landParcelPointsByRegistration(landRegistrationUid: $landRegistrationUid) {
      ${parcelPointFieldsGql}
    }
  }
`;

export const SAVE_LAND_PARCEL_POINT = gql`
  mutation saveLandParcelPoint($input: LandParcelPointDtoInput) {
    saveLandParcelPoint(input: $input) {
      ${responseGqlFields(parcelPointFieldsGql)}
    }
  }
`;

/** Every corner of a parcel at once, so the database checks the finished boundary. */
export const REPLACE_LAND_PARCEL_POINTS = gql`
  mutation replaceLandParcelPoints($landRegistrationUid: String, $corners: [LandParcelPointDtoInput]) {
    replaceLandParcelPoints(landRegistrationUid: $landRegistrationUid, corners: $corners) {
      ${responseGqlFields(parcelPointFieldsGql)}
    }
  }
`;

export const DELETE_LAND_PARCEL_POINT = gql`
  mutation deleteLandParcelPoint($uid: String) {
    deleteLandParcelPoint(uid: $uid) {
      ${responseGqlFields(parcelPointFieldsGql)}
    }
  }
`;

// -------------------------------------------------------------------- owners

const ownerFormFields = (unallocated: string): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'bioDataUid',
    label: 'Owner',
    hint: 'Someone already on the register',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: PERSON.gql.all },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'ownerType',
    label: 'Held As',
    type: FieldType.select,
    options: OWNER_TYPE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'ownershipSharePercent',
    label: 'Share (%)',
    hint: `${unallocated}% is still unallocated`,
    type: FieldType.decimal,
    decimals: 2,
    min: 0,
    max: 100,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

/**
 * Opens the owner form.
 *
 * Reads the unallocated share first so the hint can say what is left. The
 * backend refuses anything that would take the total over 100 either way; this
 * is so the user knows before submitting rather than after.
 */
function openOwnerForm(comp: BaseComponent, registrationUid?: string, row?: Lookup) {
  return async () => {
    const unallocated = await comp.fs.fetch({
      query: UNALLOCATED_SHARE,
      showLoading: false,
      variables: { landRegistrationUid: registrationUid },
    });

    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['id'] ? 'Change Share' : 'Add Owner',
      model: row?.['id']
        ? {
            uid: row['id'],
            bioDataUid: row['owner']?.id,
            ownerType: row['ownerType'],
            ownershipSharePercent: row['ownershipSharePercent'],
          }
        : {},
      fields: ownerFormFields(unallocated ?? '0'),
      closeAction$: close$,

      onSubmit: async (value: any) => {
        await comp.fs.fetch({
          notify: true,
          variables: { input: { ...value, landRegistrationUid: registrationUid } },
          mutation: SAVE_REGISTRATION_OWNER,
          successFn: (res) => {
            ownerReloaded$.next(res?.data);
            close$.next();
          },
        });
      },
    };

    comp.vs?.openModal(FormComponent, formParameter, '45%');
  };
}

const ownerColumns: GridKeyColumn[] = [
  'index',
  'owner.name as Owner',
  'ownerType as Held As',
  { field: 'ownershipSharePercent', header: 'Share (%)' },
  'actions',
];

/**
 * Who holds the registration.
 *
 * Rows are deleted outright rather than deactivated — land_registrations_bio_data
 * has no flags, so a link is a row or it is nothing.
 */
export const landRegistrationOwnerPanel = (
  comp: BaseComponent,
  registrationUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Owners',
  label: 'Owners',
  icon: 'users',
  permissions: ['ROLE_VIEW_ALL_LAND_REGISTRATION_OWNER', 'ROLE_VIEW_LAND_REGISTRATION_OWNER'],
  keyColumns: ownerColumns,
  headerButtons: [
    {
      icon: 'add',
      label: 'Add Owner',
      class: 'btn-add-primary',
      click: openOwnerForm(comp, registrationUid),
      permissions: ['ROLE_CREATE_LAND_REGISTRATION_OWNER', 'ROLE_UPDATE_LAND_REGISTRATION_OWNER'],
    } as ActionButton,
  ],
  actionButtons: [
    {
      icon: 'edit',
      label: 'Change Share',
      click: (row: Lookup) => openOwnerForm(comp, registrationUid, row)(),
      permissions: ['ROLE_UPDATE_LAND_REGISTRATION_OWNER'],
    },
    {
      ...MORE_BTN,
      buttons: [
        {
          icon: 'delete',
          label: 'Remove',
          class: 'text-danger',
          click: async (row: Lookup) => {
            const confirmed = await comp.notify.confirm({
              title: 'Remove Owner',
              message: `Remove ${row?.['owner']?.name ?? 'this owner'} from the registration?`,
            });
            if (!confirmed) return;
            await comp.fs.fetch({
              notify: true,
              variables: { uid: row?.['id'] },
              mutation: REMOVE_REGISTRATION_OWNER,
              successFn: (res) => ownerReloaded$.next(res?.data),
            });
          },
          permissions: ['ROLE_DELETE_LAND_REGISTRATION_OWNER'],
        },
      ],
    },
  ],
  reloadActions$: [ownerReloaded$],
  fetchParameter: {
    query: OWNERS_OF_REGISTRATION,
    variables: { landRegistrationUid: registrationUid },
  },
});

// ------------------------------------------------------------- encumbrances

const encumbranceFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'encumbranceType',
    label: 'Type',
    type: FieldType.select,
    options: ENCUMBRANCE_TYPE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
  },
  { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
  {
    key: 'referenceNumber',
    label: 'Reference Number',
    hint: 'Leave blank to generate automatically',
    type: FieldType.input,
  },
  // dateTime, not date: the columns are timestamps and the DTO takes LocalDateTime.
  {
    key: 'registeredDate',
    label: 'Registered On',
    type: FieldType.dateTime,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'resolvedDate',
    label: 'Resolved On',
    hint: 'Leave blank while it is still outstanding',
    type: FieldType.dateTime,
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

function openEncumbranceForm(comp: BaseComponent, registrationUid?: string, row?: Lookup) {
  return () => {
    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['id'] ? 'Amend Encumbrance' : 'Register Encumbrance',
      model: row?.['id']
        ? {
            uid: row['id'],
            encumbranceType: row['encumbranceType'],
            name: row['name'],
            referenceNumber: row['assignedNumber'],
            registeredDate: row['registeredDate'],
            resolvedDate: row['resolvedDate'],
            description: row['description'],
          }
        : {},
      fields: encumbranceFormFields(),
      closeAction$: close$,

      onSubmit: async (value: any) => {
        await comp.fs.fetch({
          notify: true,
          variables: { input: { ...value, landRegistrationUid: registrationUid } },
          mutation: SAVE_LAND_ENCUMBRANCE,
          successFn: (res) => {
            encumbranceReloaded$.next(res?.data);
            close$.next();
          },
        });
      },
    };

    comp.vs?.openModal(FormComponent, formParameter, '55%');
  };
}

const encumbranceColumns: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'name',
  'encumbranceType as Type',
  { field: 'registeredDate', header: 'Registered' },
  { field: 'resolvedDate', header: 'Resolved' },
  'actions',
];

/**
 * What is registered against the parcel.
 *
 * Note the Resolved column will repeat the registered date for anything still
 * outstanding — resolved_date is NOT NULL and the table has no way to express
 * "open". Making that column nullable is the fix, and it is with the DBA.
 */
export const landRegistrationEncumbrancePanel = (
  comp: BaseComponent,
  registrationUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Encumbrances',
  label: 'Encumbrances',
  icon: 'gavel',
  permissions: ['ROLE_VIEW_ALL_LAND_ENCUMBRANCE', 'ROLE_VIEW_LAND_ENCUMBRANCE'],
  keyColumns: encumbranceColumns,
  headerButtons: [
    {
      icon: 'add',
      label: 'Register Encumbrance',
      class: 'btn-add-primary',
      click: openEncumbranceForm(comp, registrationUid),
      permissions: ['ROLE_CREATE_LAND_ENCUMBRANCE', 'ROLE_UPDATE_LAND_ENCUMBRANCE'],
    } as ActionButton,
  ],
  actionButtons: [
    {
      icon: 'edit',
      label: 'Amend',
      click: (row: Lookup) => openEncumbranceForm(comp, registrationUid, row)(),
      permissions: ['ROLE_UPDATE_LAND_ENCUMBRANCE'],
    },
    {
      ...MORE_BTN,
      buttons: [
        {
          icon: 'delete',
          label: 'Delete',
          class: 'text-danger',
          click: async (row: Lookup) => {
            const confirmed = await comp.notify.confirm({
              title: 'Delete Encumbrance',
              message: `Delete ${row?.['name'] ?? 'this encumbrance'}?`,
            });
            if (!confirmed) return;
            await comp.fs.fetch({
              notify: true,
              variables: { uid: row?.['id'] },
              mutation: DELETE_LAND_ENCUMBRANCE,
              successFn: (res) => encumbranceReloaded$.next(res?.data),
            });
          },
          permissions: ['ROLE_DELETE_LAND_ENCUMBRANCE'],
        },
      ],
    },
  ],
  reloadActions$: [encumbranceReloaded$],
  fetchParameter: {
    query: ENCUMBRANCES_OF_REGISTRATION,
    variables: { landRegistrationUid: registrationUid },
  },
});

// ------------------------------------------------------------ parcel points

const pointFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'pointOrder',
    label: 'Point Number',
    hint: 'Its place around the boundary. Leave blank to add after the last point',
    type: FieldType.input,
    inputType: 'number',
  },
  {
    key: 'name',
    label: 'Name',
    hint: 'Such as Beacon 1. Unique on this parcel',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'assignedNumber',
    label: 'Assigned Code',
    hint: 'Generated when left blank',
    type: FieldType.input,
  },
  {
    key: 'latitude',
    label: 'Latitude',
    hint: 'Decimal degrees, between -90 and 90 (e.g. -6.800000)',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'longitude',
    label: 'Longitude',
    hint: 'Decimal degrees, between -180 and 180 (e.g. 39.280000)',
    type: FieldType.decimal,
    decimals: 6,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'description',
    label: 'Description',
    hint: 'Unique across every parcel in the system, not just this one',
    type: FieldType.textarea,
    rows: 2,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

function openPointForm(comp: BaseComponent, registrationUid?: string, row?: Lookup) {
  return () => {
    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['id'] ? 'Amend Point' : 'Record Point',
      model: row?.['id']
        ? {
            uid: row['id'],
            pointOrder: row['pointOrder'],
            name: row['name'],
            assignedNumber: row['assignedNumber'],
            latitude: row['latitude'],
            longitude: row['longitude'],
            description: row['description'],
          }
        : {},
      fields: pointFormFields(),
      closeAction$: close$,

      onSubmit: async (value: any) => {
        await comp.fs.fetch({
          notify: true,
          variables: {
            input: {
              ...value,
              // Blank means "after the last point"; an empty string is not an Int.
              pointOrder:
                value?.pointOrder === '' || value?.pointOrder == null
                  ? null
                  : Number(value.pointOrder),
              landRegistrationUid: registrationUid,
            },
          },
          mutation: SAVE_LAND_PARCEL_POINT,
          successFn: (res) => {
            pointReloaded$.next(res?.data);
            close$.next();
          },
        });
      },
    };

    comp.vs?.openModal(FormComponent, formParameter, '55%');
  };
}

/**
 * The whole boundary as text: one corner per line, in order around the plot.
 *
 * The database checks a parcel's boundary when the save commits — at least 3
 * corners, not crossing itself, within 5% of the gross area — so a new parcel's
 * corners are entered here together rather than one at a time.
 */
function openCornersForm(comp: BaseComponent, registrationUid?: string) {
  return async () => {
    const existing: ParcelPoint[] =
      (await comp.fs.fetch({
        query: POINTS_OF_REGISTRATION,
        variables: { landRegistrationUid: registrationUid },
        showLoading: false,
      })) ?? [];

    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: 'Enter All Corners',
      model: { corners: cornerLines(existing) },
      fields: [
        {
          key: 'corners',
          label: 'Corners',
          hint: 'One per line, in order around the plot: name, latitude, longitude. At least 3. Pasting from a spreadsheet works',
          type: FieldType.textarea,
          rows: 12,
          validations: [VALIDATOR_REQUIRED],
          class: 'col-span-full',
        },
      ],
      closeAction$: close$,

      onSubmit: async (value: any) => {
        await comp.fs.fetch({
          notify: true,
          variables: {
            landRegistrationUid: registrationUid,
            corners: parseCornerLines(value?.corners),
          },
          mutation: REPLACE_LAND_PARCEL_POINTS,
          successFn: (res) => {
            pointReloaded$.next(res?.data);
            close$.next();
          },
        });
      },
    };

    comp.vs?.openModal(FormComponent, formParameter, '55%');
  };
}

const pointColumns: GridKeyColumn[] = [
  'pointOrder as No.',
  'assignedNumber as Code',
  'name',
  'latitude',
  'longitude',
  'actions',
];

/**
 * The surveyed corners of the parcel.
 *
 * Listed in `point_order`, their place around the boundary, which is the order
 * the Map tab joins them in. Record Point adds or amends one corner, and works on
 * a parcel whose boundary is still valid afterwards; Enter All Corners sets them
 * all at once, which is how a new parcel's corners go in.
 */
export const landRegistrationPointPanel = (
  comp: BaseComponent,
  registrationUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Parcel Points',
  label: 'Parcel Points',
  icon: 'place',
  permissions: ['ROLE_VIEW_ALL_LAND_PARCEL_POINT', 'ROLE_VIEW_LAND_PARCEL_POINT'],
  keyColumns: pointColumns,
  headerButtons: [
    {
      icon: 'add',
      label: 'Record Point',
      class: 'btn-add-primary',
      click: openPointForm(comp, registrationUid),
      permissions: ['ROLE_CREATE_LAND_PARCEL_POINT', 'ROLE_UPDATE_LAND_PARCEL_POINT'],
    } as ActionButton,
    {
      icon: 'edit',
      label: 'Enter All Corners',
      class: 'btn-add-primary',
      click: openCornersForm(comp, registrationUid),
      permissions: ['ROLE_CREATE_LAND_PARCEL_POINT', 'ROLE_UPDATE_LAND_PARCEL_POINT'],
    } as ActionButton,
  ],
  actionButtons: [
    {
      icon: 'edit',
      label: 'Amend',
      click: (row: Lookup) => openPointForm(comp, registrationUid, row)(),
      permissions: ['ROLE_UPDATE_LAND_PARCEL_POINT'],
    },
    {
      ...MORE_BTN,
      buttons: [
        {
          icon: 'delete',
          label: 'Delete',
          class: 'text-danger',
          click: async (row: Lookup) => {
            const confirmed = await comp.notify.confirm({
              title: 'Delete Point',
              message: `Delete ${row?.['name'] ?? 'this point'}?`,
            });
            if (!confirmed) return;
            await comp.fs.fetch({
              notify: true,
              variables: { uid: row?.['id'] },
              mutation: DELETE_LAND_PARCEL_POINT,
              successFn: (res) => pointReloaded$.next(res?.data),
            });
          },
          permissions: ['ROLE_DELETE_LAND_PARCEL_POINT'],
        },
      ],
    },
  ],
  reloadActions$: [pointReloaded$],
  fetchParameter: {
    query: POINTS_OF_REGISTRATION,
    variables: { landRegistrationUid: registrationUid },
  },
});
