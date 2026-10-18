import { Validators } from '@angular/forms';
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

/**
 * A postal and physical address on a record's detail page — a person's
 * (`contact_informations_bio_data`, internal users included) or an
 * organisation's (`contact_informations_business_names`). Both follow the same
 * rules.
 *
 * One per record, so the panel shows a single row and the button reads Set
 * rather than Add; setting it again replaces it. The query still answers with a
 * list, because a table reads a list: a list of nought or one.
 *
 * Guarded by the record's own roles: whoever may edit the person or the
 * organisation may edit its address.
 */

const addressGqlFields = `
  uid
  postalAddress
  physicalAddress
`;

/** One kind of record an address hangs off. */
interface AddressOwner {
  /** What the address is taken off, in the remove confirmation. */
  ownerLabel: string;
  /** What the read and the save call the owning record, e.g. `bioDataUid`. */
  ownerArg: string;
  /** UPPER_SNAKE permission suffix of the owning record, e.g. `BIO_DATA`. */
  permission: string;
  byOwner: unknown;
  save: unknown;
  remove: unknown;
  changed$: Subject<unknown>;
}

const PERSON: AddressOwner = {
  ownerLabel: 'this person',
  ownerArg: 'bioDataUid',
  permission: 'BIO_DATA',
  byOwner: gql`
    query addressByBioData($bioDataUid: String) {
      addressByBioData(bioDataUid: $bioDataUid) {
        ${addressGqlFields}
      }
    }
  `,
  save: gql`
    mutation savePersonAddress($input: PersonAddressDtoInput) {
      savePersonAddress(input: $input) {
        ${responseGqlFields(addressGqlFields)}
      }
    }
  `,
  remove: gql`
    mutation removePersonAddress($uid: String) {
      removePersonAddress(uid: $uid) {
        ${responseGqlFields(addressGqlFields)}
      }
    }
  `,
  changed$: new Subject<unknown>(),
};

const ORGANISATION: AddressOwner = {
  ownerLabel: 'this organisation',
  ownerArg: 'businessNameUid',
  permission: 'BUSINESS_NAME',
  byOwner: gql`
    query addressByBusinessName($businessNameUid: String) {
      addressByBusinessName(businessNameUid: $businessNameUid) {
        ${addressGqlFields}
      }
    }
  `,
  save: gql`
    mutation saveBusinessNameAddress($input: BusinessNameAddressDtoInput) {
      saveBusinessNameAddress(input: $input) {
        ${responseGqlFields(addressGqlFields)}
      }
    }
  `,
  remove: gql`
    mutation removeBusinessNameAddress($uid: String) {
      removeBusinessNameAddress(uid: $uid) {
        ${responseGqlFields(addressGqlFields)}
      }
    }
  `,
  changed$: new Subject<unknown>(),
};

/** Refuses what `contact_informations33` and `34` refuse: ' " & < >. Spaces are fine. */
const VALIDATOR_ADDRESS = {
  name: 'pattern',
  message: 'Must not contain \' " & < or >',
  validator: Validators.pattern(/^[^'"&<>]*$/),
};

const addressFields = (): FieldConfig[] => [
  {
    key: 'postalAddress',
    label: 'Postal Address',
    hint: 'For example P.O. Box 1234, Dodoma',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_ADDRESS],
    class: 'col-span-full',
  },
  {
    key: 'physicalAddress',
    label: 'Physical Address',
    hint: 'Where they can be found',
    type: FieldType.textarea,
    rows: 2,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_ADDRESS],
    class: 'col-span-full',
  },
];

function setAddressBtn(
  comp: BaseComponent,
  owner: AddressOwner,
  ownerUid: string | undefined,
  editing: boolean,
): ActionButton {
  return {
    icon: editing ? 'edit' : 'add',
    label: editing ? 'Change' : 'Set Address',
    class: editing ? '' : 'btn-add-primary',
    click: (row?: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: editing
          ? { postalAddress: row?.postalAddress, physicalAddress: row?.physicalAddress }
          : {},
        title: editing ? 'Change Address' : 'Set Address',
        fields: addressFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: { [owner.ownerArg]: ownerUid, ...value } },
            mutation: owner.save,
            successFn: (res) => {
              owner.changed$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: [`ROLE_UPDATE_${owner.permission}`],
  };
}

function removeAddressBtn(comp: BaseComponent, owner: AddressOwner): ActionButton {
  return {
    icon: 'delete',
    label: 'Remove',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Remove Address',
      confirmText: 'REMOVE',
      confirmButtonColor: 'red',
      message:
        `Remove the address <b class='text-danger'>${row?.postalAddress ?? ''}</b> ` +
        `from ${owner.ownerLabel}?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: owner.remove,
        successFn: (res) => owner.changed$.next(res?.data),
      });
    },
    permissions: [`ROLE_UPDATE_${owner.permission}`],
  };
}

const addressPanel = (
  comp: BaseComponent,
  owner: AddressOwner,
  ownerUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Address',
  label: 'Address',
  icon: 'location_on',
  permissions: [`ROLE_VIEW_ALL_${owner.permission}`, `ROLE_VIEW_${owner.permission}`],
  keyColumns: [
    'index',
    'postalAddress as Postal Address',
    'physicalAddress as Physical Address',
    'actions',
  ],
  headerButtons: [setAddressBtn(comp, owner, ownerUid, false)],
  actionButtons: [
    {
      ...MORE_BTN,
      buttons: [setAddressBtn(comp, owner, ownerUid, true), removeAddressBtn(comp, owner)],
    },
  ],
  reloadActions$: [owner.changed$],
  fetchParameter: { query: owner.byOwner, variables: { [owner.ownerArg]: ownerUid } },
});

/** A person's address, for their page in Settings. */
export const personAddressPanel = (comp: BaseComponent, bioDataUid?: string): ContentParameter =>
  addressPanel(comp, PERSON, bioDataUid);

/** An organisation's address, for its page. */
export const businessNameAddressPanel = (
  comp: BaseComponent,
  businessNameUid?: string,
): ContentParameter => addressPanel(comp, ORGANISATION, businessNameUid);
