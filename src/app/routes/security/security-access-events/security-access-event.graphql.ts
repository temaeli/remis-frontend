import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityAccessEventFields = `
  station { uid name }
  personName
  personType
  staffUser { uid fullName }
  companyOrDepartment
  purpose
  credentialType
  result
  eventTime
  authorizedBy
  remarks
  ${baseGqlFields}
`;

export const ALL_SECURITY_ACCESS_EVENTS_PAGEABLE = gql`
  query allSecurityAccessEventsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityAccessEventsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityAccessEventFields)}
    }
  }
`;

export const FIND_SECURITY_ACCESS_EVENT = gql`
  query findSecurityAccessEvent($uid: String!){
    findSecurityAccessEvent(uid: $uid){
      ${responseGqlFields(securityAccessEventFields)}
    }
  }
`;

export const SAVE_SECURITY_ACCESS_EVENT = gql`
  mutation saveSecurityAccessEvent($dto: SecurityAccessEventDtoInput){
    saveSecurityAccessEvent(dto: $dto){
      ${responseGqlFields(securityAccessEventFields)}
    }
  }
`;
