import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';

import { GasSalesAgreement, GsaContractType, GsaStatus } from './gas-sales-agreement.interface';
import {
  ACTIVATE_GAS_SALES_AGREEMENT,
  ADD_GAS_SALES_AGREEMENT_ADDENDUM,
  APPROVE_GSA_AS_DIRECTOR,
  DELETE_GAS_SALES_AGREEMENT,
  REVIEW_GSA_AS_MANAGER,
  SAVE_GAS_SALES_AGREEMENT,
  SUBMIT_GAS_SALES_AGREEMENT,
  SUBMIT_GAS_SALES_AGREEMENT_TO_MANAGER,
  TERMINATE_GAS_SALES_AGREEMENT,
} from './gas-sales-agreement.graphql';
import { ALL_CLIENT } from '@routes/client-registration/customers/clients.graphql';

// Listener for all GSA actions
export const gasSalesAgreement$ = new Subject<GasSalesAgreement | any>();

// Date Validators for GSA
const createStartDateValidator = () => {
  return (control: any) => {
    if (!control.value) {
      return null;
    }

    const date = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < today ? { minDate: { message: 'Start date cannot be in the past' } } : null;
  };
};

const createEndDateValidator = () => {
  return (control: any) => {
    if (!control.value) {
      return null;
    }

    const form = control.parent;
    if (!form) {
      return null;
    }

    const startDate = form.get('startDate')?.value;
    if (!startDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(control.value);

    return start >= end ? { dateRange: { message: 'Start date must be before end date' } } : null;
  };
};

const VALIDATOR_START_DATE = {
  name: 'minDate',
  validator: createStartDateValidator(),
  message: 'Start date cannot be in the past',
};

const VALIDATOR_END_DATE = {
  name: 'dateRange',
  validator: createEndDateValidator(),
  message: 'End date must be after start date',
};

// Min/Max Daily Mmscfd Validators for Addendum
const createMinDailyValidator = () => {
  return (control: any) => {
    if (!control.value) {
      return null;
    }

    const form = control.parent;
    if (!form) {
      return null;
    }

    const maxDaily = form.get('newMaximumDailyMmscfd')?.value;
    if (!maxDaily) {
      return null;
    }

    const min = parseFloat(control.value);
    const max = parseFloat(maxDaily);

    return min > max
      ? { minGreaterThanMax: { message: 'Minimum daily must not be greater than maximum daily' } }
      : null;
  };
};

const createMaxDailyValidator = () => {
  return (control: any) => {
    if (!control.value) {
      return null;
    }

    const form = control.parent;
    if (!form) {
      return null;
    }

    const minDaily = form.get('newMinimumDailyMmscfd')?.value;
    if (!minDaily) {
      return null;
    }

    const min = parseFloat(minDaily);
    const max = parseFloat(control.value);

    return max < min
      ? { maxLessThanMin: { message: 'Maximum daily must not be less than minimum daily' } }
      : null;
  };
};

const VALIDATOR_MIN_DAILY = {
  name: 'minGreaterThanMax',
  validator: createMinDailyValidator(),
  message: 'Minimum daily must not be greater than maximum daily',
};

const VALIDATOR_MAX_DAILY = {
  name: 'maxLessThanMin',
  validator: createMaxDailyValidator(),
  message: 'Maximum daily must not be less than minimum daily',
};

export const getGasSalesAgreementFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'clientUid',
    label: 'Customer',
    type: FieldType.select,
    validations: [VALIDATOR_REQUIRED],
    optionsVariables: {
      fetchParameter: { query: ALL_CLIENT },
      mapFunction: (d: any) => ({ ...d, label: d?.user?.fullName }),
    },
  },
  {
    key: 'contractNumber',
    label: 'Contract Number',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },

  {
    key: 'contractName',
    label: 'Contract Name',
    type: FieldType.input,
    class: 'col-span-full',
    validations: [],
  },

  // {
  //   key: 'contractType',
  //   label: 'Contract Type',
  //   type: FieldType.select,
  //   validations: [VALIDATOR_REQUIRED],
  //   options: Object.values(GsaContractType).map((type) => ({
  //     label: type.replace(/_/g, ' '),
  //     value: type,
  //   })),
  // },
  {
    key: 'startDate',
    label: 'Start Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'endDate',
    label: 'End Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_END_DATE],
  },
  {
    key: 'minimumDailyMmscfd',
    label: 'Minimum Daily (MMscfd)',
    type: FieldType.number,
    value: 0,
    min: 1,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_MIN_DAILY],
  },
  {
    key: 'maximumDailyMmscfd',
    label: 'Maximum Daily (MMscfd)',
    type: FieldType.number,
    value: 0,
    min: 1,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_MAX_DAILY],
  },
  // {
  //   key: 'totalVolumeMmscf',
  //   label: 'Total Volume (MMscf)',
  //   type: FieldType.number,
  //   validations: [],
  // },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    validations: [],
    class: 'col-span-full',
  },
  // {
  //   key: 'documentBase64',
  //   label: 'Document',
  //   type: FieldType.attachment,
  //   validations: [],
  //   class: 'col-span-full',
  // },
];

