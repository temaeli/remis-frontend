import { gql } from '@apollo/client/core';

import { EntityLinkConfig } from '@shared/lookup';

/**
 * The grades an object or a material carries, and the people, units and tasks a
 * case concerns — five two-column join tables, each read from both ends:
 *
 *   objectsid_grades     objects   <-> grades
 *   materials_grades     materials <-> grades
 *   units_processes      units     <-> cases
 *   tasks_processes      tasks     <-> cases
 *   bio_data_processes   people    <-> cases
 *
 * Declared here rather than in any registry. The owners are spread across the
 * reference, project, unit and workflow lookups, and those import each other
 * already; everything needed — the reads, and the lists the link form picks
 * from — is declared here so none of them has to import another for it.
 *
 * `processes` is shown as a case, as the workflow screens call it.
 */

const ALL_GRADES = gql`
  query allGrades {
    allGrades {
      id
      name
    }
  }
`;

const ALL_OBJECTS_IDS = gql`
  query allObjectsIds {
    allObjectsIds {
      id
      name
    }
  }
`;

const ALL_MATERIALS = gql`
  query allMaterials {
    allMaterials {
      id
      name
    }
  }
`;

const ALL_PROCESSES = gql`
  query allProcesses {
    allProcesses {
      id
      name
    }
  }
`;

const ALL_UNITS = gql`
  query allUnits {
    allUnits {
      id
      name
    }
  }
`;

const ALL_TASKS = gql`
  query allTasks {
    allTasks {
      id
      name
    }
  }
`;

const ALL_BIO_DATA = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

//  Grades, from the object's and the material's side.

export const OBJECTS_ID_GRADE_LINK: EntityLinkConfig = {
  entity: 'ObjectsIdGrade',
  byOwnerQuery: 'objectsIdGradesByObjectsId',
  ownerArg: 'objectsIdUid',
  targetArg: 'gradeUid',
  field: 'grade',
  label: 'Grade',
  pluralLabel: 'Grades',
  icon: 'grade',
  permission: 'OBJECTS_ID_GRADE',
  optionsQuery: ALL_GRADES,
};

export const MATERIAL_GRADE_LINK: EntityLinkConfig = {
  entity: 'MaterialGrade',
  byOwnerQuery: 'materialGradesByMaterial',
  ownerArg: 'materialUid',
  targetArg: 'gradeUid',
  field: 'grade',
  label: 'Grade',
  pluralLabel: 'Grades',
  icon: 'grade',
  permission: 'MATERIAL_GRADE',
  optionsQuery: ALL_GRADES,
};

/** The same two tables from the grade's side. */
export const GRADE_LINKS: EntityLinkConfig[] = [
  {
    entity: 'ObjectsIdGrade',
    byOwnerQuery: 'objectsIdGradesByGrade',
    ownerArg: 'gradeUid',
    targetArg: 'objectsIdUid',
    field: 'objectsId',
    label: 'Object',
    pluralLabel: 'Objects',
    icon: 'category',
    permission: 'OBJECTS_ID_GRADE',
    optionsQuery: ALL_OBJECTS_IDS,
  },
  {
    entity: 'MaterialGrade',
    byOwnerQuery: 'materialGradesByGrade',
    ownerArg: 'gradeUid',
    targetArg: 'materialUid',
    field: 'material',
    label: 'Material',
    pluralLabel: 'Materials',
    icon: 'package',
    permission: 'MATERIAL_GRADE',
    optionsQuery: ALL_MATERIALS,
  },
];

//  Cases, from the unit's, the task's and the person's side.

/** One side's cases. The backend pluralises Process as Processes. */
const processLink = (
  entity: string,
  byOwnerQuery: string,
  ownerArg: string,
  permission: string,
): EntityLinkConfig => ({
  entity,
  byOwnerQuery,
  ownerArg,
  targetArg: 'processUid',
  field: 'process',
  label: 'Case',
  pluralLabel: 'Cases',
  icon: 'process',
  permission,
  optionsQuery: ALL_PROCESSES,
});

export const UNIT_PROCESS_LINK = processLink(
  'UnitProcess',
  'unitProcessesByUnit',
  'unitUid',
  'UNIT_PROCESS',
);

export const TASK_PROCESS_LINK = processLink(
  'TaskProcess',
  'taskProcessesByTask',
  'taskUid',
  'TASK_PROCESS',
);

export const BIO_DATA_PROCESS_LINK = processLink(
  'BioDataProcess',
  'bioDataProcessesByBioData',
  'bioDataUid',
  'BIO_DATA_PROCESS',
);

/** The same three tables from the case's side. */
export const PROCESS_LINKS: EntityLinkConfig[] = [
  {
    entity: 'BioDataProcess',
    byOwnerQuery: 'bioDataProcessesByProcess',
    ownerArg: 'processUid',
    targetArg: 'bioDataUid',
    field: 'bioData',
    label: 'Person',
    pluralLabel: 'People',
    icon: 'person',
    permission: 'BIO_DATA_PROCESS',
    optionsQuery: ALL_BIO_DATA,
    // bio_data is not a CoreNamedEntity — no assignedNumber to select.
    targetGqlFields: `
    id
    uid: id
    name
  `,
    columns: ['index', 'bioData.name as Person', 'actions'],
  },
  {
    entity: 'UnitProcess',
    byOwnerQuery: 'unitProcessesByProcess',
    ownerArg: 'processUid',
    targetArg: 'unitUid',
    field: 'unit',
    label: 'Unit',
    pluralLabel: 'Units',
    icon: 'domain',
    permission: 'UNIT_PROCESS',
    optionsQuery: ALL_UNITS,
  },
  {
    entity: 'TaskProcess',
    byOwnerQuery: 'taskProcessesByProcess',
    ownerArg: 'processUid',
    targetArg: 'taskUid',
    field: 'task',
    label: 'Task',
    pluralLabel: 'Tasks',
    icon: 'assignment',
    permission: 'TASK_PROCESS',
    optionsQuery: ALL_TASKS,
  },
];
