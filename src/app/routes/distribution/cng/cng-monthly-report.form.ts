import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { crudHostFromBase, defineEntityCrud, CrudHost } from '@shared/crud';
import { Subject } from 'rxjs';
import { inject, Injector } from '@angular/core';
import {
  SAVE_CNG_MONTHLY_REPORT,
  DELETE_CNG_MONTHLY_REPORT,
  SUBMIT_CNG_MONTHLY_REPORT,
  REVIEW_CNG_MONTHLY_REPORT,
  APPROVE_CNG_MONTHLY_REPORT,
  REJECT_CNG_MONTHLY_REPORT,
} from './cng-monthly-report.graphql';
import { CngMonthlyReport } from './cng-monthly-report.interface';
import { CngService } from './cng.service';
import { downloadPdf, downloadXlsx } from '@shared/utils';

export function getCngMonthlyReportFormFields(): FieldConfig[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'stationUid', label: 'Station', type: FieldType.input, visible: false },
    {
      key: 'year',
      label: 'Year',
      type: FieldType.input,
      inputType: 'number',
      min:0,
      validations: [VALIDATOR_REQUIRED],
      value: currentYear,
    },
    {
      key: 'month',
      label: 'Month',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      value: currentMonth,
      options: [
        { label: 'January', value: 1 },
        { label: 'February', value: 2 },
        { label: 'March', value: 3 },
        { label: 'April', value: 4 },
        { label: 'May', value: 5 },
        { label: 'June', value: 6 },
        { label: 'July', value: 7 },
        { label: 'August', value: 8 },
        { label: 'September', value: 9 },
        { label: 'October', value: 10 },
        { label: 'November', value: 11 },
        { label: 'December', value: 12 },
      ],
    },
    {
      key: 'executiveSummary',
      label: 'Executive Summary',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'hseNarrative',
      label: 'HSE Narrative',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'facilitiesNarrative',
      label: 'Facilities Narrative',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'administrationNarrative',
      label: 'Administration Narrative',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'trainingNarrative',
      label: 'Training Narrative',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'tanescoPowerUnits',
      label: 'TANESCO Power Units',
      type: FieldType.input,
      inputType: 'number',
      min:0,
      validations: [],
    },
    {
      key: 'potableWaterM3',
      label: 'Potable Water (m³)',
      type: FieldType.input,
      inputType: 'number',
      min:0,
      validations: [],
    },
    // {
    //   key: 'preparedByName',
    //   label: 'Prepared By',
    //   type: FieldType.input,
    //   validations: [],
    // },
    // {
    //   key: 'reviewedByName',
    //   label: 'Reviewed By',
    //   type: FieldType.input,
    //   validations: [],
    // },
  ];
}

// ==================== STATE PREDICATES (Workflow Rules) ====================

/**
 * Backend workflow for monthly reports:
 * DRAFT -> SUBMITTED -> REVIEWED -> APPROVED
 *    ^                      |
 *    └──────────────────────┘ (REJECT returns to DRAFT)
 */

const canSubmit = (row: CngMonthlyReport): boolean =>
  !row?.status || row.status === 'DRAFT';

const canReview = (row: CngMonthlyReport): boolean =>
  row?.status === 'SUBMITTED';

const canApprove = (row: CngMonthlyReport): boolean =>
  row?.status === 'REVIEWED';

const canReject = (row: CngMonthlyReport): boolean =>
  row?.status === 'SUBMITTED' || row?.status === 'REVIEWED';

const canEdit = (row: CngMonthlyReport): boolean =>
  !row?.status || row.status === 'DRAFT';

const canDelete = (row: CngMonthlyReport): boolean =>
  !row?.status || row.status === 'DRAFT';

const cngMonthlyReportCrud = defineEntityCrud<CngMonthlyReport>({
  name: 'CNG Monthly Report',
  routeSlug: 'cng-monthly-report',
  fields: getCngMonthlyReportFormFields(),
  modalWidth: '70%',
  modelMapper: (data?) => ({
    ...data,
    stationUid: data?.station?.uid,
  }),
  mutations: {
    create: SAVE_CNG_MONTHLY_REPORT,
    update: SAVE_CNG_MONTHLY_REPORT,
    delete: DELETE_CNG_MONTHLY_REPORT,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CNG_MONTHLY_REPORT', 'ROLE_UPDATE_CNG_MONTHLY_REPORT'],
    delete: ['ROLE_DELETE_CNG_MONTHLY_REPORT'],
  },
});

export const cngMonthlyReport$ = cngMonthlyReportCrud.reload$;

export const cngMonthlyReportUpsertBtn = (comp: BaseComponent): ActionButton =>
  cngMonthlyReportCrud.upsertBtn(crudHostFromBase(comp));

export const cngMonthlyReportDeleteBtn = (comp: BaseComponent): ActionButton =>
  cngMonthlyReportCrud.deleteBtn(crudHostFromBase(comp));

