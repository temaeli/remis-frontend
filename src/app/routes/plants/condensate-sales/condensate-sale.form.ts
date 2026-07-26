import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

import {
  APPROVE_CONDENSATE_SALE,
  CREATE_CONDENSATE_SALE,
  DELETE_CONDENSATE_SALE,
  GET_CONDENSATE_SALES_BY_PLANT,
  REJECT_CONDENSATE_SALE,
  SUBMIT_CONDENSATE_SALE,
} from './condensate-sale.graphql';
import { UPDATE_CONDENSATE_SALE } from './condensate-sale.graphql';
import { CondensateSale } from './condensate-sale.interface';
import { ALL_PLANT } from '../plants/plant.graphql';
import { Form } from '@angular/forms';
import { ContentParameter } from '@shared/components/view-component/view-interface';

//Listener for all CondensateSale actions
export const condensateSale$ = new Subject<CondensateSale | any>();
export const condensateSaleApproval$ = new Subject<CondensateSale | any>();

export const getCondensateSaleFormFields = (comp: BaseComponent): FieldConfig[] => {
  const plantUid = (comp as any)['plantUid'];

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'plantUid',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      visible: !plantUid,
      value: plantUid,
      optionsVariables: { fetchParameter: { query: ALL_PLANT } },
      class: 'col-span-full',
    },
    {
      key: 'customerName',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'customerLicenseNumber',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'truckNumber',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },

    {
      key: 'volumeInLitres',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'offloadingDate',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'salesDate',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
};

export function condensateSaleUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: CondensateSale) => {
      const formParameter: FormParameters = {
        model: { ...data, plantUid: data?.plant?.uid },
        title: 'Condensate Sale',
        fields: getCondensateSaleFormFields(comp),
        closeAction$: condensateSale$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: data ? { input: value } : { input: value },
            mutation: data ? UPDATE_CONDENSATE_SALE : CREATE_CONDENSATE_SALE,
            successFn: (res) => condensateSale$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    showFunction: (data?: CondensateSale) => !data || (!data?.approvedAt && !data?.submittedAt),
    permissions: ['ROLE_MANAGE_CONDENSATE_SALE'],
    ...getUpsertBtnProps('Condensate Sale'),
  };
}

export function condensateSaleViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Condensate Sale',
    click: (data: CondensateSale) => navigateRelativeTo(comp, 'condensate-sales', data?.uid),
    permissions: ['ROLE_VIEW_CONDENSATE_SALE', 'ROLE_MANAGE_CONDENSATE_SALE'],
  };
}

export function condensateSaleApproveBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: CondensateSale) => {
      const fp: FormParameters = {
        title: 'Approve Condensate Sale',
        closeAction$: condensateSale$,
        fields: [
          {
            key: 'comment',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            loadingOn: 'content',
            variables: { uid: data.uid, comment: value.comment },
            mutation: APPROVE_CONDENSATE_SALE,
            successFn: (res) => condensateSaleApproval$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, fp, '96%');
    },
    icon: 'check',
    label: 'Approve',
    showFunction: (d: CondensateSale) => !d?.approvedAt && !d?.rejectedAt && !!d?.submittedAt,
    permissions: ['ROLE_APPROVE_CONDENSATE_SALE'],
  };
}

export function condensateSaleRejectBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: CondensateSale) => {
      const fp: FormParameters = {
        title: 'Reject Condensate Sale',
        closeAction$: condensateSale$,
        fields: [
          {
            key: 'comment',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            loadingOn: 'content',
            variables: { uid: data.uid, comment: value.comment },
            mutation: REJECT_CONDENSATE_SALE,
            successFn: (res) => condensateSaleApproval$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, fp, '96%');
    },
    icon: 'cancel',
    label: 'Reject',
    showFunction: (d: CondensateSale) => !d?.approvedAt && !d?.rejectedAt && !!d?.submittedAt,
    permissions: ['ROLE_APPROVE_CONDENSATE_SALE'],
  };
}

export function condensateSaleSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: CondensateSale) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: SUBMIT_CONDENSATE_SALE,
        successFn: (res) => condensateSaleApproval$.next(res?.data),
      });
    },
    icon: 'send',
    label: 'Submit',
    showFunction: (data: CondensateSale) => !data?.submittedAt,
    permissions: ['ROLE_SUBMIT_CONDENSATE_SALE', 'ROLE_MANAGE_CONDENSATE_SALE'],
  };
}

export function condensateSaleDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: CondensateSale) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_CONDENSATE_SALE,
        successFn: (res) => condensateSale$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Condensate Sale', 'customerName'),
    permissions: ['ROLE_DELETE_CONDENSATE_SALE'],
  };
}

export function condensateSaleTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        condensateSaleViewBtn(comp),
        condensateSaleUpsertBtn(comp),
        condensateSaleDeleteBtn(comp),
      ],
    },
  ];
}

export function condensateSalesContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'Condensate Sales',
    icon: 'price_tag',
    title: 'Condensate Sales',
    slug: 'condensate-sales',
    keyColumns: [
      'index',
      'customerName',
      'truckNumber',
      'volumeInLitres',
      'offloadingDate',
      'salesDate',
    ],
    permissions: ['ROLE_VIEW_CONDENSATE_SALE', 'ROLE_MANAGE_CONDENSATE_SALE'],
    actionButtons: condensateSaleTableBtns(comp),
    headerButtons: [condensateSaleUpsertBtn(comp)],

    fetchParameter: {
      query: GET_CONDENSATE_SALES_BY_PLANT,
      variables: { active: true, plantUid },
    },
  } as ContentParameter;
}
