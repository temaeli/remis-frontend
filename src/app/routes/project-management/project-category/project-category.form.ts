import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldConfig } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getDeleteBtnProps,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';

import { ProjectCategory } from '../project-registry.interface';
import {
  toProjectRegistryInput,
  projectRegistryBaseFields,
  PROJECT_CATEGORY_DELETE_PERMISSIONS,
  PROJECT_CATEGORY_UPSERT_PERMISSIONS,
  PROJECT_CATEGORY_VIEW_PERMISSIONS,
} from '../project-registry.form';
import { DELETE_PROJECT_CATEGORY, SAVE_PROJECT_CATEGORY } from './project-category.graphql';

// Listener for all ProjectCategory actions
export const projectCategory$ = new Subject<ProjectCategory | any>();

export const getProjectCategoryFormFields = (): FieldConfig[] => [
  ...projectRegistryBaseFields(),
];

export function projectCategoryUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: ProjectCategory) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Project Category',
        fields: getProjectCategoryFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toProjectRegistryInput(value) },
            mutation: SAVE_PROJECT_CATEGORY,
            successFn: (res) => {
              projectCategory$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: PROJECT_CATEGORY_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Project Category'),
  };
}

export function projectCategoryViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Project Category',
    click: (data: ProjectCategory) => navigateRelativeTo(comp, 'project-categories', data?.id),
    permissions: PROJECT_CATEGORY_VIEW_PERMISSIONS,
  };
}

export function projectCategoryDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: ProjectCategory) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_PROJECT_CATEGORY,
        finalFn: (res) => projectCategory$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Project Category', 'name'),
    permissions: PROJECT_CATEGORY_DELETE_PERMISSIONS,
  };
}

export function projectCategoryTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
        buttons: [
        projectCategoryViewBtn(comp),
        projectCategoryUpsertBtn(comp),
        projectCategoryDeleteBtn(comp),
      ],
    },
  ];
}
