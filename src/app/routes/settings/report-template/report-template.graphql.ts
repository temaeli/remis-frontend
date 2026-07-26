import { gql } from '@apollo/client/core';
import { responseGqlFields, baseMinimalGqlFields } from '@shared/fetch/graphql.constants';

export const reportTemplateGqlFields = `
code
content
description
editable
migrated
name
subject
templateType
${baseMinimalGqlFields}

`;

//
//  Mutations
export const SAVE_REPORT_TEMPLATE = gql`
  mutation saveReportTemplate($input: ReportTemplateDtoInput!){
   saveReportTemplate(input: $input) {
      ${responseGqlFields(reportTemplateGqlFields)}
    }
  }
 `;

//  Queries
export const ALL_REPORT_TEMPLATE = gql`
  query allReportTemplate{
   allReportTemplate {
      ${reportTemplateGqlFields}
    }
  }
 `;

export const FIND_REPORT_TEMPLATE = gql`
  query findReportTemplate($uid: String!){
   findReportTemplate(uid: $uid) {
      ${responseGqlFields(reportTemplateGqlFields)}
    }
  }
 `;

export const DELETE_REPORT_TEMPLATE = gql`
  mutation deleteReportTemplate($uid: String!){
   deleteReportTemplate(uid: $uid) {
      ${responseGqlFields(reportTemplateGqlFields)}
    }
  }
 `;
