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
  GET_POTABLE_WATER_PRODUCTIONS_PAGEABLE,
  PROCESS_POTABLE_WATER_PRODUCTION,
  SAVE_POTABLE_WATER_PRODUCTION,
} from './potable-water-production.graphql';
import { PotableWaterProduction } from './potable-water-production.interface';
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

export const potableWaterProduction$ = new Subject<PotableWaterProduction | any>();

export const getPotableWaterProductionFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Potable Water Production Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-2 xl:grid-cols-2 gap-4 w-full',
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
      { key: 'today', type: FieldType.decimal, validations: [VALIDATOR_REQUIRED] },
    ],
  },
];

export function potableWaterProductionUpsertBtn(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton {
  return {
    click: async (data?: PotableWaterProduction) => {
      const inputs = await getInputItems(comp, PlantInputType.POTABLE_WATER_PRODUCTION);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Potable Water Production',
        fields: getPotableWaterProductionFormFields(),
        closeAction$: potableWaterProduction$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_POTABLE_WATER_PRODUCTION,
            successFn: (res) => potableWaterProduction$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    permissions: ['ROLE_CREATE_POTABLE_WATER_PRODUCTION', 'ROLE_UPDATE_POTABLE_WATER_PRODUCTION'],
    ...getUpsertBtnProps('Potable Water Production'),
  };
}

export function potableWaterProductionProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_POTABLE_WATER_PRODUCTION,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_POTABLE_WATER_PRODUCTION_AS_PLANT_MANAGER',
  });
}

export function potableWaterProductionViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Potable Water Production',
    click: (data: PotableWaterProduction) =>
      navigateRelativeTo(comp, 'potable-water-production', data?.uid),
    permissions: ['ROLE_VIEW_POTABLE_WATER_PRODUCTION'],
  };
}

export function potableWaterProductionTableBtns(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [potableWaterProductionViewBtn(comp)] }];
}

export function potableWaterProductionContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'POTABLE_WATER_PRODUCTION',
    icon: 'potable_water_production',
    title: 'Potable Water Production',
    slug: 'potable-water-production',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: potableWaterProductionTableBtns(comp, plantUid),
    headerButtons: [potableWaterProductionUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_POTABLE_WATER_PRODUCTION'],
    fetchParameter: {
      query: GET_POTABLE_WATER_PRODUCTIONS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
