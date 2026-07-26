import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { downloadBlob } from '@shared/components/details/util/base-64/base-64.helpers';
import {
  CrudHost,
  canApprove,
  canRegenerate,
  canReject,
  canSubmit,
  canView,
  crudHostFromBase,
  defineEntityCrud,
} from '@shared/crud';
import {
  APPROVE_PIPELINE_REPORT,
  CREATE_PIPELINE_REPORT,
  DELETE_PIPELINE_REPORT,
  EXPORT_PIPELINE_REPORT,
  REJECT_PIPELINE_REPORT,
  RE_GENERATE_PIPELINE_REPORT_CONTENT,
  SUBMIT_PIPELINE_REPORT,
  UPDATE_PIPELINE_REPORT,
} from './report.graphql';
import {
  PIPELINE_REPORT_SUMMARY_TYPE_OPTIONS,
  PipelineReport,
  PipelineReportSummaryTypeEnum,
  ReportOutputDto,
  ReportOutputFormat,
} from './report.interface';
import { GET_ALL_PIPELINES } from '../pipelines/pipeline.graphql';
import { ALL_REPORT_TEMPLATE } from 'app/routes/settings/report-template/report-template.graphql';
import { ReportTemplateType } from 'app/routes/settings/report-template/report-template.interface';
import {
  canActOnCurrentStage,
  ReportStageEnum,
} from 'app/routes/settings/report-template/report-actor.form';

const DATE_ONLY_TEMPLATES: ReportTemplateType[] = [
  ReportTemplateType.PIPELINE_DAILY_OPERATION,
  ReportTemplateType.PIPELINE_GM_SUMMARY,
];

const RANGE_TEMPLATES: ReportTemplateType[] = [
  ReportTemplateType.PIPELINE_MONTHLY_OPERATION,
  ReportTemplateType.PIPELINE_MAINTENANCE_PLAN,
  ReportTemplateType.PIPELINE_MATERIAL_BALANCE,
  ReportTemplateType.PIPELINE_REPORT_SUMMARY,
];

const NON_SUMMARY_RANGE_TEMPLATES: ReportTemplateType[] = RANGE_TEMPLATES.filter(
  (t) => t !== ReportTemplateType.PIPELINE_REPORT_SUMMARY,
);

const SUMMARY_TYPE_TEMPLATES: ReportTemplateType[] = [
  ReportTemplateType.PIPELINE_REPORT_SUMMARY,
];

function toLocalDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeSummaryEndDate(
  start: Date | string | null | undefined,
  summaryType: PipelineReportSummaryTypeEnum | null | undefined,
): string | null {
  if (!start || !summaryType || summaryType === PipelineReportSummaryTypeEnum.SELECTED_PERIOD) {
    return null;
  }
  const end = toLocalDate(start);
  if (!end) return null;

  switch (summaryType) {
    case PipelineReportSummaryTypeEnum.DAILY:
      break;
    case PipelineReportSummaryTypeEnum.WEEKLY:
      end.setDate(end.getDate() + 6);
      break;
    case PipelineReportSummaryTypeEnum.MONTHLY:
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case PipelineReportSummaryTypeEnum.QUARTELY:
      end.setMonth(end.getMonth() + 3);
      end.setDate(end.getDate() - 1);
      break;
    case PipelineReportSummaryTypeEnum.SEMI_ANNUAL:
      end.setMonth(end.getMonth() + 6);
      end.setDate(end.getDate() - 1);
      break;
    case PipelineReportSummaryTypeEnum.NINE_MONTH:
      end.setMonth(end.getMonth() + 9);
      end.setDate(end.getDate() - 1);
      break;
    case PipelineReportSummaryTypeEnum.ANNUAL:
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      break;
    default:
      return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const capped = end.getTime() > today.getTime() ? today : end;
  return formatLocalYmd(capped);
}

function patchSummaryEndDate(form: any): void {
  const templateType = form?.get('_templateType')?.value;
  if (templateType !== ReportTemplateType.PIPELINE_REPORT_SUMMARY) return;
  const startDate = form?.get('startDate')?.value;
  const summaryType = form?.get('reportSummaryType')?.value;
  const end = computeSummaryEndDate(startDate, summaryType);
  if (end) form?.patchValue({ endDate: end });
}

export function getPipelineReportFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'templateUid',
      label: 'Report Template',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'uid',
        fetchParameter: { query: ALL_REPORT_TEMPLATE },
        filterFunction: (op: any) =>
          typeof op?.templateType === 'string' && op.templateType.startsWith('PIPELINE_'),
      },
      validations: [VALIDATOR_REQUIRED],
      onChange: (_value: any, form?: any, _field?: any, object?: any) => {
        form?.patchValue({ _templateType: object?.templateType ?? null });
      },
    },
    { key: '_templateType', type: FieldType.input, visible: false, ignoreOnSubmit: true },
    {
      key: 'date',
      label: 'Report Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
      value: new Date(),
      showWhen: [
        { key: '_templateType', checker: (v: any) => DATE_ONLY_TEMPLATES.includes(v) },
      ],
    },
    {
      key: 'reportSummaryType',
      label: 'Summary Period',
      type: FieldType.select,
      options: PIPELINE_REPORT_SUMMARY_TYPE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      showWhen: [
        { key: '_templateType', checker: (v: any) => SUMMARY_TYPE_TEMPLATES.includes(v) },
      ],
      onChange: (_value: any, form?: any) => patchSummaryEndDate(form),
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
      showWhen: [
        { key: '_templateType', checker: (v: any) => RANGE_TEMPLATES.includes(v) },
      ],
      onChange: (_value: any, form?: any) => patchSummaryEndDate(form),
    },
    {
      key: 'endDate',
      label: 'End Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
      showWhen: [
        {
          key: '_templateType',
          checker: (v: any) => v === ReportTemplateType.PIPELINE_REPORT_SUMMARY,
        },
        {
          key: 'reportSummaryType',
          checker: (v: any) => v === PipelineReportSummaryTypeEnum.SELECTED_PERIOD,
          combination: 'and',
        },
        {
          key: '_templateType',
          checker: (v: any) => NON_SUMMARY_RANGE_TEMPLATES.includes(v),
        },
      ],
    },
  ];
}

