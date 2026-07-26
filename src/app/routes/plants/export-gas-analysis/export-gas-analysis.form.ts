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
  GET_EXPORT_GAS_ANALYSIS_PAGEABLE,
  PROCESS_EXPORT_GAS_ANALYSIS,
  SAVE_EXPORT_GAS_ANALYSIS,
} from './export-gas-analysis.graphql';
import { ExportGasAnalysis } from './export-gas-analysis.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CommonProcessReportFp,
  getInputItems,
  PlantReportCols,
  proccessPlantReportBtn,
  sortByOrderLast,
  totalRowClass,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';

export const exportGasAnalysis$ = new Subject<ExportGasAnalysis | any>();

export const exportGasAnalysis_Order_Last = ['Total', 'Density', 'LHV', 'HHV'];

// Gas Composition Mole% total should read ~100%; outside this margin the user is asked
// to confirm before saving (see onSubmit below) rather than being blocked outright.
const GAS_COMPOSITION_TOTAL_MIN = 95;
const GAS_COMPOSITION_TOTAL_MAX = 105;

export const getExportGasAnalysisFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Export Gas Analysis Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'xl:grid-cols-[3fr_1fr] lg:grid-cols-[3fr_1fr] gap-4 w-full',
    rowClassFn: totalRowClass,
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
      {
        key: 'measure',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
        decimals: 5,
        onChange: (_value, form) => sumIntoTotalRow(form),
        disabledWhen: [{ key: 'item', checker: (v: string) => /total/i.test(v) }],
      },
    ],
  },
];

export function exportGasAnalysisUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: ExportGasAnalysis) => {
      const inputs = await getInputItems(comp, PlantInputType.EXPORT_GAS_ANALYSIS);
      if (!inputs.length) return;

      const orderedInputs = sortByOrderLast(inputs, exportGasAnalysis_Order_Last, (i) => i.item);
      // 'item' (the row's label) is stripped from the submitted value (ignoreOnSubmit),
      // so the Total row has to be identified by itemUid ahead of time to read its
      // final computed measure back out of the submitted payload.
      const totalItemUid = orderedInputs.find((i) => i.item?.toLowerCase().includes('total'))
        ?.itemUid;

      const formParameter: FormParameters = {
        model: { ...data, inputs: orderedInputs, plantUid },
        title: 'Export Gas Analysis',
        fields: getExportGasAnalysisFormFields(),
        closeAction$: exportGasAnalysis$,
        onSubmit: async (value: any) => {
          const total = value.inputs?.find((i: any) => i.itemUid === totalItemUid)?.measure;

          if (
            typeof total === 'number' &&
            (total < GAS_COMPOSITION_TOTAL_MIN || total > GAS_COMPOSITION_TOTAL_MAX)
          ) {
            const c = await comp.notify.confirm_(
              'Gas Composition Out of Range',
              `Total is ${total.toFixed(2)}% - expected between ${GAS_COMPOSITION_TOTAL_MIN}% and ${GAS_COMPOSITION_TOTAL_MAX}%. Save anyway?`,
            );
            if (!c.isConfirmed) return;
          }

          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_EXPORT_GAS_ANALYSIS,
            successFn: (res) => exportGasAnalysis$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    permissions: ['ROLE_CREATE_EXPORT_GAS_ANALYSIS', 'ROLE_UPDATE_EXPORT_GAS_ANALYSIS'],
    ...getUpsertBtnProps('Export Gas Analysis'),
  };
}

export function exportGasAnalysisProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_EXPORT_GAS_ANALYSIS,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_EXPORT_GAS_ANALYSIS_AS_PLANT_MANAGER',
  });
}

export function exportGasAnalysisViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Export Gas Analysis',
    click: (data: ExportGasAnalysis) => navigateRelativeTo(comp, 'export-gas-analysis', data?.uid),
    permissions: ['ROLE_VIEW_EXPORT_GAS_ANALYSIS'],
  };
}

export function exportGasAnalysisTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [exportGasAnalysisViewBtn(comp)] }];
}

export function exportGasAnalysisContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'EXPORT_GAS_ANALYSIS',
    icon: 'export_gas_analysis',
    title: 'Export Gas Analysis',
    slug: 'export-gas-analysis',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: exportGasAnalysisTableBtns(comp, plantUid),
    headerButtons: [exportGasAnalysisUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_EXPORT_GAS_ANALYSIS'],
    fetchParameter: {
      query: GET_EXPORT_GAS_ANALYSIS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}

/** Sums the Mole% composition rows into the "Total" row. */
export function sumIntoTotalRow(form?: any) {
  let valueKey = 'measure';
  let totalMatch = 'total';

  const rows = form?.parent?.controls;
  if (!rows?.length) return;

  let totalControl: any;
  let sum = 0;

  rows.forEach((row: any) => {
    const label = String(row?.get('item')?.value ?? '').toLowerCase();
    if (label.includes(totalMatch)) {
      totalControl = row.get(valueKey);
      return;
    }

    if (!label.includes('mole')) return;

    const value = Number(row?.get(valueKey)?.value);
    if (!isNaN(value)) sum += value;
  });

  totalControl?.setValue(sum, { emitEvent: false });
}
