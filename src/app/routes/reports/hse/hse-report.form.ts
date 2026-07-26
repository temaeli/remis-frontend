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
  APPROVE_HSE_REPORT,
  CREATE_OR_UPDATE_HSE_REPORT,
  DELETE_HSE_REPORT,
  EXPORT_HSE_REPORT,
  REJECT_HSE_REPORT,
  RE_GENERATE_HSE_REPORT_CONTENT,
  SUBMIT_HSE_REPORT,
} from './hse-report.graphql';
import { HseReport } from './hse-report.interface';
import { ReportOutputDto, ReportOutputFormat } from '../ewura/ewura-report.interface';
import { ALL_REPORT_TEMPLATE } from 'app/routes/settings/report-template/report-template.graphql';
import { canActOnCurrentStage } from 'app/routes/settings/report-template/report-actor.form';

export function getHseReportFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'templateUid',
      label: 'HSE Template',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'uid',
        fetchParameter: { query: ALL_REPORT_TEMPLATE },
        filterFunction: (op: any) =>
          typeof op?.templateType === 'string' && op.templateType.startsWith('HSE_'),
      },
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
    {
      key: 'endDate',
      label: 'End Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

// Single backend op `createOrUpdateHSEReport` serves both create and update —
// BE branches on `reportDto.uid` presence. We point both crud slots at the same
// gql so the crud helper's "has uid → update / no uid → create" routing still
// works without any helper refactor.
const hseReportCrud = defineEntityCrud<HseReport>({
  name: 'HseReport',
  modalTitle: 'HSE Report',
  routeSlug: 'reports/hse',
  fields: () => getHseReportFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_HSE_REPORT,
    update: CREATE_OR_UPDATE_HSE_REPORT,
    delete: DELETE_HSE_REPORT,
  },
  permissions: {
    manage: ['ROLE_MANAGE_HSE_REPORT'],
    delete: ['ROLE_DELETE_HSE_REPORT'],
    view: ['ROLE_VIEW_HSE_REPORT'],
  },
  statusGate: { edit: true, delete: true },
  modelMapper: (data: any) => ({
    ...(data ?? {}),
    templateUid: data?.templateUid ?? data?.template?.uid,
  }),
  upsertVariables: (value) => ({ input: value }),
});

export const hseReport$ = hseReportCrud.reload$;

export const hseReportUpsertBtn = (comp: BaseComponent): ActionButton =>
  hseReportCrud.upsertBtn(crudHostFromBase(comp));

export const hseReportDeleteBtn = (comp: BaseComponent): ActionButton =>
  hseReportCrud.deleteBtn(crudHostFromBase(comp));

function hseReportDtoFromRow(data: any) {
  return {
    uid: data.uid,
    templateUid: data?.templateUid ?? data?.template?.uid,
    startDate: data.startDate,
    endDate: data.endDate,
  };
}

function hseReportLabel(data: any): string {
  return data?.template?.name ?? 'HSE Report';
}

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit HSE Report',
    permissions: ['ROLE_MANAGE_HSE_REPORT'],
    showFunction: (row: any) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit HSE Report',
      message: 'Are you sure you want to submit this report?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_HSE_REPORT,
        variables: { input: hseReportDtoFromRow(data) },
        successFn: () => hseReport$.next(null),
      });
    },
  };
}

// HSE approve/reject take (uid, comment) — NOT (reportDto, comment) like EWURA.
function buildApproveBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve',
    color: 'primary',
    toolTip: 'Approve HSE Report',
    permissions: ['ROLE_APPROVE_HSE_REPORT'],
    showFunction: (row: any) => canApprove(row) && canActOnCurrentStage(row),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Approve HSE Report: ' + hseReportLabel(data),
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
            mutation: APPROVE_HSE_REPORT,
            variables: { uid: data?.uid, comment: value?.comment ?? '' },
            successFn: () => {
              hseReport$.next(null);
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
    toolTip: 'Reject HSE Report (rewinds to ROLLED_BACK)',
    permissions: ['ROLE_APPROVE_HSE_REPORT'],
    showFunction: (row: any) => canReject(row) && canActOnCurrentStage(row),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Reject HSE Report: ' + hseReportLabel(data),
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
            mutation: REJECT_HSE_REPORT,
            variables: { uid: data?.uid, comment: value?.comment },
            successFn: () => {
              hseReport$.next(null);
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
    toolTip: 'Regenerate HSE Report Content',
    permissions: ['ROLE_MANAGE_HSE_REPORT'],
    showFunction: (row: any) => canRegenerate(row),
    confirmDataMapper: () => ({
      title: 'Regenerate HSE Report Content',
      message: 'This will overwrite the existing generated content. Continue?',
      confirmText: 'Regenerate',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: RE_GENERATE_HSE_REPORT_CONTENT,
        variables: { reportUid: data?.uid },
        successFn: () => hseReport$.next(null),
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
    toolTip: 'Download HSE Report',
    permissions: ['ROLE_PRINT_HSE_REPORT'],
    showFunction: (row: any) => canView(row),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: EXPORT_HSE_REPORT,
        variables: { reportUid: data?.uid },
        successFn: (res) => {
          const output: ReportOutputDto = res?.data;
          if (!output?.content) return;
          const blob = base64ToBlob(output.content, mimeForFormat(output.fileType));
          downloadBlob(blob, output.fileName ?? `hse-report-${data?.uid}`);
        },
      });
    },
  };
}

export const hseReportSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));
export const hseReportApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp));
export const hseReportRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp));
export const hseReportRegenerateBtn = (comp: BaseComponent): ActionButton =>
  buildRegenerateBtn(crudHostFromBase(comp));
export const hseReportExportBtn = (comp: BaseComponent): ActionButton =>
  buildExportBtn(crudHostFromBase(comp));

export const hseReportTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return hseReportCrud.tableBtns(host, [buildExportBtn(host)]);
};
