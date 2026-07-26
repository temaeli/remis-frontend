import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import { SAVE_REPORT_TEMPLATE, DELETE_REPORT_TEMPLATE } from './report-template.graphql';
import { ReportTemplate, ReportTemplateType } from './report-template.interface';

// Listener for all Report Template actions
export const reportTemplate$ = new Subject<ReportTemplate | any>();

export const getReportTemplateFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'name',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'templateType',
    label: 'Template Type',
    type: FieldType.select,
    validations: [VALIDATOR_REQUIRED],
    options: Object.values(ReportTemplateType).map((type) => ({
      label: type.replace(/_/g, ' '),
      value: type,
    })),
    class: 'col-span-full',
  },
  {
    key: 'code',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'editable',
    type: FieldType.toggle,
    validations: [],
  },

  {
    key: 'subject',
    type: FieldType.input,
    validations: [],
    class: 'col-span-full',
  },
  {
    key: 'description',
    type: FieldType.textarea,
    validations: [],
    class: 'col-span-full',
  },
  {
    key: 'content',
    type: FieldType.textarea,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function reportTemplateUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: ReportTemplate) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Report Template',
        fields: getReportTemplateFormFields(),
        closeAction$: reportTemplate$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: SAVE_REPORT_TEMPLATE,
            successFn: (res) => reportTemplate$.next(res?.data),
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Report Template'),
  };
}

export function reportTemplateViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Report Template',
    click: (data: ReportTemplate) => navigateRelativeTo(comp, 'report-template', data?.uid),
    permissions: [],
  };
}

export function reportTemplateDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: ReportTemplate) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_REPORT_TEMPLATE,
        finalFn: (res) => reportTemplate$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Report Template', 'name'),
    permissions: [],
  };
}

export function reportTemplateTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        reportTemplateViewBtn(comp),
        reportTemplateUpsertBtn(comp),
        reportTemplateDeleteBtn(comp),
      ],
    },
  ];
}