export const getAddendumFormFields = (): FieldConfig[] => [
  {
    key: 'agreementUid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'reason',
    label: 'Reason',
    type: FieldType.textarea,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'addendumDate',
    label: 'Addendum Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'newEndDate',
    label: 'New End Date',
    type: FieldType.date,
    validations: [],
  },
  {
    key: 'newMinimumDailyMmscfd',
    label: 'New Minimum Daily (MMscfd)',
    type: FieldType.number,
    validations: [VALIDATOR_MIN_DAILY],
  },
  {
    key: 'newMaximumDailyMmscfd',
    label: 'New Maximum Daily (MMscfd)',
    type: FieldType.number,
    validations: [VALIDATOR_MAX_DAILY],
  },
];

export function gasSalesAgreementUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: GasSalesAgreement) => {
      const formParameter: FormParameters = {
        model: {
          ...data,
          clientUid: data?.client?.uid,
        },
        title: 'Gas Sales Agreement',
        fields: getGasSalesAgreementFormFields(),
        closeAction$: gasSalesAgreement$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: SAVE_GAS_SALES_AGREEMENT,
            successFn: (res) => gasSalesAgreement$.next(res?.data),
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: ['ROLE_CREATE_GAS_SALES_AGREEMENT', 'ROLE_UPDATE_GAS_SALES_AGREEMENT'],
    ...getUpsertBtnProps('Gas Sales Agreement'),
    hideFunction: (data?: GasSalesAgreement) => !!data && data?.status !== GsaStatus.DRAFT,
  };
}

export function gasSalesAgreementSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_SUBMIT_GSA_TO_MANAGER'],
    icon: 'check',
    label: 'Submit GSA to Head of Operation',
    hideFunction: (data: GasSalesAgreement) => data?.status !== GsaStatus.DRAFT,
    confirmDataMapper: (data: GasSalesAgreement) => ({
      title: 'Submit Gas Sales Agreement',
      message: `Are you sure you want to submit <b>${data?.contractNumber ?? ''}</b> to Manager?`,
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: async (data: GasSalesAgreement) => {
      await comp.fs.fetch({
        notify: true,
        variables: { uid: data.uid },
        mutation: SUBMIT_GAS_SALES_AGREEMENT_TO_MANAGER,
        finalFn: (res) => gasSalesAgreement$.next(res?.data),
      });
    },
  };
}

export function gasSalesAgreementReviewAsManagerBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 's-approvals',
    label: 'Review as Head of Operation',
    permissions: ['ROLE_REVIEW_GSA_AS_MANAGER'],
    hideFunction: (data: GasSalesAgreement) => data?.status !== GsaStatus.SUBMITTED_TO_MANAGER,
    click: (data: GasSalesAgreement) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Review Gas Sales Agreement',
        icon: 's-approvals',
        model: { uid: data?.uid, approved: false, comments: '' },
        fields: [
          { key: 'uid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Approve',
            type: FieldType.select,
            options: [
              { label: 'Approve', value: true },
              { label: 'Reject', value: false },
            ],
            class: 'col-span-full',
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { uid: value.uid, approved: value.approved, comments: value.comments },
            mutation: REVIEW_GSA_AS_MANAGER,
            successFn: (res) => {
              gasSalesAgreement$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function gasSalesAgreementApproveAsDirectorBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_APPROVE_GSA_AS_DIRECTOR'],
    icon: 's-approvals',
    label: 'Approve as Distribution Manager',
    hideFunction: (data: GasSalesAgreement) =>
      [GsaStatus.ACTIVE, GsaStatus.TERMINATED].includes(data?.status),
    click: (data: GasSalesAgreement) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Approve Gas Sales Agreement',
        icon: 's-approvals',
        model: { uid: data?.uid, approved: false, comments: '' },
        fields: [
          { key: 'uid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Approve',
            type: FieldType.select,
            options: [
              { label: 'Approve', value: true },
              { label: 'Reject', value: false },
            ],
            class: 'col-span-full',
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { uid: value.uid, approved: value.approved, comments: value.comments },
            mutation: APPROVE_GSA_AS_DIRECTOR,
            successFn: (res) => {
              gasSalesAgreement$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function gasSalesAgreementActivateBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_APPROVE_GSA_AS_DIRECTOR'],
    icon: 'check_circle',
    label: 'Activate Gas Sales Agreement',
    hideFunction: (data: GasSalesAgreement) => data?.status !== GsaStatus.APPROVED_BY_MANAGER,
    confirmDataMapper: (data: GasSalesAgreement) => ({
      title: 'Activate Gas Sales Agreement',
      message: `Are you sure you want to activate <b>${data?.contractNumber ?? ''}</b>?`,
      confirmText: 'Activate',
      confirmButtonColor: 'primary',
    }),
    click: async (data: GasSalesAgreement) => {
      await comp.fs.fetch({
        notify: true,
        variables: { uid: data.uid },
        mutation: ACTIVATE_GAS_SALES_AGREEMENT,
        finalFn: (res) => gasSalesAgreement$.next(res?.data),
      });
    },
  };
}

export function gasSalesAgreementTerminateBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_DELETE_GAS_SALES_AGREEMENT'],
    icon: 'cancelled',
    label: 'Terminate Gas Sales Agreement',
    hideFunction: (data: GasSalesAgreement) => data?.status !== GsaStatus.ACTIVE,
    confirmDataMapper: (data: GasSalesAgreement) => ({
      title: 'Terminate Gas Sales Agreement',
      message: `Are you sure you want to terminate <b>${data?.contractNumber ?? ''}</b>?`,
      confirmText: 'Terminate',
      confirmButtonColor: 'red',
    }),
    click: async (data: GasSalesAgreement) => {
      await comp.fs.fetch({
        notify: true,
        variables: { uid: data.uid },
        mutation: TERMINATE_GAS_SALES_AGREEMENT,
        finalFn: (res) => gasSalesAgreement$.next(res?.data),
      });
    },
  };
}

export function gasSalesAgreementDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_DELETE_GAS_SALES_AGREEMENT'],
    click: async (data: GasSalesAgreement) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_GAS_SALES_AGREEMENT,
        finalFn: (res) => gasSalesAgreement$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Gas Sales Agreement', 'contractNumber'),
  };
}

export function gasSalesAgreementAddAddendumBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_CREATE_GAS_SALES_AGREEMENT', 'ROLE_UPDATE_GAS_SALES_AGREEMENT'],
    icon: 'add',
    label: 'Add Addendum',
    hideFunction: (data: GasSalesAgreement) =>
      ![GsaStatus.DRAFT, GsaStatus.ACTIVE].includes(data?.status),
    click: (data?: GasSalesAgreement) => {
      const formParameter: FormParameters = {
        model: { agreementUid: data?.uid },
        title: 'Add Gas Sales Agreement Addendum',
        fields: getAddendumFormFields(),
        closeAction$: gasSalesAgreement$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: ADD_GAS_SALES_AGREEMENT_ADDENDUM,
            successFn: (res) => gasSalesAgreement$.next(res?.data),
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
  };
}

export function gasSalesAgreementViewBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_VIEW_ALL_GAS_SALES_AGREEMENT', 'ROLE_VIEW_GAS_SALES_AGREEMENT'],
    icon: 'visibility',
    label: 'View Agreement',
    click: (data?: GasSalesAgreement) => {
      comp.router.navigate(['/gas-nomination/gas-sales-agreement', data?.uid]);
    },
  };
}

export function gasSalesAgreementViewAddendumBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_VIEW_ALL_GAS_SALES_AGREEMENT', 'ROLE_VIEW_GAS_SALES_AGREEMENT'],
    icon: 'view',
    label: 'View Addendums',
    hideFunction: (data: GasSalesAgreement) =>
      ![GsaStatus.ACTIVE, GsaStatus.APPROVED_BY_MANAGER].includes(data?.status),
    click: (data?: GasSalesAgreement) => {
      comp.router.navigate(['/gas-nomination/gas-sales-agreement', data?.uid, 'addendums'], {
        queryParams: { contractNumber: data?.contractNumber },
      });
    },
  };
}

export function gasSalesAgreementTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        gasSalesAgreementViewBtn(comp),
        gasSalesAgreementUpsertBtn(comp),
        gasSalesAgreementSubmitBtn(comp),
        gasSalesAgreementReviewAsManagerBtn(comp),
        // gasSalesAgreementActivateBtn(comp),
        gasSalesAgreementTerminateBtn(comp),
        gasSalesAgreementViewAddendumBtn(comp),
        gasSalesAgreementAddAddendumBtn(comp),
        gasSalesAgreementApproveAsDirectorBtn(comp),
        // gasSalesAgreementDeleteBtn(comp),
      ],
    },
  ];
}
