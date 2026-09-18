import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { Lookup } from '@shared/lookup/lookup.interface';

/**
 * What a grace period bills once it has run out —
 * `remis_core_schema.grace_periods_bill_headers_settings`.
 *
 * Not a lookup screen: the table has no code, name or description and no
 * active/deleted flags, so the generic list has nothing to show and the generic
 * delete has nothing to flip. It is a panel on the grace period's own page, with
 * a form of its own, and rows are removed outright.
 *
 * One row per grace period and bill template — that pair is UNIQUE — so the
 * backend refuses a second and says which template already has one.
 */

const settingReloaded$ = new Subject<unknown>();

/** Named months, so "month 9" on a form reads as September. */
const MONTH_OPTIONS: Option[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((label, index) => ({ value: index + 1, label }));

const monthName = (month?: number): string =>
  MONTH_OPTIONS.find((option) => option.value === month)?.label ?? '';

const settingFieldsGql = `
  id
  uid
  name
  quantities
  day
  month
  gracePeriod { id name }
  billHeadersSetting { id name }
  fee { id name }
  subcategory { id name }
  penalty { id name }
  bioData { id name }
  renew { id name }
  financialYear { id name }
`;

const SETTINGS_BY_GRACE_PERIOD = gql`
  query gracePeriodBillHeadersSettingsByGracePeriod($gracePeriodUid: String) {
    gracePeriodBillHeadersSettingsByGracePeriod(gracePeriodUid: $gracePeriodUid) {
      ${settingFieldsGql}
    }
  }
`;

const SETTINGS_BY_RENEW = gql`
  query gracePeriodBillHeadersSettingsByRenew($renewUid: String) {
    gracePeriodBillHeadersSettingsByRenew(renewUid: $renewUid) {
      ${settingFieldsGql}
    }
  }
`;

const SAVE_SETTING = gql`
  mutation saveGracePeriodBillHeadersSetting($input: GracePeriodBillHeadersSettingDtoInput) {
    saveGracePeriodBillHeadersSetting(input: $input) {
      ${responseGqlFields(settingFieldsGql)}
    }
  }
`;

const DELETE_SETTING = gql`
  mutation deleteGracePeriodBillHeadersSetting($uid: String) {
    deleteGracePeriodBillHeadersSetting(uid: $uid) {
      ${responseGqlFields(settingFieldsGql)}
    }
  }
`;

/** The lists the selects are filled from. Declared here to keep this file self-contained. */
const named = `
  id
  name
`;

const ALL_BILL_HEADERS_SETTINGS = gql`query allBillHeadersSettings { allBillHeadersSettings { ${named} } }`;
const ALL_FEES = gql`query allFees { allFees { ${named} } }`;
const ALL_SUBCATEGORIES = gql`query allSubcategories { allSubcategories { ${named} } }`;
const ALL_PENALTIES = gql`query allPenalties { allPenalties { ${named} } }`;
const ALL_BIO_DATA = gql`query allBioData { allBioData { ${named} } }`;
const ALL_RENEWS = gql`query allRenews { allRenews { ${named} } }`;
const ALL_FINANCIAL_YEARS = gql`query allFinancialYears { allFinancialYears { ${named} } }`;

const select = (key: string, label: string, query: unknown): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

const settingFormFields = (): FieldConfig[] => [
  select('billHeadersSettingUid', 'Bill Template', ALL_BILL_HEADERS_SETTINGS),
  select('feeUid', 'Fee', ALL_FEES),
  select('penaltyUid', 'Penalty', ALL_PENALTIES),
  select('subcategoryUid', 'Subcategory', ALL_SUBCATEGORIES),
  select('renewUid', 'Renewal', ALL_RENEWS),
  // Every year, switched on or off: a setting for next year is written while
  // that year is still switched off, since only one is in force at a time.
  select('financialYearUid', 'Financial Year', ALL_FINANCIAL_YEARS),
  select('bioDataUid', 'Charged To', ALL_BIO_DATA),
  {
    key: 'quantities',
    label: 'Quantity',
    hint: 'Greater than zero',
    type: FieldType.decimal,
    decimals: 6,
    min: 0,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  // The day and month it applies from. The backend refuses a day the chosen
  // month does not have, as it does on a renewal.
  {
    key: 'day',
    label: 'Applies On (Day)',
    type: FieldType.input,
    inputType: 'number',
    min: 1,
    max: 31,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'month',
    label: 'Applies In (Month)',
    type: FieldType.select,
    options: MONTH_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
  },
];

/** Opens the form, with the grace period fixed to the page's own record. */
function openSettingForm(comp: BaseComponent, gracePeriodUid?: string, row?: Lookup) {
  return async () => {
    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['id'] ? 'Change Bill Setting' : 'Add Bill Setting',
      model: row?.['id']
        ? {
            uid: row['id'],
            billHeadersSettingUid: row['billHeadersSetting']?.id,
            feeUid: row['fee']?.id,
            penaltyUid: row['penalty']?.id,
            subcategoryUid: row['subcategory']?.id,
            renewUid: row['renew']?.id,
            bioDataUid: row['bioData']?.id,
            financialYearUid: row['financialYear']?.id,
            quantities: row['quantities'],
            day: row['day'],
            month: row['month'],
          }
        : {},
      fields: settingFormFields(),
      closeAction$: close$,

      onSubmit: async (value: any) => {
        await comp.fs.fetch({
          notify: true,
          variables: { input: { ...value, gracePeriodUid } },
          mutation: SAVE_SETTING,
          successFn: (res) => {
            settingReloaded$.next(res?.data);
            close$.next();
          },
        });
      },
    };

    comp.vs?.openModal(FormComponent, formParameter, '45%');
  };
}

const settingColumns: GridKeyColumn[] = [
  'index',
  'billHeadersSetting.name as Bill Template',
  'fee.name as Fee',
  'penalty.name as Penalty',
  'renew.name as Renewal',
  'bioData.name as Charged To',
  'financialYear.name as Financial Year',
  { field: 'quantities', header: 'Quantity' },
  { field: 'day', header: 'Day' },
  { field: 'month', header: 'Month', valueFn: (row: any) => monthName(row?.month) },
  'actions',
];

/**
 * The bill settings under one grace period, added and amended from its own page.
 *
 * Removing a setting a unit still points at is refused by the backend rather
 * than cascading: the unit link's foreign key is ON DELETE RESTRICT.
 */
export const gracePeriodBillSettingsPanel = (
  comp: BaseComponent,
  gracePeriodUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Bill Settings',
  label: 'Bill Settings',
  icon: 'bill',
  permissions: ['ROLE_VIEW_ALL_GRACE_PERIOD_BILL_SETTING', 'ROLE_VIEW_GRACE_PERIOD_BILL_SETTING'],
  keyColumns: settingColumns,
  headerButtons: [
    {
      icon: 'add',
      label: 'Add Bill Setting',
      class: 'btn-add-primary',
      click: openSettingForm(comp, gracePeriodUid),
      permissions: [
        'ROLE_CREATE_GRACE_PERIOD_BILL_SETTING',
        'ROLE_UPDATE_GRACE_PERIOD_BILL_SETTING',
      ],
    } as ActionButton,
  ],
  actionButtons: [
    {
      icon: 'edit',
      label: 'Edit',
      click: (row: Lookup) => openSettingForm(comp, gracePeriodUid, row)(),
      permissions: ['ROLE_UPDATE_GRACE_PERIOD_BILL_SETTING'],
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
              title: 'Remove Bill Setting',
              message: `Remove the setting for ${
                row?.['billHeadersSetting']?.['name'] ?? 'this bill template'
              }?`,
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
              mutation: DELETE_SETTING,
              successFn: (res) => settingReloaded$.next(res?.data),
            });
          },
          permissions: ['ROLE_DELETE_GRACE_PERIOD_BILL_SETTING'],
        },
      ],
    },
  ],
  reloadActions$: [settingReloaded$],
  fetchParameter: {
    query: SETTINGS_BY_GRACE_PERIOD,
    variables: { gracePeriodUid },
  },
});

/**
 * The same rows read from the renewal side, for a renewal's own page. Read-only:
 * a setting belongs to a grace period, and that is where it is maintained.
 */
export const renewBillSettingsPanel = (renewUid?: string): ContentParameter => ({
  type: 'table',
  name: 'Bill Settings',
  label: 'Bill Settings',
  icon: 'bill',
  permissions: ['ROLE_VIEW_ALL_GRACE_PERIOD_BILL_SETTING', 'ROLE_VIEW_GRACE_PERIOD_BILL_SETTING'],
  keyColumns: [
    'index',
    'gracePeriod.name as Grace Period',
    'billHeadersSetting.name as Bill Template',
    'fee.name as Fee',
    'penalty.name as Penalty',
    'financialYear.name as Financial Year',
    { field: 'quantities', header: 'Quantity' },
  ],
  reloadActions$: [settingReloaded$],
  fetchParameter: {
    query: SETTINGS_BY_RENEW,
    variables: { renewUid },
  },
});
