import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityGuardAttendanceFields = `
  guard { uid fullName }
  guardName
  station { uid name }
  attendanceDate
  status
  remarks
  ${baseGqlFields}
`;

export const ALL_SECURITY_GUARD_ATTENDANCES_PAGEABLE = gql`
  query allSecurityGuardAttendancesPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityGuardAttendancesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityGuardAttendanceFields)}
    }
  }
`;

export const SAVE_SECURITY_GUARD_ATTENDANCE = gql`
  mutation saveSecurityGuardAttendance($dto: SecurityGuardAttendanceDtoInput){
    saveSecurityGuardAttendance(dto: $dto){
      ${responseGqlFields(securityGuardAttendanceFields)}
    }
  }
`;
