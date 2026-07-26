import { gql } from '@apollo/client/core';
import { pipelineSegmentFields } from '@routes/pipeline-management/segments/segment.graphql';
import { plantGqlFields } from '@routes/plants/plants/plant.graphql';
import { responseGqlFields, pageGqlFields, baseGqlFields } from '@shared/fetch/graphql.constants';

export const clientMinimalGqlFields = `
  user{
    uid
    fullName
  }
  code
  tin
  contactPersonEmail
  contactPersonName
  contactPersonPhone
  email
  logoUrl
  uid
`;

export const clientsGqlFields = `
accountNumber
approvalComments
approvalStatus
approvedAt
approvedById
registrationStage
reviewComments
reviewedAt
reviewedById
blockNumber
clientStatus
clientStreamType
code
contactPersonEmail
contactPersonName
contactPersonPhone
email
fax
identificationType
logoUrl
migrated
phone
plant{
 id
 uid
 name
}
postalAddress
productionCapacityMmscfd
subWard{
 id
 uid
 name
 ward{
  id
  uid
  name
  district{
   id
   uid
   name
   region{
    id
    uid
    name
   }
  }
 }
}
tin
tinVerificationStatus
tinVerifiedAt
user{
 id
 uid
 fullName
}
vrn
installedAreas{
active
activeConnections
notActiveConnections
notes
}
pipelineSegment{
 ${pipelineSegmentFields}
}
 plant{
  ${plantGqlFields}
 }
categories{
  code
  description
  id
  name
  uid
  }
${baseGqlFields}
`;

//  Mutations
export const SAVE_CLIENT = gql`
  mutation registerClient($input: ClientSelfRegistrationDtoInput!){
   registerClient(input: $input) {
      ${responseGqlFields(clientsGqlFields)}
    }
  }
 `;

//  Queries
export const ALL_CLIENT = gql`
  query allClient{
   allClient {
      ${clientsGqlFields}
    }
  }
 `;

export const ALL_CLIENT_PAGEABLE = gql`
  query allClientPageable($pageableParam: PageableParamInput, $active: Boolean){
   allClientPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(clientsGqlFields)}
    }
  }
 `;

export const FIND_CLIENT = gql`
  query findClient($uid: String!){
   findClient(uid: $uid) {
      ${responseGqlFields(clientsGqlFields)}
    }
  }
 `;

export const CLIENT_BY_STREAM_TYPE_PAGEABLE = gql`
  query clientByStreamTypePageable($pageableParam: PageableParamInput, $active: Boolean,$clientStreamType: ClientStreamType){
   clientByStreamTypePageable(pageableParam: $pageableParam, active: $active, clientStreamType: $clientStreamType) {
      ${pageGqlFields(clientsGqlFields)}
    }
  }
 `;

export const VERIFY_CLIENT_TIN = gql`
  mutation verifyClientTin($clientUid: String!, $outcome: TinVerificationStatus){
   verifyClientTin(clientUid: $clientUid, outcome: $outcome) {
      ${responseGqlFields('key\nvalue')}
    }
  }
 `;

export const TERMINATE_CLIENT = gql`
  mutation terminateClient($uid: String!, $reason: String){
   terminateClient(uid: $uid, reason: $reason) {
      ${responseGqlFields(clientsGqlFields)}
    }
  }
 `;

export const DELETE_CLIENT = gql`
   mutation deleteClient($uid: String!){
    deleteClient(uid: $uid) {
       ${responseGqlFields(clientsGqlFields)}
     }
   }
  `;

export const PENDING_CLIENT_REGISTRATIONS = gql`
  query pendingClientRegistrations{
   pendingClientRegistrations {
      ${clientsGqlFields}
    }
  }
 `;

export const CLIENT_REGISTRATION_APPROVAL_HISTORY = gql`
  query clientRegistrationApprovalHistory($clientUid: String!){
   clientRegistrationApprovalHistory(clientUid: $clientUid) {
      ${responseGqlFields(clientsGqlFields)}
    }
  }
 `;

export const APPROVE_CLIENT_REGISTRATION = gql`
  mutation approveClientRegistration($dto: ClientRegistrationApprovalDtoInput){
   approveClientRegistration(dto: $dto) {
      ${responseGqlFields(clientsGqlFields)}
    }
  }
 `;

export const REVIEW_CLIENT_REGISTRATION = gql`
  mutation reviewClientRegistration($dto: ClientRegistrationApprovalDtoInput){
   reviewClientRegistration(dto: $dto) {
      ${responseGqlFields(clientsGqlFields)}
    }
  }
 `;
