import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { crudHostFromBase, defineEntityCrud, CrudHost } from '@shared/crud';
import { Subject } from 'rxjs';

import { CngDailyReport } from './cng.interface';
import { APPROVE_CNG_DAILY_REPORT, DELETE_CNG_DAILY_REPORT, REJECT_CNG_DAILY_REPORT, SAVE_CNG_DAILY_REPORT, SUBMIT_CNG_DAILY_REPORT } from './cng-daily-report.graphql';

export function getCngDailyReportFormFields(): FieldConfig[] {
  const today = new Date().toISOString().split('T')[0];

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'stationUid', label: 'Station', type: FieldType.input, visible: false },
    {
      key: 'reportDate',
      label: 'Report Date',
      type: FieldType.input,
      inputType: 'date',
      validations: [VALIDATOR_REQUIRED],
      value: today,
    },
    {
      key: 'producedQuantity',
      label: 'Produced Quantity (kg)',
      type: FieldType.input,
      inputType: 'number',
      min:0,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'soldQuantity',
      label: 'Sold Quantity (kg)',
      type: FieldType.input,
      inputType: 'number',
      min:0,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

// State predicates aligned with backend workflow
const canSubmit = (row: CngDailyReport): boolean =>
  !row?.status || row.status === 'DRAFT';

const canApprove = (row: CngDailyReport): boolean =>
  row?.status === 'SUBMITTED';

const canReject = (row: CngDailyReport): boolean =>
  row?.status === 'SUBMITTED';

const canEdit = (row: CngDailyReport): boolean =>
  !row?.status || row.status === 'DRAFT';

const canDelete = (row: CngDailyReport): boolean =>
  !row?.status || row.status === 'DRAFT';

const cngDailyReportCrud = defineEntityCrud<CngDailyReport>({
  name: 'CNG Daily Report',
  routeSlug: 'cng-daily-reports',
  fields: getCngDailyReportFormFields(),
  modalWidth: '60%',
  modelMapper: (data?) => ({
    ...data,
    stationUid: data?.stationUid,  // Already available on CngDailyReport
  }),
  mutations: {
    create: SAVE_CNG_DAILY_REPORT,
    update: SAVE_CNG_DAILY_REPORT,
    delete: DELETE_CNG_DAILY_REPORT,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CNG_REPORT', 'ROLE_UPDATE_CNG_REPORT'],
    delete: ['ROLE_DELETE_CNG_REPORT'],
  },
});

export const cngDailyReport$ = cngDailyReportCrud.reload$;

export const cngDailyReportUpsertBtn = (comp: BaseComponent): ActionButton =>
  cngDailyReportCrud.upsertBtn(crudHostFromBase(comp));

export const cngDailyReportDeleteBtn = (comp: BaseComponent): ActionButton =>
  cngDailyReportCrud.deleteBtn(crudHostFromBase(comp));

// ==================== WORKFLOW ACTION BUTTONS ====================

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Daily Report for Approval',
    permissions: ['ROLE_CREATE_CNG_REPORT', 'ROLE_UPDATE_CNG_REPORT'],
    showFunction: (row: CngDailyReport) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit Daily Report',
      message: 'Are you sure you want to submit this report? It will be sent for approval.',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: CngDailyReport) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_CNG_DAILY_REPORT,
        variables: { dto: { uid: data.uid } },
        successFn: () => cngDailyReport$.next(null),
      });
    },
  };
}

function buildApproveBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve',
    color: 'primary',
    toolTip: 'Approve Daily Report',
    permissions: ['ROLE_UPDATE_CNG_REPORT'],
    showFunction: (row: CngDailyReport) => canApprove(row),
    click: (data: CngDailyReport) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Approve Daily Report: ' + formatReportDate(data.reportDate),
        fields: [
          {
            key: 'comment',
            label: 'Comment (optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: APPROVE_CNG_DAILY_REPORT,
            variables: {
              dto: {
                uid: data.uid,
                comments: value?.comment ?? '',
              },
            },
            successFn: () => {
              cngDailyReport$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '30%');
    },
  };
}

function buildRejectBtn(host: CrudHost): ActionButton {
  return {
    icon: 'cancel',
    label: 'Reject',
    color: 'warn',
    toolTip: 'Reject Daily Report - Returns to Draft',
    permissions: ['ROLE_UPDATE_CNG_REPORT'],
    showFunction: (row: CngDailyReport) => canReject(row),
    click: (data: CngDailyReport) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Reject Daily Report: ' + formatReportDate(data.reportDate),
        fields: [
          {
            key: 'comment',
            label: 'Reason for rejection',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: REJECT_CNG_DAILY_REPORT,
            variables: {
              dto: {
                uid: data.uid,
                comments: value?.comment,
              },
            },
            successFn: () => {
              cngDailyReport$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '30%');
    },
  };
}

export const cngDailyReportTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return [
    ...cngDailyReportCrud.tableBtns(host),
    buildSubmitBtn(host),
    buildApproveBtn(host),
    buildRejectBtn(host),
  ];
};

// ==================== UTILITY FUNCTIONS ====================

function formatReportDate(date: string | Date): string {
  if (!date) return 'Report';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
