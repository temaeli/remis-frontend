import gql from 'graphql-tag';
import { baseGqlFields } from '@shared/fetch/graphql.constants';
import { regionGqlFields } from '../region.graphql';

export const districtFewGqlFields = `
  ${baseGqlFields}
  name
  code
`;

export const districtFields = `
  ${baseGqlFields}
  name
  code
  region{
    ${regionGqlFields}
  }
`;

export const GET_ALL_ACTIVE_DISTRICT = gql`
  query getAllActiveDistricts {
    getAllActiveDistricts {
      ${districtFields}
    }
  }
`;

export const GET_DISTRICTS_BY_REGION = gql`
  query getDistrictsByRegion($uid: String) {
    getDistrictsByRegion(uid: $uid) {
      ${districtFields}
    }
  }
`;

export const GET_DISTRICTS_BY_UID = gql`
  query getDistrictObjectByUid($uid: String) {
    getDistrictObjectByUid(uid: $uid) {
      ${districtFields}
      councils {
        uid
        id
        active
        name
        code
      }
    }
  }
`;

export const SAVE_DISTRICT = gql`
  mutation saveOrUpdateDistrict($districtDto: DistrictDtoInput) {
    saveOrUpdateDistrict(districtDto: $districtDto) {
      code
      message
      data{
        ${districtFields}
      }
    }
  }
`;

export const EDIT_DISTRICT = gql`
  mutation updateDistrict( $districtDto: DistrictDtoInput) {
    updateDistrict( districtDto: $districtDto) {
      code
      message
      data {
        ${districtFields}
      }
    }
  }
`;

export const DELETE_DISTRICT = gql`
  mutation deleteD ($uid: String!) {
    deleteDistrict (uid: $uid) {
      code
      message
      data {
        ${districtFields}
      }
    }
  }
`;
export const ACTIVATE_DISTRICT = gql`
  mutation activateOrDeactivateDistrict ($uid: String!) {
    activateOrDeactivateDistrict (uid: $uid) {
      code
      message
      data {
        ${districtFields}
      }
    }
  }
`;
