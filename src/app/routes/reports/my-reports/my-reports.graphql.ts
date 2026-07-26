import { gql } from 'apollo-angular';
import { baseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

// Inbox rows need two things the standard list fragments omit:
//  - `createdBy { uid }` to split "Created by Me" from "Awaiting My Action"
//    client-side (compared against the localStorage userUid), and
//  - the current stage's assigned-role permissions to gate the awaiting queue
//    via canActOnCurrentStage.
// `createdBy` is selectable on every Report because BaseEntity annotates the
// (otherwise @JsonIgnore) field with @GraphQLQuery.
export const myReportFields = `
  section
  startDate
  endDate
  summaryType
  status
  template {
    uid
    name
    templateType
  }
  currentStage {
    assignedTo {
      uid
      sequence
      action
      role {
        uid
        name
        permissionList {
          name
        }
      }
    }
    status
    ${baseGqlFields}
  }
  createdBy {
    uid
  }
  ${baseGqlFields}
`;

// Single backend op (`getMyReports`) shared by both the Pipeline and EWURA
// inboxes; the caller scopes it with `filter.section` (PIPELINE vs REPORT).
export const GET_MY_REPORTS = gql`
  query getMyReports($filter: ReportFilterDtoInput, $pageableParam: PageableParamInput) {
    getMyReports(filter: $filter, pageableParam: $pageableParam) {
      ${pageGqlFields(myReportFields)}
    }
  }
`;
