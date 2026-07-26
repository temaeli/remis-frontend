import { BehaviorSubject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { GET_ALL_REGIONS } from '@routes/settings/regions/region.graphql';
import { GET_DISTRICTS_BY_REGION } from '@routes/settings/regions/district/district.graphql';
import { GET_WARDS_BY_DISTICT } from '@routes/settings/regions/ward/ward.graphql';
import { GET_SUB_WARD_BY_WARD } from '@routes/settings/regions/subward/subward.graphql';
import { ConstructionProject, ConstructionWeightValidation } from './construction-projects.interface';
import {
  SAVE_CONSTRUCTION_PROJECT,
  DELETE_CONSTRUCTION_PROJECT,
  VALIDATE_CONSTRUCTION_PROJECT_WEIGHTS,
  RECOMPUTE_CONSTRUCTION_PROJECT_PROGRESS,
  ALL_CONTRACTORS,
} from './construction-projects.graphql';

const CONSTRUCTION_PROJECT_STATUS_OPTIONS = [
  'REGISTERED',
  'PLANNING',
  'ONGOING',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
];

export function getConstructionProjectFormFields(data?: ConstructionProject): FieldConfig[] {
  const ward = data?.subWard?.ward;
  const regionUid$ = new BehaviorSubject<string | null>(ward?.district?.region?.uid ?? null);
  const districtUid$ = new BehaviorSubject<string | null>(ward?.district?.uid ?? null);
  const wardUid$ = new BehaviorSubject<string | null>(ward?.uid ?? null);

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'name', label: 'Project Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'contractNumber', label: 'Contract Number', type: FieldType.input, validations: [] },
    { key: 'clientName', label: 'Client', type: FieldType.input, validations: [] },
    { key: 'owner', label: 'Owner', type: FieldType.input, validations: [] },
    { key: 'consultant', label: 'Consultant', type: FieldType.input, validations: [] },
    {
      key: 'contractAmount',
      label: 'Contract Amount',
      type: FieldType.input,
      hint: 'e.g. TZS 1,250,000,000.00',
      validations: [],
    },
    {
      key: 'contractorUid',
      label: 'Contractor',
      type: FieldType.select,
      validations: [],
      optionsVariables: {
        fetchParameter: { query: ALL_CONTRACTORS },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    // {
    //   key: 'regionUid',
    //   label: 'Region',
    //   type: FieldType.select,
    //   ignoreOnSubmit: true,
    //   validations: [],
    //   optionsVariables: {
    //     fetchParameter: { query: GET_ALL_REGIONS },
    //     labelKey: 'name',
    //     valueKey: 'uid',
    //   },
    //   onChange: (value: string, form: any) => {
    //     regionUid$.next(value ?? null);
    //     form?.get('districtUid')?.reset();
    //     form?.get('wardUid')?.reset();
    //     form?.get('subWardUid')?.reset();
    //   },
    // },
    // {
    //   key: 'districtUid',
    //   label: 'District',
    //   type: FieldType.select,
    //   ignoreOnSubmit: true,
    //   validations: [],
    //   showWhen: [{ key: 'regionUid', checker: (v) => !!v }],
    //   optionsVariables: {
    //     fetchParameter: { query: GET_DISTRICTS_BY_REGION, variables: { uid: regionUid$ } },
    //     labelKey: 'name',
    //     valueKey: 'uid',
    //   },
    //   onChange: (value: string, form: any) => {
    //     districtUid$.next(value ?? null);
    //     form?.get('wardUid')?.reset();
    //     form?.get('subWardUid')?.reset();
    //   },
    // },
    // {
    //   key: 'wardUid',
    //   label: 'Ward',
    //   type: FieldType.select,
    //   ignoreOnSubmit: true,
    //   validations: [],
    //   showWhen: [{ key: 'districtUid', checker: (v) => !!v }],
    //   optionsVariables: {
    //     fetchParameter: { query: GET_WARDS_BY_DISTICT, variables: { districtUid: districtUid$ } },
    //     labelKey: 'name',
    //     valueKey: 'uid',
    //   },
    //   onChange: (value: string, form: any) => {
    //     wardUid$.next(value ?? null);
    //     form?.get('subWardUid')?.reset();
    //   },
    // },
    // {
    //   key: 'subWardUid',
    //   label: 'Sub-ward (village)',
    //   type: FieldType.select,
    //   validations: [],
    //   showWhen: [{ key: 'wardUid', checker: (v) => !!v }],
    //   optionsVariables: {
    //     fetchParameter: { query: GET_SUB_WARD_BY_WARD, variables: { uid: wardUid$ } },
    //     labelKey: 'name',
    //     valueKey: 'uid',
    //   },
    // },
    { key: 'physicalAddress', label: 'Location', type: FieldType.input, validations: [] },
    { key: 'startDate', label: 'Start Date', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
    { key: 'endDate', label: 'End Date', type: FieldType.date, validations: [VALIDATOR_REQUIRED] },
    // {
    //   key: 'durationDays',
    //   label: 'Duration (Days)',
    //   type: FieldType.number,
    //   disabled: true,
    //   ignoreOnSubmit: true,
    //   hint: 'Read-only — computed automatically from Start Date and End Date.',
    //   validations: [],
    // },
    // {
    //   key: 'requireActivityDates',
    //   label: 'Require Activity Dates',
    //   hint: 'When on, every activity / sub-activity must carry start + end dates',
    //   type: FieldType.toggle,
    //   validations: [],
    // },
    // {
    //   key: 'status',
    //   label: 'Status',
    //   type: FieldType.select,
    //   options: CONSTRUCTION_PROJECT_STATUS_OPTIONS,
    //   validations: [],
    // },
    {
      key: 'description',
      label: 'Project Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

const constructionProjectCrud = defineEntityCrud<ConstructionProject>({
  name: 'Construction Project',
  routeSlug: 'construction-projects',
  fields: (data?: ConstructionProject) => getConstructionProjectFormFields(data),
  modalWidth: '70%',
  mutations: {
    create: SAVE_CONSTRUCTION_PROJECT,
    update: SAVE_CONSTRUCTION_PROJECT,
    delete: DELETE_CONSTRUCTION_PROJECT,
  },
  modelMapper: (data?: ConstructionProject) =>
    data
      ? {
          ...data,
          contractorUid: data.contractor?.uid,
          subWardUid: data.subWard?.uid,
          wardUid: data.subWard?.ward?.uid,
          districtUid: data.subWard?.ward?.district?.uid,
          regionUid: data.subWard?.ward?.district?.region?.uid,
        }
      : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_PROJECT', 'ROLE_UPDATE_CONSTRUCTION_PROJECT'],
    delete: ['ROLE_DELETE_CONSTRUCTION_PROJECT'],
    view: ['ROLE_VIEW_ALL_CONSTRUCTION_PROJECT', 'ROLE_VIEW_CONSTRUCTION_PROJECT'],
  },
});

export const constructionProject$ = constructionProjectCrud.reload$;

export const constructionProjectUpsertBtn = (comp: BaseComponent): ActionButton =>
  constructionProjectCrud.upsertBtn(crudHostFromBase(comp));

export const constructionProjectDeleteBtn = (comp: BaseComponent): ActionButton =>
  constructionProjectCrud.deleteBtn(crudHostFromBase(comp));

export const constructionProjectViewBtn = (comp: BaseComponent): ActionButton | undefined =>
  constructionProjectCrud.viewBtn(crudHostFromBase(comp));

export function constructionProjectValidateWeightsBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'rule',
    label: 'Validate WBS Weights',
    click: async (data?: ConstructionProject) => {
      const result: ConstructionWeightValidation = await comp.fs.fetch({
        query: VALIDATE_CONSTRUCTION_PROJECT_WEIGHTS,
        variables: { projectUid: data?.uid },
      });
      if (!result) return;
      if (result.valid) {
        comp.notify.success('WBS weights are valid — categories and activities sum correctly.');
        return;
      }
      const detail = (result.messages ?? []).join(' | ') || 'Weights do not balance yet.';
      comp.notify.warn(detail);
    },
    permissions: ['ROLE_VIEW_ALL_CONSTRUCTION_PROJECT', 'ROLE_VIEW_CONSTRUCTION_PROJECT'],
  };
}

export function constructionProjectRecomputeBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'refresh',
    label: 'Recompute Progress',
    confirmDataMapper: () => ({
      title: 'Recompute Progress',
      message: 'Recompute the weighted progress roll-up for this project from its current WBS?',
      confirmText: 'Recompute',
      confirmButtonColor: 'primary',
    }),
    click: async (data?: ConstructionProject) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: RECOMPUTE_CONSTRUCTION_PROJECT_PROGRESS,
        variables: { projectUid: data?.uid },
      });
      if (result) constructionProject$.next(result);
    },
    permissions: ['ROLE_UPDATE_CONSTRUCTION_ACTIVITY', 'ROLE_VIEW_ALL_CONSTRUCTION_PROJECT'],
  };
}

export function constructionProjectTableBtns(comp: BaseComponent): ActionButton[] {
  return constructionProjectCrud.tableBtns(crudHostFromBase(comp), [
    constructionProjectValidateWeightsBtn(comp),
    constructionProjectRecomputeBtn(comp),
  ]);
}
