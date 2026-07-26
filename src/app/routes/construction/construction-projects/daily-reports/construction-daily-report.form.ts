import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { downloadPdf, downloadXlsx, downloadDocx } from '@shared/utils';
import { constructionAttachmentRowsField, mapConstructionAttachmentRows } from '../construction-attachments';

import {
  ConstructionDailyReport,
  ConstructionDailyReportDtoInput,
  DistributionReportStatus,
  ConstructionImpactLevel,
  ConstructionConstraintStatus,
} from '../construction-projects.interface';
import {
  SAVE_CONSTRUCTION_DAILY_REPORT,
  SUBMIT_CONSTRUCTION_DAILY_REPORT,
  REVIEW_CONSTRUCTION_DAILY_REPORT,
  APPROVE_CONSTRUCTION_DAILY_REPORT,
  REJECT_CONSTRUCTION_DAILY_REPORT,
  DELETE_CONSTRUCTION_DAILY_REPORT,
  CONSTRUCTION_DAILY_REPORT_PDF,
  CONSTRUCTION_DAILY_REPORT_XLSX,
  CONSTRUCTION_DAILY_REPORT_DOCX,
  CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
} from '../construction-projects.graphql';

const WORKFORCE_CATEGORY_OPTIONS: Option[] = [
  { label: 'Casual Labour', value: 'Casual Labour' },
  { label: 'Gasco Staff', value: 'Gasco Staff' },
  { label: 'Tpdc Staff', value: 'Tpdc' },
  { label: 'Visitors', value: 'Visitors' },
  { label: 'Client', value: 'Client' },
];

export const constructionDailyReport$ = new Subject<ConstructionDailyReport | any>();

const canEdit = (row?: ConstructionDailyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;
const canSubmit = (row?: ConstructionDailyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;
const canReview = (row?: ConstructionDailyReport) => row?.status === DistributionReportStatus.SUBMITTED;
const canApprove = (row?: ConstructionDailyReport) => row?.status === DistributionReportStatus.REVIEWED;
const canReject = (row?: ConstructionDailyReport) =>
  [DistributionReportStatus.SUBMITTED, DistributionReportStatus.REVIEWED].includes(
    row?.status as DistributionReportStatus,
  );
const canDelete = (row?: ConstructionDailyReport) =>
  !row?.status || row.status === DistributionReportStatus.DRAFT;

export function getConstructionDailyReportFormFields(projectUid?: string): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'reportDate', label: 'Report Date', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'weather',
      label: 'Weather Conditions',
      type: FieldType.select,
      options: ['Sunny', 'Cloudy', 'Rainy', 'Normal'],
      validations: [],
    },
    {
      key: 'manpowerRows',
      label: 'Manpower',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      canAddFormGroup: true,
      fields: [
        { key: 'entryDate', label: 'Date', type: FieldType.date, validations: [] },
        {
          key: 'workforceCategory',
          label: 'Workforce Category',
          type: FieldType.select,
          options: WORKFORCE_CATEGORY_OPTIONS,
          validations: [],
        },
        { key: 'personnelCount', label: 'Number of Personnel', type: FieldType.number, min: 0, validations: [] },
        { key: 'hoursPerDay', label: 'Hours Per Day', type: FieldType.number, min: 0, validations: [] },
        { key: 'note', label: 'Note', type: FieldType.input, validations: [] },
      ],
    },

    {
      key: 'hseObservations',
      label: 'HSE Observations',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'qualityControl',
      label: 'Quality Control',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },

    {
      key: 'toolBoxMeeting',
      label: 'Tool Box Meeting',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },

    {
      key: 'progressRows',
      label: 'Daily Progress',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      canAddFormGroup: true,
      fields: [
        {
          key: 'activityUid',
          label: 'Activity',
          type: FieldType.select,
          validations: [],
          optionsVariables: {
            fetchParameter: { query: CONSTRUCTION_ACTIVITIES_FOR_PROJECT, variables: { projectUid } },
            labelKey: 'name',
            valueKey: 'uid',
          },
        },
        { key: 'cumulativeQuantity', label: 'Cumulative Quantity', type: FieldType.number, min: 0, validations: [] },
        {
          key: 'planForNextDay',
          label: 'Plan for Next Day',
          type: FieldType.input,
          validations: [],
        },
      ],
    },

    // { key: 'subContractor', label: 'Sub-Contractor', type: FieldType.input, validations: [] },
    // { key: 'financier', label: 'Financier', type: FieldType.input, validations: [] },
    // { key: 'staffAtSite', label: 'Staff at Site', type: FieldType.input, validations: [] },


    {
      key: 'constraintRows',
      label: 'Constraints & Risks',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      canAddFormGroup: true,
      fields: [
        { key: 'title', label: 'Title', type: FieldType.input, validations: [] },
        {
          key: 'description',
          label: 'Description',
          type: FieldType.input,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'impactLevel',
          label: 'Impact Level',
          type: FieldType.select,
          options: Object.values(ConstructionImpactLevel),
          validations: [],
        },
        {
          key: 'status',
          label: 'Status',
          type: FieldType.select,
          options: Object.values(ConstructionConstraintStatus),
          validations: [],
        },
        { key: 'responsiblePerson', label: 'Responsible Person', type: FieldType.input, validations: [] },
        { key: 'mitigationAction', label: 'Mitigation Action', type: FieldType.input, validations: [] },
      ],
    },
      {
      key: 'challenges',
      label: 'Challenges & Issues',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'correctiveActions',
      label: 'Corrective Actions',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },

    constructionAttachmentRowsField('attachmentRows', 'Photographic Evidence'),
  ];
}

