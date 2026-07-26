import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

// An InspectionChecklist row IS an answer: `answer` holds the ChecklistAnswers
// enum name, `question` is the denormalized question text, `checklistItem`
// links back to the InspectionTypeChecklist (its uid === the answered questionUid).
export const inspectionChecklistAnswerFields = `
  answer
  question
  remarks
  checklistItem {
    uid
  }
  ${baseGqlFields}
`;

// Richer field set for the per-answer detail (view) modal: pulls the source
// question's guidance (description), group + mandatory flag, and audit timestamps.
export const inspectionChecklistAnswerDetailFields = `
  answer
  question
  remarks
  checklistItem {
    uid
    question
    groupName
    mandatory
    description
  }
  ${baseGqlFields}
`;

export const GET_INSPECTION_CHECKLIST_ANSWER_BY_UID = gql`
  query getInspectionChecklistAnswerByUid($uid: String!){
    getInspectionChecklistAnswerByUid(uid: $uid){
      ${responseGqlFields(inspectionChecklistAnswerDetailFields)}
    }
  }
`;

export const GET_INSPECTION_CHECKLIST_ANSWERS_BY_INSPECTION = gql`
  query getInspectionChecklistAnswersByInspectionPageable($inspectionUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getInspectionChecklistAnswersByInspectionPageable(inspectionUid: $inspectionUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(inspectionChecklistAnswerFields)}
    }
  }
`;

// Bulk create/update: takes a list of answers + the inspection (plan) uid.
// Returns Response<List<InspectionChecklist>> (the saved rows under `data`).
export const CREATE_OR_UPDATE_INSPECTION_CHECKLIST_ANSWERS = gql`
  mutation createOrUpdateInspectionChecklistAnswer($inspectionUid: String!, $answers: [InspectionChecklistAnswerDtoInput]){
    createOrUpdateInspectionChecklistAnswer(inspectionUid: $inspectionUid, answers: $answers){
      ${responseGqlFields(inspectionChecklistAnswerFields)}
    }
  }
`;

export const DELETE_INSPECTION_CHECKLIST_ANSWER = gql`
  mutation deleteInspectionChecklistAnswer($uid: String!){
    deleteInspectionChecklistAnswer(uid: $uid){
      ${responseGqlFields(inspectionChecklistAnswerFields)}
    }
  }
`;
