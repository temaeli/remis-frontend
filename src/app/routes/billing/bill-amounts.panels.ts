import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { entityLinkPanels, EntityLinkConfig } from '@shared/lookup';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { Lookup } from '@shared/lookup/lookup.interface';

/**
 * What each line of a bill owes before any penalty, and the penalties charged on
 * its lines — `bill_items_principal_amounts` and `bill_items_penalty_amounts`.
 *
 * Two panels on the bill's own page. The principal is read only: the backend
 * records it as what the line comes to whenever the line is saved, so there is
 * nothing here to type. A penalty is entered by hand against one of this bill's
 * lines, and a line can carry several.
 *
 * Neither table has a code, a name or a description: a row is a line and an
 * amount.
 */

const penaltyReloaded$ = new Subject<unknown>();

const lineFields = `
  billItem {
    id
    assignedNumber
    name
  }
`;

const penaltyFields = `
  uid
  penaltyAmount
  ${lineFields}
`;

const PRINCIPALS_OF_BILL = gql`
  query billItemPrincipalAmountsOfBill($billDetailUid: String) {
    billItemPrincipalAmountsOfBill(billDetailUid: $billDetailUid) {
      uid
      principalAmount
      ${lineFields}
    }
  }
`;

const PENALTIES_OF_BILL = gql`
  query billItemPenaltyAmountsOfBill($billDetailUid: String) {
    billItemPenaltyAmountsOfBill(billDetailUid: $billDetailUid) {
      ${penaltyFields}
    }
  }
`;

/** This bill's lines, for choosing the one a penalty is charged on. */
const LINES_OF_BILL = gql`
  query billItemsOfBill($billDetailUid: String) {
    billItemsOfBill(billDetailUid: $billDetailUid) {
      id
      assignedNumber
      name
    }
  }
`;

const SAVE_PENALTY = gql`
  mutation saveBillItemPenaltyAmount($input: BillItemPenaltyAmountDtoInput) {
    saveBillItemPenaltyAmount(input: $input) {
      ${responseGqlFields(penaltyFields)}
    }
  }
`;

const DELETE_PENALTY = gql`
  mutation deleteBillItemPenaltyAmount($uid: String) {
    deleteBillItemPenaltyAmount(uid: $uid) {
      ${responseGqlFields('uid')}
    }
  }
`;