// ==================== WORKFLOW ACTION BUTTONS ====================

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Monthly Report for Review',
    permissions: ['ROLE_CREATE_CNG_MONTHLY_REPORT', 'ROLE_UPDATE_CNG_MONTHLY_REPORT'],
    showFunction: (row: CngMonthlyReport) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit Monthly Report',
      message: 'Are you sure you want to submit this report? It will be sent for review.',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: CngMonthlyReport) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_CNG_MONTHLY_REPORT,
        variables: { dto: { uid: data.uid } },
        successFn: () => cngMonthlyReport$.next(null),
      });
    },
  };
}

function buildReviewBtn(host: CrudHost): ActionButton {
  return {
    icon: 'rate_review',
    label: 'Review',
    color: 'accent',
    toolTip: 'Review Monthly Report',
    permissions: ['ROLE_UPDATE_CNG_MONTHLY_REPORT'],
    showFunction: (row: CngMonthlyReport) => canReview(row),
    click: (data: CngMonthlyReport) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Review Monthly Report: ' + formatReportPeriod(data.year, data.month),
        fields: [
          {
            key: 'comment',
            label: 'Review comment (optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: REVIEW_CNG_MONTHLY_REPORT,
            variables: {
              dto: {
                uid: data.uid,
                comments: value?.comment ?? '',
              },
            },
            successFn: () => {
              cngMonthlyReport$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '30%');
    },
  };
}

function buildApproveBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve',
    color: 'primary',
    toolTip: 'Approve Monthly Report',
    permissions: ['ROLE_UPDATE_CNG_MONTHLY_REPORT'],
    showFunction: (row: CngMonthlyReport) => canApprove(row),
    click: (data: CngMonthlyReport) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Approve Monthly Report: ' + formatReportPeriod(data.year, data.month),
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
            mutation: APPROVE_CNG_MONTHLY_REPORT,
            variables: {
              dto: {
                uid: data.uid,
                comments: value?.comment ?? '',
              },
            },
            successFn: () => {
              cngMonthlyReport$.next(null);
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
    toolTip: 'Reject Monthly Report - Returns to Draft',
    permissions: ['ROLE_UPDATE_CNG_MONTHLY_REPORT'],
    showFunction: (row: CngMonthlyReport) => canReject(row),
    click: (data: CngMonthlyReport) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Reject Monthly Report: ' + formatReportPeriod(data.year, data.month),
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
            mutation: REJECT_CNG_MONTHLY_REPORT,
            variables: {
              dto: {
                uid: data.uid,
                comments: value?.comment,
              },
            },
            successFn: () => {
              cngMonthlyReport$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '30%');
    },
  };
}

export const cngMonthlyReportDownloadPdfBtn = (cngService: CngService): ActionButton => {
  return {
    icon: 'pdf',
    label: 'Download PDF',
    click: async (data?: CngMonthlyReport) => {
      try {
        const base64 = await cngService.cngMonthlyReportPdf(data?.uid || '').toPromise();
        if (base64) {
          const period = formatReportPeriod(data?.year || 0, data?.month || 0);
          downloadPdf(base64 as unknown as string, `monthly-report-${period}`);
        }
      } catch (error) {
        console.error('Error downloading PDF:', error);
      }
    },
    permissions: ['ROLE_VIEW_ALL_CNG_MONTHLY_REPORT', 'ROLE_VIEW_CNG_MONTHLY_REPORT'],
  };
};

export const cngMonthlyReportDownloadXlsxBtn = (cngService: CngService): ActionButton => {
  return {
    icon: 'excel',
    label: 'Download Excel',
    click: async (data?: CngMonthlyReport) => {
      try {
        const base64 = await cngService.cngMonthlyReportXlsx(data?.uid || '').toPromise();
        if (base64) {
          const period = formatReportPeriod(data?.year || 0, data?.month || 0);
          downloadXlsx(base64 as unknown as string, `monthly-report-${period}`);
        }
      } catch (error) {
        console.error('Error downloading Excel:', error);
      }
    },
    permissions: ['ROLE_VIEW_ALL_CNG_MONTHLY_REPORT', 'ROLE_VIEW_CNG_MONTHLY_REPORT'],
  };
};

export const cngMonthlyReportTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return cngMonthlyReportCrud.tableBtns(host, [
    buildSubmitBtn(host),
    buildReviewBtn(host),
    buildApproveBtn(host),
    buildRejectBtn(host),
  ]);
};

export const cngMonthlyReportWorkflowBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return [buildSubmitBtn(host), buildReviewBtn(host), buildApproveBtn(host), buildRejectBtn(host)];
};

// ==================== UTILITY FUNCTIONS ====================

function formatReportPeriod(year: number, month: number): string {
  if (!year || !month) return 'Report';
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
