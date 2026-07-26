import { Subject } from 'rxjs';
import { ACTIVATE_OR_DEACTIVATE_REGION, SAVE_OR_UPDATE_REGION } from './region.graphql';
import { Region } from './region.interface';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';

//Listener for all Region actions
export const region$ = new Subject<Region | any>();

export const getRegionFormFields = (comp: BaseComponent): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'name',
    type: FieldType.input,
    validations: [],
    class: 'col-span-full',
  },
  {
    key: 'code',
    type: FieldType.input,
    validations: [],
    class: 'col-span-full',
  },
];

export function regionUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: Region) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Region',
        fields: getRegionFormFields(comp),
        closeAction$: region$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { region: value },
            mutation: SAVE_OR_UPDATE_REGION,
            successFn: (res) => region$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Region'),
  };
}

export function regionViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Region',
    click: (data: Region) => navigateRelativeTo(comp, 'regions', data?.uid),
    permissions: [],
  };
}

export function regionDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Region) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: ACTIVATE_OR_DEACTIVATE_REGION,
        finalFn: (res) => region$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Region'),
    permissions: [],
  };
}

export function regionTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [regionViewBtn(comp), regionUpsertBtn(comp), regionDeleteBtn(comp)],
    },
  ];
}
