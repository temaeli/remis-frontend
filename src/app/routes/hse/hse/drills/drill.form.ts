import { Subject } from 'rxjs';
import { Validators } from '@angular/forms';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, FormStepper } from '@shared/components/generic-form/field.interface';
import { CrudHost, crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  DELETE_HSE_DRILL,
  ENDORSE_HSE_DRILL_PLAN,
  ENTER_HSE_DRILL_DATA,
  REJECT_HSE_DRILL_PLAN,
  REVIEW_HSE_DRILL_PLAN,
  SCHEDULE_OR_UPDATE_HSE_DRILL,
  SUBMIT_HSE_DRILL_PLAN,
} from './drill.graphql';
import { DrillStatus, HseDrill } from './drill.interface';

const QUARTER_OPTIONS = [
  { label: 'Q1', value: 1 },
  { label: 'Q2', value: 2 },
  { label: 'Q3', value: 3 },
  { label: 'Q4', value: 4 },
];

const FY_PATTERN = /^\d{4}-\d{4}$/;
const VALIDATOR_FY_PATTERN = {
  name: 'pattern',
  message: 'Financial year must be in the form YYYY-YYYY',
  validator: Validators.pattern(FY_PATTERN),
};
const VALIDATOR_FY_SEQUENTIAL = {
  name: 'fySequential',
  message: 'Second year must be exactly one greater than the first (e.g. 2025-2026)',
  validator: (control: { value: any }) => {
    const value = control?.value;
    if (!value || typeof value !== 'string' || !FY_PATTERN.test(value)) return null;
    const [a, b] = value.split('-').map(Number);
    return b === a + 1 ? null : { fySequential: true };
  },
};

export function getHseDrillFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'financialYear',
      label: 'Financial Year',
      type: FieldType.input,
      placeholder: 'e.g. 2025-2026',
      validations: [VALIDATOR_REQUIRED, VALIDATOR_FY_PATTERN, VALIDATOR_FY_SEQUENTIAL],
    },
    {
      key: 'quarter',
      label: 'Quarter',
      type: FieldType.select,
      options: QUARTER_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'category',
      label: 'Category',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'location',
      label: 'Location',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
    },
    {
      key: 'observation',
      label: 'Observation',
      class: 'col-span-full',
      type: FieldType.textarea,
    },
    {
      key: 'recommendation',
      label: 'Recommendation',
      class: 'col-span-full',
      type: FieldType.textarea,
    },
  ];
}

function getHseDrillFormSteppers(): FormStepper[] {
  return [
    {
      name: 'Scheduling',
      icon: 'schedule',
      keys: ['uid', 'financialYear', 'quarter'],
    },
    {
      name: 'Scope',
      icon: 'category',
      keys: ['category', 'location', 'description'],
    },
    {
      name: 'Notes',
      icon: 'description',
      keys: ['observation', 'recommendation'],
    },
  ];
}

export const isDrillStatus = (row: any, ...statuses: DrillStatus[]): boolean =>
  !!row && statuses.includes(row?.status as DrillStatus);

export const canSubmitDrill = (row: any) =>
  isDrillStatus(row, DrillStatus.DRAFT, DrillStatus.REJECTED);
export const canReviewDrill = (row: any) => isDrillStatus(row, DrillStatus.SUBMITTED);
export const canEndorseDrill = (row: any) => isDrillStatus(row, DrillStatus.REVIEWED);
export const canRejectDrill = (row: any) =>
  isDrillStatus(row, DrillStatus.SUBMITTED, DrillStatus.REVIEWED);
export const canEnterDrillData = (row: any) => isDrillStatus(row, DrillStatus.ENDORSED);

const drillCrud = defineEntityCrud<HseDrill>({
  name: 'HSE Drill',
  routeSlug: 'drills',
  fields: getHseDrillFormFields(),
  formSteppers: getHseDrillFormSteppers(),
  linearSteppers: false,
  modalWidth: '55%',
  mutations: {
    create: SCHEDULE_OR_UPDATE_HSE_DRILL,
    update: SCHEDULE_OR_UPDATE_HSE_DRILL,
    delete: DELETE_HSE_DRILL,
  },
  permissions: {
    manage: ['ROLE_SCHEDULE_HSE_DRILL'],
    delete: ['ROLE_DELETE_HSE_DRILL'],
    view: ['ROLE_VIEW_HSE_DRILL'],
  },
  statusGate: { edit: true, delete: true },
  statusResolver: (row: any): any => {
    // Map DrillStatus back to ProcessStatus values used by canEdit/canDelete
    // in @shared/crud: DRAFT/ROLLED_BACK are editable. REJECTED here acts as
    // "rolled back" — supervisor sent it back for edits.
    if (row?.status === DrillStatus.REJECTED) return 'ROLLED_BACK';
    return row?.status;
  },
  upsertVariables: (value) => ({ input: value }),
});

