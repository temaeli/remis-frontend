import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const securityIncidentTypeFields = `
  code
  name
  description
  orderIndex
  ${baseGqlFields}
`;

export const ALL_SECURITY_INCIDENT_TYPES = gql`
  query allSecurityIncidentTypes{
    allSecurityIncidentTypes{
      ${securityIncidentTypeFields}
    }
  }
`;

export const FIND_SECURITY_INCIDENT_TYPE = gql`
  query findSecurityIncidentType($uid: String!){
    findSecurityIncidentType(uid: $uid){
      ${responseGqlFields(securityIncidentTypeFields)}
    }
  }
`;

export const SAVE_SECURITY_INCIDENT_TYPE = gql`
  mutation saveSecurityIncidentType($dto: SecurityIncidentTypeDtoInput){
    saveSecurityIncidentType(dto: $dto){
      ${responseGqlFields(securityIncidentTypeFields)}
    }
  }
`;

export const DELETE_SECURITY_INCIDENT_TYPE = gql`
  mutation deleteSecurityIncidentType($uid: String){
    deleteSecurityIncidentType(uid: $uid){
      ${responseGqlFields(securityIncidentTypeFields)}
    }
  }
`;
