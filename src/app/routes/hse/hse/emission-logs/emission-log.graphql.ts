import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const emissionLogFields = `
  date
  amountEmitted
  unitOfMeasure
  remarks
  comment
  submittedAt
  approvedAt
  rejectedAt
  emissionSubstance {
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

export const GET_ALL_EMISSION_LOGS = gql`
  query getAllEmissionLogsPageable($active: Boolean, $pageableParam: PageableParamInput!){
    getAllEmissionLogsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(emissionLogFields)}
    }
  }
`;

export const GET_EMISSION_LOGS_BY_SUBSTANCE = gql`
  query getEmissionLogByEmissionSubstance($emissionSubstanceUid: String!, $active: Boolean, $pageableParam: PageableParamInput!){
    getEmissionLogByEmissionSubstance(emissionSubstanceUid: $emissionSubstanceUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(emissionLogFields)}
    }
  }
`;

export const GET_EMISSION_LOG_BY_UID = gql`
  query getEmissionLogByUid($uid: String!){
    getEmissionLogByUid(uid: $uid){
      ${responseGqlFields(emissionLogFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_EMISSION_LOG = gql`
  mutation createOrUpdateEmissionLog($input: EmissionLogDtoInput!){
    createOrUpdateEmissionLog(input: $input){
      ${responseGqlFields(emissionLogFields)}
    }
  }
`;

export const DELETE_EMISSION_LOG = gql`
  mutation deleteEmissionLog($uid: String!){
    deleteEmissionLog(uid: $uid){
      ${responseGqlFields(emissionLogFields)}
    }
  }
`;

export const SUBMIT_EMISSION_LOG = gql`
  mutation submitEmissionLog($uid: String!){
    submitEmissionLog(uid: $uid){
      ${responseGqlFields(emissionLogFields)}
    }
  }
`;

export const APPROVE_EMISSION_LOG = gql`
  mutation approveEmissionLog($uid: String!, $comment: String!){
    approveEmissionLog(uid: $uid, comment: $comment){
      ${responseGqlFields(emissionLogFields)}
    }
  }
`;

export const REJECT_EMISSION_LOG = gql`
  mutation rejectEmissionLog($uid: String!, $comment: String!){
    rejectEmissionLog(uid: $uid, comment: $comment){
      ${responseGqlFields(emissionLogFields)}
    }
  }
`;
