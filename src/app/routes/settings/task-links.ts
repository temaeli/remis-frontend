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
 * What a task links to: an organisation, a deliverable, a floor, a milestone, a
 * phase, a project, the parameters it is scored on, a snag, a timeline.
 *
 * Each is its own two-column join table with its own link/unlink pair on the
 * backend, so each is a panel on the task's detail page listing that side and
 * able to link and unlink. They are all the same panel with a different name, so
 * they are declared as configs below and built by one factory.
 *
 * Deliberately does not import the lookup registries. These panels hang off
 * `TASK` in project-setting-lookups, so importing that back would be a cycle;
 * the small `all…` reads the link form picks from are declared here instead —
 * the same reason project-asset.ts declares its own.
 *
 * Unlike project_assets, unlinking here takes the join row's own uid rather than
 * the pair, because that is what the controllers ask for.
 */

/** Notifies every panel that a link was made or broken. */
export const taskLink$ = new Subject<unknown>();

/** One side of a link, kept to what a grid row and a select need. */
const sideGqlFields = `
  id
  assignedNumber
  name
`;

interface TaskLinkConfig {
  /** The backend entity name — `linkTask…`, `unlinkTask…`, `taskLink…sByTask`. */
  entity: string;
  /** The field holding the other side, on both the row and the link mutation. */
  field: string;
  /** Singular label shown on the panel and its buttons. */
  label: string;
  /** Plural label used as the panel's title. */
  pluralLabel: string;
  icon: string;
  /** UPPER_SNAKE suffix of the permission set PermissionSeeder generates. */
  permission: string;
  /** The read the link form's select is filled from. */
  optionsQuery: unknown;
}

const allBusinessNames = gql`
  query allBusinessNames {
    allBusinessNames {
      id
      name
    }
  }
`;

const allDeliverables = gql`
  query allDeliverables {
    allDeliverables {
      id
      name
    }
  }
`;

const allFloors = gql`
  query allFloors {
    allFloors {
      id
      name
    }
  }
`;

const allMilestones = gql`
  query allMilestones {
    allMilestones {
      id
      name
    }
  }
`;

const allPhases = gql`
  query allPhases {
    allPhases {
      id
      name
    }
  }
`;

const allRegistryProjects = gql`
  query allRegistryProjects {
    allRegistryProjects {
      id
      name
    }
  }
`;

const allRisks = gql`
  query allRisks {
    allRisks {
      id
      name
    }
  }
`;

const allQualitativeParameters = gql`
  query allQualitativeParameters {
    allQualitativeParameters {
      id
      name
    }
  }
`;

const allQuantitativeParameters = gql`
  query allQuantitativeParameters {
    allQuantitativeParameters {
      id
      name
    }
  }
`;

const allSnags = gql`
  query allSnags {
    allSnags {
      id
      name
    }
  }
`;

const allTimelines = gql`
  query allTimelines {
    allTimelines {
      id
      name
    }
  }
`;

const allStreets = gql`
  query allStreets {
    allStreets {
      id
      name
    }
  }
`;

const allUnits = gql`
  query allUnits {
    allUnits {
      id
      name
    }
  }
`;

/** In the order they read on the task's page: what it produces, then where it sits. */
const TASK_LINKS: TaskLinkConfig[] = [
  {
    entity: 'TaskDeliverable',
    field: 'deliverable',
    label: 'Deliverable',
    pluralLabel: 'Deliverables',
    icon: 'layers',
    permission: 'TASK_DELIVERABLE',
    optionsQuery: allDeliverables,
  },
  {
    entity: 'TaskMilestone',
    field: 'milestone',
    label: 'Milestone',
    pluralLabel: 'Milestones',
    icon: 'flag',
    permission: 'TASK_MILESTONE',
    optionsQuery: allMilestones,
  },
  {
    entity: 'TaskPhase',
    field: 'phase',
    label: 'Phase',
    pluralLabel: 'Phases',
    icon: 'timeline',
    permission: 'TASK_PHASE',
    optionsQuery: allPhases,
  },
  {
    entity: 'TaskTimeline',
    field: 'timeline',
    label: 'Timeline',
    pluralLabel: 'Timelines',
    icon: 'clock',
    permission: 'TASK_TIMELINE',
    optionsQuery: allTimelines,
  },
  {
    entity: 'TaskProject',
    field: 'project',
    label: 'Project',
    pluralLabel: 'Projects',
    icon: 'project',
    permission: 'TASK_PROJECT',
    optionsQuery: allRegistryProjects,
  },
  {
    entity: 'TaskFloor',
    field: 'floor',
    label: 'Floor',
    pluralLabel: 'Floors',
    icon: 'layers',
    permission: 'TASK_FLOOR',
    optionsQuery: allFloors,
  },
  {
    entity: 'TaskQualitativeParameter',
    field: 'qualitativeParameter',
    label: 'Qualitative Parameter',
    pluralLabel: 'Qualitative Parameters',
    icon: 'rule',
    permission: 'TASK_QUALITATIVE_PARAMETER',
    optionsQuery: allQualitativeParameters,
  },
  {
    entity: 'TaskQuantitativeParameter',
    field: 'quantitativeParameter',
    label: 'Quantitative Parameter',
    pluralLabel: 'Quantitative Parameters',
    icon: 'calculate',
    permission: 'TASK_QUANTITATIVE_PARAMETER',
    optionsQuery: allQuantitativeParameters,
  },
  {
    entity: 'TaskSnag',
    field: 'snag',
    label: 'Snag',
    pluralLabel: 'Snags',
    icon: 'warning',
    permission: 'TASK_SNAG',
    optionsQuery: allSnags,
  },
  {
    entity: 'TaskBusinessName',
    field: 'businessName',
    label: 'Organisation',
    pluralLabel: 'Organisations',
    icon: 'institution',
    permission: 'TASK_BUSINESS_NAME',
    optionsQuery: allBusinessNames,
  },
  {
    entity: 'TaskRisk',
    field: 'risk',
    label: 'Risk',
    pluralLabel: 'Risks',
    icon: 'warning',
    permission: 'TASK_RISK',
    optionsQuery: allRisks,
  },
  {
    entity: 'TaskStreet',
    field: 'street',
    label: 'Street',
    pluralLabel: 'Streets',
    icon: 'signpost',
    permission: 'TASK_STREET',
    optionsQuery: allStreets,
  },
  {
    entity: 'TaskUnit',
    field: 'unit',
    label: 'Unit',
    pluralLabel: 'Units',
    icon: 'domain',
    permission: 'TASK_UNIT',
    optionsQuery: allUnits,
  },
];

