import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  baseMinimalGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

// GSA (Gas Sales Agreement) Fields
export const gasSalesAgreementGqlFields = `
activatedByUser{
 id
 uid
 fullName
}
addendums{
id
uid
}
client{
 id
 uid
 user{
  fullName
 }
}
clientName
contractName
contractNumber
contractType
description
documentUrl
endDate
maximumDailyMmscfd
migrated
minimumDailyMmscfd
startDate
status
submittedByUser{
id
uid
fullName
}
totalVolumeMmscf
${baseGqlFields}
`;

export const gsaAddendumGqlFields = `
addendumDate
agreement{
id
uid
}
documentUrl
migrated
newEndDate
newMaximumDailyMmscfd
newMinimumDailyMmscfd
reason
${baseMinimalGqlFields}

`;

// GSA Mutations
export const SAVE_GAS_SALES_AGREEMENT = gql`
  mutation saveGasSalesAgreement($dto: GasSalesAgreementDtoInput){
   saveGasSalesAgreement(dto: $dto) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const SUBMIT_GAS_SALES_AGREEMENT = gql`
  mutation submitGasSalesAgreement($uid: String!){
   submitGasSalesAgreement(uid: $uid) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const REVIEW_GSA_AS_MANAGER = gql`
  mutation reviewGsaAsManager($uid: String, $approved: Boolean, $comments: String){
   reviewGsaAsManager(uid: $uid, approved: $approved, comments: $comments) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const APPROVE_GSA_AS_DIRECTOR = gql`
  mutation approveGsaAsDirector($uid: String, $approved: Boolean, $comments: String){
   approveGsaAsDirector(uid: $uid, approved: $approved, comments: $comments) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const SUBMIT_GAS_SALES_AGREEMENT_TO_MANAGER = gql`
  mutation submitGsaToManager($uid: String!){
   submitGsaToManager(uid: $uid) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const ACTIVATE_GAS_SALES_AGREEMENT = gql`
  mutation activateGasSalesAgreement($uid: String!){
   activateGasSalesAgreement(uid: $uid) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const TERMINATE_GAS_SALES_AGREEMENT = gql`
  mutation terminateGasSalesAgreement($uid: String!){
   terminateGasSalesAgreement(uid: $uid) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const ADD_GAS_SALES_AGREEMENT_ADDENDUM = gql`
  mutation addGasSalesAgreementAddendum($dto: GsaAddendumDtoInput){
   addGasSalesAgreementAddendum(dto: $dto) {
      ${responseGqlFields(gsaAddendumGqlFields)}
    }
  }
 `;

export const DELETE_GAS_SALES_AGREEMENT = gql`
  mutation deleteGasSalesAgreement($uid: String!){
   deleteGasSalesAgreement(uid: $uid) {
      ${responseGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

// GSA Queries
export const ALL_GAS_SALES_AGREEMENTS = gql`
  query allGasSalesAgreements{
   allGasSalesAgreements {
      ${gasSalesAgreementGqlFields}
    }
  }
 `;

export const ALL_GAS_SALES_AGREEMENTS_PAGEABLE = gql`
  query allGasSalesAgreementsPageable($pageableParam: PageableParamInput){
   allGasSalesAgreementsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const ALL_GAS_SALES_AGREEMENTS_BY_STATUS_PAGEABLE = gql`
  query allGasSalesAgreementsByStatus($pageableParam: PageableParamInput,$status:GsaStatus){
   allGasSalesAgreementsByStatus(pageableParam: $pageableParam,status:$status) {
      ${pageGqlFields(gasSalesAgreementGqlFields)}
    }
  }
 `;

export const GAS_SALES_AGREEMENTS_FOR_CLIENT = gql`
  query gasSalesAgreementsForClient($clientUid: String!){
   gasSalesAgreementsForClient(clientUid: $clientUid) {
      ${gasSalesAgreementGqlFields}
    }
  }
 `;

export const FIND_GAS_SALES_AGREEMENT = gql`
  query findGasSalesAgreement($uid: String!){
   findGasSalesAgreement(uid: $uid) {
      ${gasSalesAgreementGqlFields}
    }
  }
 `;

export const MY_GAS_SALES_AGREEMENT = gql`
  query myGasSalesAgreements{
   myGasSalesAgreements {
      ${gasSalesAgreementGqlFields}
    }
  }
 `;

export const GAS_SALES_AGREEMENT_ADDENDUMS = gql`
  query gasSalesAgreementAddendums($agreementUid: String!){
   gasSalesAgreementAddendums(agreementUid: $agreementUid) {
      ${gsaAddendumGqlFields}
      createdAt
      ${baseGqlFields}
    }
  }
 `;
