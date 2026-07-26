import { gql } from '@apollo/client/core';
import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const condensateSaleGqlFields = `
  active
  customerLicenseNumber
  customerName
  offloadingDate
  plant{
    name
    code
    blockNumber
    dailyProductionCapacityMmscfd
    physicalAddress
    postalAddress
    uid
  }
  salesDate
  truckNumber
  volumeInLitres
  submittedAt
  approvedAt
  approvedBy{ ${userMinimalGqlFields}}
  rejectedAt
  rejectedBy{ ${userMinimalGqlFields}}
  createdBy{ ${userMinimalGqlFields}}
  ${baseGqlFields}
  remarks
  comment
`;

//
//  Mutations
export const DELETE_CONDENSATE_SALE = gql`
  mutation deleteCondensateSale($uid: String!){
   deleteCondensateSale(uid: $uid) {
      ${responseGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

export const APPROVE_CONDENSATE_SALE = gql`
  mutation approveCondensateSale($uid: String!, $comment: String!){
   approveCondensateSale(uid: $uid, comment: $comment) {
      ${responseGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

export const UPDATE_CONDENSATE_SALE = gql`
  mutation updateCondensateSale($input: CondensateSaleDtoInput!){
   updateCondensateSale(input: $input) {
      ${responseGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

export const SUBMIT_CONDENSATE_SALE = gql`
  mutation submitCondensateSale($uid: String!){
   submitCondensateSale(uid: $uid) {
      ${responseGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

export const CREATE_CONDENSATE_SALE = gql`
  mutation createCondensateSale($input: CondensateSaleDtoInput!){
   createCondensateSale(input: $input) {
      ${responseGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

export const REJECT_CONDENSATE_SALE = gql`
  mutation rejectCondensateSale($uid: String!, $comment: String!){
   rejectCondensateSale(uid: $uid, comment: $comment) {
      ${responseGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

//  Queries
export const GET_ALL_CONDENSATE_SALES_PAGEABLE = gql`
  query getAllCondensateSalesPageable($pageableParam: PageableParamInput, $active: Boolean){
   getAllCondensateSalesPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

export const GET_CONDENSATE_SALE_BY_UID = gql`
  query getCondensateSaleByUid($uid: String!){
   getCondensateSaleByUid(uid: $uid) {
      ${responseGqlFields(condensateSaleGqlFields)}
    }
  }
 `;

export const GET_CONDENSATE_SALES_BY_PLANT = gql`
  query getCondensateSalesByPlant($pageableParam: PageableParamInput, $active: Boolean, $plantUid: String!){
   getCondensateSalesByPlant(pageableParam: $pageableParam, active: $active, plantUid: $plantUid) {
      ${pageGqlFields(condensateSaleGqlFields)}
    }
  }
 `;
