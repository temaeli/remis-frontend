import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityFormFields = `
  code
  name
  description
  category
  periodicity
  docRef
  versionLabel
  workflowEnabled
  requiresApproval
  ${baseGqlFields}
`;

export const ALL_SECURITY_FORMS = gql`
  query allSecurityForms{
    allSecurityForms{
      ${securityFormFields}
    }
  }
`;

export const ALL_SECURITY_FORMS_PAGEABLE = gql`
  query allSecurityFormsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityFormsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityFormFields)}
    }
  }
`;

export const SECURITY_FORMS_BY_CATEGORY = gql`
  query securityFormsByCategory($category: SecurityFormCategory){
    securityFormsByCategory(category: $category){
      ${securityFormFields}
    }
  }
`;

export const FIND_SECURITY_FORM = gql`
  query findSecurityForm($uid: String!){
    findSecurityForm(uid: $uid){
      ${responseGqlFields(securityFormFields)}
    }
  }
`;

export const SAVE_SECURITY_FORM = gql`
  mutation saveSecurityForm($dto: SecurityFormDtoInput){
    saveSecurityForm(dto: $dto){
      ${responseGqlFields(securityFormFields)}
    }
  }
`;

export const DELETE_SECURITY_FORM = gql`
  mutation deleteSecurityForm($uid: String){
    deleteSecurityForm(uid: $uid){
      ${responseGqlFields(securityFormFields)}
    }
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
