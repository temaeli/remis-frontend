import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { CrudHost, crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import {
  CANCEL_HSE_TRAINING,
  DELETE_HSE_TRAINING,
  MARK_HSE_TRAINING_AS_COMPLETED,
  SCHEDULE_OR_RESCHEDULE_HSE_TRAINING,
  START_HSE_TRAINING,
} from './training.graphql';
import {
  HseTraining,
  TrainingCategory,
  TrainingDeliveryMode,
  TrainingStatus,
  TrainingType,
} from './training.interface';

export function getHseTrainingFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'category',
      label: 'Category',
      type: FieldType.select,
      options: enumToObjectArray(TrainingCategory),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'type',
      label: 'Type',
      type: FieldType.select,
      options: enumToObjectArray(TrainingType),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'deliveryMode',
      label: 'Delivery Mode',
      type: FieldType.select,
      options: enumToObjectArray(TrainingDeliveryMode),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'plannedDate',
      label: 'Planned Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'course',
      label: 'Course',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'trainingInstitution',
      label: 'Training Institution',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'trainingContent',
      label: 'Training Content',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const hseTrainingCrud = defineEntityCrud<HseTraining>({
  name: 'HSE Training',
  routeSlug: 'trainings',
  fields: getHseTrainingFormFields(),
  modalWidth: '60%',
  mutations: {
    create: SCHEDULE_OR_RESCHEDULE_HSE_TRAINING,
    update: SCHEDULE_OR_RESCHEDULE_HSE_TRAINING,
    delete: DELETE_HSE_TRAINING,
  },
  permissions: {
    manage: ['ROLE_SCHEDULE_HSE_TRAINING'],
    delete: ['ROLE_DELETE_HSE_TRAINING'],
    view: ['ROLE_VIEW_HSE_TRAINING'],
  },
  upsertVariables: (value) => {
    const payload: any = { ...value };
    if (payload.plannedDate) {
      const dateStr =
        typeof payload.plannedDate === 'string'
          ? payload.plannedDate
          : new Date(payload.plannedDate).toISOString();
      payload.plannedDate = dateStr.split('T')[0];
    }
    return { input: payload };
  },
});

export const hseTraining$ = hseTrainingCrud.reload$;

export const hseTrainingUpsertBtn = (comp: BaseComponent): ActionButton =>
  hseTrainingCrud.upsertBtn(crudHostFromBase(comp));

export const hseTrainingDeleteBtn = (comp: BaseComponent): ActionButton =>
  hseTrainingCrud.deleteBtn(crudHostFromBase(comp));

function buildMarkCompletedBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Mark Completed',
    color: 'primary',
    toolTip: 'Mark Training as Completed',
    permissions: ['ROLE_SCHEDULE_HSE_TRAINING'],
    // Backend markCompleted only accepts ONGOING trainings.
    showFunction: (row: any) => row?.status === TrainingStatus.ONGOING,
    // Hard-block completion until attendance has been recorded for at least one
    // attendee. `attendedCount` is stamped onto the training in the detail view.
    disabledFunction: (row: any) => !((row?.attendedCount ?? 0) > 0),
    toolTipMapper: (row: any) =>
      (row?.attendedCount ?? 0) > 0
        ? 'Mark Training as Completed'
        : 'Record attendance before completing this training',
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Complete Training: ' + (data?.course ?? ''),
        fields: [
          {
            key: 'remarks',
            label: 'Remarks',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: MARK_HSE_TRAINING_AS_COMPLETED,
            variables: { trainingUid: data.uid, remarks: value?.remarks },
            successFn: () => {
              hseTraining$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '40%');
    },
  };
}

export const hseTrainingMarkCompletedBtn = (comp: BaseComponent): ActionButton =>
  buildMarkCompletedBtn(crudHostFromBase(comp));

function buildStartBtn(host: CrudHost): ActionButton {
  return {
    icon: 'rocket',
    label: 'Start',
    color: 'primary',
    toolTip: 'Start Training',
    permissions: ['ROLE_EXECUTE_HSE_TRAINING'],
    // Backend start only accepts PLANNED trainings.
    showFunction: (row: any) => row?.status === TrainingStatus.PLANNED,
    // Block starting with an empty roster — there'd be no one to take attendance
    // for (and roster CRUD is locked once ONGOING). `attendeeCount` is stamped
    // onto the training in the detail view.
    disabledFunction: (row: any) => !((row?.attendeeCount ?? 0) > 0),
    toolTipMapper: (row: any) =>
      (row?.attendeeCount ?? 0) > 0
        ? 'Start Training'
        : 'Add at least one attendee before starting this training',
    confirmMessage:
      'Start this training? Once started you can record attendance. This cannot be undone.',
    click: (data: any) => {
      if (!data?.uid) return;
      host.fetch({
        notify: true,
        mutation: START_HSE_TRAINING,
        variables: { trainingUid: data.uid },
        successFn: () => hseTraining$.next(null),
      });
    },
  };
}

export const hseTrainingStartBtn = (comp: BaseComponent): ActionButton =>
  buildStartBtn(crudHostFromBase(comp));

function buildCancelBtn(host: CrudHost): ActionButton {
  return {
    icon: 'cancel',
    label: 'Cancel',
    color: 'warn',
    toolTip: 'Cancel Training',
    permissions: ['ROLE_EXECUTE_HSE_TRAINING'],
    // Backend cancel only accepts PLANNED trainings.
    showFunction: (row: any) => row?.status === TrainingStatus.PLANNED,
    click: (data: any) => {
      if (!data?.uid) return;
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Cancel Training: ' + (data?.course ?? ''),
        fields: [
          {
            key: 'remarks',
            label: 'Reason for cancellation',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: CANCEL_HSE_TRAINING,
            variables: { trainingUid: data.uid, remarks: value?.remarks },
            successFn: () => {
              hseTraining$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '40%');
    },
  };
}

export const hseTrainingCancelBtn = (comp: BaseComponent): ActionButton =>
  buildCancelBtn(crudHostFromBase(comp));

export const hseTrainingTableBtns = (comp: BaseComponent): ActionButton[] =>
  hseTrainingCrud.tableBtns(crudHostFromBase(comp));
