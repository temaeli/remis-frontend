import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getDeleteBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';

import {
  ConstructionNonConformity,
  ConstructionSopRecord,
  ConstructionSopRecordDtoInput,
  NonConformityStatus,
  SopChecklistOutcome,
  SopExecutionStatus,
} from './construction-sop.interface';
import {
  APPROVE_CONSTRUCTION_SOP_RECORD,
  CONSTRUCTION_SOP_CATALOG,
  DELETE_CONSTRUCTION_SOP_RECORD,
  RECORD_CONSTRUCTION_NON_CONFORMITY,
  REJECT_CONSTRUCTION_SOP_RECORD,
  REVIEW_CONSTRUCTION_SOP_RECORD,
  SAVE_CONSTRUCTION_SOP_RECORD,
  SUBMIT_CONSTRUCTION_SOP_RECORD,
} from './construction-sop.graphql';
import { GET_ALL_USERS_PAGEABLE } from '@routes/plants/plants/plant.graphql';

export const constructionNonConformity$ = new Subject<ConstructionNonConformity | any>();

export const constructionSop$ = new Subject<ConstructionSopRecord | any>();

export const getConstructionSopRecordFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'checklistItems',
    label: 'Checklist Items',
    type: FieldType.formGroupArray,
    class: 'col-span-full',
    fields: [
      {
        key: 'ordering',
        label: 'Ordering',
        type: FieldType.input,
        inputType: 'number',
      },
      {
        key: 'outcome',
        label: 'Outcome',
        type: FieldType.select,
        options: Object.values(SopChecklistOutcome),
        class: 'col-span-1',
      },

      {
        key: 'comment',
        label: 'Comment',
        type: FieldType.input,
      },
      {
        key: 'description',
        label: 'Description',
        type: FieldType.input,
      },
      {
        key: 'evidenceAttachmentInput',
        label: 'Evidence',
        type: FieldType.attachment,
        skipAutoUpload: true,
        attachment: { sourceName: AttachmentSourceNameEnum.OTHERS },
        validations: [],
      },
    ],
  },
  {
    key: 'executionDate',
    label: 'Execution Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'executionTime',
    label: 'Execution Time',
    type: FieldType.dateTime,
    validations: [],
  },
  {
    key: 'sopCatalogUid',
    label: 'SOP',
    type: FieldType.select,
    validations: [VALIDATOR_REQUIRED],
    optionsVariables: {
      fetchParameter: { query: CONSTRUCTION_SOP_CATALOG },
      labelKey: 'name',
      valueKey: 'uid',
    },
  },
  {
    key: 'location',
    label: 'Location',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'teamId',
    label: 'Team ID',
    type: FieldType.input,
  },

  {
    key: 'supervisorUid',
    type: FieldType.select,
    label: 'Supervisor',
    validations: [],
    optionsVariables: { fetchParameter: { query: GET_ALL_USERS_PAGEABLE } },
  },
  {
    key: 'fieldEngineerUid',
    type: FieldType.select,
    label: 'Field Engineer',
    validations: [],
    optionsVariables: { fetchParameter: { query: GET_ALL_USERS_PAGEABLE } },
  },
  {
    key: 'qcInspectorUid',
    type: FieldType.select,
    label: 'QC Inspector',
    validations: [],
    optionsVariables: { fetchParameter: { query: GET_ALL_USERS_PAGEABLE } },
  },
  {
    key: 'summary',
    label: 'Summary',
    type: FieldType.textarea,
    class: 'col-span-full',
  },
];

/**
 * Folds each checklist row's transient `evidenceAttachmentInput` (the
 * upload widget's `{ data, ... }` object) into `evidenceAttachmentBase64` —
 * the field name the backend's ConstructionSopChecklistItemDtoInput expects
 * — and strips the transient key. Returns the cleaned DTO ready to submit.
 */
function mapSopRecordChecklistEvidence(model: any): any {
  const dto = { ...(model ?? {}) };
  const items = Array.isArray(dto.checklistItems) ? dto.checklistItems : [];
  dto.checklistItems = items.map((item: any) => {
    const row = { ...item };
    const evidence = row.evidenceAttachmentInput;
    delete row.evidenceAttachmentInput;
    if (evidence?.data) {
      row.evidenceAttachmentBase64 = evidence.data;
    }
    return row;
  });
  return dto;
}

