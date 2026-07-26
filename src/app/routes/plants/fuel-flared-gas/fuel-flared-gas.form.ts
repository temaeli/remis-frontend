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
  GET_FUEL_FLARED_GASES_PAGEABLE,
  PROCESS_FUEL_FLARED_GAS,
  SAVE_FUEL_FLARED_GAS,
} from './fuel-flared-gas.graphql';
import { FuelFlaredGas } from './fuel-flared-gas.interface';
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

export const fuelFlaredGas$ = new Subject<FuelFlaredGas | any>();

export const fuelFlaredGas_Order_Last = [
  'Total flared gas',
  'Total fuel & flared gas',
  'Percentage of daily flared gas',
];

export const getFuelFlaredGasFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Fuel and Flared Gas Items',
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
        onChange: (_value, form) => computeFuelFlaredGasTotals(form),
        disabledWhen: [
          { key: 'item', checker: (v: string) => /total/i.test(v) && /flared/i.test(v) },
        ],
      },
    ],
  },
];

export function fuelFlaredGasUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: FuelFlaredGas) => {
      const inputs = await getInputItems(comp, PlantInputType.FUEL_AND_FLARED_GAS);
      if (!inputs.length) return;

      const orderedInputs = sortByOrderLast(inputs, fuelFlaredGas_Order_Last, (i) => i.item);

      const formParameter: FormParameters = {
        model: { ...data, inputs: orderedInputs, plantUid },
        title: 'Fuel and Flared Gas',
        fields: getFuelFlaredGasFormFields(),
        closeAction$: fuelFlaredGas$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_FUEL_FLARED_GAS,
            successFn: (res) => fuelFlaredGas$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    permissions: ['ROLE_CREATE_FUEL_AND_FLARED_GAS', 'ROLE_UPDATE_FUEL_AND_FLARED_GAS'],
    ...getUpsertBtnProps('Fuel and Flared Gas'),
  };
}

export function fuelFlaredGasProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_FUEL_FLARED_GAS,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_FUEL_AND_FLARED_GAS_AS_PLANT_MANAGER',
  });
}

export function fuelFlaredGasViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Fuel and Flared Gas',
    click: (data: FuelFlaredGas) => navigateRelativeTo(comp, 'fuel-flared-gases', data?.uid),
    permissions: ['ROLE_VIEW_FUEL_AND_FLARED_GAS'],
  };
}

export function fuelFlaredGasTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [fuelFlaredGasViewBtn(comp)] }];
}

/**
 * Auto-computes the two derived Fuel & Flared Gas rows from the manually-entered
 * ones - Total flared gas = Low + High flare meter reading, and Total fuel &
 * flared gas = Total fuel gas meter reading + Total flared gas. Rows are matched
 * by item-label keyword (not index) since the row set comes from backend-configured
 * PlantFormItems. "Percentage of daily flared gas", "Meg reboiler" and "Pilot gas"
 * match none of the finders below and stay manually entered.
 */
export function computeFuelFlaredGasTotals(form?: any) {
  const rows = form?.parent?.controls;
  if (!rows?.length) return;

  const label = (row: any) => String(row?.get('item')?.value ?? '').toLowerCase();
  const find = (pred: (l: string) => boolean) => rows.find((r: any) => pred(label(r)));
  const num = (row: any) => Number(row?.get('measure')?.value) || 0;

  const fuelMeter = find((l) => l.includes('meter') && l.includes('fuel'));
  const low = find((l) => l.includes('low'));
  const high = find((l) => l.includes('high'));
  const totalFlared = find(
    (l) => l.includes('total') && l.includes('flared') && !l.includes('fuel'),
  );
  const totalFuelFlared = find(
    (l) => l.includes('total') && l.includes('flared') && l.includes('fuel'),
  );

  if (totalFlared) totalFlared.get('measure')?.setValue(num(low) + num(high), { emitEvent: false });
  if (totalFuelFlared) {
    totalFuelFlared
      .get('measure')
      ?.setValue(num(fuelMeter) + num(totalFlared), { emitEvent: false });
  }
}

export function fuelFlaredGasContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'FUEL_AND_FLARED_GAS',
    icon: 'fuel_flared_gas',
    title: 'Fuel and Flared Gas',
    slug: 'fuel-flared-gases',

    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: fuelFlaredGasTableBtns(comp, plantUid),
    headerButtons: [fuelFlaredGasUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_FUEL_AND_FLARED_GAS'],

    fetchParameter: {
      query: GET_FUEL_FLARED_GASES_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
