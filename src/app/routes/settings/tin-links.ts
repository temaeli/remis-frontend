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
 * Which TIN belongs to whom — `tin_data_bio_data` and `tin_data_business_names`.
 *
 * A person's link is not only a record. When a bill's identity type is mapped to
 * the TIN identification label, this is where GePG's `CustId` reads the number
 * from, so a bill raised under such a type cannot be sent until the link exists.
 *
 * Deliberately does not import the lookup registry it hangs off, which would be
 * a cycle — the same reason `person-links` keeps its own queries.
 */

/** Notifies the panels that a TIN was linked or unlinked. */
export const tinDataLink$ = new Subject<unknown>();

const tinLinkGqlFields = `
  uid
  tinData {
    id
    assignedNumber
    name
  }
`;

export const TINS_OF_PERSON = gql`
  query tinDataByPerson($personUid: String) {
    tinDataByPerson(personUid: $personUid) {
      ${tinLinkGqlFields}
    }
  }
`;

export const TINS_OF_BUSINESS_NAME = gql`
  query tinDataByBusinessName($businessNameUid: String) {
    tinDataByBusinessName(businessNameUid: $businessNameUid) {
      ${tinLinkGqlFields}
    }
  }
`;

const ALL_TIN_DATA_FOR_LINK = gql`
  query allTinDatas {
    allTinDatas {
      id
      assignedNumber
      name
    }
  }
`;

export const LINK_TIN_TO_PERSON = gql`
  mutation linkTinDataToPerson($personUid: String, $tinDataUid: String) {
    linkTinDataToPerson(personUid: $personUid, tinDataUid: $tinDataUid) {
      ${responseGqlFields(tinLinkGqlFields)}
    }
  }
`;

export const UNLINK_TIN_FROM_PERSON = gql`
  mutation unlinkTinDataFromPerson($uid: String) {
    unlinkTinDataFromPerson(uid: $uid) {
      ${responseGqlFields(tinLinkGqlFields)}
    }
  }
`;

export const LINK_TIN_TO_BUSINESS_NAME = gql`
  mutation linkTinDataToBusinessName($businessNameUid: String, $tinDataUid: String) {
    linkTinDataToBusinessName(businessNameUid: $businessNameUid, tinDataUid: $tinDataUid) {
      ${responseGqlFields(tinLinkGqlFields)}
    }
  }
`;

export const UNLINK_TIN_FROM_BUSINESS_NAME = gql`
  mutation unlinkTinDataFromBusinessName($uid: String) {
    unlinkTinDataFromBusinessName(uid: $uid) {
      ${responseGqlFields(tinLinkGqlFields)}
    }
  }
`;

const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_TIN_DATA', 'ROLE_VIEW_TIN_DATA'];
const LINK_PERMISSIONS = ['ROLE_CREATE_TIN_DATA', 'ROLE_UPDATE_TIN_DATA'];
const UNLINK_PERMISSIONS = ['ROLE_DELETE_TIN_DATA', 'ROLE_UPDATE_TIN_DATA'];

function linkTinBtn(
  comp: BaseComponent,
  ownerUid: string | undefined,
  ownerArg: 'personUid' | 'businessNameUid',
  mutation: any,
): ActionButton {
  return {
    icon: 'add',
    label: 'Link TIN',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: 'Link TIN',
        fields: [
          {
            key: 'tinDataUid',
            label: 'TIN',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'assignedNumber',
              valueKey: 'id',
              fetchParameter: { query: ALL_TIN_DATA_FOR_LINK },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { [ownerArg]: ownerUid, ...value },
            mutation,
            successFn: (res) => {
              tinDataLink$.next(res?.data);
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

function unlinkTinBtn(comp: BaseComponent, mutation: any): ActionButton {
  return {
    icon: 'block',
    label: 'Unlink',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'UNLINK',
      confirmText: 'UNLINK',
      confirmButtonColor: 'red',
      message: `Unlink TIN <b class='text-danger'>${row?.tinData?.assignedNumber ?? ''}</b>?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation,
        successFn: (res) => tinDataLink$.next(res?.data),
      });
    },
    permissions: UNLINK_PERMISSIONS,
  };
}

const tinColumns = ['index', 'tinData.assignedNumber as TIN', 'tinData.name as Name', 'actions'];

/**
 * The TINs one person holds, for their detail page.
 *
 * Where GePG's `CustId` comes from when the bill's identity type means TIN.
 */
export const personTinsPanel = (comp: BaseComponent, personUid?: string): ContentParameter => ({
  type: 'table',
  name: 'TINs',
  label: 'TINs',
  icon: 'numbers',
  permissions: VIEW_PERMISSIONS,
  keyColumns: tinColumns,
  headerButtons: [linkTinBtn(comp, personUid, 'personUid', LINK_TIN_TO_PERSON)],
  actionButtons: [{ ...MORE_BTN, buttons: [unlinkTinBtn(comp, UNLINK_TIN_FROM_PERSON)] }],
  reloadActions$: [tinDataLink$],
  fetchParameter: { query: TINS_OF_PERSON, variables: { personUid } },
});

/** The TINs one organisation holds, for its detail page. */
export const businessNameTinsPanel = (
  comp: BaseComponent,
  businessNameUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'TINs',
  label: 'TINs',
  icon: 'numbers',
  permissions: VIEW_PERMISSIONS,
  keyColumns: tinColumns,
  headerButtons: [
    linkTinBtn(comp, businessNameUid, 'businessNameUid', LINK_TIN_TO_BUSINESS_NAME),
  ],
  actionButtons: [{ ...MORE_BTN, buttons: [unlinkTinBtn(comp, UNLINK_TIN_FROM_BUSINESS_NAME)] }],
  reloadActions$: [tinDataLink$],
  fetchParameter: { query: TINS_OF_BUSINESS_NAME, variables: { businessNameUid } },
});
