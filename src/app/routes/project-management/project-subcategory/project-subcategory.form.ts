import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  getDeleteBtnProps,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';

import { ProjectSubcategory } from '../project-registry.interface';
import {
  toProjectRegistryInput,
  projectRegistryBaseFields,
  PROJECT_SUBCATEGORY_DELETE_PERMISSIONS,
  PROJECT_SUBCATEGORY_UPSERT_PERMISSIONS,
  PROJECT_SUBCATEGORY_VIEW_PERMISSIONS,
} from '../project-registry.form';
import { ALL_PROJECT_CATEGORIES } from '../project-category/project-category.graphql';
import { DELETE_PROJECT_SUBCATEGORY, SAVE_PROJECT_SUBCATEGORY } from './project-subcategory.graphql';

// Listener for all ProjectSubcategory actions
export const projectSubcategory$ = new Subject<ProjectSubcategory | any>();

export const getProjectSubcategoryFormFields = (): FieldConfig[] => [
  ...projectRegistryBaseFields(),
  {
    key: 'projectCategoryUid',
    label: 'Project Category',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_PROJECT_CATEGORIES },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function projectSubcategoryUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: ProjectSubcategory) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data, projectCategoryUid: data?.projectCategory?.id },
        title: 'Project Subcategory',
        fields: getProjectSubcategoryFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toProjectRegistryInput(value) },
            mutation: SAVE_PROJECT_SUBCATEGORY,
            successFn: (res) => {
              projectSubcategory$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: PROJECT_SUBCATEGORY_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Project Subcategory'),
  };
}

export function projectSubcategoryViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Project Subcategory',
    click: (data: ProjectSubcategory) => navigateRelativeTo(comp, 'project-subcategories', data?.id),
    permissions: PROJECT_SUBCATEGORY_VIEW_PERMISSIONS,
  };
}

export function projectSubcategoryDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: ProjectSubcategory) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_PROJECT_SUBCATEGORY,
        finalFn: (res) => projectSubcategory$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Project Subcategory', 'name'),
    permissions: PROJECT_SUBCATEGORY_DELETE_PERMISSIONS,
  };
}

export function projectSubcategoryTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
        buttons: [
        projectSubcategoryViewBtn(comp),
        projectSubcategoryUpsertBtn(comp),
        projectSubcategoryDeleteBtn(comp),
      ],
    },
  ];
}
