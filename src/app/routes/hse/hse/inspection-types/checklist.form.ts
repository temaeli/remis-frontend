import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import {
  CREATE_OR_UPDATE_INSPECTION_CHECKLIST,
  DELETE_INSPECTION_CHECKLIST,
  GET_INSPECTION_CHECKLIST_BY_UID,
} from './inspection-type.graphql';

export const inspectionChecklist$ = new Subject<any>();

export function getChecklistFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'question',
      label: 'Question',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'group',
      label: 'Group',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'mandatory',
      label: 'Mandatory',
      type: FieldType.toggle,
      validations: [],
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export function inspectionChecklistUpsertBtn(
  comp: BaseComponent,
  inspectionTypeUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_INSPECTION_CHECKLIST_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {
          ...seed,
          group: seed?.groupName ?? seed?.group,
        },
        title: 'Checklist Item',
        fields: getChecklistFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { inspectionTypeUid, input: value },
            mutation: CREATE_OR_UPDATE_INSPECTION_CHECKLIST,
            successFn: (res) => {
              inspectionChecklist$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: ['ROLE_MANAGE_INSPECTION_CHECKLIST'],
    ...getUpsertBtnProps('Checklist Item'),
  };
}

export function inspectionChecklistDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Checklist Item'),
    permissions: ['ROLE_DELETE_INSPECTION_CHECKLIST'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_INSPECTION_CHECKLIST,
        variables: { uid: data.uid },
        successFn: () => inspectionChecklist$.next(null),
      });
    },
  };
}

export function inspectionChecklistTableBtns(
  comp: BaseComponent,
  inspectionTypeUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        inspectionChecklistUpsertBtn(comp, inspectionTypeUid),
        inspectionChecklistDeleteBtn(comp),
      ],
    },
  ];
}
