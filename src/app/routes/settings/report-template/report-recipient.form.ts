import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  VALIDATOR_REQUIRED,
  VALIDATOR_EMAIL,
  VALIDATOR_TANZINIA_PHONE,
} from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import {
  CREATE_OR_UPDATE_REPORT_RECIPIENT,
  DELETE_REPORT_RECIPIENT,
  FIND_REPORT_RECIPIENT,
} from './report-recipient.graphql';

export const reportRecipient$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_MANAGE_REPORT_RECIPIENTS'];
const DELETE_PERMS = ['ROLE_DELETE_REPORT_RECIPIENTS'];

function getReportRecipientFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'email',
      label: 'Email',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
      class: 'col-span-full',
    },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [] },
    { key: 'title', label: 'Title', type: FieldType.input, validations: [] },
    {
      key: 'phone',
      label: 'Phone',
      type: FieldType.input,
      validations: [VALIDATOR_TANZINIA_PHONE],
    },
    { key: 'address', label: 'Address', type: FieldType.input, validations: [] },
  ];
}

export function reportRecipientUpsertBtn(comp: BaseComponent, templateUid: string): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({ query: FIND_REPORT_RECIPIENT, variables: { uid: data.uid } })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...(seed ?? {}) },
        title: 'Report Recipient',
        fields: getReportRecipientFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { templateUid, input: value },
            mutation: CREATE_OR_UPDATE_REPORT_RECIPIENT,
            successFn: (res) => {
              reportRecipient$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Recipient'),
  };
}

export function reportRecipientDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Recipient', 'email'),
    permissions: DELETE_PERMS,
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_REPORT_RECIPIENT,
        variables: { uid: data.uid },
        successFn: () => reportRecipient$.next(null),
      });
    },
  };
}

export function reportRecipientTableBtns(comp: BaseComponent, templateUid: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [reportRecipientUpsertBtn(comp, templateUid), reportRecipientDeleteBtn(comp)],
    },
  ];
}
