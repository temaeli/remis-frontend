import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { ALL_PLANT } from '@routes/plants/plants/plant.graphql';
import { DistributionReportStatus, AnticipatedProduction } from './anticipated-production.interface';
import {
  SAVE_ANTICIPATED_PRODUCTION,
  SUBMIT_ANTICIPATED_PRODUCTION,
  REVIEW_ANTICIPATED_PRODUCTION,
  DELETE_ANTICIPATED_PRODUCTION,
} from './anticipated-production.graphql';

export const anticipatedProduction$ = new Subject<any>();

export function getAnticipatedProductionFormFields(): FieldConfig[] {
  return [
    {
      key: 'plantUid',
      label: 'Plant',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: ALL_PLANT },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    {
      key: 'productionDate',
      label: 'Production Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'anticipatedMmscfd',
      label: 'Anticipated (MMscfd)',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'anticipatedSm3PerDay',
      label: 'Anticipated (Sm³/day)',
      type: FieldType.number,
      validations: [],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

// ── Upsert ────────────────────────────────────────────────────────────────────

export function anticipatedProductionUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'New Anticipated Production',
    permissions: ['ROLE_CREATE_ANTICIPATED_PRODUCTION', 'ROLE_UPDATE_ANTICIPATED_PRODUCTION'],
    click: (data?: AnticipatedProduction) => {
      const isEdit = !!data?.uid;
      const formParameter: FormParameters = {
        title: isEdit ? 'Edit Anticipated Production' : 'New Anticipated Production',
        fields: getAnticipatedProductionFormFields(),
        model: data
          ? { ...data, plantUid: data.plant?.uid }
          : undefined,
        closeAction$: anticipatedProduction$,
        onSubmit: async (value: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_ANTICIPATED_PRODUCTION,
            variables: {
              dto: {
                ...(isEdit ? { uid: data!.uid } : {}),
                plantUid: value.plantUid,
                productionDate: value.productionDate,
                anticipatedMmscfd: value.anticipatedMmscfd,
                anticipatedSm3PerDay: value.anticipatedSm3PerDay || null,
                remarks: value.remarks || null,
              },
            },
          });
          if (result) anticipatedProduction$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
  };
}

export function anticipatedProductionEditBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'edit',
    label: 'Edit',
    permissions: ['ROLE_CREATE_ANTICIPATED_PRODUCTION', 'ROLE_UPDATE_ANTICIPATED_PRODUCTION'],
    showFunction: (row: AnticipatedProduction) =>
      row?.status === DistributionReportStatus.DRAFT ||
      row?.status === DistributionReportStatus.REJECTED,
    click: (data: AnticipatedProduction) => anticipatedProductionUpsertBtn(comp).click!(data),
  };
}

// ── Submit ────────────────────────────────────────────────────────────────────

export function anticipatedProductionSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    permissions: ['ROLE_CREATE_ANTICIPATED_PRODUCTION', 'ROLE_UPDATE_ANTICIPATED_PRODUCTION'],
    showFunction: (row: AnticipatedProduction) => row?.status === DistributionReportStatus.DRAFT,
    click: (data: AnticipatedProduction) => {
      const formParameter: FormParameters = {
        title: `Submit — ${data?.productionDate}`,
        fields: [
          {
            key: 'comments',
            label: 'Comments (optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [],
          },
        ],
        closeAction$: anticipatedProduction$,
        onSubmit: async (value: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SUBMIT_ANTICIPATED_PRODUCTION,
            variables: { dto: { uid: data.uid, comments: value.comments || null } },
          });
          if (result) anticipatedProduction$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
  };
}

// ── Review ────────────────────────────────────────────────────────────────────

export function anticipatedProductionReviewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'fact_check',
    label: 'Review',
    color: 'primary',
    permissions: ['ROLE_REVIEW_ANTICIPATED_PRODUCTION'],
    showFunction: (row: AnticipatedProduction) => row?.status === DistributionReportStatus.SUBMITTED,
    click: (data: AnticipatedProduction) => {
      const formParameter: FormParameters = {
        title: `Review — ${data?.productionDate}`,
        fields: [
          {
            key: 'approved',
            label: 'Decision',
            type: FieldType.select,
            options: [
              { label: 'Approve', value: true },
              { label: 'Reject', value: false },
            ],
            validations: [VALIDATOR_REQUIRED],
          },
          {
            key: 'comments',
            label: 'Comments (optional)',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [],
          },
        ],
        closeAction$: anticipatedProduction$,
        onSubmit: async (value: any) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: REVIEW_ANTICIPATED_PRODUCTION,
            variables: {
              dto: { uid: data.uid, comments: value.comments || null },
              approved: value.approved,
            },
          });
          if (result) anticipatedProduction$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
  };
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function anticipatedProductionDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_DELETE_ANTICIPATED_PRODUCTION'],
    showFunction: (row: AnticipatedProduction) => row?.status === DistributionReportStatus.DRAFT,
    ...getDeleteBtnProps('Anticipated Production', 'productionDate'),
    click: async (data: AnticipatedProduction) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: DELETE_ANTICIPATED_PRODUCTION,
        variables: { uid: data.uid },
      });
      if (result) anticipatedProduction$.next(result);
    },
  };
}

// ── Table buttons ─────────────────────────────────────────────────────────────

export function anticipatedProductionTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        anticipatedProductionEditBtn(comp),
        anticipatedProductionSubmitBtn(comp),
        anticipatedProductionReviewBtn(comp),
        anticipatedProductionDeleteBtn(comp),
      ],
    },
  ];
}
