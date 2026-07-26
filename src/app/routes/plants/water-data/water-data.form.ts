import { Subject } from 'rxjs';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { CREATE_UPDATE_WATER_DATA } from './water-data.graphql';
import { WaterData, WaterDataType, WaterDataTypeLabels } from './water-data.interface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';

export const waterData$ = new Subject<WaterData | any>();

export const WaterDataCols: GridKeyColumn[] = [
  'sno as S/No',
  'plant.name as Plant',
  'firstTrain as Train 1',
  'secondTrain as Train 2',
  'thirdTrain as Train 3',
  'createdBy.fullName as User',
  'createdAt type(date)',
  'actions',
];

export const getWaterDataFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'firstTrain',
    type: FieldType.decimal,
    label: 'Train 1',
    class: 'col-span-full',
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'secondTrain',
    type: FieldType.decimal,
    label: 'Train 2',
    class: 'col-span-full',
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'thirdTrain',
    type: FieldType.decimal,
    label: 'Train 3',
    class: 'col-span-full',
    validations: [VALIDATOR_REQUIRED],
  },
];

/**
 * createUpdateWaterData(uid, inputs, plantUid) - uid/plantUid are separate
 * top-level mutation args, not part of WaterDataDtoInput (see schema).
 */
export function waterDataUpsertBtn(
  comp: BaseComponent,
  waterDataType: WaterDataType,
  plantUid?: string,
): ActionButton {
  const typeLabel = WaterDataTypeLabels[waterDataType];

  return {
    click: (data?: WaterData) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: `${typeLabel} Water Data`,
        fields: getWaterDataFormFields(),
        closeAction$: waterData$,

        onSubmit: async (value: any) => {
          const { uid, ...inputs } = value;

          await comp.fs.fetch({
            notify: true,
            variables: { uid, plantUid, inputs: { ...inputs, type: waterDataType } },
            mutation: CREATE_UPDATE_WATER_DATA,
            successFn: (res) => waterData$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [
      'ROLE_CREATE_HYDROCARBON_AND_WATER_CONTENT',
      'ROLE_UPDATE_HYDROCARBON_AND_WATER_CONTENT',
    ],
    ...getUpsertBtnProps(`${typeLabel} Water Data`),
  };
}

/** No getWaterDataByUid query exists, so the only row action is edit (no separate view/detail page). */
export function waterDataTableBtns(
  comp: BaseComponent,
  waterDataType: WaterDataType,
  plantUid?: string,
): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [waterDataUpsertBtn(comp, waterDataType, plantUid)] }];
}
