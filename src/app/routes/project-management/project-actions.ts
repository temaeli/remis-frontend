import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { Lookup, LookupModule } from '@shared/lookup';

/**
 * What can be done to a project from its own page, with the project already
 * chosen: Add Task, Add Person, Change Status. Also the pieces the New Project
 * form shares with them.
 *
 * The tables stay as the DBA made them, so the page does the joining the user
 * used to do by hand:
 *
 * - A task has no project column, only the `tasks_projects` link. Add Task
 *   saves the task, then links it to this project, in one step.
 * - `projects_bio_data` rows and tasks need a name and a description, each
 *   unique across the whole table. They are written here from the person, the
 *   position and the project, so nobody has to invent them.
 * - Status is a history (`projects_statusid`). Change Status offers only the
 *   steps that make sense next, out of the few labels that fit a project.
 *
 * Does not import project-lookups, which imports this file.
 */

// ---------------------------------------------------------------- status --

/**
 * The project steps, out of the shared `statuses` type, which is mostly
 * billing labels. APPROVED is what completing (converting) a project writes.
 */
export const PROJECT_STATUS_OPTIONS: Option[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'WIP', label: 'Work in progress' },
  { value: 'APPROVED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

/** Where a project may go from each step. No status yet counts as Draft. */
const NEXT_STATUS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['WIP', 'DRAFT', 'CANCELLED'],
  WIP: ['APPROVED', 'CANCELLED'],
  APPROVED: [],
  CANCELLED: ['DRAFT'],
};

export const projectStatusLabel = (value?: string): string =>
  PROJECT_STATUS_OPTIONS.find((option) => option.value === value)?.label ??
  (value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : 'No status');

/** Newest first, so the first row is where the project stands now. */
export const PROJECT_STATUS_CHANGES_BY_PROJECT = gql`
  query projectStatusChangesByProject($projectUid: String) {
    projectStatusChangesByProject(projectUid: $projectUid) {
      id
      uid: id
      status
      changeDay
    }
  }
`;

const SAVE_PROJECT_STATUS_CHANGE = gql`
  mutation saveProjectStatusChange($input: ProjectStatusChangeDtoInput) {
    saveProjectStatusChange(input: $input) {
      ${responseGqlFields('id')}
    }
  }
`;

/** Notifies the Statuses panel that a status was recorded here. */
export const projectStatus$ = new Subject<unknown>();

/** Records a status; the backend stamps the time. True when it saved. */
export async function recordProjectStatus(
  comp: BaseComponent,
  projectUid: string,
  status: string,
  notify = false,
): Promise<boolean> {
  const res = await comp.fs.fetch({
    notify,
    mapData: false,
    mutation: SAVE_PROJECT_STATUS_CHANGE,
    variables: { input: { projectUid, status } },
  });
  const ok = !!res?.data?.id;
  if (ok) projectStatus$.next(res.data);
  return ok;
}

async function currentStatus(comp: BaseComponent, projectUid: string): Promise<string> {
  const rows = await comp.fs.fetch({
    query: PROJECT_STATUS_CHANGES_BY_PROJECT,
    variables: { projectUid },
    loadingOn: 'content',
  });
  return rows?.[0]?.status ?? 'DRAFT';
}

async function openChangeStatusForm(comp: BaseComponent, project: Lookup): Promise<void> {
  const projectUid = project?.id;
  if (!projectUid) return;
  const now = await currentStatus(comp, projectUid);
  const options = PROJECT_STATUS_OPTIONS.filter((o) => NEXT_STATUS[now]?.includes(o.value));

  if (!options.length) {
    comp.notify.info(`This project is ${projectStatusLabel(now)} and has no further step.`);
    return;
  }

  const close$ = new Subject<void>();
  const formParameter: FormParameters = {
    title: `Change Status — now ${projectStatusLabel(now)}`,
    model: { status: options[0].value },
    closeAction$: close$,
    fields: [
      {
        key: 'status',
        label: 'Move to',
        type: FieldType.select,
        options,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
    ],
    onSubmit: async (value: Record<string, unknown>) => {
      if (await recordProjectStatus(comp, projectUid, value['status'] as string, true)) {
        close$.next();
      }
    },
  };
  comp.vs?.openModal(FormComponent, formParameter, '40%');
}

// ---------------------------------------------------------------- people --

const ALL_BIO_DATA = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

const ALL_POSITIONS = gql`
  query allPositions {
    allPositions {
      id
      name
    }
  }
`;

const ALL_SUBCATEGORIES = gql`
  query allSubcategories {
    allSubcategories {
      id
      name
    }
  }
`;

const SAVE_PROJECT_PERSON = gql`
  mutation saveProjectPerson($input: ProjectPersonDtoInput) {
    saveProjectPerson(input: $input) {
      ${responseGqlFields('id')}
    }
  }
`;

const pick = (key: string, label: string, query: unknown, required = true): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query } },
  validations: required ? [VALIDATOR_REQUIRED] : [],
  class: 'col-span-full md:col-span-1',
});

