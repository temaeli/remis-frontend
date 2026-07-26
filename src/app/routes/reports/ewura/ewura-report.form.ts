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
  APPROVE_EWURA_REPORT,
  CREATE_EWURA_REPORT,
  DELETE_EWURA_REPORT,
  EXPORT_EWURA_REPORT,
  REJECT_EWURA_REPORT,
  RE_GENERATE_EWURA_REPORT_CONTENT,
  SUBMIT_EWURA_REPORT,
  UPDATE_EWURA_REPORT,
} from './ewura-report.graphql';
import { EwuraReport, ReportOutputDto, ReportOutputFormat } from './ewura-report.interface';
import { ALL_REPORT_TEMPLATE } from 'app/routes/settings/report-template/report-template.graphql';
import { canActOnCurrentStage } from 'app/routes/settings/report-template/report-actor.form';

export function getEwuraReportFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'templateUid',
      label: 'EWURA Template',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'uid',
        fetchParameter: { query: ALL_REPORT_TEMPLATE },
        filterFunction: (op: any) =>
          typeof op?.templateType === 'string' && op.templateType.startsWith('EWURA_'),
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

const ewuraReportCrud = defineEntityCrud<EwuraReport>({
  name: 'EwuraReport',
  modalTitle: 'EWURA Report',
  routeSlug: 'reports/ewura',
  fields: () => getEwuraReportFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_EWURA_REPORT,
    update: UPDATE_EWURA_REPORT,
    delete: DELETE_EWURA_REPORT,
  },
  permissions: {
    manage: ['ROLE_PREPARE_EWURA_REPORT'],
    delete: ['ROLE_DELETE_EWURA_REPORT'],
    view: ['ROLE_VIEW_EWURA_REPORT'],
  },
  statusGate: { edit: true, delete: true },
  modelMapper: (data: any) => ({
    ...(data ?? {}),
    templateUid: data?.templateUid ?? data?.template?.uid,
  }),
  upsertVariables: (value) => ({ reportDto: value }),
});

export const ewuraReport$ = ewuraReportCrud.reload$;

export const ewuraReportUpsertBtn = (comp: BaseComponent): ActionButton =>
  ewuraReportCrud.upsertBtn(crudHostFromBase(comp));

export const ewuraReportDeleteBtn = (comp: BaseComponent): ActionButton =>
  ewuraReportCrud.deleteBtn(crudHostFromBase(comp));

function ewuraReportDtoFromRow(data: any) {
  return {
    uid: data.uid,
    templateUid: data?.templateUid ?? data?.template?.uid,
    startDate: data.startDate,
    endDate: data.endDate,
  };
}

function ewuraReportLabel(data: any): string {
  return data?.template?.name ?? 'EWURA Report';
}

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit EWURA Report',
    permissions: ['ROLE_PREPARE_EWURA_REPORT'],
    showFunction: (row: any) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit EWURA Report',
      message: 'Are you sure you want to submit this report?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_EWURA_REPORT,
        variables: { reportDto: ewuraReportDtoFromRow(data) },
        successFn: () => ewuraReport$.next(null),
      });
    },
  };
}

function buildApproveBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve',
    color: 'primary',
    toolTip: 'Approve EWURA Report',
    permissions: ['ROLE_APPROVE_EWURA_REPORT'],
    showFunction: (row: any) => canApprove(row) && canActOnCurrentStage(row),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Approve EWURA Report: ' + ewuraReportLabel(data),
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
            mutation: APPROVE_EWURA_REPORT,
            variables: { reportDto: ewuraReportDtoFromRow(data), comment: value?.comment },
            successFn: () => {
              ewuraReport$.next(null);
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
    toolTip: 'Reject EWURA Report (rewinds to ROLLED_BACK)',
    permissions: ['ROLE_APPROVE_EWURA_REPORT'],
    showFunction: (row: any) => canReject(row) && canActOnCurrentStage(row),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Reject EWURA Report: ' + ewuraReportLabel(data),
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
            mutation: REJECT_EWURA_REPORT,
            variables: { reportDto: ewuraReportDtoFromRow(data), comment: value?.comment },
            successFn: () => {
              ewuraReport$.next(null);
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
    toolTip: 'Regenerate EWURA Report Content',
    permissions: ['ROLE_PREPARE_EWURA_REPORT'],
    showFunction: (row: any) => canRegenerate(row),
    confirmDataMapper: () => ({
      title: 'Regenerate EWURA Report Content',
      message: 'This will overwrite the existing generated content. Continue?',
      confirmText: 'Regenerate',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: RE_GENERATE_EWURA_REPORT_CONTENT,
        variables: { reportUid: data?.uid },
        successFn: () => ewuraReport$.next(null),
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
    toolTip: 'Download EWURA Report',
    permissions: ['ROLE_PRINT_EWURA_REPORT'],
    showFunction: (row: any) => canView(row),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: EXPORT_EWURA_REPORT,
        variables: { reportUid: data?.uid },
        successFn: (res) => {
          const output: ReportOutputDto = res?.data;
          if (!output?.content) return;
          const blob = base64ToBlob(output.content, mimeForFormat(output.fileType));
          downloadBlob(blob, output.fileName ?? `ewura-report-${data?.uid}`);
        },
      });
    },
  };
}

export const ewuraReportSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));
export const ewuraReportApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp));
export const ewuraReportRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp));
export const ewuraReportRegenerateBtn = (comp: BaseComponent): ActionButton =>
  buildRegenerateBtn(crudHostFromBase(comp));
export const ewuraReportExportBtn = (comp: BaseComponent): ActionButton =>
  buildExportBtn(crudHostFromBase(comp));

export const ewuraReportTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return ewuraReportCrud.tableBtns(host, [buildExportBtn(host)]);
};
