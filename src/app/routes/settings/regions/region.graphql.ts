import { gql } from '@apollo/client/core';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

export const regionGqlFields = `
  code
  name
  napaId
  uid
`;

//
//  Mutations
export const SAVE_OR_UPDATE_REGION = gql`
  mutation saveOrUpdateRegion($region: RegionDtoInput){
   saveOrUpdateRegion(region: $region) {
      ${responseGqlFields(regionGqlFields)}
    }
  }
 `;

export const ACTIVATE_OR_DEACTIVATE_REGION = gql`
  mutation activateOrDeactivateRegion($uid: String){
   activateOrDeactivateRegion(uid: $uid) {
      ${responseGqlFields(regionGqlFields)}
    }
  }
 `;

//  Queries
export const GET_ALL_REGIONS = gql`
  query getAllRegions{
   getAllRegions {
      ${regionGqlFields}
    }
  }
 `;

export const GET_REGION_OBJECT_BY_UID = gql`
  query getRegionObjectByUid($uid: String){
   getRegionObjectByUid(uid: $uid) {
      ${responseGqlFields(regionGqlFields)}
    }
  }
 `;

export const GET_REGION_BY_ID = gql`
  query getRegionById($uid: String){
   getRegionById(uid: $uid) {
      ${responseGqlFields(regionGqlFields)}
    }
  }
 `;

export const GET_ALL_IN_ACTIVE_REGIONS = gql`
  query getAllInActiveRegions{
   getAllInActiveRegions {
      ${regionGqlFields}
    }
  }
 `;
