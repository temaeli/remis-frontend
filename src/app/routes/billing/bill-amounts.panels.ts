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
 * What a bill owes before any penalty, and the penalty charged on top of it —
 * `principal_amounts` and `penalty_amounts`.
 *
 * Two panels on the bill's own page rather than two lookup screens: both hang off
 * one bill, and a principal read out of a global list says nothing. A penalty
 * keys on the principal it grew from, not on the bill, so its form picks from
 * this bill's principals.
 *
 * Both tables carry the usual code/name/description triple, all three UNIQUE, so
 * the forms ask for a name and a description and the backend says which one
 * clashed.
 */

const principalReloaded$ = new Subject<unknown>();
const penaltyReloaded$ = new Subject<unknown>();

const principalFields = `
  id
  uid: id
  assignedNumber
  name
  description
  principalAmount
  gracePeriodBillHeadersSetting { id }
`;

const penaltyFields = `
  id
  uid: id
  assignedNumber
  name
  description
  penaltyAmount
  principalAmount { id name principalAmount }
`;

const PRINCIPALS_OF_OBLIGATION = gql`
  query principalAmountsByGracePeriodBillSetting($obligationUid: String) {
    principalAmountsByGracePeriodBillSetting(gracePeriodBillHeadersSettingUid: $obligationUid) {
      ${principalFields}
    }
  }
`;

const PENALTIES_OF_OBLIGATION = gql`
  query penaltyAmountsByGracePeriodBillSetting($obligationUid: String) {
    penaltyAmountsByGracePeriodBillSetting(gracePeriodBillHeadersSettingUid: $obligationUid) {
      ${penaltyFields}
    }
  }
`;

const SAVE_PRINCIPAL = gql`
  mutation savePrincipalAmount($input: PrincipalAmountDtoInput) {
    savePrincipalAmount(input: $input) {
      ${responseGqlFields(principalFields)}
    }
  }
`;

const DELETE_PRINCIPAL = gql`
  mutation deletePrincipalAmount($uid: String) {
    deletePrincipalAmount(uid: $uid) {
      ${responseGqlFields(principalFields)}
    }
  }
`;

const SAVE_PENALTY = gql`
  mutation savePenaltyAmount($input: PenaltyAmountDtoInput) {
    savePenaltyAmount(input: $input) {
      ${responseGqlFields(penaltyFields)}
    }
  }
`;

const DELETE_PENALTY = gql`
  mutation deletePenaltyAmount($uid: String) {
    deletePenaltyAmount(uid: $uid) {
      ${responseGqlFields(penaltyFields)}
    }
  }
`;

