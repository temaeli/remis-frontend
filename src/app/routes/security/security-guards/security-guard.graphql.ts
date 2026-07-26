import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityGuardFields = `
  firstName
  middleName
  surname
  fullName
  contact
  rank
  serviceNumber
  station { uid name }
  contractor { uid name }
  ${baseGqlFields}
`;

export const ALL_SECURITY_GUARDS_PAGEABLE = gql`
  query allSecurityGuardsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityGuardsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityGuardFields)}
    }
  }
`;

export const SECURITY_GUARDS_BY_STATION = gql`
  query securityGuardsByStation($stationUid: String){
    securityGuardsByStation(stationUid: $stationUid){
      ${securityGuardFields}
    }
  }
`;

export const FIND_SECURITY_GUARD = gql`
  query findSecurityGuard($uid: String!){
    findSecurityGuard(uid: $uid){
      ${responseGqlFields(securityGuardFields)}
    }
  }
`;

export const SAVE_SECURITY_GUARD = gql`
  mutation saveSecurityGuard($dto: SecurityGuardDtoInput){
    saveSecurityGuard(dto: $dto){
      ${responseGqlFields(securityGuardFields)}
    }
  }
`;

export const DELETE_SECURITY_GUARD = gql`
  mutation deleteSecurityGuard($uid: String){
    deleteSecurityGuard(uid: $uid){
      ${responseGqlFields(securityGuardFields)}
    }
  }
`;
