import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  booleanResponseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';
import { userMinimalGqlFields } from 'app/routes/users-managment/users/user.graphql';
import { stagesGqlFields } from '../hse-reports/hse-report.graphql';
import { plantFormItemGqlFields } from '../plant-form-items/plant-form-item.graphql';

export const condensateStorageTankGqlFields = `
  approvalStatus
  createdBy{${userMinimalGqlFields}}
  name
  plant{name uid}
  stage
  stages{${stagesGqlFields}}
  ${baseGqlFields}
`;

export const condensateStorageTankItemGqlFields = `
  active
  tankA
  tankB
  uoM
  item{${plantFormItemGqlFields}}
  condensateStorageTank{name uid}
  ${baseGqlFields}
`;

export const SAVE_CONDENSATE_STORAGE_TANK = gql`
  mutation saveCondensateStorageTank(
    $inputs: [CondensateTankDataInputDtoInput]!
    $uid: String
    $plantUid: String
  ) {
    saveCondensateStorageTank(inputs: $inputs, uid: $uid, plantUid: $plantUid) {
      ${responseGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;

export const PROCESS_CONDENSATE_STORAGE_TANK = gql`
  mutation processCondensateStorageTank($processingDto: ProcessingDtoInput!) {
    processCondensateStorageTank(processingDto: $processingDto) {
      ${booleanResponseGqlFields}
    }
  }
`;

export const GET_CONDENSATE_STORAGE_TANK_ITEMS = gql`
  query getCondensateStorageTankItems($formUid: String) {
    getCondensateStorageTankItems(formUid: $formUid) {
      ${condensateStorageTankItemGqlFields}
    }
  }
`;

export const GET_CONDENSATE_STORAGE_TANK_BY_UID = gql`
  query getCondensateStorageTankByUid($uid: String) {
    getCondensateStorageTankByUid(uid: $uid) {
      ${responseGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;

export const GET_CONDENSATE_STORAGE_TANKS_PAGEABLE = gql`
  query getCondensateStorageTanksPageable($pageableParam: PageableParamInput!, $active: Boolean = true) {
    getCondensateStorageTanksPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;

export const GET_OFFICER_CONDENSATE_STORAGE_TANKS_PAGEABLE = gql`
  query getOfficerCondensateStorageTanksPageable($pageableParam: PageableParamInput!) {
    getOfficerCondensateStorageTanksPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;

export const GET_SHIFT_SUPERVISOR_CONDENSATE_STORAGE_TANKS_PAGEABLE = gql`
  query getShiftSupervisorCondensateStorageTanksPageable($pageableParam: PageableParamInput!) {
    getShiftSupervisorCondensateStorageTanksPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;

export const GET_SUPERINTENDENT_CONDENSATE_STORAGE_TANKS_PAGEABLE = gql`
  query getSuperintendentCondensateStorageTanksPageable($pageableParam: PageableParamInput!) {
    getSuperintendentCondensateStorageTanksPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;

export const GET_PLANT_MANAGER_CONDENSATE_STORAGE_TANKS_PAGEABLE = gql`
  query getPlantManagerCondensateStorageTanksPageable($pageableParam: PageableParamInput!) {
    getPlantManagerCondensateStorageTanksPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;

export const GET_MY_CONDENSATE_STORAGE_TANK_PAGEABLE = gql`
  query getMyCondensateStorageTankPageable($pageableParam: PageableParamInput!) {
    getMyCondensateStorageTankPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(condensateStorageTankGqlFields)}
    }
  }
`;
