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
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/** The statuses linked to a bill pay option — `bill_pay_options_statuses`. */

/** Tells the panel a link changed. */
export const billPayOptionStatus$ = new Subject<unknown>();

const linkGqlFields = `
  id
  uid
  status
`;

export const STATUSES_OF_BILL_PAY_OPTION = gql`
  query statusesByBillPayOption($billPayOptionUid: String) {
    statusesByBillPayOption(billPayOptionUid: $billPayOptionUid) {
      ${linkGqlFields}
    }
  }
`;

export const ADD_BILL_PAY_OPTION_STATUS = gql`
  mutation addBillPayOptionStatus($billPayOptionUid: String, $status: CoreStatus) {
    addBillPayOptionStatus(billPayOptionUid: $billPayOptionUid, status: $status) {
      ${responseGqlFields(linkGqlFields)}
    }
  }
`;

export const REMOVE_BILL_PAY_OPTION_STATUS = gql`
  mutation removeBillPayOptionStatus($uid: String) {
    removeBillPayOptionStatus(uid: $uid) {
      ${responseGqlFields(linkGqlFields)}
    }
  }
`;

const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_BILL_PAY_OPTION', 'ROLE_VIEW_BILL_PAY_OPTION'];
const ADD_PERMISSIONS = ['ROLE_CREATE_BILL_PAY_OPTION', 'ROLE_UPDATE_BILL_PAY_OPTION'];
const REMOVE_PERMISSIONS = ['ROLE_UPDATE_BILL_PAY_OPTION', 'ROLE_DELETE_BILL_PAY_OPTION'];

function addBtn(comp: BaseComponent, billPayOptionUid: string | undefined, statusOptions: Option[]): ActionButton {
  return {
    icon: 'add',
    label: 'Add Status',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: 'Add Status',
        fields: [
          {
            key: 'status',
            label: 'Status',
            type: FieldType.select,
            options: statusOptions,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: { status: string }) => {
          await comp.fs.fetch({
            notify: true,
            mutation: ADD_BILL_PAY_OPTION_STATUS,
            variables: { billPayOptionUid, status: value.status },
            successFn: (res) => {
              billPayOptionStatus$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: ADD_PERMISSIONS,
  };
}

function removeBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'delete',
    label: 'Remove',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Remove Status',
      confirmText: 'REMOVE',
      confirmButtonColor: 'red',
      message: `Remove <b class='text-danger'>${getDisplayName(row?.status) ?? 'this status'}</b> from this pay option?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        mutation: REMOVE_BILL_PAY_OPTION_STATUS,
        variables: { uid: row?.uid },
        successFn: (res) => billPayOptionStatus$.next(res?.data),
      });
    },
    permissions: REMOVE_PERMISSIONS,
  };
}

/**
 * The statuses one pay option is linked to, for its detail page.
 * `statusOptions` is passed in rather than imported, as the lookups file
 * that owns it imports this one.
 */
export const billPayOptionStatusesPanel = (
  comp: BaseComponent,
  billPayOptionUid: string | undefined,
  statusOptions: Option[],
): ContentParameter => ({
  type: 'table',
  name: 'Statuses',
  label: 'Statuses',
  icon: 'flag',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    { field: 'status', header: 'Status', valueFn: (row: any) => getDisplayName(row?.status) },
    'actions',
  ],
  headerButtons: [addBtn(comp, billPayOptionUid, statusOptions)],
  actionButtons: [{ ...MORE_BTN, buttons: [removeBtn(comp)] }],
  reloadActions$: [billPayOptionStatus$],
  fetchParameter: { query: STATUSES_OF_BILL_PAY_OPTION, variables: { billPayOptionUid } },
});
