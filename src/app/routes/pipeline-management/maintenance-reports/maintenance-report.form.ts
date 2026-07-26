import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  CrudHost,
  ProcessStatus,
  buildApproveBtn,
  buildRejectBtn,
  canSubmit,
  crudHostFromBase,
} from '@shared/crud';
import {
  getInputItems,
} from '@routes/plants/common-plant-reports/comon-plant-report';
import { PlantInputType } from '@routes/plants/plant-form-groups/plant-form-group.interface';
import {
  APPROVE_PIPELINE_MAINTENANCE_REPORT,
  CREATE_OR_UPDATE_PIPELINE_MAINTENANCE_REPORT,
  DELETE_MAINTENANCE_ACTIVITY,
  REJECT_PIPELINE_MAINTENANCE_REPORT,
  SUBMIT_PIPELINE_MAINTENANCE_REPORT,
} from './maintenance-report.graphql';
import {
  ApprovalStatus,
  PipelineMaintenanceReport,
  StageEnum,
} from './maintenance-report.interface';

export const pipelineMaintenanceReport$ = new Subject<PipelineMaintenanceReport | any>();

// Maps the new BE lifecycle (ApprovalStatus + StageEnum) onto the shared
// ProcessStatus so @shared/crud predicates (canSubmit/canApprove/canReject)
// keep working without change.
export function pipelineMaintenanceReportStatus(row: any): ProcessStatus | undefined {
  if (!row?.uid) return undefined;
  if (row.approvalStatus === ApprovalStatus.APPROVED) return ProcessStatus.APPROVED;
  if (row.approvalStatus === ApprovalStatus.REJECTED) return ProcessStatus.REJECTED;
  if (row.stage === StageEnum.OFFICER) return ProcessStatus.DRAFT;
  return ProcessStatus.SUBMITTED;
}

const canEdit = (row: any, currentUsername?: string) => {
  if (!row?.uid) return true;
  const s = pipelineMaintenanceReportStatus(row);
  return s === ProcessStatus.DRAFT && row?.createdBy?.username === currentUsername;
};

const canDelete = (row: any, currentUsername?: string) => canEdit(row, currentUsername);

export const getPipelineMaintenanceReportFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  { key: 'pipelineUid', type: FieldType.input, visible: false, validations: [VALIDATOR_REQUIRED] },
  {
    key: 'date',
    label: 'Report Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'remarks',
    label: 'Remarks',
    type: FieldType.textarea,
    class: 'col-span-full',
  },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Maintenance Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-5 xl:grid-cols-5 gap-4',
    fields: [
      { key: 'uid', type: FieldType.input, visible: false },
      {
        key: 'itemUid',
        type: FieldType.input,
        visible: false,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'item',
        type: FieldType.label,
        valueAsLabel: true,
        innerClass: 'bg-gray-400/10 rounded-lg p-3',
        validations: [VALIDATOR_REQUIRED],
        ignoreOnSubmit: true,
        disabled: true,
      },
      {
        key: 'plannedMaintenance',
        label: 'Planned',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'plannedMaintenanceDone',
        label: 'Planned Done',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'plannedMaintenanceNotDone',
        label: 'Planned Not Done',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'unPlannedMaintenanceDone',
        label: 'Unplanned Done',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
    ],
  },
];

export function pipelineMaintenanceReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Maintenance Performance',
    toolTip: 'View Maintenance Performance',
    permissions: ['ROLE_VIEW_MAINTENANCE_ACTIVITY', 'ROLE_MANAGE_MAINTENANCE_ACTIVITY'],
    showFunction: (row: any) => !!row?.uid,
    click: (data: any) =>
      comp.router.navigate(['/pipeline-management/maintenance-reports', data?.uid]),
  };
}