export function getCreateReportFormFields(): FieldConfig[] {
  return [
    {
      key: 'pipelineUid',
      label: 'Pipeline',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'uid',
        fetchParameter: { query: GET_ALL_PIPELINES, variables: { active: true } },
      },
      validations: [VALIDATOR_REQUIRED],
    },
    ...getPipelineReportFormFields(),
  ];
}

const reportCrud = defineEntityCrud<PipelineReport>({
  name: 'Report',
  modalTitle: 'Pipeline Report',
  routeSlug: 'reports',
  fields: (data) => (data?.uid ? getPipelineReportFormFields() : getCreateReportFormFields()),
  modalWidth: '50%',
  mutations: {
    create: CREATE_PIPELINE_REPORT,
    update: UPDATE_PIPELINE_REPORT,
    delete: DELETE_PIPELINE_REPORT,
  },
  permissions: {
    manage: ['ROLE_CREATE_PIPELINE_REPORT', 'ROLE_UPDATE_PIPELINE_REPORT'],
    delete: ['ROLE_DELETE_PIPELINE_REPORT'],
    view: ['ROLE_VIEW_PIPELINE_REPORT'],
  },
  statusGate: { edit: true, delete: true },
  modelMapper: (data: any) => ({
    ...(data ?? {}),
    templateUid: data?.templateUid ?? data?.template?.uid,
    _templateType: data?.template?.templateType,
    reportSummaryType: data?.reportSummaryType ?? data?.summaryType,
  }),
  upsertVariables: (value, isCreate) => {
    if (isCreate) {
      const { pipelineUid, ...reportDto } = value;
      return { reportDto, pipelineUid };
    }
    return { reportDto: value };
  },
});

export const pipelineReport$ = reportCrud.reload$;

export const reportUpsertBtn = (comp: BaseComponent): ActionButton => {
  const btn = reportCrud.upsertBtn(crudHostFromBase(comp));
  btn.labelMapper = (d?: any) => (!d?.uid ? 'Generate Report' : 'Edit Report');
  btn.toolTipMapper = (d?: any) => (!d?.uid ? 'Generate Report' : 'Edit Report');
  return btn;
};

export const reportDeleteBtn = (comp: BaseComponent): ActionButton =>
  reportCrud.deleteBtn(crudHostFromBase(comp));

function reportDtoFromRow(data: any) {
  return {
    uid: data.uid,
    templateUid: data?.templateUid ?? data?.template?.uid,
    date: data.date,
    startDate: data.startDate,
    endDate: data.endDate,
    reportSummaryType: data?.reportSummaryType ?? data?.summaryType,
  };
}

function reportLabel(data: any): string {
  return data?.template?.name ?? 'Report';
}

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Report',
    permissions: ['ROLE_CREATE_PIPELINE_REPORT'],
    showFunction: (row: any) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit Report',
      message: 'Are you sure you want to submit this report?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_PIPELINE_REPORT,
        variables: { reportDto: reportDtoFromRow(data) },
        successFn: () => pipelineReport$.next(null),
      });
    },
  };
}

function buildApproveBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve',
    color: 'primary',
    toolTip: 'Approve Report',
    permissions: ['ROLE_APPROVE_PIPELINE_REPORT'],
    showFunction: (row: any) => canApprove(row) && canActOnCurrentStage(row),
    click: (data: any) => {
      const close$ = new Subject<void>();
      // The VALIDATE stage actor must supply the three status remarks — the
      // backend (PipelineReportService.approve) rejects the approval otherwise.
      const isValidate =
        data?.currentStage?.assignedTo?.action === ReportStageEnum.VALIDATE;
      const validateFields: FieldConfig[] = isValidate
        ? [
            {
              key: 'operationStatus',
              label: 'Operation Status',
              type: FieldType.textarea,
              class: 'col-span-full',
              validations: [VALIDATOR_REQUIRED],
            },
            {
              key: 'constructionProgress',
              label: 'Construction Progress',
              type: FieldType.textarea,
              class: 'col-span-full',
              validations: [VALIDATOR_REQUIRED],
            },
            {
              key: 'majorMaintenanceStatus',
              label: 'Major Maintenance Status',
              type: FieldType.textarea,
              class: 'col-span-full',
              validations: [VALIDATOR_REQUIRED],
            },
          ]
        : [];
      const params: FormParameters = {
        model: isValidate
          ? {
              operationStatus: data?.operationStatus ?? '',
              constructionProgress: data?.constructionProgress ?? '',
              majorMaintenanceStatus: data?.majorMaintenanceStatus ?? '',
            }
          : {},
        title: 'Approve Report: ' + reportLabel(data),
        fields: [
          ...validateFields,
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
          const reportDto = isValidate
            ? {
                ...reportDtoFromRow(data),
                operationStatus: value?.operationStatus,
                constructionProgress: value?.constructionProgress,
                majorMaintenanceStatus: value?.majorMaintenanceStatus,
              }
            : reportDtoFromRow(data);
          await host.fetch({
            notify: true,
            mutation: APPROVE_PIPELINE_REPORT,
            variables: { reportDto, comment: value?.comment },
            successFn: () => {
              pipelineReport$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, isValidate ? '50%' : '30%');
    },
  };
}

function buildRejectBtn(host: CrudHost): ActionButton {
  return {
    icon: 'cancel',
    label: 'Reject',
    color: 'warn',
    toolTip: 'Reject Report',
    permissions: ['ROLE_APPROVE_PIPELINE_REPORT'],
    showFunction: (row: any) => canReject(row) && canActOnCurrentStage(row),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Reject Report: ' + reportLabel(data),
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
            mutation: REJECT_PIPELINE_REPORT,
            variables: { reportDto: reportDtoFromRow(data), comment: value?.comment },
            successFn: () => {
              pipelineReport$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '30%');
    },
  };
}

function buildRegenerateBtn(host: CrudHost): ActionButton {
  return {
    icon: 'refresh',
    label: 'Regenerate Content',
    color: 'primary',
    toolTip: 'Regenerate Report Content',
    permissions: ['ROLE_CREATE_PIPELINE_REPORT', 'ROLE_UPDATE_PIPELINE_REPORT'],
    showFunction: (row: any) => canRegenerate(row),
    confirmDataMapper: () => ({
      title: 'Regenerate Report Content',
      message: 'This will overwrite the existing generated content. Continue?',
      confirmText: 'Regenerate',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: RE_GENERATE_PIPELINE_REPORT_CONTENT,
        variables: { reportUid: data?.uid },
        successFn: () => pipelineReport$.next(null),
      });
    },
  };
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

function mimeForFormat(fileType?: ReportOutputFormat): string {
  return fileType === ReportOutputFormat.PDF
    ? 'application/pdf'
    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
}

function buildExportBtn(host: CrudHost): ActionButton {
  return {
    icon: 'download',
    label: 'Download',
    color: 'primary',
    toolTip: 'Download Report',
    permissions: ['ROLE_PRINT_PIPELINE_REPORT'],
    showFunction: (row: any) => canView(row),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: EXPORT_PIPELINE_REPORT,
        variables: { reportUid: data?.uid },
        successFn: (res) => {
          const output: ReportOutputDto = res?.data;
          if (!output?.content) return;
          const blob = base64ToBlob(output.content, mimeForFormat(output.fileType));
          downloadBlob(blob, output.fileName ?? `report-${data?.uid}`);
        },
      });
    },
  };
}

export const reportSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));
export const reportApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp));
export const reportRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp));
export const reportRegenerateBtn = (comp: BaseComponent): ActionButton =>
  buildRegenerateBtn(crudHostFromBase(comp));
export const reportExportBtn = (comp: BaseComponent): ActionButton =>
  buildExportBtn(crudHostFromBase(comp));

export const reportTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return reportCrud.tableBtns(host, [buildExportBtn(host)]);
};
