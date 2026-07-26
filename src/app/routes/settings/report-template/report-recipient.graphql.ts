import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

// Report recipient: external/notified contact of a generated report, hung off
// a ReportTemplate.
export const reportRecipientFields = `
  email
  name
  title
  phone
  address
  ${baseGqlFields}
`;

export const GET_REPORT_RECIPIENTS_BY_TEMPLATE = gql`
  query getReportRecipientsByTemplate($templateUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getReportRecipientsByTemplate(templateUid: $templateUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(reportRecipientFields)}
    }
  }
`;

export const FIND_REPORT_RECIPIENT = gql`
  query findReportRecipient($uid: String!){
    findReportRecipient(uid: $uid){
      ${responseGqlFields(reportRecipientFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_REPORT_RECIPIENT = gql`
  mutation createOrUpdateReportRecipient($templateUid: String!, $input: ReportRecipientDtoInput!){
    createOrUpdateReportRecipient(templateUid: $templateUid, input: $input){
      ${responseGqlFields(reportRecipientFields)}
    }
  }
`;

export const DELETE_REPORT_RECIPIENT = gql`
  mutation deleteReportRecipient($uid: String!){
    deleteReportRecipient(uid: $uid){
      ${responseGqlFields(reportRecipientFields)}
    }
  }
`;