export function pipelineMaintenanceReportUpsertBtn(
  comp: BaseComponent,
  pipelineUid?: string,
): ActionButton {
  const host = crudHostFromBase(comp);
  return {
    icon: 'add',
    label: 'Add Maintenance Performance',
    labelMapper: (row: any) =>
      row?.uid ? 'Edit Maintenance Performance' : 'Add Maintenance Performance',
    toolTip: 'Add Maintenance Performance',
    toolTipMapper: (row: any) =>
      row?.uid ? 'Edit Maintenance Performance' : 'Add Maintenance Performance',
    iconMapper: (row: any) => (row?.uid ? 'edit' : 'add'),
    color: 'primary',
    permissions: ['ROLE_MANAGE_MAINTENANCE_ACTIVITY'],
    showFunction: (row: any) => canEdit(row, host.currentUserUsername),
    click: async (data?: PipelineMaintenanceReport) => {
      const resolvedPipelineUid = pipelineUid ?? (data as any)?.pipeline?.uid;
      const seededInputs = await getInputItems(comp, PlantInputType.MAINTENANCE);
      if (!seededInputs.length) return;

      const existingInputs = (data as any)?.items?.map((it: any) => ({
        uid: it.uid,
        itemUid: it.item?.uid,
        item: it.item?.name,
        plannedMaintenance: it.plannedMaintenance,
        plannedMaintenanceDone: it.plannedMaintenanceDone,
        plannedMaintenanceNotDone: it.plannedMaintenanceNotDone,
        unPlannedMaintenanceDone: it.unPlannedMaintenanceDone,
      }));

      const params: FormParameters = {
        model: {
          uid: data?.uid,
          pipelineUid: resolvedPipelineUid,
          date: (data as any)?.createdAtDate,
          remarks: data?.remarks,
          inputs: existingInputs?.length ? existingInputs : seededInputs,
        },
        title: 'Maintenance Performance',
        fields: getPipelineMaintenanceReportFormFields(),
        closeAction$: pipelineMaintenanceReport$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: CREATE_OR_UPDATE_PIPELINE_MAINTENANCE_REPORT,
            successFn: (res) => pipelineMaintenanceReport$.next(res?.data),
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '96%', 'auto', { minWidth: '1280px' });
    },
  };
}

export function pipelineMaintenanceReportDeleteBtn(comp: BaseComponent): ActionButton {
  const host = crudHostFromBase(comp);
  return {
    icon: 'delete',
    label: 'Delete',
    color: 'warn',
    toolTip: 'Delete Maintenance Performance',
    permissions: ['ROLE_DELETE_MAINTENANCE_ACTIVITY'],
    showFunction: (row: any) => canDelete(row, host.currentUserUsername),
    confirmDataMapper: (data: any) => ({
      title: 'Delete Maintenance Performance',
      message: `Are you sure you want to delete "${data?.name}"?`,
      confirmText: 'Delete',
      confirmButtonColor: 'red',
    }),
    click: async (data: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_MAINTENANCE_ACTIVITY,
        successFn: (res) => pipelineMaintenanceReport$.next(res?.data),
      });
    },
  };
}

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Maintenance Performance',
    permissions: ['ROLE_MANAGE_MAINTENANCE_ACTIVITY'],
    showFunction: (row: any) =>
      canSubmit({ status: pipelineMaintenanceReportStatus(row) }) &&
      row?.createdBy?.username === host.currentUserUsername,
    confirmDataMapper: () => ({
      title: 'Submit Maintenance Performance',
      message: 'Are you sure you want to submit this maintenance report?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_PIPELINE_MAINTENANCE_REPORT,
        variables: { uid: data.uid },
        successFn: () => pipelineMaintenanceReport$.next(null),
      });
    },
  };
}

export const pipelineMaintenanceReportSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const pipelineMaintenanceReportApproveBtn = (comp: BaseComponent): ActionButton => {
  const host = crudHostFromBase(comp);
  const btn = buildApproveBtn(host, {
    mutation: APPROVE_PIPELINE_MAINTENANCE_REPORT,
    entityLabel: 'Maintenance Performance',
    permission: 'ROLE_APPROVE_MAINTENANCE_ACTIVITY',
    onSuccess: () => pipelineMaintenanceReport$.next(null),
    gateCreator: true,
  });
  // BE has no timestamps → override the shared status-from-timestamps check
  btn.showFunction = (row: any) => {
    if (pipelineMaintenanceReportStatus(row) !== ProcessStatus.SUBMITTED) return false;
    return row?.createdBy?.username !== host.currentUserUsername;
  };
  return btn;
};

export const pipelineMaintenanceReportRejectBtn = (comp: BaseComponent): ActionButton => {
  const host = crudHostFromBase(comp);
  const btn = buildRejectBtn(host, {
    mutation: REJECT_PIPELINE_MAINTENANCE_REPORT,
    entityLabel: 'Maintenance Performance',
    permission: 'ROLE_APPROVE_MAINTENANCE_ACTIVITY',
    onSuccess: () => pipelineMaintenanceReport$.next(null),
    gateCreator: true,
  });
  btn.showFunction = (row: any) => {
    if (pipelineMaintenanceReportStatus(row) !== ProcessStatus.SUBMITTED) return false;
    return row?.createdBy?.username !== host.currentUserUsername;
  };
  return btn;
};

export function pipelineMaintenanceReportTableBtns(
  comp: BaseComponent,
  pipelineUid?: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        pipelineMaintenanceReportViewBtn(comp),
        pipelineMaintenanceReportUpsertBtn(comp, pipelineUid),
        pipelineMaintenanceReportSubmitBtn(comp),
        pipelineMaintenanceReportApproveBtn(comp),
        pipelineMaintenanceReportRejectBtn(comp),
        pipelineMaintenanceReportDeleteBtn(comp),
      ],
    },
  ];
}
