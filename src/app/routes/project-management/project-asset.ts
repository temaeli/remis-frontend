import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * The link between a project and an asset, from both ends.
 *
 * `project_assets` is a join table: attaching and detaching are its own two
 * mutations, and each side reads the same join rows filtered by the other. So
 * this is a panel on the project's detail page listing its assets, and a panel on
 * the asset's listing its projects, each able to attach and detach.
 *
 * Deliberately imports neither registry. The panels belong to both modules, and
 * having asset-lookups and project-lookups import each other would be a cycle;
 * everything needed — the two reads, the two mutations, and the lists the attach
 * form picks from — is declared here instead.
 */

/** Notifies both panels that a link was made or broken. */
export const projectAsset$ = new Subject<unknown>();

/** A join row, with just enough of each side to fill a grid and detach again. */
const projectAssetGqlFields = `
  id
  asset {
    id
    assignedNumber
    name
  }
  project {
    id
    assignedNumber
    name
  }
`;

export const ASSETS_OF_PROJECT = gql`
  query assetsOfProject($projectUid: String) {
    assetsOfProject(projectUid: $projectUid) {
      ${projectAssetGqlFields}
    }
  }
`;

export const PROJECTS_OF_ASSET = gql`
  query projectsOfAsset($assetUid: String) {
    projectsOfAsset(assetUid: $assetUid) {
      ${projectAssetGqlFields}
    }
  }
`;

export const ATTACH_ASSET_TO_PROJECT = gql`
  mutation attachAssetToProject($input: ProjectAssetDtoInput) {
    attachAssetToProject(input: $input) {
      ${responseGqlFields(projectAssetGqlFields)}
    }
  }
`;

export const DETACH_ASSET_FROM_PROJECT = gql`
  mutation detachAssetFromProject($input: ProjectAssetDtoInput) {
    detachAssetFromProject(input: $input) {
      ${responseGqlFields(projectAssetGqlFields)}
    }
  }
`;

/**
 * The two lists the attach form picks from, kept to what a select needs.
 * Exported like the rest so they are checked against the schema.
 */
export const ALL_ASSETS_FOR_LINK = gql`
  query allAssets {
    allAssets {
      id
      name
    }
  }
`;

export const ALL_PROJECTS_FOR_LINK = gql`
  query allRegistryProjects {
    allRegistryProjects {
      id
      name
    }
  }
`;

//  Permissions, as declared on ProjectAssetController.
const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_PROJECT_ASSET', 'ROLE_VIEW_PROJECT_ASSET'];
const ATTACH_PERMISSIONS = ['ROLE_CREATE_PROJECT_ASSET', 'ROLE_UPDATE_PROJECT_ASSET'];
const DETACH_PERMISSIONS = ['ROLE_DELETE_PROJECT_ASSET'];

/**
 * Opens the attach form for whichever side is fixed: on a project's page the
 * project is known and an asset is chosen, and the other way round.
 */
function attachBtn(
  comp: BaseComponent,
  fixed: { projectUid?: string; assetUid?: string },
  pick: { key: 'assetUid' | 'projectUid'; label: string; query: unknown },
): ActionButton {
  return {
    icon: 'add',
    label: `Attach ${pick.label}`,
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: `Attach ${pick.label}`,
        fields: [
          {
            key: pick.key,
            label: pick.label,
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: pick.query },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: { ...fixed, ...value } },
            mutation: ATTACH_ASSET_TO_PROJECT,
            successFn: (res) => {
              projectAsset$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: ATTACH_PERMISSIONS,
  };
}

/**
 * Breaks the link. The join row carries both sides, so the mutation is given the
 * pair rather than the row's own id — which is what it asks for.
 */
function detachBtn(comp: BaseComponent, otherSide: 'asset' | 'project'): ActionButton {
  return {
    icon: 'block',
    label: 'Detach',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'DETACH',
      confirmText: 'DETACH',
      confirmButtonColor: 'red',
      message: `Are you sure you want to detach <b class='text-danger'>${
        row?.[otherSide]?.name ?? ''
      }</b> ?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { input: { assetUid: row?.asset?.id, projectUid: row?.project?.id } },
        mutation: DETACH_ASSET_FROM_PROJECT,
        successFn: (res) => projectAsset$.next(res?.data),
      });
    },
    permissions: DETACH_PERMISSIONS,
  };
}

const linkColumns = (side: 'asset' | 'project'): GridKeyColumn[] => [
  'index',
  `${side}.assignedNumber as Assigned Number`,
  `${side}.name as Name`,
  'actions',
];

/** The assets attached to one project, shown on the project's detail page. */
export const projectAssetsPanel = (comp: BaseComponent, projectUid?: string): ContentParameter => ({
  type: 'table',
  name: 'Attached Assets',
  label: 'Attached Assets',
  icon: 'suitcase',
  permissions: VIEW_PERMISSIONS,
  keyColumns: linkColumns('asset'),
  headerButtons: [
    attachBtn(
      comp,
      { projectUid },
      { key: 'assetUid', label: 'Asset', query: ALL_ASSETS_FOR_LINK },
    ),
  ],
  actionButtons: [{ ...MORE_BTN, buttons: [detachBtn(comp, 'asset')] }],
  reloadActions$: [projectAsset$],
  fetchParameter: { query: ASSETS_OF_PROJECT, variables: { projectUid } },
});

/** The projects one asset is attached to, shown on the asset's detail page. */
export const assetProjectsPanel = (comp: BaseComponent, assetUid?: string): ContentParameter => ({
  type: 'table',
  name: 'Attached Projects',
  label: 'Attached Projects',
  icon: 'project',
  permissions: VIEW_PERMISSIONS,
  keyColumns: linkColumns('project'),
  headerButtons: [
    attachBtn(
      comp,
      { assetUid },
      { key: 'projectUid', label: 'Project', query: ALL_PROJECTS_FOR_LINK },
    ),
  ],
  actionButtons: [{ ...MORE_BTN, buttons: [detachBtn(comp, 'project')] }],
  reloadActions$: [projectAsset$],
  fetchParameter: { query: PROJECTS_OF_ASSET, variables: { assetUid } },
});
