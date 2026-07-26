import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

import {
  ALL_PLANT_EXPORT_READING_PAGEABLE,
  SAVE_PLANT_EXPORT_READING,
} from './plant-export-reading.graphql';
import { PlantExportReading } from './plant-export-reading.interface';
import { ALL_PLANT } from '../plants/plant.graphql';
import { maintenanceReportUpsertBtn } from '../maintenance-reports/maintenance-report.form';
import { ContentParameter } from '@shared/components/view-component/view-interface';

//Listener for all PlantExportReading actions
export const plantExportReading$ = new Subject<PlantExportReading | any>();

// Utilization Capacity = Produced gas * 0.00003531467 / Available Capacity
const UTILIZATION_CAPACITY_FACTOR = 0.00003531467;

function recomputeUtilizedCapacity(form?: any) {
  const producedGas = Number(form?.get('producedGas')?.value);
  const availableCapacity = Number(form?.get('availableCapacity')?.value);
  if (!producedGas || !availableCapacity) return;

  const utilizedCapacity = (producedGas * UTILIZATION_CAPACITY_FACTOR) / availableCapacity;
  form?.get('utilizedCapacity')?.setValue(utilizedCapacity);
}

// Pipeline Export Flow Rate = Exported Gas / 24
function recomputePipelineExportFlowRate(form?: any) {
  const exportedGas = Number(form?.get('exportedGas')?.value);
  if (!exportedGas) return;

  const pipelineExportFlowRate = exportedGas / 24;
  form?.get('pipelineExportFlowRate')?.setValue(pipelineExportFlowRate);
}

export const getPlantExportReadingFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  // {
  //   key: 'plantUid',
  //   type: FieldType.select,
  //   optionsVariables: { fetchParameter: { query: ALL_PLANT } },
  //   class: 'col-span-full',
  //   validations: [VALIDATOR_REQUIRED],
  // },
  {
    key: 'producedGas',
    type: FieldType.decimal,
    validations: [],
    onChange: (_value, form) => recomputeUtilizedCapacity(form),
  },
  {
    key: 'ownUseGas',
    type: FieldType.decimal,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'flaredGas',
    type: FieldType.decimal,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'availableCapacity',
    type: FieldType.decimal,
    validations: [VALIDATOR_REQUIRED],
    onChange: (_value, form) => recomputeUtilizedCapacity(form),
  },
  {
    key: 'utilizedCapacity',
    label: 'Utilization Capacity (auto-calculated)',
    type: FieldType.decimal,
    validations: [],
  },
  {
    key: 'exportedGas',
    type: FieldType.decimal,
    validations: [],
    onChange: (_value, form) => recomputePipelineExportFlowRate(form),
  },
  {
    key: 'pipelineExportFlowRate',
    label: 'Pipeline Export Flow Rate (auto-calculated)',
    type: FieldType.decimal,
    validations: [],
  },
  {
    key: 'pipelineExportPressure',
    type: FieldType.decimal,
    validations: [],
  },
  {
    key: 'pipelineExportTemperature',
    type: FieldType.decimal,
    validations: [],
  },
];

export function plantExportReadingUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: PlantExportReading) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Plant Export Reading',
        fields: getPlantExportReadingFormFields(comp),
        closeAction$: plantExportReading$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: SAVE_PLANT_EXPORT_READING,
            successFn: (res) => plantExportReading$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '680px' });
    },
    permissions: ['ROLE_CREATE_PLANT_EXPORT_READING ', 'ROLE_UPDATE_PLANT_EXPORT_READING'],
    ...getUpsertBtnProps('Plant Export Reading'),
  };
}

export function plantExportReadingViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Plant Export Reading',
    click: (data: PlantExportReading) =>
      navigateRelativeTo(comp, 'plant-export-readings', data?.uid),
    permissions: ['ROLE_VIEW_PLANT_EXPORT_READING'],
  };
}

// export function plantExportReadingDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: PlantExportReading) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         finalFn: (res) => plantExportReading$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Plant Export Reading', 'name'),
//     permissions: ['ROLE_DELETE_PLANT_EXPORT_READING'],
//   };
// }

export function plantExportReadingTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        plantExportReadingViewBtn(comp),
        plantExportReadingUpsertBtn(comp),
        // plantExportReadingDeleteBtn(comp),
      ],
    },
  ];
}

export function plantExportReadingsContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'Export Readings',
    title: 'Export Readings',
    slug: 'export-readings',
    icon: 'export',
    actionButtons: plantExportReadingTableBtns(comp),
    headerButtons: [plantExportReadingUpsertBtn(comp)],
    permissions: ['ROLE_VIEW_ALL_PLANT_EXPORT_READING'],

    keyColumns: [
      'index',
      'exportedGas',

      'pipelineExportFlowRate',
      'pipelineExportPressure',
      'pipelineExportTemperature',
      'actions',
    ],

    fetchParameter: {
      query: ALL_PLANT_EXPORT_READING_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
