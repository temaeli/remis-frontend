import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType, Option } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { getDisplayName } from '@core/helpers/view.helpers';

/**
 * The documents a person is identified by beyond the one on their record —
 * `any_other_id`.
 *
 * A person's own record carries a single national ID and one identity type.
 * Someone holding a ZANID as well as a driving licence, or a TIN alongside
 * both, has nowhere to put the others; this panel is that place, one row per
 * document, shown on their detail page.
 *
 * Deliberately does not import the lookup registry it hangs off, which would be
 * a cycle — the same reason `person-links` keeps its own queries.
 */

/** Notifies the panel that a document was added, edited or removed. */
export const anyOtherId$ = new Subject<unknown>();

/**
 * The five labels of the PostgreSQL enum
 * `remis_core_schema.identification_types`, mirroring `IdentificationType` on
 * the backend. The two lists have to stay in step.
 */
export enum IdentificationType {
  NIN = 'NIN',
  ZANID = 'ZANID',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  TIN = 'TIN',
  CUSTOM = 'CUSTOM',
}

export const IDENTIFICATION_TYPE_OPTIONS: Option[] = Object.values(IdentificationType).map(
  (value) => ({ value, label: getDisplayName(value) as string }),
);

const identificationGqlFields = `
  id
  uid: id
  assignedNumber
  identificationType
  description
  createdAt
`;

export const IDENTIFICATIONS_OF_PERSON = gql`
  query anyOtherIdsByBioData($bioDataUid: String) {
    anyOtherIdsByBioData(bioDataUid: $bioDataUid) {
      ${identificationGqlFields}
    }
  }
`;

export const SAVE_ANY_OTHER_ID = gql`
  mutation saveAnyOtherId($input: AnyOtherIdDtoInput) {
    saveAnyOtherId(input: $input) {
      ${responseGqlFields(identificationGqlFields)}
    }
  }
`;

export const DELETE_ANY_OTHER_ID = gql`
  mutation deleteAnyOtherId($uid: String) {
    deleteAnyOtherId(uid: $uid) {
      ${responseGqlFields(identificationGqlFields)}
    }
  }
`;

const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_ANY_OTHER_ID', 'ROLE_VIEW_ANY_OTHER_ID'];
const WRITE_PERMISSIONS = ['ROLE_CREATE_ANY_OTHER_ID', 'ROLE_UPDATE_ANY_OTHER_ID'];
const DELETE_PERMISSIONS = ['ROLE_DELETE_ANY_OTHER_ID'];

/**
 * The form behind both adding and editing.
 *
 * Three fields, because `name` is generated: it is UNIQUE across the whole
 * table, so "Driving Licence" would be taken by the first person to hold one.
 * The description is optional and generated too, but kept editable — it is the
 * only way to say what a CUSTOM document actually is.
 */
const identificationFields = () => [
  {
    key: 'identificationType',
    label: 'Type',
    type: FieldType.select,
    options: IDENTIFICATION_TYPE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'assignedCode',
    label: 'Identification Number',
    hint: 'The number on the document. Must be unique — one document belongs to one person.',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'description',
    label: 'Description',
    hint: 'Optional. Say what the document is where the type does not — a custom one especially.',
    type: FieldType.textarea,
    rows: 2,
    class: 'col-span-full',
  },
];

/**
 * One button for both jobs. The header calls it with nothing and gets a create;
 * a row action calls it with that row and gets an edit of it.
 */