/**
 * Folds the repeatable `manpowerRows`/`constraintRows`/`progressRows` into
 * the DTO's `manpower`/`constraints`/`dailyProgress` arrays, dropping empty
 * rows. Constraint and progress rows reuse their standalone entities' DTO
 * shapes as-is (constraints need `projectUid`; progress needs `activityUid`)
 * even when nested under a daily report.
 */
function mapConstructionDailyReportRows(value: any, projectUid: string): any {
  const dto = { ...(value ?? {}) };
  const manpowerRows = dto.manpowerRows;
  const constraintRows = dto.constraintRows;
  const progressRows = dto.progressRows;
  delete dto.manpowerRows;
  delete dto.constraintRows;
  delete dto.progressRows;

  const manpower = (Array.isArray(manpowerRows) ? manpowerRows : [])
    .filter((row) => row?.workforceCategory || row?.personnelCount || row?.hoursPerDay || row?.note)
    .map((row) => ({
      entryDate: row.entryDate,
      workforceCategory: row.workforceCategory,
      personnelCount: row.personnelCount,
      hoursPerDay: row.hoursPerDay,
      note: row.note,
    }));
  if (manpower.length) dto.manpower = manpower;

  const constraints = (Array.isArray(constraintRows) ? constraintRows : [])
    .filter((row) => !!row?.description)
    .map((row) => ({
      projectUid,
      title: row.title,
      description: row.description,
      impactLevel: row.impactLevel,
      status: row.status,
      responsiblePerson: row.responsiblePerson,
      mitigationAction: row.mitigationAction,
    }));
  if (constraints.length) dto.constraints = constraints;

  const dailyProgress = (Array.isArray(progressRows) ? progressRows : [])
    .filter((row) => !!row?.activityUid && row?.cumulativeQuantity != null)
    .map((row) => ({
      activityUid: row.activityUid,
      reportDate: row.reportDate,
      cumulativeQuantity: row.cumulativeQuantity,
      previousCumulativeQuantity: row.previousCumulativeQuantity,
      planForNextDay: row.planForNextDay,
      note: row.note,
    }));
  if (dailyProgress.length) dto.dailyProgress = dailyProgress;

  return dto;
}

