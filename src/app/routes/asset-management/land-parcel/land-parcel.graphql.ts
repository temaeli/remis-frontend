import { gql } from '@apollo/client/core';
import { booleanResponseGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const landParcelGqlFields = `
  id
  uid
  titleNumber
  location
  sizeSqm
  active
  createdAt
`;

//  Queries
export const GET_LAND_PARCELS = gql`
  query getLandParcels{
   getLandParcels {
      ${landParcelGqlFields}
    }
  }
 `;

export const FIND_LAND_PARCEL = gql`
  query findLandParcel($uid: String){
   findLandParcel(uid: $uid) {
      ${responseGqlFields(landParcelGqlFields)}
    }
  }
 `;

//
//  Mutations
export const REGISTER_LAND_PARCEL = gql`
  mutation registerLandParcel($input: LandParcelDtoInput){
   registerLandParcel(input: $input) {
      ${responseGqlFields(landParcelGqlFields)}
    }
  }
 `;

export const UPDATE_LAND_PARCEL = gql`
  mutation updateLandParcel($input: LandParcelDtoInput){
   updateLandParcel(input: $input) {
      ${responseGqlFields(landParcelGqlFields)}
    }
  }
 `;

export const DELETE_LAND_PARCEL = gql`
  mutation deleteLandParcel($id: Long){
   deleteLandParcel(id: $id) {
      ${booleanResponseGqlFields}
    }
  }
 `;