export function constructionSopUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'New Record',
    click: () => {
      const formParameter: FormParameters = {
        title: 'Create Construction SOP Record',
        fields: getConstructionSopRecordFormFields(),
        closeAction$: constructionSop$,
        onSubmit: async (model: ConstructionSopRecordDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CONSTRUCTION_SOP_RECORD,
            variables: { dto: mapSopRecordChecklistEvidence(model) },
          });
          if (result) {
            constructionSop$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: ['ROLE_CREATE_CONSTRUCTION_SOP', 'ROLE_UPDATE_CONSTRUCTION_SOP'],
  };
}

export function constructionSopEditBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'edit',
    label: 'Edit Construction Sop',
    showFunction: (data?: ConstructionSopRecord) => data?.status !== SopExecutionStatus.APPROVED,
    click: (data?: ConstructionSopRecord) => {
      const formParameter: FormParameters = {
        title: `Edit Record - ${data?.referenceNumber}`,
        fields: getConstructionSopRecordFormFields(),
        closeAction$: constructionSop$,
        model: data,
        onSubmit: async (model: ConstructionSopRecordDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CONSTRUCTION_SOP_RECORD,
            variables: { dto: { ...mapSopRecordChecklistEvidence(model), uid: data?.uid } },
          });
          if (result) {
            constructionSop$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: ['ROLE_CREATE_CONSTRUCTION_SOP', 'ROLE_UPDATE_CONSTRUCTION_SOP'],
  };
}

export function constructionSopSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit Construction Sop',
    showFunction: (data?: ConstructionSopRecord) =>
      [
        SopExecutionStatus.OPEN,
        SopExecutionStatus.IN_PROGRESS,
        SopExecutionStatus.REJECTED,
      ].includes(data?.status as SopExecutionStatus),
    click: (data?: ConstructionSopRecord) => {
      const formParameter: FormParameters = {
        title: `Submit Record - ${data?.referenceNumber}`,
        fields: [
          {
            key: 'comments',
            label: 'Submit Comments',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionSop$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SUBMIT_CONSTRUCTION_SOP_RECORD,
            variables: { dto: { uid: data?.uid, comments: model.comments } },
          });
          if (result) {
            constructionSop$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_CREATE_CONSTRUCTION_SOP', 'ROLE_UPDATE_CONSTRUCTION_SOP'],
  };
}

export function constructionSopReviewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'Review Construction Sop',
    showFunction: (data?: ConstructionSopRecord) => data?.status === SopExecutionStatus.SUBMITTED,
    click: (data?: ConstructionSopRecord) => {
      const formParameter: FormParameters = {
        title: `Review Record - ${data?.referenceNumber}`,
        fields: [
          {
            key: 'comments',
            label: 'Reviewer Comments',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionSop$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REVIEW_CONSTRUCTION_SOP_RECORD,
            variables: { dto: { uid: data?.uid, comments: model.comments } },
          });
          if (result) {
            constructionSop$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_APPROVE_CONSTRUCTION_SOP'],
  };
}

export function constructionSopApproveBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve Construction Sop',
    showFunction: (data?: ConstructionSopRecord) => data?.status === SopExecutionStatus.REVIEWED,
    confirmDataMapper: (data: ConstructionSopRecord) => ({
      title: 'Approve Construction SOP Record',
      message: 'Are you sure you want to approve this record?',
      confirmText: 'Approve',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: ConstructionSopRecord) => {
      const formParameter: FormParameters = {
        title: `Approve Record - ${data?.referenceNumber}`,
        fields: [
          {
            key: 'comments',
            label: 'Approver Comments (Optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionSop$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: APPROVE_CONSTRUCTION_SOP_RECORD,
            variables: { dto: { uid: data?.uid, comments: model.comments } },
          });
          if (result) {
            constructionSop$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_APPROVE_CONSTRUCTION_SOP'],
  };
}

export function constructionSopRejectBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'cancel',
    label: 'Reject Construction Sop',
    showFunction: (data?: ConstructionSopRecord) =>
      [SopExecutionStatus.SUBMITTED, SopExecutionStatus.REVIEWED].includes(
        data?.status as SopExecutionStatus,
      ),
    confirmDataMapper: (data: ConstructionSopRecord) => ({
      title: 'Reject Construction SOP Record',
      message: 'Are you sure you want to reject this record?',
      confirmText: 'Reject',
      confirmButtonColor: 'red',
    }),
    click: async (data?: ConstructionSopRecord) => {
      const formParameter: FormParameters = {
        title: `Reject Record - ${data?.referenceNumber}`,
        fields: [
          {
            key: 'comments',
            label: 'Rejection Reason',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: constructionSop$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REJECT_CONSTRUCTION_SOP_RECORD,
            variables: { dto: { uid: data?.uid, comments: model.comments } },
          });
          if (result) {
            constructionSop$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: ['ROLE_APPROVE_CONSTRUCTION_SOP'],
  };
}

export function constructionSopDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Construction SOP Record', 'referenceNumber'),
    showFunction: (data?: ConstructionSopRecord) => data?.status !== SopExecutionStatus.APPROVED,
    click: async (data?: ConstructionSopRecord) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: DELETE_CONSTRUCTION_SOP_RECORD,
        variables: { uid: data?.uid },
      });
      if (result) {
        constructionSop$.next(result);
      }
    },
  };
}

