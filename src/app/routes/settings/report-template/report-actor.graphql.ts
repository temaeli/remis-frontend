import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

// Report approval-chain actor: a role + sequence + stage (ReportStageEnum),
// hung off a ReportTemplate.
export const reportActorFields = `
  sequence
  action
  role {
    uid
    name
  }
  ${baseGqlFields}
`;

export const GET_REPORT_ACTORS_BY_TEMPLATE = gql`
  query getReportActorsByTemplate($templateUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getReportActorsByTemplate(templateUid: $templateUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(reportActorFields)}
    }
  }
`;

export const FIND_REPORT_ACTOR = gql`
  query findReportActor($uid: String!){
    findReportActor(uid: $uid){
      ${responseGqlFields(reportActorFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_REPORT_ACTOR = gql`
  mutation createOrUpdateReportActor($templateUid: String!, $input: ReportActorDtoInput!){
    createOrUpdateReportActor(templateUid: $templateUid, input: $input){
      ${responseGqlFields(reportActorFields)}
    }
  }
`;

export const DELETE_REPORT_ACTOR = gql`
  mutation deleteReportActor($uid: String!){
    deleteReportActor(uid: $uid){
      ${responseGqlFields(reportActorFields)}
    }
  }
`;
