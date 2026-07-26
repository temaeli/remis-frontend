import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityGatePassFields = `
  referenceNumber
  serialNo
  company
  vehicleNo
  station { uid name }
  otherStation
  passDate
  initiatedByName
  comments
  status
  items { uid materialDescription quantity itemRefNo itemStatus unitOfMeasure returnDetails expectedReturnDate }
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid status');

export const ALL_SECURITY_GATE_PASSES_PAGEABLE = gql`
  query allSecurityGatePassesPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityGatePassesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityGatePassFields)}
    }
  }
`;

export const FIND_SECURITY_GATE_PASS = gql`
  query findSecurityGatePass($uid: String!){
    findSecurityGatePass(uid: $uid){
      ${responseGqlFields(securityGatePassFields)}
    }
  }
`;

export const SAVE_SECURITY_GATE_PASS = gql`
  mutation saveSecurityGatePass($dto: SecurityGatePassDtoInput){
    saveSecurityGatePass(dto: $dto){
      ${responseGqlFields(securityGatePassFields)}
    }
  }
`;

export const REVIEW_SECURITY_GATE_PASS = gql`
  mutation reviewSecurityGatePass($dto: SecurityWorkflowActionDtoInput){
    reviewSecurityGatePass(dto: $dto){ ${workflowReturn} }
  }
`;

export const APPROVE_SECURITY_GATE_PASS = gql`
  mutation approveSecurityGatePass($dto: SecurityWorkflowActionDtoInput){
    approveSecurityGatePass(dto: $dto){ ${workflowReturn} }
  }
`;

export const SECURITY_CHECK_GATE_PASS = gql`
  mutation securityCheckGatePass($dto: SecurityWorkflowActionDtoInput){
    securityCheckGatePass(dto: $dto){ ${workflowReturn} }
  }
`;

export const CLOSE_SECURITY_GATE_PASS = gql`
  mutation closeSecurityGatePass($dto: SecurityWorkflowActionDtoInput){
    closeSecurityGatePass(dto: $dto){ ${workflowReturn} }
  }
`;
