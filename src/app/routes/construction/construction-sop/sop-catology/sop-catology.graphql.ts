import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import {
  sopCatalogEntryGqlFields,
  sopCatalogVersionGqlFields,
  constructionSopAssignmentGqlFields,
} from '../construction-sop.graphql';

export const ALL_SOP_CATALOG_ENTRIES_PAGEABLE = gql`
  query allSopCatalogEntriesPageable($active: Boolean, $pageableParam: PageableParamInput) {
    allSopCatalogEntriesPageable(active: $active, pageableParam: $pageableParam) {
      ${pageGqlFields(sopCatalogEntryGqlFields)}
    }
  }
`;

export const FIND_SOP_CATALOG_ENTRY = gql`
  query findSopCatalogEntry($uid: String) {
    findSopCatalogEntry(uid: $uid) {
      ${responseGqlFields(sopCatalogEntryGqlFields)}
    }
  }
`;

export const SAVE_SOP_CATALOG_ENTRY = gql`
  mutation saveSopCatalogEntry($dto: SopCatalogEntryDtoInput) {
    saveSopCatalogEntry(dto: $dto) {
      ${responseGqlFields(sopCatalogEntryGqlFields)}
    }
  }
`;

export const DELETE_SOP_CATALOG_ENTRY = gql`
  mutation deleteSopCatalogEntry($uid: String) {
    deleteSopCatalogEntry(uid: $uid) {
      ${responseGqlFields(sopCatalogEntryGqlFields)}
    }
  }
`;

export const SOP_CATALOG_VERSION_HISTORY = gql`
  query sopCatalogVersionHistory($sopUid: String) {
    sopCatalogVersionHistory(sopUid: $sopUid) {
      ${sopCatalogVersionGqlFields}
    }
  }
`;

// ── SOP-to-WBS assignment ────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_SOP_ASSIGNMENT = gql`
  mutation saveConstructionSopAssignment($dto: ConstructionSopAssignmentDtoInput) {
    saveConstructionSopAssignment(dto: $dto) {
      ${responseGqlFields(constructionSopAssignmentGqlFields)}
    }
  }
`;

export const CONSTRUCTION_SOP_ASSIGNMENTS_FOR_SOP = gql`
  query constructionSopAssignmentsForSop($sopUid: String) {
    constructionSopAssignmentsForSop(sopUid: $sopUid) {
      ${constructionSopAssignmentGqlFields}
    }
  }
`;

export const CONSTRUCTION_SOP_ASSIGNMENTS_FOR_PROJECT = gql`
  query constructionSopAssignmentsForProject($projectUid: String) {
    constructionSopAssignmentsForProject(projectUid: $projectUid) {
      ${constructionSopAssignmentGqlFields}
    }
  }
`;

export const CONSTRUCTION_SOP_ASSIGNMENTS_FOR_CATEGORY = gql`
  query constructionSopAssignmentsForCategory($categoryUid: String) {
    constructionSopAssignmentsForCategory(categoryUid: $categoryUid) {
      ${constructionSopAssignmentGqlFields}
    }
  }
`;

export const CONSTRUCTION_SOP_ASSIGNMENTS_FOR_ACTIVITY = gql`
  query constructionSopAssignmentsForActivity($activityUid: String) {
    constructionSopAssignmentsForActivity(activityUid: $activityUid) {
      ${constructionSopAssignmentGqlFields}
    }
  }
`;

export const DELETE_CONSTRUCTION_SOP_ASSIGNMENT = gql`
  mutation deleteConstructionSopAssignment($uid: String) {
    deleteConstructionSopAssignment(uid: $uid) {
      ${responseGqlFields(constructionSopAssignmentGqlFields)}
    }
  }
`;

// POST /graphql - allSopCatalogEntriesPageable
// POST /graphql - findSopCatalogEntry
// POST /graphql - saveSopCatalogEntry
// POST /graphql - deleteSopCatalogEntry
// POST /graphql - sopCatalogVersionHistory
// POST /graphql - saveConstructionSopAssignment
// POST /graphql - constructionSopAssignmentsForSop
// POST /graphql - constructionSopAssignmentsForProject
// POST /graphql - constructionSopAssignmentsForCategory
// POST /graphql - constructionSopAssignmentsForActivity
// POST /graphql - deleteConstructionSopAssignment