export function constructionDailyReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'View Report',
    click: (data?: ConstructionDailyReport) => {
      if (!data?.uid) return;
      comp.router.navigate(['/construction/daily-site-reports', data.uid]);
    },
    permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_DAILY_REPORT', 'ROLE_VIEW_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportUpsertBtn(comp: BaseComponent, projectUid: string): ActionButton {
  return {
    iconMapper: (d?: ConstructionDailyReport) => (!d?.uid ? 'add' : 'edit'),
    labelMapper: (d?: ConstructionDailyReport) => (!d?.uid ? 'New Daily Report' : 'Edit Daily Report'),
    disabledFunction: (row?: any) => !!row && !canEdit(row),
    click: (data?: ConstructionDailyReport) => {
      const formParameter: FormParameters = {
        title: data?.uid ? `Edit Daily Report - ${data?.reportDate}` : 'New Daily Report',
        fields: getConstructionDailyReportFormFields(projectUid),
        model: data,
        closeAction$: constructionDailyReport$,
        onSubmit: async (model: ConstructionDailyReportDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CONSTRUCTION_DAILY_REPORT,
            variables: {
              dto: mapConstructionAttachmentRows(
                mapConstructionDailyReportRows({ ...model, uid: data?.uid, projectUid }, projectUid),
              ),
            },
          });
          if (result) constructionDailyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '75%');
    },
    permissions: ['ROLE_CREATE_CONSTRUCTION_DAILY_REPORT', 'ROLE_UPDATE_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit Daily Report',
    showFunction: (row?: ConstructionDailyReport) => canSubmit(row),
    confirmDataMapper: () => ({
      title: 'Submit Daily Report',
      message: 'Are you sure you want to submit this daily report?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: ConstructionDailyReport) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: SUBMIT_CONSTRUCTION_DAILY_REPORT,
        variables: { action: { uid: data?.uid } },
      });
      if (result) constructionDailyReport$.next(result);
    },
    permissions: ['ROLE_SUBMIT_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportReviewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'Review Daily Report',
    showFunction: (row?: ConstructionDailyReport) => canReview(row),
    click: (data?: ConstructionDailyReport) => {
      const formParameter: FormParameters = {
        title: `Review Daily Report - ${data?.reportDate}`,
        fields: [
          {
            key: 'comments',
            label: 'Reviewer Comments',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionDailyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REVIEW_CONSTRUCTION_DAILY_REPORT,
            variables: { action: { uid: data?.uid, comments: model.comments } },
          });
          if (result) constructionDailyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_REVIEW_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportApproveBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve Daily Report',
    showFunction: (row?: ConstructionDailyReport) => canApprove(row),
    confirmDataMapper: () => ({
      title: 'Approve Daily Report',
      message: 'Are you sure you want to approve this daily report?',
      confirmText: 'Approve',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: ConstructionDailyReport) => {
      const formParameter: FormParameters = {
        title: `Approve Daily Report - ${data?.reportDate}`,
        fields: [
          {
            key: 'comments',
            label: 'Approver Comments (Optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionDailyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: APPROVE_CONSTRUCTION_DAILY_REPORT,
            variables: { action: { uid: data?.uid, comments: model.comments } },
          });
          if (result) constructionDailyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_APPROVE_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportRejectBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'cancel',
    label: 'Reject Daily Report',
    showFunction: (row?: ConstructionDailyReport) => canReject(row),
    confirmDataMapper: () => ({
      title: 'Reject Daily Report',
      message: 'Are you sure you want to reject this daily report?',
      confirmText: 'Reject',
      confirmButtonColor: 'red',
    }),
    click: async (data?: ConstructionDailyReport) => {
      const formParameter: FormParameters = {
        title: `Reject Daily Report - ${data?.reportDate}`,
        fields: [
          {
            key: 'comments',
            label: 'Rejection Reason',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionDailyReport$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REJECT_CONSTRUCTION_DAILY_REPORT,
            variables: { action: { uid: data?.uid, comments: model.comments } },
          });
          if (result) constructionDailyReport$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_REVIEW_CONSTRUCTION_DAILY_REPORT', 'ROLE_APPROVE_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Daily Report', 'reportDate'),
    showFunction: (row?: ConstructionDailyReport) => canDelete(row),
    permissions: ['ROLE_DELETE_CONSTRUCTION_DAILY_REPORT'],
    click: async (data?: ConstructionDailyReport) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: DELETE_CONSTRUCTION_DAILY_REPORT,
        variables: { uid: data?.uid },
      });
      if (result) constructionDailyReport$.next(result);
    },
  };
}

export function constructionDailyReportPdfBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'pdf',
    label: 'Download PDF',
    click: async (data?: ConstructionDailyReport) => {
      const base64 = await comp.fs.fetch({
        query: CONSTRUCTION_DAILY_REPORT_PDF,
        variables: { uid: data?.uid },
      });
      if (base64) downloadPdf(base64, `construction-daily-report-${data?.reportDate ?? 'export'}`);
    },
    permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_DAILY_REPORT', 'ROLE_VIEW_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportXlsxBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'excel',
    label: 'Download Excel',
    click: async (data?: ConstructionDailyReport) => {
      const base64 = await comp.fs.fetch({
        query: CONSTRUCTION_DAILY_REPORT_XLSX,
        variables: { uid: data?.uid },
      });
      if (base64) downloadXlsx(base64, `construction-daily-report-${data?.reportDate ?? 'export'}`);
    },
    permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_DAILY_REPORT', 'ROLE_VIEW_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportDocxBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'word',
    label: 'Download Word',
    click: async (data?: ConstructionDailyReport) => {
      const base64 = await comp.fs.fetch({
        query: CONSTRUCTION_DAILY_REPORT_DOCX,
        variables: { uid: data?.uid },
      });
      if (base64) downloadDocx(base64, `construction-daily-report-${data?.reportDate ?? 'export'}`);
    },
    permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_DAILY_REPORT', 'ROLE_VIEW_CONSTRUCTION_DAILY_REPORT'],
  };
}

export function constructionDailyReportTableBtns(comp: BaseComponent, projectUid: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        constructionDailyReportViewBtn(comp),
        constructionDailyReportUpsertBtn(comp, projectUid),
        constructionDailyReportSubmitBtn(comp),
        constructionDailyReportReviewBtn(comp),
        constructionDailyReportApproveBtn(comp),
        constructionDailyReportRejectBtn(comp),
        constructionDailyReportPdfBtn(comp),
        constructionDailyReportXlsxBtn(comp),
        constructionDailyReportDocxBtn(comp),
        constructionDailyReportDeleteBtn(comp),
      ],
    },
  ];
}
