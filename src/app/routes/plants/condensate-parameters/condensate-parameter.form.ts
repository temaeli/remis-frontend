import { Subject } from 'rxjs';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { CREATE_UPDATE_CONDENSATE_PARAMETER } from './condensate-parameter.graphql';
import { CondensateParameter } from './condensate-parameter.interface';

export const condensateParameter$ = new Subject<CondensateParameter | any>();

export const CondensateParameterCols: GridKeyColumn[] = [
  'sno as S/No',
  'plant.name as Plant',
  'testedRvp as Tested RVP',
  'createdBy.fullName as User',
  'createdAt type(date)',
  'actions',
];

export const getCondensateParameterFormFields = (): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'testedRedVapourPressure',
    type: FieldType.decimal,
    label: 'Tested Red Vapour Pressure',
    validations: [VALIDATOR_REQUIRED],
  },
];

/**
 * createUpdateCondensateParameter(uid, inputs, plantUid) - uid/plantUid are
 * separate top-level mutation args, not part of CondensateParameterDtoInput.
 * The returned field (testedRvp) has a different name than the input field
 * (testedRedVapourPressure), so it's remapped explicitly when pre-filling.
 */
export function condensateParameterUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: (data?: CondensateParameter) => {
      const formParameter: FormParameters = {
        model: { uid: data?.uid, testedRedVapourPressure: data?.testedRvp },
        title: 'Condensate Parameter',
        fields: getCondensateParameterFormFields(),
        closeAction$: condensateParameter$,

        onSubmit: async (value: any) => {
          const { uid, ...inputs } = value;

          await comp.fs.fetch({
            notify: true,
            variables: { uid, plantUid, inputs },
            mutation: CREATE_UPDATE_CONDENSATE_PARAMETER,
            successFn: (res) => condensateParameter$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_CREATE_CONDENSATE_PARAMETER', 'ROLE_UPDATE_CONDENSATE_PARAMETER'],
    ...getUpsertBtnProps('Condensate Parameter'),
  };
}

/** No getCondensateParameterByUid query exists, so the only row action is edit. */
export function condensateParameterTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [condensateParameterUpsertBtn(comp, plantUid)];
}