function upsertBtn(comp: BaseComponent, bioDataUid: string | undefined, editing: boolean): ActionButton {
  return {
    icon: editing ? 'edit' : 'add',
    label: editing ? 'Edit' : 'Add Identification',
    class: editing ? '' : 'btn-add-primary',
    click: (row?: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        // The number is read as `assignedNumber` and submitted as
        // `assignedCode`, which is what the column is called.
        model: editing
          ? {
              uid: row?.uid,
              identificationType: row?.identificationType,
              assignedCode: row?.assignedNumber,
              description: row?.description,
            }
          : {},
        title: editing ? 'Edit Identification' : 'Add Identification',
        fields: identificationFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: { bioDataUid, ...value } },
            mutation: SAVE_ANY_OTHER_ID,
            successFn: (res) => {
              anyOtherId$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: WRITE_PERMISSIONS,
  };
}

function removeBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'delete',
    label: 'Remove',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Remove Identification',
      confirmText: 'REMOVE',
      confirmButtonColor: 'red',
      message: `Remove <b class='text-danger'>${getDisplayName(
        row?.identificationType,
      )} ${row?.assignedNumber}</b> from this person?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: DELETE_ANY_OTHER_ID,
        successFn: (res) => anyOtherId$.next(res?.data),
      });
    },
    permissions: DELETE_PERMISSIONS,
  };
}

/** The documents one person holds, for their detail page. */
export const personIdentificationsPanel = (
  comp: BaseComponent,
  bioDataUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Other Identifications',
  label: 'Other Identifications',
  icon: 'badge',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    {
      field: 'identificationType',
      header: 'Type',
      valueFn: (row: any) => getDisplayName(row?.identificationType),
    },
    'assignedNumber as Number',
    'description',
    { field: 'createdAt', header: 'Recorded' },
    'actions',
  ],
  headerButtons: [upsertBtn(comp, bioDataUid, false)],
  actionButtons: [
    { ...MORE_BTN, buttons: [upsertBtn(comp, bioDataUid, true), removeBtn(comp)] },
  ],
  reloadActions$: [anyOtherId$],
  fetchParameter: { query: IDENTIFICATIONS_OF_PERSON, variables: { bioDataUid } },
});

/* ------------------------------------------------------------------ *
 * Which identity type on the register each label means.
 *
 * `identity_types` is the editable lookup a person's record points at;
 * `identification_types` is the fixed enum above. This is the bridge, shown on
 * the identity type's own detail page.
 *
 * A label belongs to exactly one identity type — `identification_types` is
 * UNIQUE on its own — so mapping one that is already mapped is refused by the
 * backend, naming the type it belongs to.
 * ------------------------------------------------------------------ */

/** Notifies the mapping panel that a label was mapped, re-pointed or removed. */
export const identityTypeIdentification$ = new Subject<unknown>();

const mappingGqlFields = `
  id
  uid: id
  assignedNumber
  identificationType
  description
  identityType {
    id
    name
  }
`;

export const IDENTIFICATIONS_OF_IDENTITY_TYPE = gql`
  query identificationTypesByIdentityType($identityTypeUid: String) {
    identificationTypesByIdentityType(identityTypeUid: $identityTypeUid) {
      ${mappingGqlFields}
    }
  }
`;

export const SAVE_IDENTITY_TYPE_IDENTIFICATION = gql`
  mutation saveIdentityTypeIdentificationType($input: IdentityTypeIdentificationTypeDtoInput) {
    saveIdentityTypeIdentificationType(input: $input) {
      ${responseGqlFields(mappingGqlFields)}
    }
  }
`;

export const DELETE_IDENTITY_TYPE_IDENTIFICATION = gql`
  mutation deleteIdentityTypeIdentificationType($uid: String) {
    deleteIdentityTypeIdentificationType(uid: $uid) {
      ${responseGqlFields(mappingGqlFields)}
    }
  }
`;

const MAP_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_IDENTITY_TYPE_IDENTIFICATION_TYPE',
  'ROLE_VIEW_IDENTITY_TYPE_IDENTIFICATION_TYPE',
];
const MAP_WRITE_PERMISSIONS = [
  'ROLE_CREATE_IDENTITY_TYPE_IDENTIFICATION_TYPE',
  'ROLE_UPDATE_IDENTITY_TYPE_IDENTIFICATION_TYPE',
];
const MAP_DELETE_PERMISSIONS = ['ROLE_DELETE_IDENTITY_TYPE_IDENTIFICATION_TYPE'];

function mapUpsertBtn(
  comp: BaseComponent,
  identityTypeUid: string | undefined,
  editing: boolean,
): ActionButton {
  return {
    icon: editing ? 'edit' : 'add',
    label: editing ? 'Edit' : 'Map Identification Type',
    class: editing ? '' : 'btn-add-primary',
    click: (row?: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: editing
          ? { uid: row?.uid, identificationType: row?.identificationType, description: row?.description }
          : {},
        title: editing ? 'Edit Mapping' : 'Map Identification Type',
        fields: [
          {
            key: 'identificationType',
            label: 'Identification Type',
            hint: 'Each one belongs to a single identity type.',
            type: FieldType.select,
            options: IDENTIFICATION_TYPE_OPTIONS,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          {
            key: 'description',
            label: 'Description',
            hint: 'Optional. Generated from the label and this identity type when left blank.',
            type: FieldType.textarea,
            rows: 2,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: { identityTypeUid, ...value } },
            mutation: SAVE_IDENTITY_TYPE_IDENTIFICATION,
            successFn: (res) => {
              identityTypeIdentification$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: MAP_WRITE_PERMISSIONS,
  };
}

function mapRemoveBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'block',
    label: 'Unmap',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Unmap Identification Type',
      confirmText: 'UNMAP',
      confirmButtonColor: 'red',
      message: `Stop treating <b class='text-danger'>${getDisplayName(
        row?.identificationType,
      )}</b> as this identity type?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: DELETE_IDENTITY_TYPE_IDENTIFICATION,
        successFn: (res) => identityTypeIdentification$.next(res?.data),
      });
    },
    permissions: MAP_DELETE_PERMISSIONS,
  };
}

/** The labels that mean one identity type, for its detail page. */
export const identityTypeIdentificationsPanel = (
  comp: BaseComponent,
  identityTypeUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Identification Types',
  label: 'Identification Types',
  icon: 'id_card',
  permissions: MAP_VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    {
      field: 'identificationType',
      header: 'Identification Type',
      valueFn: (row: any) => getDisplayName(row?.identificationType),
    },
    'description',
    'actions',
  ],
  headerButtons: [mapUpsertBtn(comp, identityTypeUid, false)],
  actionButtons: [
    { ...MORE_BTN, buttons: [mapUpsertBtn(comp, identityTypeUid, true), mapRemoveBtn(comp)] },
  ],
  reloadActions$: [identityTypeIdentification$],
  fetchParameter: {
    query: IDENTIFICATIONS_OF_IDENTITY_TYPE,
    variables: { identityTypeUid },
  },
});
