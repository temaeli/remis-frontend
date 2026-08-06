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

import { RegistryProject } from '../project-registry.interface';
import {
  toProjectRegistryInput,
  projectRegistryBaseFields,
  coordinateFields,
  PROJECT_DELETE_PERMISSIONS,
  PROJECT_UPSERT_PERMISSIONS,
  PROJECT_VIEW_PERMISSIONS,
} from '../project-registry.form';
import { ALL_PROJECT_SUBCATEGORIES } from '../project-subcategory/project-subcategory.graphql';
import { DELETE_REGISTRY_PROJECT, SAVE_REGISTRY_PROJECT } from './project.graphql';

// Listener for all project actions
export const registryProject$ = new Subject<RegistryProject | any>();

export const getRegistryProjectFormFields = (): FieldConfig[] => [
  ...projectRegistryBaseFields(),
  {
    key: 'projectSubcategoryUid',
    label: 'Project Subcategory',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_PROJECT_SUBCATEGORIES },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  ...coordinateFields(),
  {
    key: 'startedAt',
    label: 'Start Date',
    type: FieldType.date,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    // Required: v1 of the schema has ended_at NOT NULL, so a running project
    // still needs a date. v2 relaxes it to mean "still under way".
    key: 'endedAt',
    label: 'End Date',
    type: FieldType.date,
    hint: 'Required — the schema does not yet allow an open-ended project',
    validations: [VALIDATOR_REQUIRED],
  },
];

export function registryProjectUpsertBtn(
  comp: BaseComponent,
  projectSubcategoryUid?: string,
): ActionButton {
  return {
    click: (data?: RegistryProject) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {
          projectSubcategoryUid: data?.projectSubcategory?.id ?? projectSubcategoryUid,
          ...data,
        },
        title: 'Project',
        fields: getRegistryProjectFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toProjectRegistryInput(value) },
            mutation: SAVE_REGISTRY_PROJECT,
            successFn: (res) => {
              registryProject$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: PROJECT_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Project'),
  };
}

export function registryProjectViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Project',
    click: (data: RegistryProject) => navigateRelativeTo(comp, 'projects', data?.id),
    permissions: PROJECT_VIEW_PERMISSIONS,
  };
}

export function registryProjectDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: RegistryProject) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_REGISTRY_PROJECT,
        finalFn: (res) => registryProject$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Project', 'name'),
    permissions: PROJECT_DELETE_PERMISSIONS,
  };
}

export function registryProjectTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        registryProjectViewBtn(comp),
        registryProjectUpsertBtn(comp),
        registryProjectDeleteBtn(comp),
      ],
    },
  ];
}
