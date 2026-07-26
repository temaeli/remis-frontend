import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const inspectionPlanFields = `
  station
  area
  category
  inspectionDate
  closedAt
  inspectedAt
  observation
  recommendation
  endorsementOfDoer
  remarks
  type {
    uid
    name
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const inspectionAttachmentFields = `
  attachmentTitle
  filePath
  mediaType
  mediaSize
  sourceId
  sourceName
  ${baseGqlFields}
`;

export const GET_ALL_INSPECTION_PLANS = gql`
  query getAllInspectionPlansPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllInspectionPlansPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(inspectionPlanFields)}
    }
  }
`;

export const GET_INSPECTION_PLAN_BY_UID = gql`
  query getInspectionPlanByUid($uid: String!){
    getInspectionPlanByUid(uid: $uid){
      ${responseGqlFields(inspectionPlanFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INSPECTION_PLAN = gql`
  mutation createOrUpdateInspectionPlan($inspectionTypeUid: String!, $input: InspectionPlanDtoInput!){
    createOrUpdateInspectionPlan(inspectionTypeUid: $inspectionTypeUid, input: $input){
      ${responseGqlFields(inspectionPlanFields)}
    }
  }
`;

export const DELETE_INSPECTION_PLAN = gql`
  mutation deleteInspectionPlan($uid: String!){
    deleteInspectionPlan(uid: $uid){
      ${responseGqlFields(inspectionPlanFields)}
    }
  }
`;

export const EXECUTE_INSPECTION_PLAN = gql`
  mutation executeInspectionPlan(
    $uid: String!,
    $observations: String!,
    $recommendation: String!,
    $yourEndorsement: String!
  ){
    executeInspectionPlan(
      uid: $uid,
      observations: $observations,
      recommendation: $recommendation,
      yourEndorsement: $yourEndorsement
    ){
      ${responseGqlFields(inspectionPlanFields)}
    }
  }
`;

export const CLOSE_INSPECTION_PLAN = gql`
  mutation closeInspectionPlan($planUid: String!, $remarks: String!){
    closeInspectionPlan(planUid: $planUid, remarks: $remarks){
      ${responseGqlFields(inspectionPlanFields)}
    }
  }
`;

// Attachments
export const GET_INSPECTION_ATTACHMENTS = gql`
  query getInspectionAttachments($planUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getInspectionAttachments(planUid: $planUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(inspectionAttachmentFields)}
    }
  }
`;

export const SAVE_OR_UPDATE_INSPECTION_ATTACHMENT = gql`
  mutation saveOrUpdateInspectionAttachment($planUid: String!, $attachmentDto: AttachmentDtoInput!){
    saveOrUpdateInspectionAttachment(planUid: $planUid, attachmentDto: $attachmentDto){
      ${responseGqlFields(inspectionAttachmentFields)}
    }
  }
`;

export const DELETE_INSPECTION_ATTACHMENT = gql`
  mutation deleteInspectionAttachment($attachmentUid: String!){
    deleteInspectionAttachment(attachmentUid: $attachmentUid){
      ${responseGqlFields(inspectionAttachmentFields)}
    }
  }
`;