/** Lowercases the first letter — the backend derives its query names the same way. */
const lower = (s: string) => s[0].toLowerCase() + s.slice(1);

const buildGql = (config: TaskLinkConfig) => {
  const { entity, field } = config;
  const rowFields = `
  uid
  ${field} {
    ${sideGqlFields}
  }
`;

  return {
    byTask: gql`
      query ${lower(entity)}sByTask($taskUid: String) {
        ${lower(entity)}sByTask(taskUid: $taskUid) {
          ${rowFields}
        }
      }
    `,
    link: gql`
      mutation link${entity}($taskUid: String, $${field}Uid: String) {
        link${entity}(taskUid: $taskUid, ${field}Uid: $${field}Uid) {
          ${responseGqlFields(rowFields)}
        }
      }
    `,
    unlink: gql`
      mutation unlink${entity}($uid: String) {
        unlink${entity}(uid: $uid) {
          ${responseGqlFields(rowFields)}
        }
      }
    `,
  };
};

function linkBtn(
  comp: BaseComponent,
  config: TaskLinkConfig,
  documents: ReturnType<typeof buildGql>,
  taskUid?: string,
): ActionButton {
  return {
    icon: 'add',
    label: `Link ${config.label}`,
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: `Link ${config.label}`,
        fields: [
          {
            key: `${config.field}Uid`,
            label: config.label,
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: config.optionsQuery },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { taskUid, ...value },
            mutation: documents.link,
            successFn: (res) => {
              taskLink$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: [`ROLE_CREATE_${config.permission}`, `ROLE_UPDATE_${config.permission}`],
  };
}

function unlinkBtn(
  comp: BaseComponent,
  config: TaskLinkConfig,
  documents: ReturnType<typeof buildGql>,
): ActionButton {
  return {
    icon: 'block',
    label: 'Unlink',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'UNLINK',
      confirmText: 'UNLINK',
      confirmButtonColor: 'red',
      message: `Are you sure you want to unlink <b class='text-danger'>${
        row?.[config.field]?.name ?? ''
      }</b> ?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: documents.unlink,
        successFn: (res) => taskLink$.next(res?.data),
      });
    },
    permissions: [`ROLE_DELETE_${config.permission}`],
  };
}

const linkColumns = (field: string): GridKeyColumn[] => [
  'index',
  `${field}.assignedNumber as Assigned Number`,
  `${field}.name as Name`,
  'actions',
];

/** One panel per link, for the task's detail page. */
export const taskLinkPanels = (comp: BaseComponent, taskUid?: string): ContentParameter[] =>
  TASK_LINKS.map((config) => {
    const documents = buildGql(config);
    return {
      type: 'table',
      name: config.pluralLabel,
      label: config.pluralLabel,
      icon: config.icon,
      permissions: [`ROLE_VIEW_ALL_${config.permission}`, `ROLE_VIEW_${config.permission}`],
      keyColumns: linkColumns(config.field),
      headerButtons: [linkBtn(comp, config, documents, taskUid)],
      actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp, config, documents)] }],
      reloadActions$: [taskLink$],
      fetchParameter: { query: documents.byTask, variables: { taskUid } },
    } as ContentParameter;
  });
