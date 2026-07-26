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
  GET_WATER_TECHNICIAN_REPORTS_PAGEABLE,
  PROCESS_WATER_TECHNICIAN_REPORT,
  SAVE_WATER_TECHNICIAN_REPORT,
} from './water-technician-report.graphql';
import { WaterTechnicianReport } from './water-technician-report.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CommonProcessReportFp,
  getInputItems,
  PlantReportCols,
  proccessPlantReportBtn,
} from '../common-plant-reports/comon-plant-report';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { StageEnum } from '../hse-reports/hse-report.interface';

//Listener for all WaterTechnicianReport actions
export const waterTechnicianReport$ = new Subject<WaterTechnicianReport | any>();

export const getWaterTechnicianReportFormFields = (comp: BaseComponent): FieldConfig[] => [
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
    label: 'Water Technician Report Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-2 xl:grid-cols-2 gap-4 w-full',
    fields: [
      // { key: 'uid', type: FieldType.input, visible: false },
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
        key: 'today',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
      },
    ],
  },
];

export function waterTechnicianReportUpsertBtn(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton {
  return {
    click: async (data?: WaterTechnicianReport) => {
      const inputs = await getInputItems(comp, PlantInputType.WATER_TANK_LEVEL);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Water Technician Report',
        fields: getWaterTechnicianReportFormFields(comp),
        closeAction$: waterTechnicianReport$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_WATER_TECHNICIAN_REPORT,
            successFn: (res) => waterTechnicianReport$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '680px' });
    },
    permissions: ['ROLE_CREATE_WATER_TECHNICIAN_REPORT', 'ROLE_UPDATE_WATER_TECHNICIAN_REPORT'],
    ...getUpsertBtnProps('Water Technician Report'),
  };
}

export function waterTechnicianReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_WATER_TECHNICIAN_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_WATER_TECHNICIAN_REPORT_AS_PLANT_MANAGER',
  });
}

export function waterTechnicianReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Water Technician Report',
    click: (data: WaterTechnicianReport) =>
      navigateRelativeTo(comp, 'water-technician-reports', data?.uid),
    permissions: ['ROLE_VIEW_WATER_TECHNICIAN_REPORT'],
  };
}

// export function waterTechnicianReportDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: WaterTechnicianReport) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: ACTIVATE_OR_DEACTIVATE_WATER_TECHNICIAN_REPORT,
//         finalFn: (res) => waterTechnicianReport$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('WaterTechnician Report', 'name'),
//     permissions: ['ROLE_DELETE_WATER_TECHNICIAN_REPORT'],
//   };
// }

export function waterTechnicianReportTableBtns(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        waterTechnicianReportViewBtn(comp),
        // waterTechnicianReportUpsertBtn(comp, plantUid),
        // waterTechnicianReportDeleteBtn(comp),
      ],
    },
  ];
}

export function waterTechnicianReportsContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'WATER_TECHNICIAN',
    icon: 'shield_star',
    title: 'WaterTechnician Reports',
    slug: 'water-technician-reports',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: waterTechnicianReportTableBtns(comp, plantUid),
    headerButtons: [waterTechnicianReportUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_WATER_TECHNICIAN_REPORT'],

    fetchParameter: {
      query: GET_WATER_TECHNICIAN_REPORTS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