/** Person, position and capacity: one member of the project team. */
export const teamMemberFields = (required = true): FieldConfig[] => [
  pick('personUid', 'Person', ALL_BIO_DATA, required),
  pick('positionUid', 'Position', ALL_POSITIONS, required),
  pick('subcategoryUid', 'Capacity', ALL_SUBCATEGORIES, required),
];

export interface TeamMember {
  personUid?: string;
  positionUid?: string;
  subcategoryUid?: string;
}

/** Labels for the uids a member was picked by, so the row can be named after them. */
export interface TeamNames {
  people: Record<string, string>;
  positions: Record<string, string>;
}

/** The names behind the person and position selects, for naming new rows. */
export async function loadTeamNames(comp: BaseComponent): Promise<TeamNames> {
  const [people, positions] = await Promise.all([
    comp.fs.fetch({ query: ALL_BIO_DATA, showLoading: false }),
    comp.fs.fetch({ query: ALL_POSITIONS, showLoading: false }),
  ]);
  const byId = (rows: { id: string; name: string }[] | undefined) =>
    Object.fromEntries((rows ?? []).map((r) => [r.id, r.name]));
  return { people: byId(people), positions: byId(positions) };
}

/** Held to the column's 100 characters. */
const clip = (text: string, max = 100) => (text.length <= max ? text : text.slice(0, max));

/**
 * Adds one person to a project. The row's name and description are unique
 * across the table, so both carry the person, the position and the project.
 */
export async function addProjectPerson(
  comp: BaseComponent,
  project: { id: string; name?: string | undefined },
  member: TeamMember,
  names: TeamNames,
  notify = false,
): Promise<boolean> {
  const person = names.people[member.personUid ?? ''] ?? 'Person';
  const position = names.positions[member.positionUid ?? ''] ?? 'Member';
  const projectName = project.name ?? 'project';
  const res = await comp.fs.fetch({
    notify,
    mapData: false,
    mutation: SAVE_PROJECT_PERSON,
    variables: {
      input: {
        projectUid: project.id,
        personUid: member.personUid,
        positionUid: member.positionUid,
        subcategoryUid: member.subcategoryUid,
        name: clip(`${person} · ${position} · ${projectName}`),
        description: `${person} as ${position} on ${projectName}`,
      },
    },
  });
  return !!res?.data?.id;
}

/** Notifies the People panel that someone was added here. */
export const projectPerson$ = new Subject<unknown>();

/** Person, position and capacity only: the row's name and description are written for it. */
export async function openAddPersonForm(comp: BaseComponent, project: Lookup): Promise<void> {
  const projectUid = project?.id;
  if (!projectUid) return;
  const target = { id: projectUid, name: project.name };
  const close$ = new Subject<void>();
  const formParameter: FormParameters = {
    title: 'Add Person',
    model: {},
    closeAction$: close$,
    fields: teamMemberFields(),
    onSubmit: async (value: TeamMember) => {
      const names = await loadTeamNames(comp);
      if (await addProjectPerson(comp, target, value, names, true)) {
        projectPerson$.next(value);
        close$.next();
      }
    },
  };
  comp.vs?.openModal(FormComponent, formParameter, '50%');
}

// ----------------------------------------------------------------- tasks --

const SAVE_TASK = gql`
  mutation saveTask($input: TaskDtoInput) {
    saveTask(input: $input) {
      ${responseGqlFields('id')}
    }
  }
`;

const LINK_TASK_PROJECT = gql`
  mutation linkTaskProject($taskUid: String, $projectUid: String) {
    linkTaskProject(taskUid: $taskUid, projectUid: $projectUid) {
      ${responseGqlFields('uid')}
    }
  }
`;

const UNLINK_TASK_PROJECT = gql`
  mutation unlinkTaskProject($uid: String) {
    unlinkTaskProject(uid: $uid) {
      ${responseGqlFields('uid')}
    }
  }
`;

const TASK_PROJECTS_BY_PROJECT = gql`
  query taskProjectsByProject($projectUid: String) {
    taskProjectsByProject(projectUid: $projectUid) {
      uid
      task {
        id
        assignedNumber
        name
        description
      }
    }
  }
`;

/** Notifies the Tasks panel that a task was added to or taken off a project. */
export const projectTask$ = new Subject<unknown>();