const amountField = (key: string, label: string): FieldConfig => ({
  key,
  label,
  hint: 'Zero or more',
  type: FieldType.decimal,
  decimals: 6,
  min: 0,
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

function openPenaltyForm(comp: BaseComponent, billUid?: string, row?: Lookup) {
  return async () => {
    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['uid'] ? 'Change Penalty' : 'Add Penalty',
      model: row?.['uid']
        ? {
            uid: row['uid'],
            billItemUid: (row['billItem'] as Lookup)?.['id'],
            penaltyAmount: row['penaltyAmount'],
          }
        : {},
      fields: [
        // This bill's lines only: a penalty belongs to the line it is charged
        // on, and one from another bill would be unreadable here.
        {
          key: 'billItemUid',
          label: 'Bill Line',
          hint: 'The line the penalty is charged on, by its reference',
          type: FieldType.select,
          optionsVariables: {
            labelKey: 'assignedNumber',
            valueKey: 'id',
            fetchParameter: { query: LINES_OF_BILL, variables: { billDetailUid: billUid } },
          },
          validations: [VALIDATOR_REQUIRED],
          class: 'col-span-full',
        },
        amountField('penaltyAmount', 'Penalty Amount'),
      ],
      closeAction$: close$,

      onSubmit: async (value: any) => {
        await comp.fs.fetch({
          notify: true,
          variables: { input: value },
          mutation: SAVE_PENALTY,
          successFn: (res) => {
            penaltyReloaded$.next(res?.data);
            close$.next();
          },
        });
      },
    };

    comp.vs?.openModal(FormComponent, formParameter, '45%');
  };
}

const principalColumns: GridKeyColumn[] = [
  'index',
  'billItem.assignedNumber as Line',
  'billItem.name as Name',
  { field: 'principalAmount', header: 'Principal' },
];

const penaltyColumns: GridKeyColumn[] = [
  'index',
  'billItem.assignedNumber as Line',
  'billItem.name as Name',
  { field: 'penaltyAmount', header: 'Penalty' },
  'actions',
];

const removePenaltyBtn = (comp: BaseComponent): ActionButton => ({
  ...MORE_BTN,
  buttons: [
    {
      icon: 'delete',
      label: 'Remove',
      class: 'text-danger',
      click: async (row: Lookup) => {
        const confirmed = await comp.notify.confirm({
          title: 'Remove Penalty',
          message: `Remove this penalty of ${row?.['penaltyAmount'] ?? ''} from the line?`,
          confirmText: 'REMOVE',
          confirmButtonColor: 'red',
        });
        if (!confirmed) {
          return;
        }
        await comp.fs.fetch({
          notify: true,
          loadingOn: 'content',
          variables: { uid: row?.['uid'] },
          mutation: DELETE_PENALTY,
          successFn: (res) => penaltyReloaded$.next(res?.data),
        });
      },
      permissions: ['ROLE_DELETE_BILL_ITEM_PENALTY_AMOUNT'],
    },
  ],
});

/** What each line of this bill owes, and the penalties charged on its lines. */
export const lineAmountPanels = (comp: BaseComponent, billUid?: string): ContentParameter[] => [
  {
    type: 'table',
    name: 'Principal Amounts',
    label: 'Principal Amounts',
    icon: 'coins',
    permissions: [
      'ROLE_VIEW_ALL_BILL_ITEM_PRINCIPAL_AMOUNT',
      'ROLE_VIEW_BILL_ITEM_PRINCIPAL_AMOUNT',
    ],
    keyColumns: principalColumns,
    fetchParameter: { query: PRINCIPALS_OF_BILL, variables: { billDetailUid: billUid } },
  },
  {
    type: 'table',
    name: 'Penalties',
    label: 'Penalties',
    icon: 'warning',
    permissions: ['ROLE_VIEW_ALL_BILL_ITEM_PENALTY_AMOUNT', 'ROLE_VIEW_BILL_ITEM_PENALTY_AMOUNT'],
    keyColumns: penaltyColumns,
    headerButtons: [
      {
        icon: 'add',
        label: 'Add Penalty',
        class: 'btn-add-primary',
        click: openPenaltyForm(comp, billUid),
        permissions: [
          'ROLE_CREATE_BILL_ITEM_PENALTY_AMOUNT',
          'ROLE_UPDATE_BILL_ITEM_PENALTY_AMOUNT',
        ],
      } as ActionButton,
    ],
    actionButtons: [
      {
        icon: 'edit',
        label: 'Edit',
        click: (row: Lookup) => openPenaltyForm(comp, billUid, row)(),
        permissions: ['ROLE_UPDATE_BILL_ITEM_PENALTY_AMOUNT'],
      },
      removePenaltyBtn(comp),
    ],
    reloadActions$: [penaltyReloaded$],
    fetchParameter: { query: PENALTIES_OF_BILL, variables: { billDetailUid: billUid } },
  },
];

/** Every bill, for the picker that places one under another. */
const ALL_BILL_HEADERS = gql`
  query allBillHeaders {
    allBillHeaders {
      id
      assignedNumber
      name
    }
  }
`;

/**
 * The bills sitting under this one — `bill_headers_bill_headers`. A renewal is
 * placed under the bill it follows by the renewal run, so a bill with nothing
 * above it is a first bill. A link can also be made by hand.
 *
 * A plain link panel: the table holds a parent, a child and nothing else. The
 * backend refuses a bill under itself and a child already under another parent,
 * neither of which the table forbids.
 *
 * Beside it, the bills this one carries as a bulk bill —
 * `bulk_bills_connections`, the same shape in a table of its own. There the
 * backend refuses a bill under itself and a loop.
 */
const CHILD_BILL_LINKS: EntityLinkConfig[] = [
  {
    entity: 'BillHeaderConnection',
    byOwnerQuery: 'billHeaderConnectionsByParent',
    ownerArg: 'parentUid',
    targetArg: 'childUid',
    field: 'child',
    label: 'Child Bill',
    pluralLabel: 'Child Bills',
    icon: 'bill',
    permission: 'BILL_HEADER_CONNECTION',
    optionsQuery: ALL_BILL_HEADERS,
  },
  {
    entity: 'BulkBillConnection',
    byOwnerQuery: 'bulkBillConnectionsByParent',
    ownerArg: 'parentUid',
    targetArg: 'childUid',
    field: 'child',
    label: 'Bulk Bill Member',
    pluralLabel: 'Bulk Bill Members',
    icon: 'bill',
    permission: 'BULK_BILL_CONNECTION',
    optionsQuery: ALL_BILL_HEADERS,
  },
];

export const childBillPanels = (comp: BaseComponent, obligationUid?: string): ContentParameter[] =>
  entityLinkPanels(comp, CHILD_BILL_LINKS, obligationUid);
