import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityGuardRosterFields = `
  referenceNumber
  station { uid name }
  contractor { uid name }
  weekStart
  weekEnd
  status
  preparedByUser { uid fullName }
  approvedByUser { uid fullName }
  entries { uid guardName dutyDate shift guard { uid fullName } }
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid status');

export const ALL_SECURITY_GUARD_ROSTERS_PAGEABLE = gql`
  query allSecurityGuardRostersPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityGuardRostersPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityGuardRosterFields)}
    }
  }
`;

export const SECURITY_GUARD_ROSTERS_BY_STATION = gql`
  query securityGuardRostersByStation($stationUid: String){
    securityGuardRostersByStation(stationUid: $stationUid){
      ${securityGuardRosterFields}
    }
  }
`;

export const FIND_SECURITY_GUARD_ROSTER = gql`
  query findSecurityGuardRoster($uid: String!){
    findSecurityGuardRoster(uid: $uid){
      ${responseGqlFields(securityGuardRosterFields)}
    }
  }
`;

export const SAVE_SECURITY_GUARD_ROSTER = gql`
  mutation saveSecurityGuardRoster($dto: SecurityGuardRosterDtoInput){
    saveSecurityGuardRoster(dto: $dto){
      ${responseGqlFields(securityGuardRosterFields)}
    }
  }
`;

export const SUBMIT_SECURITY_GUARD_ROSTER = gql`
  mutation submitSecurityGuardRoster($uid: String){
    submitSecurityGuardRoster(uid: $uid){ ${workflowReturn} }
  }
`;

export const REVIEW_SECURITY_GUARD_ROSTER = gql`
  mutation reviewSecurityGuardRoster($dto: SecurityWorkflowActionDtoInput){
    reviewSecurityGuardRoster(dto: $dto){ ${workflowReturn} }
  }
`;