/** Saves the task, then links it to the project — the step users used to do by hand. */
async function addTask(
  comp: BaseComponent,
  project: Lookup,
  value: Record<string, unknown>,
): Promise<boolean> {
  const name = String(value['name'] ?? '').trim();
  const description = String(value['description'] ?? '').trim();

  const saved = await comp.fs.fetch({
    notify: false,
    mapData: false,
    mutation: SAVE_TASK,
    variables: { input: { name, description } },
  });
  const taskUid = saved?.data?.id;
  if (!taskUid) return false;

  const linked = await comp.fs.fetch({
    notify: true,
    successMessage: `Task "${name}" added to the project`,
    mapData: false,
    mutation: LINK_TASK_PROJECT,
    variables: { taskUid, projectUid: project?.id },
  });
  if (!linked?.data?.uid) return false;
  projectTask$.next(linked.data);
  return true;
}

function openAddTaskForm(comp: BaseComponent, project: Lookup): void {
  if (!project?.id) return;
  const close$ = new Subject<void>();
  const formParameter: FormParameters = {
    title: 'Add Task',
    model: {},
    closeAction$: close$,
    fields: [
      {
        key: 'name',
        label: 'Task',
        hint: 'What has to be done, e.g. "Foundation works, Block A"',
        type: FieldType.input,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
      {
        key: 'description',
        label: 'Details',
        type: FieldType.textarea,
        rows: 3,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
    ],
    onSubmit: async (value: Record<string, unknown>) => {
      if (await addTask(comp, project, value)) close$.next();
    },
  };
  comp.vs?.openModal(FormComponent, formParameter, '50%');
}

/**
 * The project's tasks, through `tasks_projects`. Opening a row goes to the
 * task's own page, where its phases, milestones and team are linked.
 */
export function projectTasksPanel(
  comp: BaseComponent,
  project: Lookup | undefined,
  taskSlug: string,
): ContentParameter {
  return {
    type: 'table',
    name: 'Tasks',
    label: 'Tasks',
    icon: 'assignment',
    permissions: ['ROLE_VIEW_ALL_TASK_PROJECT', 'ROLE_VIEW_TASK_PROJECT'],
    keyColumns: [
      'index',
      'task.assignedNumber as Number',
      'task.name as Task',
      'task.description as Details',
      'actions',
    ],
    headerButtons: [
      {
        icon: 'add',
        label: 'Add Task',
        class: 'btn-add-primary',
        click: () => openAddTaskForm(comp, project as Lookup),
        permissions: ['ROLE_CREATE_TASK'],
      },
    ],
    actionButtons: [
      {
        ...MORE_BTN,
        buttons: [
          {
            icon: 'visibility',
            label: 'Open Task',
            click: (row: any) =>
              comp.router.navigate(['/settings', 'project', taskSlug, row?.task?.id]),
          },
          {
            icon: 'block',
            label: 'Remove from project',
            class: 'text-danger',
            confirmDataMapper: (row: any) => ({
              title: 'REMOVE',
              confirmText: 'REMOVE',
              confirmButtonColor: 'red',
              message: `Take <b class='text-danger'>${row?.task?.name ?? ''}</b> off this project? The task itself is kept.`,
            }),
            click: async (row: any) => {
              await comp.fs.fetch({
                notify: true,
                loadingOn: 'content',
                mutation: UNLINK_TASK_PROJECT,
                variables: { uid: row?.uid },
                successFn: (res) => projectTask$.next(res?.data),
              });
            },
            permissions: ['ROLE_DELETE_TASK_PROJECT'],
          },
        ],
      },
    ],
    reloadActions$: [projectTask$],
    fetchParameter: { query: TASK_PROJECTS_BY_PROJECT, variables: { projectUid: project?.id } },
  } as ContentParameter;
}

// --------------------------------------------------------------- buttons --

/** The project page's header buttons. */
export function projectActions(comp: BaseComponent, _project: LookupModule): ActionButton[] {
  return [
    {
      icon: 'assignment',
      label: 'Add Task',
      toolTip: 'Create a task on this project',
      hideFunction: (p?: Lookup) => !p,
      click: (p: Lookup) => openAddTaskForm(comp, p),
      permissions: ['ROLE_CREATE_TASK'],
    },
    {
      icon: 'users',
      label: 'Add Person',
      toolTip: 'Add someone to the project team',
      hideFunction: (p?: Lookup) => !p,
      click: (p: Lookup) => openAddPersonForm(comp, p),
      permissions: ['ROLE_CREATE_PROJECT_PERSON'],
    },
    {
      icon: 'flag',
      label: 'Change Status',
      toolTip: 'Move the project to its next step',
      hideFunction: (p?: Lookup) => !p,
      click: (p: Lookup) => openChangeStatusForm(comp, p),
      permissions: ['ROLE_CREATE_PROJECT_STATUS_CHANGE'],
    },
  ];
}
