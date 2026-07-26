import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

// Construction SOP GraphQL Fields
export const constructionSopRecordGqlFields = `
approvedAt
approver{
 id
 uid
 fullName
}
approverComments
checklistItems{
 id
 uid
 ordering
 description
 outcome
 comment
 evidenceAttachmentUrl
}
executionDate
executionTime
fieldEngineer{
 id
 uid
 fullName
}
migrated
nonConformities{
 id
 uid
}
qcInspector{
 id
 uid
 fullName
}
referenceNumber
reviewedAt
sop{
id
uid
name
}
status
submittedAt
summary
supervisor{
 id
 uid
 fullName
}
teamId
location
${baseGqlFields}
`;

export const sopCatalogEntryGqlFields = `
code
description
migrated
name
version
purpose
scope
responsibilities
procedureSteps
referenceDocuments
tools
attachmentUrl
${baseGqlFields}
`;

export const sopCatalogVersionGqlFields = `
sop{
 id
 uid
 name
}
version
changeNote
name
description
purpose
scope
responsibilities
procedureSteps
referenceDocuments
tools
attachmentUrl
${baseGqlFields}
`;

export const constructionSopAssignmentGqlFields = `
sop{
 id
 uid
 name
}
scope
project{
 id
 uid
 name
}
category{
 id
 uid
 name
}
activity{
 id
 uid
 name
}
${baseGqlFields}
`;

export const constructionNonConformityGqlFields = `
correctiveAction
description
dueDate
migrated
record{
id
uid
}
resolutionNotes
responsibleParty{
 id
 uid
 fullName
}
status
${baseGqlFields}
`;

export const constructionSopChecklistItemGqlFields = `
comment
description
evidenceAttachmentUrl
migrated
ordering
outcome
record{
 id
 uid
}
 ${baseGqlFields}
`;

// Construction SOP Mutations
export const SAVE_CONSTRUCTION_SOP_RECORD = gql`
  mutation saveConstructionSopRecord($dto: ConstructionSopRecordDtoInput){
   saveConstructionSopRecord(dto: $dto) {
      ${responseGqlFields(constructionSopRecordGqlFields)}
    }
  }
 `;

export const REVIEW_CONSTRUCTION_SOP_RECORD = gql`
  mutation reviewConstructionSopRecord($dto: WorkflowActionDtoInput){
    reviewConstructionSopRecord(dto: $dto) {
      ${responseGqlFields(constructionSopRecordGqlFields)}
    }
  }
`;
export const SUBMIT_CONSTRUCTION_SOP_RECORD = gql`
  mutation submitConstructionSopRecord($dto: WorkflowActionDtoInput){
    submitConstructionSopRecord(dto: $dto) {
      ${responseGqlFields(constructionSopRecordGqlFields)}
    }
  }
`;

export const APPROVE_CONSTRUCTION_SOP_RECORD = gql`
  mutation approveConstructionSopRecord($dto: WorkflowActionDtoInput){
    approveConstructionSopRecord(dto: $dto) {
      ${responseGqlFields(constructionSopRecordGqlFields)}
    }
  }
`;

export const REJECT_CONSTRUCTION_SOP_RECORD = gql`
  mutation rejectConstructionSopRecord($dto: WorkflowActionDtoInput){
    rejectConstructionSopRecord(dto: $dto) {
      ${responseGqlFields(constructionSopRecordGqlFields)}
    }
  }
`;

export const RECORD_CONSTRUCTION_NON_CONFORMITY = gql`
  mutation recordConstructionNonConformity($dto: ConstructionNonConformityDtoInput){
    recordConstructionNonConformity(dto: $dto) {
      ${responseGqlFields(constructionNonConformityGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_SOP_RECORD = gql`
  mutation deleteConstructionSopRecord($uid: String){
   deleteConstructionSopRecord(uid: $uid) {
      ${responseGqlFields(constructionSopRecordGqlFields)}
    }
  }
 `;

// Construction SOP Queries
export const CONSTRUCTION_SOP_CATALOG = gql`
  query constructionSopCatalog {
    constructionSopCatalog {
      ${sopCatalogEntryGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_SOP_RECORDS = gql`
  query allConstructionSopRecords{
   allConstructionSopRecords {
      ${constructionSopRecordGqlFields}
    }
  }
 `;

export const ALL_CONSTRUCTION_SOP_RECORDS_PAGEABLE = gql`
  query allConstructionSopRecordsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allConstructionSopRecordsPageable(pageableParam: $pageableParam, active: $active) {
     ${pageGqlFields(constructionSopRecordGqlFields)}
    }
  }
 `;

export const FIND_CONSTRUCTION_SOP_RECORD = gql`
  query findConstructionSopRecord($uid: String){
   findConstructionSopRecord(uid: $uid) {
      ${responseGqlFields(constructionSopRecordGqlFields)}
    }
  }
 `;

export const CONSTRUCTION_SOP_CHECKLIST = gql`
  query constructionSopChecklist($recordUid: String) {
    constructionSopChecklist(recordUid: $recordUid) {
      ${constructionSopChecklistItemGqlFields}
  }
}
`;

export const CONSTRUCTION_NON_CONFORMITIES = gql`
  query constructionNonConformities($recordUid: String) {
    constructionNonConformities(recordUid: $recordUid) {
      ${constructionNonConformityGqlFields}
    }
  }
`;

// POST /graphql - constructionSopCatalog
// POST /graphql - saveConstructionSopRecord
// POST /graphql - submitConstructionSopRecord
// POST /graphql - recordConstructionNonConformity
// POST /graphql - reviewConstructionSopRecord
// POST /graphql - approveConstructionSopRecord
// POST /graphql - rejectConstructionSopRecord
// POST /graphql - allConstructionSopRecords
// POST /graphql - allConstructionSopRecordsPageable
// POST /graphql - findConstructionSopRecord
// POST /graphql - deleteConstructionSopRecord
// POST /graphql - constructionSopChecklist
// POST /graphql - constructionNonConformities
