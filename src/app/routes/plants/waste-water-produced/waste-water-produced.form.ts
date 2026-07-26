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
  GET_WASTE_WATER_PRODUCED_PAGEABLE,
  PROCESS_WASTE_WATER_PRODUCED,
  SAVE_WASTE_WATER_PRODUCED,
} from './waste-water-produced.graphql';
import { WasteWaterProduced } from './waste-water-produced.interface';
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

export const wasteWaterProduced$ = new Subject<WasteWaterProduced | any>();

export const getWasteWaterProducedFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Waste Water Produced Items',
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

export function wasteWaterProducedUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: WasteWaterProduced) => {
      const inputs = await getInputItems(comp, PlantInputType.WASTE_WATER_PRODUCED);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Waste Water Produced',
        fields: getWasteWaterProducedFormFields(),
        closeAction$: wasteWaterProduced$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_WASTE_WATER_PRODUCED,
            successFn: (res) => wasteWaterProduced$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    permissions: ['ROLE_CREATE_WASTE_WATER_PRODUCED', 'ROLE_UPDATE_WASTE_WATER_PRODUCED'],
    ...getUpsertBtnProps('Waste Water Produced'),
  };
}

export function wasteWaterProducedProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_WASTE_WATER_PRODUCED,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_WASTE_WATER_PRODUCED_AS_PLANT_MANAGER',
  });
}

export function wasteWaterProducedViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Waste Water Produced',
    click: (data: WasteWaterProduced) =>
      navigateRelativeTo(comp, 'waste-water-produced', data?.uid),
    permissions: ['ROLE_VIEW_WASTE_WATER_PRODUCED'],
  };
}

export function wasteWaterProducedTableBtns(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [wasteWaterProducedViewBtn(comp)] }];
}

export function wasteWaterProducedContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'WASTE_WATER_PRODUCED',
    icon: 'waste_water_produced',
    title: 'Waste Water Produced',
    slug: 'waste-water-produced',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: wasteWaterProducedTableBtns(comp, plantUid),
    headerButtons: [wasteWaterProducedUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_WASTE_WATER_PRODUCED'],
    fetchParameter: {
      query: GET_WASTE_WATER_PRODUCED_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
