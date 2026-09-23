import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * How urgent a project is, and how urgent a service is —
 * `projects_priorities` and `services_priorities`.
 *
 * A table rather than a column on either parent, so a project or a service may
 * carry more than one level. Neither pair is UNIQUE in the database; the
 * backend refuses a repeat, since the second row says nothing the first does
 * not.
 *
 * Both sides are the same panel with different words, so they are written once
 * here. Deliberately does not import either lookup registry, which would be a
 * cycle.
 */

/** Notifies the panels that a priority was recorded or removed. */
export const priority$ = new Subject<unknown>();

/** The five levels, lowest first, as the database enum declares them. */
export const PRIORITY_OPTIONS = [
  { value: 'LOWEST', label: 'Lowest' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'HIGHEST', label: 'Highest' },
];

/** Title case, so a table does not shout LOWEST at the reader. */
export const priorityLabel = (value?: string): string =>
  PRIORITY_OPTIONS.find((option) => option.value === value)?.label ?? (value ?? '');

const PROJECT_PRIORITIES = gql`
  query projectPrioritiesByProject($projectUid: String) {
    projectPrioritiesByProject(projectUid: $projectUid) {
      uid
      priority
    }
  }
`;

const SERVICE_PRIORITIES = gql`
  query servicePrioritiesByService($serviceUid: String) {
    servicePrioritiesByService(serviceUid: $serviceUid) {
      uid
      priority
    }
  }
`;

const RECORD_PROJECT_PRIORITY = gql`
  mutation recordProjectPriority($projectUid: String, $priority: Priority) {
    recordProjectPriority(projectUid: $projectUid, priority: $priority) {
      ${responseGqlFields}
    }
  }
`;

const REMOVE_PROJECT_PRIORITY = gql`
  mutation removeProjectPriority($uid: String) {
    removeProjectPriority(uid: $uid) {
      ${responseGqlFields}
    }
  }
`;

const RECORD_SERVICE_PRIORITY = gql`
  mutation recordServicePriority($serviceUid: String, $priority: Priority) {
    recordServicePriority(serviceUid: $serviceUid, priority: $priority) {
      ${responseGqlFields}
    }
  }
`;

const REMOVE_SERVICE_PRIORITY = gql`
  mutation removeServicePriority($uid: String) {
    removeServicePriority(uid: $uid) {
      ${responseGqlFields}
    }
  }
`;

interface PriorityPanelConfig {
  /** What is being prioritised, for the wording. */
  subject: string;
  ownerArg: 'projectUid' | 'serviceUid';
  query: unknown;
  record: unknown;
  remove: unknown;
  viewPermissions: string[];
  writePermissions: string[];
  deletePermissions: string[];
}

const PROJECT: PriorityPanelConfig = {
  subject: 'project',
  ownerArg: 'projectUid',
  query: PROJECT_PRIORITIES,
  record: RECORD_PROJECT_PRIORITY,
  remove: REMOVE_PROJECT_PRIORITY,
  viewPermissions: ['ROLE_VIEW_ALL_PROJECT_PRIORITY', 'ROLE_VIEW_PROJECT_PRIORITY'],
  writePermissions: ['ROLE_CREATE_PROJECT_PRIORITY', 'ROLE_UPDATE_PROJECT_PRIORITY'],
  deletePermissions: ['ROLE_DELETE_PROJECT_PRIORITY'],
};

const SERVICE: PriorityPanelConfig = {
  subject: 'service',
  ownerArg: 'serviceUid',
  query: SERVICE_PRIORITIES,
  record: RECORD_SERVICE_PRIORITY,
  remove: REMOVE_SERVICE_PRIORITY,
  viewPermissions: ['ROLE_VIEW_ALL_SERVICE_PRIORITY', 'ROLE_VIEW_SERVICE_PRIORITY'],
  writePermissions: ['ROLE_CREATE_SERVICE_PRIORITY', 'ROLE_UPDATE_SERVICE_PRIORITY'],
  deletePermissions: ['ROLE_DELETE_SERVICE_PRIORITY'],
};

function recordBtn(
  comp: BaseComponent,
  config: PriorityPanelConfig,
  ownerUid?: string,
): ActionButton {
  return {
    icon: 'add',
    label: 'Add Priority',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: 'Add Priority',
        fields: [
          {
            key: 'priority',
            label: 'Priority',
            type: FieldType.select,
            options: PRIORITY_OPTIONS,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { [config.ownerArg]: ownerUid, priority: value?.priority },
            mutation: config.record,
            successFn: (res) => {
              priority$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: config.writePermissions,
  };
}

function removeBtn(comp: BaseComponent, config: PriorityPanelConfig): ActionButton {
  return {
    icon: 'block',
    label: 'Remove',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Remove Priority',
      confirmText: 'REMOVE',
      confirmButtonColor: 'red',
      message: `Stop treating this ${config.subject} as <b class='text-danger'>${priorityLabel(
        row?.priority,
      )}</b> priority?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: config.remove,
        successFn: (res) => priority$.next(res?.data),
      });
    },
    permissions: config.deletePermissions,
  };
}

const panel = (
  comp: BaseComponent,
  config: PriorityPanelConfig,
  ownerUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Priorities',
  label: 'Priorities',
  icon: 'flag',
  permissions: config.viewPermissions,
  keyColumns: [
    'index',
    { field: 'priority', header: 'Priority', valueFn: (row: any) => priorityLabel(row?.priority) },
    'actions',
  ],
  headerButtons: [recordBtn(comp, config, ownerUid)],
  actionButtons: [{ ...MORE_BTN, buttons: [removeBtn(comp, config)] }],
  reloadActions$: [priority$],
  fetchParameter: { query: config.query, variables: { [config.ownerArg]: ownerUid } },
});

/** How urgent one project is, for its detail page. */
export const projectPrioritiesPanel = (
  comp: BaseComponent,
  projectUid?: string,
): ContentParameter => panel(comp, PROJECT, projectUid);

/** How urgent one service is, for its detail page. */
export const servicePrioritiesPanel = (
  comp: BaseComponent,
  serviceUid?: string,
): ContentParameter => panel(comp, SERVICE, serviceUid);
