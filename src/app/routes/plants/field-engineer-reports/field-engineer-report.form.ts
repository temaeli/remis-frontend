import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  GET_FIELD_REPORTS_PAGEABLE,
  PROCESS_FIELD_ENGINEER_REPORT,
  SAVE_FIELD_ENGINEER_REPORT,
} from './field-engineer-report.graphql';
import { FieldEngineerReport } from './field-engineer-report.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CommonProcessReportFp,
  getInputItems,
  PlantReportCols,
  proccessPlantReportBtn,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';

//Listener for all FieldEngineerReport actions
export const fieldEngineerReport$ = new Subject<FieldEngineerReport | any>();

export const getFieldEngineerReportFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  // {
  //   key: 'plantUid',
  //   type: FieldType.select,
  //   optionsVariables: { fetchParameter: { query: ALL_PLANT } },
  //   class: 'col-span-full',
  //   validations: [VALIDATOR_REQUIRED],
  // },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Field Engineer Report Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-2 xl:grid-cols-2 gap-4 w-full',
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
        innerClass: 'bg-gray-400/10 rounded-lg  p-3',
        validations: [VALIDATOR_REQUIRED],
        ignoreOnSubmit: true,
        disabled: true,
      },
      {
        key: 'runHours',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
    ],
  },
];

export function fieldEngineerReportUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: FieldEngineerReport) => {
      const inputs = await getInputItems(comp, PlantInputType.FUEL_AND_FLARED_GAS);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Field Engineer Report',
        fields: getFieldEngineerReportFormFields(comp),
        closeAction$: fieldEngineerReport$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_FIELD_ENGINEER_REPORT,
            successFn: (res) => fieldEngineerReport$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '620px' });
    },
    permissions: ['ROLE_CREATE_FE_REPORT', 'ROLE_UPDATE_FE_REPORT'],
    ...getUpsertBtnProps('FE Report'),
  };
}

export function fieldEngineerReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_FIELD_ENGINEER_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_FIELD_ENGINEER_REPORT_AS_PLANT_MANAGER',
  });
}

export function fieldEngineerReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View FE Report',
    click: (data: FieldEngineerReport) =>
      navigateRelativeTo(comp, 'field-engineer-reports', data?.uid),
    permissions: ['ROLE_VIEW_FE_REPORT'],
  };
}

// export function fieldEngineerReportDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: FieldEngineerReport) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: ACTIVATE_OR_DEACTIVATE_FIELD_ENGINEER_REPORT,
//         finalFn: (res) => fieldEngineerReport$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Field Engineer Report', 'name'),
//     permissions: ['ROLE_DELETE_FIELD_ENGINEER_REPORT'],
//   };
// }

export function fieldEngineerReportTableBtns(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        fieldEngineerReportViewBtn(comp),
        // fieldEngineerReportUpsertBtn(comp, plantUid),
        // fieldEngineerReportDeleteBtn(comp),
      ],
    },
  ];
}

export function fieldEngineerReportsContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'FE',
    icon: 'construction',
    title: 'Field Engineer Reports',
    slug: 'field-reports',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    headerButtons: [fieldEngineerReportUpsertBtn(comp, plantUid)],
    actionButtons: fieldEngineerReportTableBtns(comp, plantUid),
    permissions: ['ROLE_VIEW_ALL_FE_REPORT'],

    fetchParameter: {
      query: GET_FIELD_REPORTS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
