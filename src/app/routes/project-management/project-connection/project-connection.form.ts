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

import { ProjectConnection } from '../project-registry.interface';
import {
  toProjectRegistryInput,
  projectRegistryBaseFields,
  PROJECT_CONNECTION_DELETE_PERMISSIONS,
  PROJECT_CONNECTION_UPSERT_PERMISSIONS,
  PROJECT_CONNECTION_VIEW_PERMISSIONS,
} from '../project-registry.form';
import { ALL_REGISTRY_PROJECTS } from '../project/project.graphql';
import { DELETE_PROJECT_CONNECTION, SAVE_PROJECT_CONNECTION } from './project-connection.graphql';

// Listener for all connection actions
export const projectConnection$ = new Subject<ProjectConnection | any>();

/**
 * The link is untyped — "phase of", "depends on" and "supersedes" all go in the
 * name and description, which the schema documentation records as an open gap.
 * The backend rejects self-links, duplicate pairs and cycles.
 */
export const getProjectConnectionFormFields = (): FieldConfig[] => [
  ...projectRegistryBaseFields(),
  {
    key: 'parentUid',
    label: 'Parent Project',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_REGISTRY_PROJECTS },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'childUid',
    label: 'Child Project',
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_REGISTRY_PROJECTS },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
];

export function projectConnectionUpsertBtn(comp: BaseComponent, parentUid?: string): ActionButton {
  return {
    click: (data?: ProjectConnection) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {
          parentUid: data?.parent?.id ?? parentUid,
          childUid: data?.child?.id,
          ...data,
        },
        title: 'Project Connection',
        fields: getProjectConnectionFormFields(),
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: toProjectRegistryInput(value) },
            mutation: SAVE_PROJECT_CONNECTION,
            successFn: (res) => {
              projectConnection$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: PROJECT_CONNECTION_UPSERT_PERMISSIONS,
    ...getUpsertBtnProps('Project Connection'),
  };
}

export function projectConnectionViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Project Connection',
    click: (data: ProjectConnection) => navigateRelativeTo(comp, 'project-connections', data?.id),
    permissions: PROJECT_CONNECTION_VIEW_PERMISSIONS,
  };
}

export function projectConnectionDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: ProjectConnection) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.id },
        mutation: DELETE_PROJECT_CONNECTION,
        finalFn: (res) => projectConnection$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Project Connection', 'name'),
    permissions: PROJECT_CONNECTION_DELETE_PERMISSIONS,
  };
}

export function projectConnectionTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        projectConnectionViewBtn(comp),
        projectConnectionUpsertBtn(comp),
        projectConnectionDeleteBtn(comp),
      ],
    },
  ];
}
