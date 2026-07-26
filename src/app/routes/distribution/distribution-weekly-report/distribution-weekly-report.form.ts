import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { getDeleteBtnProps, navigateRelativeTo } from '@shared/components/view-component/view.helpers';

import {
  DistributionRegion,
  DistributionWeeklyOperationReport,
  DistributionWeeklyOperationReportDtoInput,
} from './distribution-weekly-report.interface';
import {
  APPROVE_DISTRIBUTION_WEEKLY_REPORT,
  DELETE_DISTRIBUTION_WEEKLY_REPORT,
  REJECT_DISTRIBUTION_WEEKLY_REPORT,
  REVIEW_DISTRIBUTION_WEEKLY_REPORT,
  SAVE_DISTRIBUTION_WEEKLY_REPORT,
  SUBMIT_DISTRIBUTION_WEEKLY_REPORT,
} from './distribution-weekly-report.graphql';

// Listener for all Distribution Weekly Report actions
export const distributionWeeklyReport$ = new Subject<DistributionWeeklyOperationReport | any>();

export const getDistributionWeeklyReportFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'weekStartDate',
    label: 'Week Start Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'weekEndDate',
    label: 'Week End Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'region',
    label: 'Region',
    type: FieldType.select,
    validations: [VALIDATOR_REQUIRED],
    options: Object.values(DistributionRegion),
    class: 'col-span-1',
  },
  // manHoursWorked should be picked from the HSE report
  {
    key: 'manHoursWorked',
    label: 'Man Hours Worked',
    type: FieldType.number,
    min:0,
  },
  // totalConsumptionMmscf should be picked from pipeline data
  {
    key: 'totalConsumptionMmscf',
    label: 'Total Consumption (MMscf)',
    type: FieldType.number,
    min:0,
  },
  {
    key: 'preventiveMaintenanceCompleted',
    label: 'Preventive Maintenance Completed',
    type: FieldType.number,
    min:0,
  },
  {
    key: 'correctiveMaintenanceCompleted',
    label: 'Corrective Maintenance Completed',
    type: FieldType.number,
    min:0,
  },
  // lostTimeInjuries, nearMissCount, firstAidCases removed - these are picked from the HSE report
  // {
  //   key: 'hseNarrative',
  //   label: 'HSE Narrative',
  //   type: FieldType.textarea,
  //   class: 'col-span-full',
  // },
];

export function distributionWeeklyReportUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'New Report',
    click: () => {
      const formParameter: FormParameters = {
        title: 'Create Distribution Weekly Report',
        fields: getDistributionWeeklyReportFormFields(),
        closeAction$: distributionWeeklyReport$,
        onSubmit: async (model: DistributionWeeklyOperationReportDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_DISTRIBUTION_WEEKLY_REPORT,
            variables: { dto: model },
          });
          if (result) {
            distributionWeeklyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: ['ROLE_CREATE_DISTRIBUTION_REPORT', 'ROLE_UPDATE_DISTRIBUTION_REPORT'],
  };
}

export function distributionWeeklyReportEditBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'edit',
    label: 'Edit  Weekly Report',
    click: (data?: DistributionWeeklyOperationReport) => {
      const formParameter: FormParameters = {
        title: `Edit  Weekly Report - ${data?.weekStartDate} to ${data?.weekEndDate}`,
        fields: getDistributionWeeklyReportFormFields(),
        model: data,
        closeAction$: distributionWeeklyReport$,
        onSubmit: async (model: DistributionWeeklyOperationReportDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_DISTRIBUTION_WEEKLY_REPORT,
            variables: { dto: { ...model, uid: data?.uid } },
          });
          if (result) {
            distributionWeeklyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: ['ROLE_CREATE_DISTRIBUTION_REPORT', 'ROLE_UPDATE_DISTRIBUTION_REPORT'],
  };
}

