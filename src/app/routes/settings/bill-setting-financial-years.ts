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
 * The financial years a bill header setting is linked to —
 * `bill_headers_settings_financial_years`.
 *
 * The active one is the setting's financial year: every bill raised from the
 * setting takes its year from it, and a setting with no active year is not
 * billed. Only one is active at a time: making one active switches the others
 * off.
 */

/** Tells the panel a link changed. */
export const billSettingFinancialYear$ = new Subject<unknown>();

const linkGqlFields = `
  id
  uid
  active
  financialYear {
    id
    name
    startedAt
    endedAt
  }
`;

export const FINANCIAL_YEARS_OF_BILL_SETTING = gql`
  query financialYearsByBillHeadersSetting($billHeadersSettingUid: String) {
    financialYearsByBillHeadersSetting(billHeadersSettingUid: $billHeadersSettingUid) {
      ${linkGqlFields}
    }
  }
`;

const ALL_FINANCIAL_YEARS_FOR_LINK = gql`
  query allFinancialYears {
    allFinancialYears {
      id
      name
    }
  }
`;

export const LINK_BILL_SETTING_FINANCIAL_YEAR = gql`
  mutation linkBillHeadersSettingFinancialYear(
    $billHeadersSettingUid: String
    $financialYearUid: String
    $active: Boolean
  ) {
    linkBillHeadersSettingFinancialYear(
      billHeadersSettingUid: $billHeadersSettingUid
      financialYearUid: $financialYearUid
      active: $active
    ) {
      ${responseGqlFields(linkGqlFields)}
    }
  }
`;

export const SET_BILL_SETTING_FINANCIAL_YEAR_ACTIVE = gql`
  mutation setBillHeadersSettingFinancialYearActive($uid: String, $active: Boolean) {
    setBillHeadersSettingFinancialYearActive(uid: $uid, active: $active) {
      ${responseGqlFields(linkGqlFields)}
    }
  }
`;

const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_BILL_HEADERS_SETTING', 'ROLE_VIEW_BILL_HEADERS_SETTING'];
const WRITE_PERMISSIONS = ['ROLE_CREATE_BILL_HEADERS_SETTING', 'ROLE_UPDATE_BILL_HEADERS_SETTING'];

/** Links a year to the setting; active unless switched off. */
function linkBtn(comp: BaseComponent, billHeadersSettingUid?: string): ActionButton {
  return {
    icon: 'add',
    label: 'Link Financial Year',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { active: true },
        title: 'Link Financial Year',
        fields: [
          {
            key: 'financialYearUid',
            label: 'Financial Year',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: ALL_FINANCIAL_YEARS_FOR_LINK },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          {
            key: 'active',
            label: 'Active (bills use this year; the others are switched off)',
            type: FieldType.toggle,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: { financialYearUid: string; active?: boolean }) => {
          await comp.fs.fetch({
            notify: true,
            mutation: LINK_BILL_SETTING_FINANCIAL_YEAR,
            variables: {
              billHeadersSettingUid,
              financialYearUid: value.financialYearUid,
              active: value.active !== false,
            },
            successFn: (res: any) => {
              billSettingFinancialYear$.next(res?.data);
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

/** Make a linked year the active one, or switch the active one off. */
function toggleActiveBtn(comp: BaseComponent, makeActive: boolean): ActionButton {
  return {
    icon: makeActive ? 'check_circle' : 'block',
    label: makeActive ? 'Make Active' : 'Switch Off',
    class: makeActive ? '' : 'text-danger',
    showFunction: (row: any) => (row?.active === true) !== makeActive,
    confirmDataMapper: (row: any) => ({
      title: makeActive ? 'Make Active' : 'Switch Off',
      confirmText: makeActive ? 'MAKE ACTIVE' : 'SWITCH OFF',
      confirmButtonColor: makeActive ? 'primary' : 'red',
      message: makeActive
        ? `Bill under <b>${row?.financialYear?.name ?? 'this year'}</b> from now on? The setting's other years are switched off.`
        : `Switch off <b class='text-danger'>${row?.financialYear?.name ?? 'this year'}</b>? Bills from this setting are refused until a year is active.`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        mutation: SET_BILL_SETTING_FINANCIAL_YEAR_ACTIVE,
        variables: { uid: row?.uid, active: makeActive },
        successFn: (res: any) => billSettingFinancialYear$.next(res?.data),
      });
    },
    permissions: WRITE_PERMISSIONS,
  };
}

/** The years one setting is linked to, for its detail page. */
export const billSettingFinancialYearsPanel = (
  comp: BaseComponent,
  billHeadersSettingUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Financial Years',
  label: 'Financial Years',
  icon: 'calendar',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    'financialYear.name as Financial Year',
    'financialYear.startedAt as Starts',
    'financialYear.endedAt as Ends',
    {
      field: 'active',
      header: 'Active',
      valueFn: (row: any) => (row?.active ? 'Yes — bills use this year' : 'No'),
      valueClassMapper: (row: any) => (row?.active ? 'text-success font-bold' : 'text-gray-500'),
    },
    'actions',
  ],
  headerButtons: [linkBtn(comp, billHeadersSettingUid)],
  actionButtons: [{ ...MORE_BTN, buttons: [toggleActiveBtn(comp, true), toggleActiveBtn(comp, false)] }],
  reloadActions$: [billSettingFinancialYear$],
  fetchParameter: { query: FINANCIAL_YEARS_OF_BILL_SETTING, variables: { billHeadersSettingUid } },
});
