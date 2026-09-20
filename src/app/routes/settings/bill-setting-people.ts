import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * Which people a bill header setting applies to —
 * `bill_headers_settings_bio_data`.
 *
 * The setting says how a bill is raised; this says whom it is raised for. Shown
 * from both sides: the people on a setting's page, and the settings on a
 * person's.
 *
 * Deliberately does not import the lookup registry it hangs off, which would be
 * a cycle — the same reason `person-links` keeps its own queries.
 */

/** Notifies both panels that a person was attached or removed. */
export const billSettingPerson$ = new Subject<unknown>();

const settingPersonGqlFields = `
  id
  uid: id
  assignedNumber
  description
  createdAt
  billHeadersSetting {
    id
    name
  }
  person {
    id
    firstName
    secondName
    thirdName
  }
`;

export const PEOPLE_OF_BILL_SETTING = gql`
  query peopleByBillHeadersSetting($billHeadersSettingUid: String) {
    peopleByBillHeadersSetting(billHeadersSettingUid: $billHeadersSettingUid) {
      ${settingPersonGqlFields}
    }
  }
`;

export const BILL_SETTINGS_OF_PERSON = gql`
  query billHeadersSettingsByPerson($bioDataUid: String) {
    billHeadersSettingsByPerson(bioDataUid: $bioDataUid) {
      ${settingPersonGqlFields}
    }
  }
`;

const ALL_PEOPLE_FOR_LINK = gql`
  query allBioData {
    allBioData {
      id
      firstName
      secondName
      thirdName
    }
  }
`;

const ALL_BILL_SETTINGS_FOR_LINK = gql`
  query allBillHeadersSettings {
    allBillHeadersSettings {
      id
      name
    }
  }
`;

export const SAVE_BILL_SETTING_PERSON = gql`
  mutation saveBillHeadersSettingPerson($input: BillHeadersSettingPersonDtoInput) {
    saveBillHeadersSettingPerson(input: $input) {
      ${responseGqlFields(settingPersonGqlFields)}
    }
  }
`;

export const DELETE_BILL_SETTING_PERSON = gql`
  mutation deleteBillHeadersSettingPerson($uid: String) {
    deleteBillHeadersSettingPerson(uid: $uid) {
      ${responseGqlFields(settingPersonGqlFields)}
    }
  }
`;

const VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_BILL_HEADERS_SETTING_PERSON',
  'ROLE_VIEW_BILL_HEADERS_SETTING_PERSON',
];
const WRITE_PERMISSIONS = [
  'ROLE_CREATE_BILL_HEADERS_SETTING_PERSON',
  'ROLE_UPDATE_BILL_HEADERS_SETTING_PERSON',
];
const DELETE_PERMISSIONS = ['ROLE_DELETE_BILL_HEADERS_SETTING_PERSON'];

/** First, middle and last, skipping whichever are absent. */
const fullName = (person: any): string =>
  [person?.firstName, person?.secondName, person?.thirdName].filter(Boolean).join(' ').trim();

/**
 * One button for both sides of the link.
 *
 * On a setting's page the person is chosen; on a person's page the setting is.
 * The other end comes from whichever record the panel is on, so it is never
 * asked for twice.
 */
function attachBtn(
  comp: BaseComponent,
  fixed: { billHeadersSettingUid?: string; bioDataUid?: string },
): ActionButton {
  const choosingPerson = !!fixed.billHeadersSettingUid;
  return {
    icon: 'add',
    label: choosingPerson ? 'Attach Person' : 'Attach Setting',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: choosingPerson ? 'Attach Person' : 'Attach Setting',
        fields: [
          choosingPerson
            ? {
                key: 'bioDataUid',
                label: 'Person',
                type: FieldType.select,
                optionsVariables: {
                  valueKey: 'id',
                  fetchParameter: { query: ALL_PEOPLE_FOR_LINK },
                  mapFunction: (option: any) => ({
                    ...option,
                    label: fullName(option),
                    value: option.id,
                  }),
                },
                validations: [VALIDATOR_REQUIRED],
                class: 'col-span-full',
              }
            : {
                key: 'billHeadersSettingUid',
                label: 'Automatic Bill Setting',
                type: FieldType.select,
                optionsVariables: {
                  labelKey: 'name',
                  valueKey: 'id',
                  fetchParameter: { query: ALL_BILL_SETTINGS_FOR_LINK },
                },
                validations: [VALIDATOR_REQUIRED],
                class: 'col-span-full',
              },
          {
            key: 'description',
            label: 'Note',
            hint: 'Optional. Generated from the setting and the person when left blank.',
            type: FieldType.textarea,
            rows: 2,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: { ...fixed, ...value } },
            mutation: SAVE_BILL_SETTING_PERSON,
            successFn: (res) => {
              billSettingPerson$.next(res?.data);
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

function detachBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'block',
    label: 'Remove',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Remove',
      confirmText: 'REMOVE',
      confirmButtonColor: 'red',
      message: `Stop applying <b class='text-danger'>${
        row?.billHeadersSetting?.name ?? 'this setting'
      }</b> to <b class='text-danger'>${fullName(row?.person)}</b>?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: DELETE_BILL_SETTING_PERSON,
        successFn: (res) => billSettingPerson$.next(res?.data),
      });
    },
    permissions: DELETE_PERMISSIONS,
  };
}

/** The people one setting applies to, for its detail page. */
export const billSettingPeoplePanel = (
  comp: BaseComponent,
  billHeadersSettingUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Applies To',
  label: 'Applies To',
  icon: 'users',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    { field: 'person', header: 'Person', valueFn: (row: any) => fullName(row?.person) },
    'description as Note',
    { field: 'createdAt', header: 'Attached' },
    'actions',
  ],
  headerButtons: [attachBtn(comp, { billHeadersSettingUid })],
  actionButtons: [{ ...MORE_BTN, buttons: [detachBtn(comp)] }],
  reloadActions$: [billSettingPerson$],
  fetchParameter: { query: PEOPLE_OF_BILL_SETTING, variables: { billHeadersSettingUid } },
});

/** The settings one person is attached to, for their detail page. */
export const personBillSettingsPanel = (
  comp: BaseComponent,
  bioDataUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Automatic Bill Settings',
  label: 'Automatic Bill Settings',
  icon: 'bill',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    'billHeadersSetting.name as Setting',
    'description as Note',
    { field: 'createdAt', header: 'Attached' },
    'actions',
  ],
  headerButtons: [attachBtn(comp, { bioDataUid })],
  actionButtons: [{ ...MORE_BTN, buttons: [detachBtn(comp)] }],
  reloadActions$: [billSettingPerson$],
  fetchParameter: { query: BILL_SETTINGS_OF_PERSON, variables: { bioDataUid } },
});