/** The code, name and description every one of these tables keeps unique. */
const describedFields = (): FieldConfig[] => [
  {
    key: 'assignedNumber',
    label: 'Assigned Code',
    hint: 'Left empty, one is generated',
    type: FieldType.input,
  },
  { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

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

function openPrincipalForm(comp: BaseComponent, obligationUid?: string, row?: Lookup) {
  return async () => {
    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['id'] ? 'Change Principal' : 'Add Principal',
      model: row?.['id']
        ? {
            uid: row['id'],
            assignedNumber: row['assignedNumber'],
            name: row['name'],
            description: row['description'],
            principalAmount: row['principalAmount'],
          }
        : {},
      fields: [...describedFields(), amountField('principalAmount', 'Principal Amount')],
      closeAction$: close$,

      onSubmit: async (value: any) => {
        await comp.fs.fetch({
          notify: true,
          variables: { input: { ...value, gracePeriodBillHeadersSettingUid: obligationUid } },
          mutation: SAVE_PRINCIPAL,
          successFn: (res) => {
            principalReloaded$.next(res?.data);
            close$.next();
          },
        });
      },
    };

    comp.vs?.openModal(FormComponent, formParameter, '45%');
  };
}

function openPenaltyForm(comp: BaseComponent, obligationUid?: string, row?: Lookup) {
  return async () => {
    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['id'] ? 'Change Penalty' : 'Add Penalty',
      model: row?.['id']
        ? {
            uid: row['id'],
            assignedNumber: row['assignedNumber'],
            name: row['name'],
            description: row['description'],
            principalAmountUid: row['principalAmount']?.id,
            penaltyAmount: row['penaltyAmount'],
          }
        : {},
      fields: [
        // This bill's principals only: a penalty belongs to the amount it grew
        // from, and one from another bill would be unreadable here.
        {
          key: 'principalAmountUid',
          label: 'Principal',
          type: FieldType.select,
          optionsVariables: {
            labelKey: 'name',
            valueKey: 'id',
            fetchParameter: { query: PRINCIPALS_OF_OBLIGATION, variables: { obligationUid } },
          },
          validations: [VALIDATOR_REQUIRED],
          class: 'col-span-full',
        },
        ...describedFields(),
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
  'assignedNumber as Code',
  'name as Name',
  { field: 'principalAmount', header: 'Principal' },
  'actions',
];

const penaltyColumns: GridKeyColumn[] = [
  'index',
  'assignedNumber as Code',
  'name as Name',
  'principalAmount.name as Principal',
  { field: 'penaltyAmount', header: 'Penalty' },
  'actions',
];

const removeBtn = (
  comp: BaseComponent,
  what: string,
  mutation: unknown,
  reloaded$: Subject<unknown>,
  permission: string,
): ActionButton => ({
  ...MORE_BTN,
  buttons: [
    {
      icon: 'delete',
      label: 'Remove',
      class: 'text-danger',
      click: async (row: Lookup) => {
        const confirmed = await comp.notify.confirm({
          title: `Remove ${what}`,
          message: `Remove ${row?.['name'] ?? `this ${what.toLowerCase()}`} from the bill?`,
          confirmText: 'REMOVE',
          confirmButtonColor: 'red',
        });
        if (!confirmed) {
          return;
        }
        await comp.fs.fetch({
          notify: true,
          loadingOn: 'content',
          variables: { uid: row?.['id'] },
          mutation,
          successFn: (res) => reloaded$.next(res?.data),
        });
      },
      permissions: [`ROLE_DELETE_${permission}`],
    },
  ],
});

/** The principal owed on this bill, and the penalties charged on it. */
/**
 * The principal owed under one renewal obligation, and the penalties on it.
 *
 * Keyed on a `grace_periods_bill_headers_settings` row — the person, the
 * setting and the fee — not on a bill. A principal outlives any one bill:
 * the same obligation is billed again next year.
 *
 * Not mounted anywhere yet. It hung off the bill's own screen while
 * `principal_amounts` keyed on `bill_headers`, and there is no path from a bill
 * to an obligation now. It needs a home on whatever screen knows one.
 */
export const obligationAmountPanels = (
  comp: BaseComponent,
  obligationUid?: string,
): ContentParameter[] => [
  {
    type: 'table',
    name: 'Principal Amounts',
    label: 'Principal Amounts',
    icon: 'coins',
    permissions: ['ROLE_VIEW_ALL_PRINCIPAL_AMOUNT', 'ROLE_VIEW_PRINCIPAL_AMOUNT'],
    keyColumns: principalColumns,
    headerButtons: [
      {
        icon: 'add',
        label: 'Add Principal',
        class: 'btn-add-primary',
        click: openPrincipalForm(comp, obligationUid),
        permissions: ['ROLE_CREATE_PRINCIPAL_AMOUNT', 'ROLE_UPDATE_PRINCIPAL_AMOUNT'],
      } as ActionButton,
    ],
    actionButtons: [
      {
        icon: 'edit',
        label: 'Edit',
        click: (row: Lookup) => openPrincipalForm(comp, obligationUid, row)(),
        permissions: ['ROLE_UPDATE_PRINCIPAL_AMOUNT'],
      },
      removeBtn(comp, 'Principal', DELETE_PRINCIPAL, principalReloaded$, 'PRINCIPAL_AMOUNT'),
    ],
    reloadActions$: [principalReloaded$, penaltyReloaded$],
    fetchParameter: { query: PRINCIPALS_OF_OBLIGATION, variables: { obligationUid } },
  },
  {
    type: 'table',
    name: 'Penalties',
    label: 'Penalties',
    icon: 'warning',
    permissions: ['ROLE_VIEW_ALL_PENALTY_AMOUNT', 'ROLE_VIEW_PENALTY_AMOUNT'],
    keyColumns: penaltyColumns,
    headerButtons: [
      {
        icon: 'add',
        label: 'Add Penalty',
        class: 'btn-add-primary',
        click: openPenaltyForm(comp, obligationUid),
        permissions: ['ROLE_CREATE_PENALTY_AMOUNT', 'ROLE_UPDATE_PENALTY_AMOUNT'],
      } as ActionButton,
    ],
    actionButtons: [
      {
        icon: 'edit',
        label: 'Edit',
        click: (row: Lookup) => openPenaltyForm(comp, obligationUid, row)(),
        permissions: ['ROLE_UPDATE_PENALTY_AMOUNT'],
      },
      removeBtn(comp, 'Penalty', DELETE_PENALTY, penaltyReloaded$, 'PENALTY_AMOUNT'),
    ],
    reloadActions$: [penaltyReloaded$],
    fetchParameter: { query: PENALTIES_OF_OBLIGATION, variables: { obligationUid } },
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
 * The bills sitting under this one — `bill_headers_bill_headers`, which is what
 * a combined bill is at GePG: a group bill carrying others.
 *
 * A plain link panel: the table holds a parent, a child and nothing else. The
 * backend refuses a bill under itself and a child already under another parent,
 * neither of which the table forbids.
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
];

export const childBillPanels = (comp: BaseComponent, obligationUid?: string): ContentParameter[] =>
  entityLinkPanels(comp, CHILD_BILL_LINKS, obligationUid);
