import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const wasteGenerationLogFields = `
  date
  amountGenerated
  amountRecycled
  remarks
  comment
  submittedAt
  approvedAt
  rejectedAt
  wasteCategory {
    uid
    code
    name
  }
  workingStation {
    uid
    name
  }
  createdBy {
    username
  }
  ${baseGqlFields}
`;

export const GET_ALL_WASTE_GENERATION_LOGS = gql`
  query getAllWasteGenerationLogsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllWasteGenerationLogsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(wasteGenerationLogFields)}
    }
  }
`;

export const GET_WASTE_GENERATION_LOGS_BY_CATEGORY = gql`
  query getWasteGenerationLogByWasteCategory($wasteCategoryUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getWasteGenerationLogByWasteCategory(wasteCategoryUid: $wasteCategoryUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(wasteGenerationLogFields)}
    }
  }
`;

export const GET_WASTE_GENERATION_LOG_BY_UID = gql`
  query getWasteGenerationLogByUid($uid: String!){
    getWasteGenerationLogByUid(uid: $uid){
      ${responseGqlFields(wasteGenerationLogFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_WASTE_GENERATION_LOG = gql`
  mutation createOrUpdateWasteGenerationLog($input: WasteGenerationLogDtoInput!){
    createOrUpdateWasteGenerationLog(input: $input){
      ${responseGqlFields(wasteGenerationLogFields)}
    }
  }
`;

export const DELETE_WASTE_GENERATION_LOG = gql`
  mutation deleteWasteGenerationLog($uid: String!){
    deleteWasteGenerationLog(uid: $uid){
      ${responseGqlFields(wasteGenerationLogFields)}
    }
  }
`;

export const SUBMIT_WASTE_GENERATION_LOG = gql`
  mutation submitWasteGenerationLog($uid: String!){
    submitWasteGenerationLog(uid: $uid){
      ${responseGqlFields(wasteGenerationLogFields)}
    }
  }
`;

export const APPROVE_WASTE_GENERATION_LOG = gql`
  mutation approveWasteGenerationLog($uid: String!, $comment: String!){
    approveWasteGenerationLog(uid: $uid, comment: $comment){
      ${responseGqlFields(wasteGenerationLogFields)}
    }
  }
`;

export const REJECT_WASTE_GENERATION_LOG = gql`
  mutation rejectWasteGenerationLog($uid: String!, $comment: String!){
    rejectWasteGenerationLog(uid: $uid, comment: $comment){
      ${responseGqlFields(wasteGenerationLogFields)}
    }
  }
`;