export const hseDrill$ = drillCrud.reload$;

export const hseDrillUpsertBtn = (comp: BaseComponent): ActionButton =>
  drillCrud.upsertBtn(crudHostFromBase(comp));

export const hseDrillDeleteBtn = (comp: BaseComponent): ActionButton =>
  drillCrud.deleteBtn(crudHostFromBase(comp));

export const hseDrillTableBtns = (comp: BaseComponent): ActionButton[] =>
  drillCrud.tableBtns(crudHostFromBase(comp));

function workflowMutationBtn(
  host: CrudHost,
  opts: {
    icon: string;
    label: string;
    toolTip: string;
    permissions: string[];
    predicate: (row: any) => boolean;
    mutation: any;
  },
): ActionButton {
  return {
    icon: opts.icon,
    label: opts.label,
    color: 'primary',
    toolTip: opts.toolTip,
    permissions: opts.permissions,
    showFunction: opts.predicate,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { uid: data?.uid, comments: '' },
        title: opts.toolTip,
        fields: [
          {
            key: 'comments',
            label: 'Comments',
            class: 'col-span-full',
            type: FieldType.textarea,
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: opts.mutation,
            variables: { input: { uid: data.uid, comments: value?.comments ?? null } },
            successFn: () => {
              hseDrill$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '45%');
    },
  };
}

export const hseDrillSubmitBtn = (comp: BaseComponent): ActionButton =>
  workflowMutationBtn(crudHostFromBase(comp), {
    icon: 'send',
    label: 'Submit',
    toolTip: 'Submit Drill Plan',
    permissions: ['ROLE_SCHEDULE_HSE_DRILL'],
    predicate: canSubmitDrill,
    mutation: SUBMIT_HSE_DRILL_PLAN,
  });

export const hseDrillReviewBtn = (comp: BaseComponent): ActionButton =>
  workflowMutationBtn(crudHostFromBase(comp), {
    icon: 'rate_review',
    label: 'Review',
    toolTip: 'Review Drill Plan',
    permissions: ['ROLE_REVIEW_HSE_DRILL'],
    predicate: canReviewDrill,
    mutation: REVIEW_HSE_DRILL_PLAN,
  });

export const hseDrillEndorseBtn = (comp: BaseComponent): ActionButton =>
  workflowMutationBtn(crudHostFromBase(comp), {
    icon: 'verified',
    label: 'Endorse',
    toolTip: 'Endorse Drill Plan',
    permissions: ['ROLE_ENDORSE_HSE_DRILL'],
    predicate: canEndorseDrill,
    mutation: ENDORSE_HSE_DRILL_PLAN,
  });

export const hseDrillRejectBtn = (comp: BaseComponent): ActionButton => {
  const host = crudHostFromBase(comp);
  return {
    icon: 'cancel',
    label: 'Reject',
    color: 'warn',
    toolTip: 'Reject Drill Plan',
    permissions: ['ROLE_REVIEW_HSE_DRILL', 'ROLE_ENDORSE_HSE_DRILL'],
    showFunction: canRejectDrill,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { uid: data?.uid, comments: '' },
        title: 'Reject Drill Plan',
        fields: [
          {
            key: 'comments',
            label: 'Rejection Reason',
            class: 'col-span-full',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: REJECT_HSE_DRILL_PLAN,
            variables: { input: { uid: data.uid, comments: value?.comments } },
            successFn: () => {
              hseDrill$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '40%');
    },
  };
};

export const hseDrillEnterDataBtn = (comp: BaseComponent): ActionButton => {
  const host = crudHostFromBase(comp);
  return {
    icon: 'edit_note',
    label: 'Enter Data',
    color: 'primary',
    toolTip: 'Enter Drill Data',
    permissions: ['ROLE_ENTER_HSE_DRILL_DATA'],
    showFunction: canEnterDrillData,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {
          uid: data?.uid,
          dateConducted: data?.dateConducted ?? null,
          observation: data?.observation ?? '',
          recommendation: data?.recommendation ?? '',
          description: data?.description ?? '',
        },
        title: 'Enter Drill Data',
        fields: [
          {
            key: 'dateConducted',
            label: 'Date Conducted',
            type: FieldType.date,
            validations: [VALIDATOR_REQUIRED],
            maxDate: new Date(),
          },
          {
            key: 'observation',
            label: 'Observation',
            class: 'col-span-full',
            type: FieldType.textarea,
          },
          {
            key: 'recommendation',
            label: 'Recommendation',
            class: 'col-span-full',
            type: FieldType.textarea,
          },
          {
            key: 'description',
            label: 'Description',
            class: 'col-span-full',
            type: FieldType.textarea,
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: ENTER_HSE_DRILL_DATA,
            variables: { input: value },
            successFn: () => {
              hseDrill$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '55%');
    },
  };
};
