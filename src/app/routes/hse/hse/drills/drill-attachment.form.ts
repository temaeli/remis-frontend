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
  DELETE_DRILL_ATTACHMENT,
  SAVE_OR_UPDATE_DRILL_ATTACHMENT,
} from './drill.graphql';

export const drillAttachment$ = new Subject<any>();

function getFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'attachmentTitle',
      label: 'Title',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'attachment',
      label: 'File',
      type: FieldType.attachment,
      acceptType: ['.pdf', '.png', '.jpg', '.xlsx'],
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

export function drillAttachmentUpsertBtn(comp: BaseComponent, planUid: string): ActionButton {
  return {
    click: (data?: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { ...(data ?? {}) },
        title: 'Drill Attachment',
        fields: getFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: SAVE_OR_UPDATE_DRILL_ATTACHMENT,
            variables: { planUid, attachmentDto: value },
            successFn: () => {
              drillAttachment$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '50%');
    },
    permissions: ['ROLE_ENTER_HSE_DRILL_DATA'],
    ...getUpsertBtnProps('Attachment'),
  };
}

export function drillAttachmentDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Attachment'),
    permissions: ['ROLE_DELETE_HSE_DRILL'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_DRILL_ATTACHMENT,
        variables: { attachmentUid: data.uid },
        successFn: () => drillAttachment$.next(null),
      });
    },
  };
}

export function drillAttachmentTableBtns(
  comp: BaseComponent,
  planUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        drillAttachmentUpsertBtn(comp, planUid),
        drillAttachmentDeleteBtn(comp),
      ],
    },
  ];
}
