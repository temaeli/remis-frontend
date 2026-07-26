import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getDeleteBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import {
  CngDailyReport,
  CngDailyReportDtoInput,
  DistributionReportStatus,
  WorkflowActionDtoInput,
} from './cng-daily-report.interface';
import {
  APPROVE_CNG_DAILY_REPORT,
  DELETE_CNG_DAILY_REPORT,
  SAVE_CNG_DAILY_REPORT,
  SUBMIT_CNG_DAILY_REPORT,
} from './cng-daily-report.graphql';
import { CngService } from '@routes/distribution/cng/cng.service';
import { downloadPdf, downloadXlsx } from '@shared/utils';

// Listener for all CNG Daily Report actions
export const cngDailyReport$ = new Subject<CngDailyReport | any>();

// Workflow state predicates
const canSubmit = (row: CngDailyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;
const canApprove = (row: CngDailyReport) =>
  row?.status === DistributionReportStatus.SUBMITTED;
const canEdit = (row: CngDailyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;
const canDelete = (row: CngDailyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;

export const getCngDailyReportFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  { key: 'reportDate', label: 'Report Date', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },

  // ── Station Availability ───────────────────────────────────────────────────
  { key: 'unplannedDowntimeHours', label: 'Unplanned Downtime (hrs)', type: FieldType.number, validations: [],min:0, },
  { key: 'plannedOperatingHours', label: 'Planned Operating Hours', type: FieldType.number, validations: [],min:0, },
  { key: 'availabilityPercent', label: 'Availability (%)', type: FieldType.number, validations: [],min:0, },

  // ── Customers Served ───────────────────────────────────────────────────────
  {
    key: 'customerTypeSelector',
    label: 'Customer Types Served',
    type: FieldType.select,
    multiple: true,
    ignoreOnSubmit: true,
    options: [
      { label: 'Tube Trailers', value: 'TUBE_TRAILER' },
      { label: 'Buses', value: 'BUS' },
      { label: 'Cars', value: 'CAR' },
      { label: 'Bajaj', value: 'BAJAJ' },
    ],
    validations: [],
  },
  {
    key: 'customersTubeTrailers',
    label: 'Tube Trailers — Count',
    type: FieldType.number,
    min:0,
    validations: [],
    showWhen: [{ key: 'customerTypeSelector', checker: (v: any) => Array.isArray(v) ? v.includes('TUBE_TRAILER') : v === 'TUBE_TRAILER' }],
  },
  {
    key: 'customersBuses',
    label: 'Buses — Count',
    type: FieldType.number,
    min:0,
    validations: [],
    showWhen: [{ key: 'customerTypeSelector', checker: (v: any) => Array.isArray(v) ? v.includes('BUS') : v === 'BUS' }],
  },
  {
    key: 'customersCars',
    label: 'Cars — Count',
    type: FieldType.number,
    min:0,
    validations: [],
    showWhen: [{ key: 'customerTypeSelector', checker: (v: any) => Array.isArray(v) ? v.includes('CAR') : v === 'CAR' }],
  },
  {
    key: 'customersBajaj',
    label: 'Bajaj — Count',
    type: FieldType.number,
    min:0,
    validations: [],
    showWhen: [{ key: 'customerTypeSelector', checker: (v: any) => Array.isArray(v) ? v.includes('BAJAJ') : v === 'BAJAJ' }],
  },

  // ── Gas Meter Readings (operator inputs) ──────────────────────────────────
  { key: 'fmsMeterPrevScm', label: 'FMS Meter Previous (Scm)', type: FieldType.number, validations: [],min:0, },
  { key: 'fmsMeterTodayScm', label: 'FMS Meter Today (Scm)', type: FieldType.number, validations: [],min:0, },
  { key: 'fuelGasPrevScm', label: 'Fuel Gas Previous (Scm)', type: FieldType.number, validations: [],min:0, },
  { key: 'fuelGasTodayScm', label: 'Fuel Gas Today (Scm)', type: FieldType.number, validations: [],min:0, },
  { key: 'cascadeStoredKg', label: 'Cascade Stored (Kg)', type: FieldType.number, validations: [],min:0,},

  // ── Derived Gas Totals (computed — override optional) ─────────────────────
  // { key: 'fmsMeterReadingScm', label: 'FMS Meter Reading (Scm)', type: FieldType.number, validations: [],min:0, },
  // { key: 'fuelGasUsedScm', label: 'Fuel Gas Used (Scm)', type: FieldType.number, validations: [],min:0, },
  // { key: 'totalGasDispensedScm', label: 'Total Gas Dispensed (Scm)', type: FieldType.number, validations: [],min:0, },
  { key: 'totalGasDispensedKg', label: 'Total Gas Dispensed (Kg)', type: FieldType.number, validations: [],min:0, },
  { key: 'compressedGasStoredScm', label: 'Compressed Gas Stored (Scm)', type: FieldType.number, validations: [],min:0, },
  { key: 'gasVentedScm', label: 'Gas Vented (Scm)', type: FieldType.number, validations: [],min:0, },

  // ── Legacy operational fields ──────────────────────────────────────────────
  { key: 'gasInletSm3', label: 'Gas Inlet (Sm³)', type: FieldType.number, validations: [],min:0, },
  { key: 'gasOutletSm3', label: 'Gas Outlet (Sm³)', type: FieldType.number, validations: [],min:0, },
  { key: 'compressedVolumeSm3', label: 'Compressed Volume (Sm³)', type: FieldType.number, validations: [],min:0, },
  // { key: 'salesQuantitySm3', label: 'Sales Quantity (Sm³)', type: FieldType.number, validations: [] },
  { key: 'downtimeHours', label: 'Downtime Hours', type: FieldType.number, validations: [],min:0, },
  // { key: 'hseIncidents', label: 'HSE Incidents', type: FieldType.number, validations: [] },

  // ── Narratives ─────────────────────────────────────────────────────────────
  // { key: 'operationMaintenanceActivities', label: 'O&M Activities', type: FieldType.textarea, class: 'col-span-full', validations: [] },
  // { key: 'narrative', label: 'Narrative', type: FieldType.textarea, class: 'col-span-full', validations: [] },

  // ── Signatures ─────────────────────────────────────────────────────────────
  // { key: 'preparedByName', label: 'Prepared By', type: FieldType.input, validations: [] },
  // { key: 'reviewedByName', label: 'Reviewed By', type: FieldType.input, validations: [] },
];

export function cngDailyReportUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'New Report',
    click: () => {
      const formParameter: FormParameters = {
        title: 'Create CNG Daily Report',
        fields: getCngDailyReportFormFields(),
        closeAction$: cngDailyReport$,
        onSubmit: async (model: CngDailyReportDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CNG_DAILY_REPORT,
            variables: { dto: model },
          });
          if (result) {
            cngDailyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: ['ROLE_CREATE_CNG_REPORT', 'ROLE_UPDATE_CNG_REPORT'],
  };
}

export function cngDailyReportEditBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'edit',
    label: 'Edit CNG Daily Report',
    showFunction: (row: CngDailyReport) => canEdit(row),
    click: (data?: CngDailyReport) => {
      const formParameter: FormParameters = {
        title: `Edit Report - ${data?.reportDate}`,
        fields: getCngDailyReportFormFields(),
        model: data,
        closeAction$: cngDailyReport$,
        onSubmit: async (model: CngDailyReportDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CNG_DAILY_REPORT,
            variables: { dto: { ...model, uid: data?.uid } },
          });
          if (result) {
            cngDailyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: ['ROLE_CREATE_CNG_REPORT', 'ROLE_UPDATE_CNG_REPORT'],
  };
}

export function cngDailyReportSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit CNG Daily Report',
    showFunction: (row: CngDailyReport) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit CNG Daily Report',
      message: 'Are you sure you want to submit this report?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: CngDailyReport) => {
      const formParameter: FormParameters = {
        title: `Submit Report - ${data?.reportDate}`,
        fields: [
          {
            key: 'comments',
            label: 'Submit Comments (Optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: cngDailyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SUBMIT_CNG_DAILY_REPORT,
            variables: { dto: { uid: data?.uid, comments: model.comments } },
          });
          if (result) {
            cngDailyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_CREATE_CNG_REPORT', 'ROLE_UPDATE_CNG_REPORT'],
  };
}

export function cngDailyReportApproveBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve CNG Daily Report',
    showFunction: (row: CngDailyReport) => canApprove(row),
    confirmDataMapper: () => ({
      title: 'Approve CNG Daily Report',
      message: 'Are you sure you want to approve this report?',
      confirmText: 'Approve',
      confirmButtonColor: 'primary',
    }),

    click: async (data?: CngDailyReport) => {
      const formParameter: FormParameters = {
        title: `Approve Report - ${data?.reportDate}`,
        fields: [
          {
            key: 'comments',
            label: 'Approve Comments (Optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: cngDailyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: APPROVE_CNG_DAILY_REPORT,
            variables: { dto: { uid: data?.uid, comments: model.comments } },
          });
          if (result) {
            cngDailyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },

    permissions: ['ROLE_CREATE_CNG_REPORT', 'ROLE_UPDATE_CNG_REPORT'],
  };
}

export function cngDailyReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View CNG Daily Report',
    click: (data: CngDailyReport) => navigateRelativeTo(comp, 'cng-daily-report', data?.uid),
    permissions: ['ROLE_VIEW_ALL_CNG_REPORT', 'ROLE_VIEW_CNG_REPORT'],
  };
}