export function distributionWeeklyReportSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit  Weekly Report',
    click: (data?: DistributionWeeklyOperationReport) => {
      const formParameter: FormParameters = {
        title: `Submit  Weekly Report - ${data?.weekStartDate} to ${data?.weekEndDate}`,
        fields: [
          {
            key: 'comments',
            label: 'Submit Comments',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: distributionWeeklyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SUBMIT_DISTRIBUTION_WEEKLY_REPORT,
            variables: { dto: { uid: data?.uid, comments: model.comments } },
          });
          if (result) {
            distributionWeeklyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_SUBMIT_DISTRIBUTION_REPORT'],
  };
}

export function distributionWeeklyReportReviewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'Review  Weekly Report',
    click: (data?: DistributionWeeklyOperationReport) => {
      const formParameter: FormParameters = {
        title: `Review  Weekly Report - ${data?.weekStartDate} to ${data?.weekEndDate}`,
        fields: [
          {
            key: 'reviewerComments',
            label: 'Reviewer Comments',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: distributionWeeklyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REVIEW_DISTRIBUTION_WEEKLY_REPORT,
            variables: { dto: { uid: data?.uid, comments: model.reviewerComments } },
          });
          if (result) {
            distributionWeeklyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_REVIEW_DISTRIBUTION_REPORT'],
  };
}

export function distributionWeeklyReportApproveBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve  Weekly Report',
    confirmDataMapper: (data: DistributionWeeklyOperationReport) => ({
      title: 'Approve  Weekly Report',
      message: 'Are you sure you want to approve this report?',
      confirmText: 'Approve',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: DistributionWeeklyOperationReport) => {
      const formParameter: FormParameters = {
        title: `Approve  Weekly Report - ${data?.weekStartDate} to ${data?.weekEndDate}`,
        fields: [
          {
            key: 'approverComments',
            label: 'Approver Comments (Optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: distributionWeeklyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: APPROVE_DISTRIBUTION_WEEKLY_REPORT,
            variables: { dto: { uid: data?.uid, comments: model.approverComments } },
          });
          if (result) {
            distributionWeeklyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_APPROVE_DISTRIBUTION_REPORT'],
  };
}

export function distributionWeeklyReportRejectBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'cancel',
    label: 'Reject Weekly Report',
    confirmDataMapper: (data: DistributionWeeklyOperationReport) => ({
      title: 'Reject Weekly Report',
      message: 'Are you sure you want to reject this report?',
      confirmText: 'Reject',
      confirmButtonColor: 'red',
    }),
    click: async (data?: DistributionWeeklyOperationReport) => {
      const formParameter: FormParameters = {
        title: `Reject Weekly Report - ${data?.weekStartDate} to ${data?.weekEndDate}`,
        fields: [
          {
            key: 'rejectionReason',
            label: 'Rejection Reason',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: distributionWeeklyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REJECT_DISTRIBUTION_WEEKLY_REPORT,
            variables: { dto: { uid: data?.uid, comments: model.rejectionReason } },
          });
          if (result) {
            distributionWeeklyReport$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_REVIEW_DISTRIBUTION_REPORT'],
  };
}

export function distributionWeeklyReportDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Weekly Report', 'weekStartDate'),
    permissions: ['ROLE_DELETE_DISTRIBUTION_REPORT'],
    click: async (data?: DistributionWeeklyOperationReport) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: DELETE_DISTRIBUTION_WEEKLY_REPORT,
        variables: { uid: data?.uid },
      });
      if (result) {
        distributionWeeklyReport$.next(result);
      }
    },
  };
}

export function distributionWeeklyReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Report',
    permissions: ['ROLE_VIEW_ALL_DISTRIBUTION_REPORT', 'ROLE_VIEW_DISTRIBUTION_REPORT'],
    click: (data: DistributionWeeklyOperationReport) =>
      navigateRelativeTo(comp, 'distribution-weekly-report', data?.uid),
  };
}

export function distributionWeeklyReportTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        distributionWeeklyReportViewBtn(comp),
        distributionWeeklyReportEditBtn(comp),
        distributionWeeklyReportSubmitBtn(comp),
        distributionWeeklyReportReviewBtn(comp),
        distributionWeeklyReportApproveBtn(comp),
        distributionWeeklyReportRejectBtn(comp),
        distributionWeeklyReportDeleteBtn(comp),
      ],
    },
  ];
}
