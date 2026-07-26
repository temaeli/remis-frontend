import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityFormSubmissionFields = `
  referenceNumber
  form { uid name code }
  station { uid name }
  periodStart
  periodEnd
  status
  values { uid fieldKey valueText valueNumber valueDate valueBoolean valueJson }
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid status');

export const ALL_SECURITY_FORM_SUBMISSIONS_PAGEABLE = gql`
  query allSecurityFormSubmissionsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityFormSubmissionsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityFormSubmissionFields)}
    }
  }
`;

export const SECURITY_FORM_SUBMISSIONS_BY_FORM = gql`
  query securityFormSubmissionsByForm($formUid: String){
    securityFormSubmissionsByForm(formUid: $formUid){
      ${securityFormSubmissionFields}
    }
  }
`;

export const FIND_SECURITY_FORM_SUBMISSION = gql`
  query findSecurityFormSubmission($uid: String!){
    findSecurityFormSubmission(uid: $uid){
      ${responseGqlFields(securityFormSubmissionFields)}
    }
  }
`;

export const SAVE_SECURITY_FORM_SUBMISSION = gql`
  mutation saveSecurityFormSubmission($dto: SecurityFormSubmissionDtoInput){
    saveSecurityFormSubmission(dto: $dto){
      ${responseGqlFields(securityFormSubmissionFields)}
    }
  }
`;

export const SUBMIT_SECURITY_FORM_SUBMISSION = gql`
  mutation submitSecurityFormSubmission($uid: String){
    submitSecurityFormSubmission(uid: $uid){ ${workflowReturn} }
  }
`;

export const REVIEW_SECURITY_FORM_SUBMISSION = gql`
  mutation reviewSecurityFormSubmission($dto: SecurityWorkflowActionDtoInput){
    reviewSecurityFormSubmission(dto: $dto){ ${workflowReturn} }
  }
`;

export const APPROVE_SECURITY_FORM_SUBMISSION = gql`
  mutation approveSecurityFormSubmission($dto: SecurityWorkflowActionDtoInput){
    approveSecurityFormSubmission(dto: $dto){ ${workflowReturn} }
  }
`;

export const ESCALATE_SECURITY_FORM_SUBMISSION = gql`
  mutation escalateSecurityFormSubmission($dto: SecurityWorkflowActionDtoInput){
    escalateSecurityFormSubmission(dto: $dto){ ${workflowReturn} }
  }
`;

export const CLOSE_SECURITY_FORM_SUBMISSION = gql`
  mutation closeSecurityFormSubmission($dto: SecurityWorkflowActionDtoInput){
    closeSecurityFormSubmission(dto: $dto){ ${workflowReturn} }
  }
`;

export const GET_SECURITY_FORM_FIELDS = gql`
  query securityFormFields($formUid: String!){
    securityFormFields(formUid: $formUid){
      uid
      fieldKey
      label
      fieldType
      required
      orderIndex
      section
      hint
      optionsCsv
    }
  }
`;
