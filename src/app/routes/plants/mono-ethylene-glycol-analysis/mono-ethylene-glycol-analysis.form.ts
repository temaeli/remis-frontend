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
  GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
  PROCESS_MONO_ETHYLENE_GLYCOL_ANALYSIS,
  SAVE_MONO_ETHYLENE_GLYCOL_ANALYSIS,
} from './mono-ethylene-glycol-analysis.graphql';
import { MonoEthyleneGlycolAnalysis } from './mono-ethylene-glycol-analysis.interface';
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

export const monoEthyleneGlycolAnalysis$ = new Subject<MonoEthyleneGlycolAnalysis | any>();

export const getMonoEthyleneGlycolAnalysisFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Mono Ethylene Glycol Analysis Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-3 xl:grid-cols-3 gap-4 w-full',
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
      { key: 'concentration', type: FieldType.decimal, validations: [VALIDATOR_REQUIRED] },
      { key: 'ph', type: FieldType.decimal, validations: [VALIDATOR_REQUIRED] },
    ],
  },
];

export function monoEthyleneGlycolAnalysisUpsertBtn(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton {
  return {
    click: async (data?: MonoEthyleneGlycolAnalysis) => {
      const inputs = await getInputItems(comp, PlantInputType.MEGA);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Mono Ethylene Glycol Analysis',
        fields: getMonoEthyleneGlycolAnalysisFormFields(),
        closeAction$: monoEthyleneGlycolAnalysis$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_MONO_ETHYLENE_GLYCOL_ANALYSIS,
            successFn: (res) => monoEthyleneGlycolAnalysis$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '820px' });
    },
    permissions: ['ROLE_CREATE_MONO_ETHYLENE_ANALYSIS', 'ROLE_UPDATE_MONO_ETHYLENE_ANALYSIS'],
    ...getUpsertBtnProps('Mono Ethylene Glycol Analysis'),
  };
}

export function monoEthyleneGlycolAnalysisProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_MONO_ETHYLENE_GLYCOL_ANALYSIS,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_MONO_ETHYLENE_ANALYSIS_AS_PLANT_MANAGER',
  });
}

export function monoEthyleneGlycolAnalysisViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Mono Ethylene Glycol Analysis',
    click: (data: MonoEthyleneGlycolAnalysis) =>
      navigateRelativeTo(comp, 'mono-ethylene-glycol-analysis', data?.uid),
    permissions: ['ROLE_VIEW_MONO_ETHYLENE_ANALYSIS'],
  };
}

export function monoEthyleneGlycolAnalysisTableBtns(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [monoEthyleneGlycolAnalysisViewBtn(comp)] }];
}

export function monoEthyleneGlycolAnalysisContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'MONO_ETHYLENE_ANALYSIS',
    icon: 'mono_ethylene_glycol_analysis',
    title: 'Mono Ethylene Glycol Analysis',
    slug: 'mono-ethylene-glycol-analysis',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: monoEthyleneGlycolAnalysisTableBtns(comp, plantUid),
    headerButtons: [monoEthyleneGlycolAnalysisUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_MONO_ETHYLENE_ANALYSIS'],
    fetchParameter: {
      query: GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
