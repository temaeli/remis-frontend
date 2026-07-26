import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  GET_LAB_REPORTS_PAGEABLE,
  PROCESS_LAB_REPORT,
  SAVE_LAB_REPORT,
} from './lab-report.graphql';
import { LabReport, UnitOfMeasure } from './lab-report.interface';
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

//Listener for all LabReport actions
export const labReport$ = new Subject<LabReport | any>();

export const getLabReportFormFields = (comp: BaseComponent): FieldConfig[] => [
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
    label: 'Lab Report Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-3 xl:grid-cols-3 gap-4',
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
        innerClass: 'bg-gray-400/10 rounded-lg p-3',
        validations: [VALIDATOR_REQUIRED],
        ignoreOnSubmit: true,
        disabled: true,
      },
      {
        key: 'measuredValue',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'uoM',
        label: 'Unit of Measure',
        type: FieldType.select,
        options: Object.values(UnitOfMeasure),
      },
    ],
  },
];

export function labReportUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: LabReport) => {
      const inputs = await getInputItems(comp, PlantInputType.MEGA);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Lab Report',
        fields: getLabReportFormFields(comp),
        closeAction$: labReport$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_LAB_REPORT,
            successFn: (res) => labReport$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    permissions: ['ROLE_CREATE_LAB_REPORT', 'ROLE_UPDATE_LAB_REPORT'],
    ...getUpsertBtnProps('Lab Report'),
  };
}

export function labReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_LAB_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_LAB_REPORT_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_LAB_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_LAB_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_LAB_REPORT_AS_PLANT_MANAGER',
  });
}

export function labReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Lab Report',
    click: (data: LabReport) => navigateRelativeTo(comp, 'lab-reports', data?.uid),
    permissions: ['ROLE_VIEW_LAB_REPORT'],
  };
}

// export function labReportDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: LabReport) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: ACTIVATE_OR_DEACTIVATE_LAB_REPORT,
//         finalFn: (res) => labReport$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Lab Report', 'name'),
//     permissions: ['ROLE_DELETE_LAB_REPORT'],
//   };
// }

export function labReportTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        labReportViewBtn(comp),
        // labReportUpsertBtn(comp, plantUid),
        // labReportDeleteBtn(comp),
      ],
    },
  ];
}

export function labReportsContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'LAB',
    icon: 'flask',
    title: 'Lab Reports',
    slug: 'lab-reports',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: labReportTableBtns(comp, plantUid),
    headerButtons: [labReportUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_LAB_REPORT'],

    fetchParameter: {
      query: GET_LAB_REPORTS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