export function cngDailyReportDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('CNG Daily Report', 'reportDate'),
    showFunction: (row: CngDailyReport) => canDelete(row),
    permissions: ['ROLE_DELETE_CNG_REPORT'],
    click: async (data?: CngDailyReport) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: DELETE_CNG_DAILY_REPORT,
        variables: { uid: data?.uid },
      });
      if (result) {
        cngDailyReport$.next(result);
      }
    },
  };
}

export function cngDailyReportDownloadPdfBtn(cngService: CngService): ActionButton {
  return {
    icon: 'pdf',
    label: 'Download PDF',
    click: async (data?: CngDailyReport) => {
      try {
        const base64 = await cngService.cngDailyReportPdf(data?.uid || '').toPromise();
        if (base64) {
          downloadPdf(base64 as unknown as string, `daily-report-${data?.reportDate || 'export'}`);
        }
      } catch (error) {
        console.error('Error downloading PDF:', error);
      }
    },
    permissions: ['ROLE_VIEW_ALL_CNG_REPORT', 'ROLE_VIEW_CNG_REPORT'],
  };
}

export function cngDailyReportDownloadXlsxBtn(cngService: CngService): ActionButton {
  return {
    icon: 'excel',
    label: 'Download Excel',
    click: async (data?: CngDailyReport) => {
      try {
        const base64 = await cngService.cngDailyReportXlsx(data?.uid || '').toPromise();
        if (base64) {
          downloadXlsx(base64 as unknown as string, `daily-report-${data?.reportDate || 'export'}`);
        }
      } catch (error) {
        console.error('Error downloading Excel:', error);
      }
    },
    permissions: ['ROLE_VIEW_ALL_CNG_REPORT', 'ROLE_VIEW_CNG_REPORT'],
  };
}

export function cngDailyReportTableBtns(comp: BaseComponent, cngService: CngService): ActionButton[] {

  return [
    {
      ...MORE_BTN,
      buttons: [
        cngDailyReportViewBtn(comp),
        cngDailyReportEditBtn(comp),
        cngDailyReportSubmitBtn(comp),
        cngDailyReportApproveBtn(comp),
        cngDailyReportDownloadPdfBtn(cngService),
        cngDailyReportDownloadXlsxBtn(cngService),
        cngDailyReportDeleteBtn(comp),
      ],
    },
  ];
}
