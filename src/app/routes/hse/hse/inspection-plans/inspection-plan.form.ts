import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  CrudHost,
  crudHostFromBase,
  defineEntityCrud,
  lookupOptions,
} from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { inspectionTypeLookupProvider } from '../inspection-types/inspection-type.provider';
import {
  CLOSE_INSPECTION_PLAN,
  CREATE_OR_UPDATE_INSPECTION_PLAN,
  DELETE_INSPECTION_PLAN,
  EXECUTE_INSPECTION_PLAN,
} from './inspection-plan.graphql';
import { InspectionPlan, TimelineType } from './inspection-plan.interface';
import { GET_ALL_USERS_PAGEABLE } from 'app/routes/plants/plants/plant.graphql';
import { SearchOperationType } from '@shared/fetch/fetch.interface';

export function getInspectionPlanFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'inspectionTypeUid',
      label: 'Inspection Type',
      type: FieldType.select,
      optionsVariables: lookupOptions(inspectionTypeLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'inspectorUids',
      label: 'Inspectors',
      type: FieldType.multiple_select,
      optionsVariables: {
        fetchParameter: {
          query: GET_ALL_USERS_PAGEABLE,
          variables: {
            active: true,
            pageableParam: {
              size: 1000,
              searchFields: [
                {
                  fieldName: 'isStaff',
                  fieldValue: 'true',
                  searchType: SearchOperationType.Equals,
                },
              ],
            },
          },
        },
      },
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'category',
      label: 'Timeline / Category',
      type: FieldType.select,
      options: enumToObjectArray(TimelineType),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'station',
      label: 'Station',
      type: FieldType.textarea,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'area',
      label: 'Area',
      type: FieldType.textarea,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'inspectionDate',
      label: 'Inspection Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const inspectionPlanCrud = defineEntityCrud<InspectionPlan>({
  name: 'Inspection Plan',
  routeSlug: 'inspection-plans',
  fields: getInspectionPlanFormFields(),
  modalWidth: '60%',
  mutations: {
    create: CREATE_OR_UPDATE_INSPECTION_PLAN,
    update: CREATE_OR_UPDATE_INSPECTION_PLAN,
    delete: DELETE_INSPECTION_PLAN,
  },
  permissions: {
    manage: ['ROLE_MANAGE_INSPECTION_PLANS'],
    delete: ['ROLE_DELETE_INSPECTION_PLAN'],
    view: ['ROLE_VIEW_INSPECTION_PLAN'],
  },
  modelMapper: (data?: InspectionPlan) => ({
    ...(data ?? {}),
    inspectionTypeUid: (data as any)?.type?.uid,
    inspectorUids: ((data as any)?.inspectors ?? [])
      .map((i: any) => i?.inspector?.uid)
      .filter(Boolean),
  }),
  upsertVariables: (value) => {
    const { inspectionTypeUid, ...rest } = value ?? {};
    const payload: any = { ...rest };
    if (payload.inspectionDate) {
      const dateStr =
        typeof payload.inspectionDate === 'string'
          ? payload.inspectionDate
          : new Date(payload.inspectionDate).toISOString();
      payload.inspectionDate = dateStr.split('T')[0];
    }
    return { inspectionTypeUid, input: payload };
  },
});

export const inspectionPlan$ = inspectionPlanCrud.reload$;

export const inspectionPlanUpsertBtn = (comp: BaseComponent): ActionButton =>
  inspectionPlanCrud.upsertBtn(crudHostFromBase(comp));

export const inspectionPlanDeleteBtn = (comp: BaseComponent): ActionButton =>
  inspectionPlanCrud.deleteBtn(crudHostFromBase(comp));

function buildExecuteBtn(host: CrudHost): ActionButton {
  return {
    icon: 'play_circle',
    label: 'Execute',
    color: 'primary',
    toolTip: 'Execute Inspection Plan',
    permissions: ['ROLE_EXECUTE_INSPECTION_PLAN'],
    showFunction: (row: any) => !!row?.uid && !row?.inspectedAt && !row?.closedAt,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Execute Inspection Plan',
        fields: [
          {
            key: 'observations',
            label: 'Observations',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
          {
            key: 'recommendation',
            label: 'Recommendation',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
          {
            key: 'yourEndorsement',
            label: 'Your Endorsement',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: EXECUTE_INSPECTION_PLAN,
            variables: {
              uid: data.uid,
              observations: value?.observations,
              recommendation: value?.recommendation,
              yourEndorsement: value?.yourEndorsement,
            },
            successFn: () => {
              inspectionPlan$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '60%');
    },
  };
}

function buildCloseBtn(host: CrudHost): ActionButton {
  return {
    icon: 'lock',
    label: 'Close',
    color: 'warn',
    toolTip: 'Close Inspection Plan',
    permissions: ['ROLE_EXECUTE_INSPECTION_PLAN'],
    showFunction: (row: any) => !!row?.inspectedAt && !row?.closedAt,
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Close Inspection Plan',
        fields: [
          {
            key: 'remarks',
            label: 'Closing Remarks',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: CLOSE_INSPECTION_PLAN,
            variables: { planUid: data.uid, remarks: value?.remarks },
            successFn: () => {
              inspectionPlan$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '40%');
    },
  };
}

export const inspectionPlanExecuteBtn = (comp: BaseComponent): ActionButton =>
  buildExecuteBtn(crudHostFromBase(comp));

export const inspectionPlanCloseBtn = (comp: BaseComponent): ActionButton =>
  buildCloseBtn(crudHostFromBase(comp));

export const inspectionPlanTableBtns = (comp: BaseComponent): ActionButton[] =>
  inspectionPlanCrud.tableBtns(crudHostFromBase(comp));
