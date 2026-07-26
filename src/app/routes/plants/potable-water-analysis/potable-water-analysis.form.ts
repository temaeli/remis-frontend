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
  GET_POTABLE_WATER_ANALYSIS_PAGEABLE,
  PROCESS_POTABLE_WATER_ANALYSIS,
  SAVE_POTABLE_WATER_ANALYSIS,
} from './potable-water-analysis.graphql';
import { PotableWaterAnalysis } from './potable-water-analysis.interface';
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

export const potableWaterAnalysis$ = new Subject<PotableWaterAnalysis | any>();

export const getPotableWaterAnalysisFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Potable Water Analysis Items',
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
      { key: 'testedResult', type: FieldType.decimal, validations: [VALIDATOR_REQUIRED] },
    ],
  },
];

export function potableWaterAnalysisUpsertBtn(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton {
  return {
    click: async (data?: PotableWaterAnalysis) => {
      const inputs = await getInputItems(comp, PlantInputType.POTABLE_WATER_ANALYSIS);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Potable Water Analysis',
        fields: getPotableWaterAnalysisFormFields(),
        closeAction$: potableWaterAnalysis$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_POTABLE_WATER_ANALYSIS,
            successFn: (res) => potableWaterAnalysis$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    permissions: ['ROLE_CREATE_POTABLE_WATER_ANALYSIS', 'ROLE_UPDATE_POTABLE_WATER_ANALYSIS'],
    ...getUpsertBtnProps('Potable Water Analysis'),
  };
}

export function potableWaterAnalysisProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_POTABLE_WATER_ANALYSIS,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_POTABLE_WATER_ANALYSIS_AS_PLANT_MANAGER',
  });
}

export function potableWaterAnalysisViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Potable Water Analysis',
    click: (data: PotableWaterAnalysis) =>
      navigateRelativeTo(comp, 'potable-water-analysis', data?.uid),
    permissions: ['ROLE_VIEW_POTABLE_WATER_ANALYSIS'],
  };
}

export function potableWaterAnalysisTableBtns(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [potableWaterAnalysisViewBtn(comp)] }];
}

export function potableWaterAnalysisContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'POTABLE_WATER_ANALYSIS',
    icon: 'potable_water_analysis',
    title: 'Potable Water Analysis',
    slug: 'potable-water-analysis',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: potableWaterAnalysisTableBtns(comp, plantUid),
    headerButtons: [potableWaterAnalysisUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_POTABLE_WATER_ANALYSIS'],
    fetchParameter: {
      query: GET_POTABLE_WATER_ANALYSIS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
