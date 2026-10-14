import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

import { PARTY_OPTIONS, partyColumn } from './party-links';

/**
 * Which people are linked to an organisation on the register, and as what —
 * `bio_data_business_names`, a join table with its own link/unlink pair and a
 * `parties` column that defaults to EMPLOYEE. Linking a pair that is already
 * linked changes its party.
 *
 * Shown on the organisation's detail page. Deliberately does not import the
 * lookup registry it hangs off, which would be a cycle; `party-links` imports
 * nothing from the app, so taking the party list from there is safe.
 *
 * People are labelled from their names rather than `bio_data.name`: that column
 * is nullable and nothing on the user-creation path fills it in, so a select
 * bound to it would be a list of blanks.
 */

/** Notifies the panel that a link was made or broken. */
export const personBusinessName$ = new Subject<unknown>();

const linkRowGqlFields = `
  uid
  party
  person {
    id
    firstName
    secondName
    thirdName
  }
  businessName {
    id
    assignedNumber
    name
  }
`;

export const PEOPLE_OF_BUSINESS_NAME = gql`
  query personBusinessNamesByBusinessName($businessNameUid: String) {
    personBusinessNamesByBusinessName(businessNameUid: $businessNameUid) {
      ${linkRowGqlFields}
    }
  }
`;

export const BUSINESS_NAMES_OF_PERSON = gql`
  query personBusinessNamesByPerson($personUid: String) {
    personBusinessNamesByPerson(personUid: $personUid) {
      ${linkRowGqlFields}
    }
  }
`;

const ALL_BUSINESS_NAMES_FOR_LINK = gql`
  query allBusinessNames {
    allBusinessNames {
      id
      name
    }
  }
`;

export const LINK_PERSON_BUSINESS_NAME = gql`
  mutation linkPersonBusinessName($personUid: String, $businessNameUid: String, $party: Party) {
    linkPersonBusinessName(personUid: $personUid, businessNameUid: $businessNameUid, party: $party) {
      ${responseGqlFields(linkRowGqlFields)}
    }
  }
`;

export const UNLINK_PERSON_BUSINESS_NAME = gql`
  mutation unlinkPersonBusinessName($uid: String) {
    unlinkPersonBusinessName(uid: $uid) {
      ${responseGqlFields(linkRowGqlFields)}
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

//  Permissions, as declared on PersonBusinessNameController.
const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_PERSON_BUSINESS_NAME', 'ROLE_VIEW_PERSON_BUSINESS_NAME'];
const LINK_PERMISSIONS = ['ROLE_CREATE_PERSON_BUSINESS_NAME', 'ROLE_UPDATE_PERSON_BUSINESS_NAME'];
const UNLINK_PERMISSIONS = ['ROLE_DELETE_PERSON_BUSINESS_NAME'];

/** First, middle and last, skipping whichever are absent. */
const fullName = (person?: {
  firstName?: string;
  secondName?: string;
  thirdName?: string;
}): string =>
  [person?.firstName, person?.secondName, person?.thirdName].filter(Boolean).join(' ').trim();

/** What the person is to the organisation. Both link forms start it at EMPLOYEE, the database default. */
const partyFormField: FieldConfig = {
  key: 'party',
  label: 'Party',
  hint: 'What they are to the organisation',
  type: FieldType.select,
  options: PARTY_OPTIONS,
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
};

function linkBtn(comp: BaseComponent, businessNameUid?: string): ActionButton {
  return {
    icon: 'add',
    label: 'Link Person',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { party: 'EMPLOYEE' },
        title: 'Link Person',
        fields: [
          {
            key: 'personUid',
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
          },
          partyFormField,
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { businessNameUid, ...value },
            mutation: LINK_PERSON_BUSINESS_NAME,
            successFn: (res) => {
              personBusinessName$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: LINK_PERMISSIONS,
  };
}

function unlinkBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'block',
    label: 'Unlink',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'UNLINK',
      confirmText: 'UNLINK',
      confirmButtonColor: 'red',
      message: `Are you sure you want to unlink <b class='text-danger'>${fullName(
        row?.person,
      )}</b> ?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: UNLINK_PERSON_BUSINESS_NAME,
        successFn: (res) => personBusinessName$.next(res?.data),
      });
    },
    permissions: UNLINK_PERMISSIONS,
  };
}

function linkOrganisationBtn(comp: BaseComponent, personUid?: string): ActionButton {
  return {
    icon: 'add',
    label: 'Link Organisation',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { party: 'EMPLOYEE' },
        title: 'Link Organisation',
        fields: [
          {
            key: 'businessNameUid',
            label: 'Organisation',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: ALL_BUSINESS_NAMES_FOR_LINK },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          partyFormField,
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { personUid, ...value },
            mutation: LINK_PERSON_BUSINESS_NAME,
            successFn: (res) => {
              personBusinessName$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: LINK_PERMISSIONS,
  };
}

/** The organisations one person is linked to, for their detail page. */
export const personOrganisationsPanel = (
  comp: BaseComponent,
  personUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Linked Organisations',
  label: 'Linked Organisations',
  icon: 'institution',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    'businessName.assignedNumber as Assigned Number',
    'businessName.name as Organisation',
    partyColumn,
    'actions',
  ],
  headerButtons: [linkOrganisationBtn(comp, personUid)],
  actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp)] }],
  reloadActions$: [personBusinessName$],
  fetchParameter: { query: BUSINESS_NAMES_OF_PERSON, variables: { personUid } },
});

/** The people linked to one organisation, for its detail page. */
export const businessNamePeoplePanel = (
  comp: BaseComponent,
  businessNameUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Linked People',
  label: 'Linked People',
  icon: 'users',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    { field: 'person', header: 'Name', valueFn: (row: any) => fullName(row?.person) },
    partyColumn,
    'actions',
  ],
  headerButtons: [linkBtn(comp, businessNameUid)],
  actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp)] }],
  reloadActions$: [personBusinessName$],
  fetchParameter: { query: PEOPLE_OF_BUSINESS_NAME, variables: { businessNameUid } },
});
