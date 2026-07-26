import { baseGqlFields } from '@shared/fetch/graphql.constants';
import gql from 'graphql-tag';

export const subwardFields = `
  ${baseGqlFields}
  name
  code
  name
  uid
  ward{
    name
    uid
    district{
      name
      uid
      region{
        name
        uid
      }
    }
  }
`;

export const GET_ALL_ACTIVE_SUB_WARD = gql`
  query getAllActiveSubWards {
    getAllActiveSubWards {
      ${subwardFields}
    }
  }
`;

export const GET_SUB_WARDS_BY_WARD = gql`
  query getSubWardByWardAndIsActive($uid: String,$deletedStatus: Boolean!) {
    getSubWardByWardAndIsActive(uid: $uid,deletedStatus:$deletedStatus) {
      ${subwardFields}
    }
  }
`;

export const GET_SUB_WARD_BY_WARD = gql`
  query getSubWardsByWard($uid: String) {
    getSubWardsByWard(uid:$uid) {
      ${subwardFields}
    }
  }
`;

export const GET_SUBWARD_BY_UID = gql`
  query getSubWardById($uid: String) {
    getSubWardById(uid: $uid) {
      code
      message
      data{
        ${subwardFields}
      }
    }
  }
`;

export const SAVE_SUB_WARD = gql`
  mutation saveOrUpdateSubWard($subWardDto: SubWardDtoInput) {
    saveOrUpdateSubWard(subWardDto: $subWardDto) {
      code
      message
      data{
        ${subwardFields}
      }
    }
  }
`;

export const ACTIVATE_SUB_WARD = gql`
  mutation activateOrDeactivateSubWard ($uid: String!) {
    activateOrDeactivateSubWard (uid: $uid) {
      code
      message
      data {
        ${subwardFields}
      }
    }
  }
`;
