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

const LINKS_OF_SETTING = gql`
  query settingLinks($uid: String) {
    penaltiesOfGracePeriodBillHeadersSetting(gracePeriodBillHeadersSettingUid: $uid) {
      uid
      penalty {
        id
        name
      }
    }
    percentagesOfGracePeriodBillHeadersSetting(gracePeriodBillHeadersSettingUid: $uid) {
      uid
      percentage {
        id
        name
        taxesType
        amount
      }
    }
    flatAmountsOfGracePeriodBillHeadersSetting(gracePeriodBillHeadersSettingUid: $uid) {
      uid
      flatAmount {
        id
        name
        taxesType
        amount
      }
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
const ALL_PERCENTAGES = gql`
  query allPercentages {
    allPercentages {
      id
      name
      taxesType
      amount
    }
  }
`;
const ALL_FLAT_AMOUNTS = gql`
  query allFlatAmounts {
    allFlatAmounts {
      id
      name
      taxesType
      amount
    }
  }
`;
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

/**
 * All three are lists: a setting charges any number of penalties and applies any
 * number of percentages and flat amounts, each through its own table. Sending a
 * list replaces what is linked.
 */
const linkField = (
  key: string,
  label: string,
  query: unknown,
  mapFn?: (o: any) => any,
): FieldConfig => ({
  key,
  label,
  type: FieldType.multiple_select,
  class: 'col-span-full',
  optionsVariables: {
    fetchParameter: { query },
    mapFunction: mapFn ?? ((option: any) => ({ ...option, label: option.name, value: option.id })),
  },
});

const settingFormFields = (): FieldConfig[] => [
  select('billHeadersSettingUid', 'Bill Template', ALL_BILL_HEADERS_SETTINGS),
  select('feeUid', 'Fee', ALL_FEES),
  select('subcategoryUid', 'Subcategory', ALL_SUBCATEGORIES),
  select('renewUid', 'Renewal', ALL_RENEWS),
  linkField('penaltyUids', 'Penalties', ALL_PENALTIES),
  // Named with the direction and the figure: two percentages called "Late" tell
  // the reader nothing, and the direction is what decides which way money moves.
  linkField('percentageUids', 'Percentages', ALL_PERCENTAGES, (option: any) => ({
    ...option,
    label: `${option.name} (${option.taxesType === 'DECREASE' ? '−' : '+'}${option.amount})`,
    value: option.id,
  })),
  // The same, as a fixed sum rather than a rate.
  linkField('flatAmountUids', 'Flat Amounts', ALL_FLAT_AMOUNTS, (option: any) => ({
    ...option,
    label: `${option.name} (${option.taxesType === 'DECREASE' ? '−' : '+'}${option.amount})`,
    value: option.id,
  })),
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
    // What it already charges and applies, so the pickers open on it rather than
    // empty — an empty list would read as "remove them all".
    const links = row?.['id']
      ? await comp.fs.fetch({
          query: LINKS_OF_SETTING,
          showLoading: false,
          variables: { uid: row['id'] },
        })
      : null;

    const close$ = new Subject<void>();
    const formParameter: FormParameters = {
      title: row?.['id'] ? 'Change Bill Setting' : 'Add Bill Setting',
      model: row?.['id']
        ? {
            uid: row['id'],
            billHeadersSettingUid: row['billHeadersSetting']?.id,
            feeUid: row['fee']?.id,
            subcategoryUid: row['subcategory']?.id,
            renewUid: row['renew']?.id,
            bioDataUid: row['bioData']?.id,
            financialYearUid: row['financialYear']?.id,
            quantities: row['quantities'],
            day: row['day'],
            month: row['month'],
            penaltyUids: (links?.penaltiesOfGracePeriodBillHeadersSetting ?? []).map(
              (link: any) => link?.penalty?.id,
            ),
            percentageUids: (links?.percentagesOfGracePeriodBillHeadersSetting ?? []).map(
              (link: any) => link?.percentage?.id,
            ),
            flatAmountUids: (links?.flatAmountsOfGracePeriodBillHeadersSetting ?? []).map(
              (link: any) => link?.flatAmount?.id,
            ),
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
    'financialYear.name as Financial Year',
    { field: 'quantities', header: 'Quantity' },
  ],
  reloadActions$: [settingReloaded$],
  fetchParameter: {
    query: SETTINGS_BY_RENEW,
    variables: { renewUid },
  },
});
