import { baseGqlFields } from '@shared/fetch/graphql.constants';
import gql from 'graphql-tag';

export const wardFields = `
  ${baseGqlFields}
  name
  code
`;

export const GET_ALL_ACTIVE_WARD = gql`
  query getAllActiveWards {
    getAllActiveWards {
      ${wardFields}
    }
  }
`;

export const GET_WARD_BY_UID = gql`
  query getWardByUid($uid: String) {
    getWardByUid(uid: $uid) {
      code
      message
      data{
        ${wardFields}
      }
    }
  }
`;

export const GET_WARDS_BY_COUNCIL = gql`
  query getWardsByCouncil($uid: String) {
    getWardsByCouncil(uid: $uid) {
      ${wardFields}
    }
  }
`;

export const GET_WARDS_BY_DISTICT = gql`
  query getWardsByDistrict($districtUid: String) {
    getWardsByDistrict(districtUid: $districtUid) {
      ${wardFields}
    }
  }
`;

export const SAVE_WARD = gql`
  mutation saveOrUpdateWard($wardDto: WardDtoInput) {
    saveOrUpdateWard(wardDto: $wardDto) {
      code
      data{
        ${wardFields}
      }
    }
  }
`;

export const ACTIVATE_WARD = gql`
  mutation activateOrDeactivateWard ($uid: String!) {
    activateOrDeactivateWard (uid: $uid) {
      code
      data {
        ${wardFields}
      }
    }
  }
`;