export function constructionSopViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Construction Sop',
    click: (data?: ConstructionSopRecord) => navigateRelativeTo(comp, 'construction-sop', data?.uid),
  };
}

export function constructionSopTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        constructionSopViewBtn(comp),
        constructionSopEditBtn(comp),
        constructionSopSubmitBtn(comp),
        constructionSopReviewBtn(comp),
        constructionSopApproveBtn(comp),
        constructionSopRejectBtn(comp),
        constructionSopDeleteBtn(comp),
      ],
    },
  ];
}

export function constructionNonConformityUpsertBtn(
  comp: BaseComponent,
  recordUid: string,
): ActionButton {
  return {
    iconMapper: (d?: ConstructionNonConformity) => (d?.uid ? 'edit' : 'add'),
    labelMapper: (d?: ConstructionNonConformity) =>
      d?.uid ? 'Edit Non-Conformity' : 'Record Non-Conformity',
    click: (data?: ConstructionNonConformity) => {
      const formParameter: FormParameters = {
        title: data?.uid ? 'Edit Non-Conformity' : 'Record Non-Conformity',
        model: data,
        fields: [
          { key: 'uid', type: FieldType.input, visible: false },
          {
            key: 'description',
            label: 'Description',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
          {
            key: 'correctiveAction',
            label: 'Corrective Action',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [],
          },
          {
            key: 'responsiblePartyUserUid',
            label: 'Responsible Party',
            type: FieldType.select,
            validations: [],
            optionsVariables: { fetchParameter: { query: GET_ALL_USERS_PAGEABLE } },
          },
          { key: 'dueDate', label: 'Due Date', type: FieldType.date, validations: [] },
          {
            key: 'status',
            label: 'Status',
            type: FieldType.select,
            options: Object.values(NonConformityStatus),
            validations: [],
          },
          {
            key: 'resolutionNotes',
            label: 'Resolution Notes',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [],
          },
        ],
        closeAction$: constructionNonConformity$,
        onSubmit: async (model: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: RECORD_CONSTRUCTION_NON_CONFORMITY,
            variables: { dto: { ...model, recordUid } },
          });
          if (result) {
            constructionNonConformity$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: [
      'ROLE_CREATE_CONSTRUCTION_SOP',
      'ROLE_UPDATE_CONSTRUCTION_SOP',
      'ROLE_APPROVE_CONSTRUCTION_SOP',
    ],
  };
}

export function constructionNonConformityTableBtns(
  comp: BaseComponent,
  recordUid: string,
): ActionButton[] {
  return [constructionNonConformityUpsertBtn(comp, recordUid)];
}
