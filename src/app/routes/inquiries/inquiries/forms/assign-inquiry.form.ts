import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { Inquiry, InquiryStatus } from '../inquiry.interface';
import { inquiryProcess$ } from './inquiry.form';
import { ASSIGN_INQUIRY } from '../inquiry.graphql';
import { LIST_USERS_PAGEABLE_ } from '@routes/users-managment/users/user.graphql';

export const getAssignInquiryFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },

  {
    key: 'assignedTo',
    type: FieldType.select,
    validations: [],
    optionsVariables: {
      mapFunction: (d: any) => ({ label: `${d.firstName} ${d.lastName}`, value: d.uid }),

      fetchParameter: {
        queryFieldsKeys: ['firstName', 'lastName', 'uid'],
        query: LIST_USERS_PAGEABLE_,
        pageableParam: { page: 0, size: 10000 },
        variables: { active: true },
        searchStates: {},
      },
    },
    class: 'col-span-full',
  },
  {
    key: 'comment',
    type: FieldType.textarea,
    validations: [],
    class: 'col-span-full',
  },
];

export function inquiryAssignBtn(comp: BaseComponent): ActionButton {
  return {
    label: 'Assign Inquiry',
    icon: 'user_check',
    showFunction: (d?: Inquiry) => d?.status === InquiryStatus.OPEN,

    click: (data?: Inquiry) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Assign Inquiry',
        fields: getAssignInquiryFormFields(comp),
        closeAction$: inquiryProcess$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { assignmentDto: value },
            query: ASSIGN_INQUIRY,
            successFn: (res) => inquiryProcess$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_ASSIGN_INQUIRY'],
  };
}
