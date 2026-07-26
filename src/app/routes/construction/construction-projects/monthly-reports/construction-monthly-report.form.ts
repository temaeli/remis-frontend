import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { downloadPdf, downloadDocx } from '@shared/utils';

import {
  ConstructionMonthlyReport,
  ConstructionMonthlyReportDtoInput,
  DistributionReportStatus,
} from '../construction-projects.interface';
import {
  SAVE_CONSTRUCTION_MONTHLY_REPORT,
  SUBMIT_CONSTRUCTION_MONTHLY_REPORT,
  REVIEW_CONSTRUCTION_MONTHLY_REPORT,
  APPROVE_CONSTRUCTION_MONTHLY_REPORT,
  REJECT_CONSTRUCTION_MONTHLY_REPORT,
  DELETE_CONSTRUCTION_MONTHLY_REPORT,
  CONSTRUCTION_MONTHLY_REPORT_PDF,
  CONSTRUCTION_MONTHLY_REPORT_DOCX,
} from '../construction-projects.graphql';

export const constructionMonthlyReport$ = new Subject<ConstructionMonthlyReport | any>();

const canEdit = (row?: ConstructionMonthlyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;
const canSubmit = (row?: ConstructionMonthlyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;
const canReview = (row?: ConstructionMonthlyReport) => row?.status === DistributionReportStatus.SUBMITTED;
const canApprove = (row?: ConstructionMonthlyReport) => row?.status === DistributionReportStatus.REVIEWED;
const canReject = (row?: ConstructionMonthlyReport) =>
  [DistributionReportStatus.SUBMITTED, DistributionReportStatus.REVIEWED].includes(
    row?.status as DistributionReportStatus,
  );
const canDelete = (row?: ConstructionMonthlyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;

export function getConstructionMonthlyReportFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'reportYear', label: 'Year', type: FieldType.number, min: 2000, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'reportMonth',
      label: 'Month',
      type: FieldType.select,
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
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

export function constructionMonthlyReportUpsertBtn(comp: BaseComponent, projectUid: string): ActionButton {
  return {
    iconMapper: (d?: ConstructionMonthlyReport) => (!d?.uid ? 'add' : 'edit'),
    labelMapper: (d?: ConstructionMonthlyReport) => (!d?.uid ? 'New Monthly Report' : 'Edit Monthly Report'),
    disabledFunction: (row?: any) => !!row && !canEdit(row),
    click: (data?: ConstructionMonthlyReport) => {
      const formParameter: FormParameters = {
        title: data?.uid
          ? `Edit Monthly Report - ${data?.reportMonth}/${data?.reportYear}`
          : 'New Monthly Report',
        fields: getConstructionMonthlyReportFormFields(),
        model: data,
        closeAction$: constructionMonthlyReport$,
        onSubmit: async (model: ConstructionMonthlyReportDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CONSTRUCTION_MONTHLY_REPORT,
            variables: { dto: { ...model, uid: data?.uid, projectUid } },
          });
          if (result) constructionMonthlyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '80%');
    },
    permissions: ['ROLE_CREATE_CONSTRUCTION_MONTHLY_REPORT', 'ROLE_UPDATE_CONSTRUCTION_MONTHLY_REPORT'],
  };
}

export function constructionMonthlyReportSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit Monthly Report',
    showFunction: (row?: ConstructionMonthlyReport) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit Monthly Report',
      message: 'Are you sure you want to submit this monthly report?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: ConstructionMonthlyReport) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: SUBMIT_CONSTRUCTION_MONTHLY_REPORT,
        variables: { action: { uid: data?.uid } },
      });
      if (result) constructionMonthlyReport$.next(result);
    },
    permissions: ['ROLE_SUBMIT_CONSTRUCTION_MONTHLY_REPORT'],
  };
}

export function constructionMonthlyReportReviewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'Review Monthly Report',
    showFunction: (row?: ConstructionMonthlyReport) => canReview(row),
    click: (data?: ConstructionMonthlyReport) => {
      const formParameter: FormParameters = {
        title: `Review Monthly Report - ${data?.reportMonth}/${data?.reportYear}`,
        fields: [
          {
            key: 'comments',
            label: 'Reviewer Comments',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionMonthlyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REVIEW_CONSTRUCTION_MONTHLY_REPORT,
            variables: { action: { uid: data?.uid, comments: model.comments } },
          });
          if (result) constructionMonthlyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_REVIEW_CONSTRUCTION_MONTHLY_REPORT'],
  };
}

export function constructionMonthlyReportApproveBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve Monthly Report',
    showFunction: (row?: ConstructionMonthlyReport) => canApprove(row),
    confirmDataMapper: () => ({
      title: 'Approve Monthly Report',
      message: 'Are you sure you want to approve this monthly report?',
      confirmText: 'Approve',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: ConstructionMonthlyReport) => {
      const formParameter: FormParameters = {
        title: `Approve Monthly Report - ${data?.reportMonth}/${data?.reportYear}`,
        fields: [
          {
            key: 'comments',
            label: 'Approver Comments (Optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionMonthlyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: APPROVE_CONSTRUCTION_MONTHLY_REPORT,
            variables: { action: { uid: data?.uid, comments: model.comments } },
          });
          if (result) constructionMonthlyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_APPROVE_CONSTRUCTION_MONTHLY_REPORT'],
  };
}

export function constructionMonthlyReportRejectBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'cancel',
    label: 'Reject Monthly Report',
    showFunction: (row?: ConstructionMonthlyReport) => canReject(row),
    confirmDataMapper: () => ({
      title: 'Reject Monthly Report',
      message: 'Are you sure you want to reject this monthly report?',
      confirmText: 'Reject',
      confirmButtonColor: 'red',
    }),
    click: async (data?: ConstructionMonthlyReport) => {
      const formParameter: FormParameters = {
        title: `Reject Monthly Report - ${data?.reportMonth}/${data?.reportYear}`,
        fields: [
          {
            key: 'comments',
            label: 'Rejection Reason',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionMonthlyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REJECT_CONSTRUCTION_MONTHLY_REPORT,
            variables: { action: { uid: data?.uid, comments: model.comments } },
          });
          if (result) constructionMonthlyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_REVIEW_CONSTRUCTION_MONTHLY_REPORT', 'ROLE_APPROVE_CONSTRUCTION_MONTHLY_REPORT'],
  };
}

export function constructionMonthlyReportDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Monthly Report', 'reportNo'),
    showFunction: (row?: ConstructionMonthlyReport) => canDelete(row),
    permissions: ['ROLE_DELETE_CONSTRUCTION_MONTHLY_REPORT'],
    click: async (data?: ConstructionMonthlyReport) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: DELETE_CONSTRUCTION_MONTHLY_REPORT,
        variables: { uid: data?.uid },
      });
      if (result) constructionMonthlyReport$.next(result);
    },
  };
}

export function constructionMonthlyReportPdfBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'pdf',
    label: 'Download PDF',
    click: async (data?: ConstructionMonthlyReport) => {
      const base64 = await comp.fs.fetch({
        query: CONSTRUCTION_MONTHLY_REPORT_PDF,
        variables: { uid: data?.uid },
      });
      if (base64)
        downloadPdf(base64, `construction-monthly-report-${data?.reportYear}-${data?.reportMonth ?? 'export'}`);
    },
    permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_MONTHLY_REPORT', 'ROLE_VIEW_CONSTRUCTION_MONTHLY_REPORT'],
  };
}

export function constructionMonthlyReportDocxBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'word',
    label: 'Download Word',
    click: async (data?: ConstructionMonthlyReport) => {
      const base64 = await comp.fs.fetch({
        query: CONSTRUCTION_MONTHLY_REPORT_DOCX,
        variables: { uid: data?.uid },
      });
      if (base64)
        downloadDocx(base64, `construction-monthly-report-${data?.reportYear}-${data?.reportMonth ?? 'export'}`);
    },
    permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_MONTHLY_REPORT', 'ROLE_VIEW_CONSTRUCTION_MONTHLY_REPORT'],
  };
}

export function constructionMonthlyReportTableBtns(comp: BaseComponent, projectUid: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        constructionMonthlyReportUpsertBtn(comp, projectUid),
        constructionMonthlyReportSubmitBtn(comp),
        constructionMonthlyReportReviewBtn(comp),
        constructionMonthlyReportApproveBtn(comp),
        constructionMonthlyReportRejectBtn(comp),
        constructionMonthlyReportPdfBtn(comp),
        constructionMonthlyReportDocxBtn(comp),
        constructionMonthlyReportDeleteBtn(comp),
      ],
    },
  ];
}
