import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { DELETE_CUSTOMER_CATEGORY, SAVE_CUSTOMER_CATEGORY } from './customers-categories.graphql';
import { CustomerCategory, CustomerCategoryDtoInput } from './customers-categories.interface';

// Listener for all Customer Category actions
export const customerCategory$ = new Subject<CustomerCategory | any>();

export const getCustomerCategoryFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'name',
    label: 'Name',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'code',
    label: 'Code',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'description',
    label: 'Description',
    type: FieldType.textarea,
    validations: [],
    class: 'col-span-full',
  },
];

export function customerCategoryUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'New Customer Category',
    click: () => {
      const formParameter: FormParameters = {
        title: 'Add Customer Category',
        fields: getCustomerCategoryFormFields(),
        closeAction$: customerCategory$,
        onSubmit: async (model: CustomerCategory) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CUSTOMER_CATEGORY,
            variables: { dto: model },
          });
          if (result) {
            customerCategory$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: [],
  };
}

export function customerCategoryEditBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'edit',
    label: 'Edit Customer Category',
    click: (data?: CustomerCategory) => {
      const formParameter: FormParameters = {
        title: `Edit Customer Category - ${data?.name}`,
        fields: getCustomerCategoryFormFields(),
        model: data,
        closeAction$: customerCategory$,
        onSubmit: async (model: CustomerCategoryDtoInput) => {
          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CUSTOMER_CATEGORY,
            variables: { dto: { ...model, uid: data?.uid } },
          });
          if (result) {
            customerCategory$.next(result);
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '70%');
    },
    permissions: [],
  };
}

export function customerCategoryDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: CustomerCategory) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_CUSTOMER_CATEGORY,
        finalFn: (res) => customerCategory$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Customer Category', 'name'),
    permissions: [],
  };
}

export function customerCategoryTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [customerCategoryEditBtn(comp), customerCategoryDeleteBtn(comp)],
    },
  ];
}
