import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import {
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  GET_WATER_TANK_LEVELS_PAGEABLE,
  PROCESS_WATER_TANK_LEVEL,
  SAVE_WATER_TANK_LEVEL,
} from './water-tank-level.graphql';
import { WaterTankLevel } from './water-tank-level.interface';
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

export const waterTankLevel$ = new Subject<WaterTankLevel | any>();

export const getWaterTankLevelFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Water Tank Level Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'xl:grid-cols-[3fr_1fr] lg:grid-cols-[3fr_1fr] gap-4 w-full',
    fields: [
      { key: 'uid', type: FieldType.input, visible: false },
      { key: 'itemUid', type: FieldType.input, visible: false, validations: [VALIDATOR_REQUIRED] },
      {
        key: 'item',
        type: FieldType.label,
        valueAsLabel: true,
        innerClass: 'bg-gray-400/10 rounded-lg p-3',
        validations: [VALIDATOR_REQUIRED],
        ignoreOnSubmit: true,
        disabled: true,
      },
      { key: 'measure', type: FieldType.decimal, validations: [VALIDATOR_REQUIRED] },
    ],
  },
];

export function waterTankLevelUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: WaterTankLevel) => {
      const inputs = await getInputItems(comp, PlantInputType.WATER_TANK_LEVEL);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Water Tank Level',
        fields: getWaterTankLevelFormFields(),
        closeAction$: waterTankLevel$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_WATER_TANK_LEVEL,
            successFn: (res) => waterTankLevel$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    permissions: ['ROLE_CREATE_WATER_TANK_LEVEL', 'ROLE_UPDATE_WATER_TANK_LEVEL'],
    ...getUpsertBtnProps('Water Tank Level'),
  };
}

export function waterTankLevelProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_WATER_TANK_LEVEL,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_WATER_TANK_LEVEL_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_WATER_TANK_LEVEL_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_WATER_TANK_LEVEL_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_WATER_TANK_LEVEL_AS_PLANT_MANAGER',
  });
}

export function waterTankLevelViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Water Tank Level',
    click: (data: WaterTankLevel) => navigateRelativeTo(comp, 'water-tank-levels', data?.uid),
    permissions: ['ROLE_VIEW_WATER_TANK_LEVEL'],
  };
}

export function waterTankLevelTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [waterTankLevelViewBtn(comp)] }];
}

export function waterTankLevelContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'WATER_TANK_LEVEL',
    icon: 'water_tank_levels',
    title: 'Water Tank Level',
    slug: 'water-tank-levels',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: waterTankLevelTableBtns(comp, plantUid),
    headerButtons: [waterTankLevelUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_WATER_TANK_LEVEL'],
    fetchParameter: {
      query: GET_WATER_TANK_LEVELS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
