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
  GET_CONDENSATE_STORAGE_TANKS_PAGEABLE,
  PROCESS_CONDENSATE_STORAGE_TANK,
  SAVE_CONDENSATE_STORAGE_TANK,
} from './condensate-storage-tank.graphql';
import { CondensateStorageTank } from './condensate-storage-tank.interface';
import { GET_ALL_PLANT_FORM_ITEMS } from '../plant-form-items/plant-form-item.graphql';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { PlantFormItem, UnitOfMeasureMap } from '../plant-form-items/plant-form-item.interface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CommonProcessReportFp,
  getInputItems,
  PlantReportCols,
  proccessPlantReportBtn,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';

export const condensateStorageTank$ = new Subject<CondensateStorageTank | any>();

export const getCondensateStorageTankFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Condensate Storage Tank Items',
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
      {
        key: 'tankA',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
        onChange: (_value, form) => computeCondensateClosingStock(form),
        disabledWhen: [{ key: 'item', checker: (v: string) => /closing/i.test(v) }],
      },
      {
        key: 'tankB',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
        onChange: (_value, form) => computeCondensateClosingStock(form),
        disabledWhen: [{ key: 'item', checker: (v: string) => /closing/i.test(v) }],
      },
    ],
  },
];

export function condensateStorageTankUpsertBtn(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton {
  return {
    click: async (data?: CondensateStorageTank) => {
      const inputs = await getInputItems(comp, PlantInputType.CONDENSATE_STORAGE_TANK);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Condensate Storage Tank',
        fields: getCondensateStorageTankFormFields(),
        closeAction$: condensateStorageTank$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_CONDENSATE_STORAGE_TANK,
            successFn: (res) => condensateStorageTank$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '820px' });
    },
    permissions: ['ROLE_CREATE_CONDENSATE_STORAGE_TANK', 'ROLE_UPDATE_CONDENSATE_STORAGE_TANK'],
    ...getUpsertBtnProps('Condensate Storage Tank'),
  };
}

export function condensateStorageTankProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_CONDENSATE_STORAGE_TANK,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_CONDENSATE_STORAGE_TANK_AS_PLANT_MANAGER',
  });
}

export function condensateStorageTankViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Condensate Storage Tank',
    click: (data: CondensateStorageTank) =>
      navigateRelativeTo(comp, 'condensate-storage-tanks', data?.uid),
    permissions: ['ROLE_VIEW_CONDENSATE_STORAGE_TANK'],
  };
}

export function condensateStorageTankTableBtns(
  comp: BaseComponent,
  plantUid?: string,
): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [condensateStorageTankViewBtn(comp)] }];
}

export function condensateStorageTankContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'CONDENSATE_STORAGE_TANK',
    icon: 'condensate_storage_tanks',
    title: 'Condensate Storage Tank',
    slug: 'condensate-storage-tanks',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: condensateStorageTankTableBtns(comp, plantUid),
    headerButtons: [condensateStorageTankUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_CONDENSATE_STORAGE_TANK'],
    fetchParameter: {
      query: GET_CONDENSATE_STORAGE_TANKS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}

/**
 * Auto-computes "Closing Stock" for a Condensate Storage Tank row group as
 * Opening Stock + Condensate Produced - Condensate Offloaded/Transferred -
 * Drained Water, independently for both tank columns. Rows are matched by
 * item-label keyword rather than index for the same reason as sumIntoTotalRow.
 * No-ops if a "closing" row isn't present in this plant's configured items.
 */
export function computeCondensateClosingStock(form?: any) {
  const rows = form?.parent?.controls;
  if (!rows?.length) return;

  const findByKeyword = (keyword: string) =>
    rows.find((row: any) =>
      String(row?.get('item')?.value ?? '')
        .toLowerCase()
        .includes(keyword),
    );

  const opening = findByKeyword('opening');
  const produced = findByKeyword('produced');
  const offloaded = findByKeyword('offload') ?? findByKeyword('transfer');
  const drained = findByKeyword('drain');
  const closing = findByKeyword('closing');
  if (!closing) return;

  (['tankA', 'tankB'] as const).forEach((col) => {
    const num = (row: any) => Number(row?.get(col)?.value) || 0;
    const value = num(opening) + num(produced) - num(offloaded) - num(drained);
    closing.get(col)?.setValue(value, { emitEvent: false });
  });
}
