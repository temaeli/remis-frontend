import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import { GET_ALL_USERS_PAGEABLE } from 'app/routes/plants/plants/plant.graphql';
import { SearchOperationType } from '@shared/fetch/fetch.interface';
import {
  DELETE_INSPECTION_INSPECTOR,
  SAVE_INSPECTION_INSPECTOR,
} from './inspection-inspector.graphql';

export const inspectionInspector$ = new Subject<any>();

const INSPECTOR_USER_FETCH = {
  query: GET_ALL_USERS_PAGEABLE,
  variables: {
    active: true,
    pageableParam: {
      size: 1000,
      searchFields: [
        {
          fieldName: 'isStaff',
          fieldValue: 'true',
          searchType: SearchOperationType.Equals,
        },
      ],
    },
  },
};

export function inspectionInspectorUpsertBtn(comp: BaseComponent, planUid: string): ActionButton {
  return {
    click: () => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: 'Assign Inspectors',
        fields: [
          {
            key: 'inspectorUids',
            label: 'Inspectors',
            type: FieldType.multiple_select,
            optionsVariables: { fetchParameter: INSPECTOR_USER_FETCH },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const uids: string[] = Array.isArray(value?.inspectorUids) ? value.inspectorUids : [];
          if (!uids.length) return;
          let lastRes: any = null;
          for (const inspectorUid of uids) {
            lastRes = await comp.fs.fetch({
              notify: false,
              mutation: SAVE_INSPECTION_INSPECTOR,
              variables: { planUid, inspectorUid },
            });
          }
          inspectionInspector$.next(lastRes);
          close$.next();
        },
      };
      comp.vs?.openModal(FormComponent, params, '40%');
    },
    permissions: ['ROLE_MANAGE_INSPECTION_PLANS'],
    ...getUpsertBtnProps('Inspector'),
  };
}

export function inspectionInspectorDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Inspector'),
    permissions: ['ROLE_MANAGE_INSPECTION_PLANS'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INSPECTION_INSPECTOR,
        variables: { inspectorUid: data.uid },
        successFn: () => inspectionInspector$.next(null),
      });
    },
  };
}

export function inspectionInspectorTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [inspectionInspectorDeleteBtn(comp)],
    },
  ];
}
