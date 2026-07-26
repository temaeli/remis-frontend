import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const securityContractorFields = `
  code
  name
  description
  ${baseGqlFields}
`;

export const ALL_SECURITY_CONTRACTORS = gql`
  query allSecurityContractors{
    allSecurityContractors{
      ${securityContractorFields}
    }
  }
`;

export const FIND_SECURITY_CONTRACTOR = gql`
  query findSecurityContractor($uid: String!){
    findSecurityContractor(uid: $uid){
      ${responseGqlFields(securityContractorFields)}
    }
  }
`;

export const SAVE_SECURITY_CONTRACTOR = gql`
  mutation saveSecurityContractor($dto: SecurityContractorDtoInput){
    saveSecurityContractor(dto: $dto){
      ${responseGqlFields(securityContractorFields)}
    }
  }
`;

export const DELETE_SECURITY_CONTRACTOR = gql`
  mutation deleteSecurityContractor($uid: String){
    deleteSecurityContractor(uid: $uid){
      ${responseGqlFields(securityContractorFields)}
    }
  }
`;
