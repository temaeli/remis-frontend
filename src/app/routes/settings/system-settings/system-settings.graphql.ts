import { gql } from '@apollo/client/core';
import {
  responseGqlFields,
  baseMinimalGqlFields,
  plainResponseGqlFields,
} from '@shared/fetch/graphql.constants';

export const systemSettingGqlFields = `
category
defaultValue
description
migrated
settingKey
settingValue
systemSeed
valueType
${baseMinimalGqlFields}

`;

//
//  Mutations
export const SAVE_SYSTEM_SETTING = gql`
  mutation saveSystemSetting($dto: SystemSettingDtoInput){
   saveSystemSetting(dto: $dto) {
      ${responseGqlFields(systemSettingGqlFields)}
    }
  }
 `;

//  Queries
export const ALL_SYSTEM_SETTINGS = gql`
  query allSystemSettings{
   allSystemSettings {
      ${systemSettingGqlFields}
    }
  }
 `;

export const SYSTEM_SETTINGS_BY_CATEGORY = gql`
  query systemSettingsByCategory($category: String){
   systemSettingsByCategory(category: $category) {
      ${systemSettingGqlFields}
    }
  }
 `;

export const FIND_SYSTEM_SETTING = gql`
  query findSystemSetting($uid: String!){
   findSystemSetting(uid: $uid) {
      ${responseGqlFields(systemSettingGqlFields)}
    }
  }
 `;

export const DELETE_SYSTEM_SETTING = gql`
  mutation deleteSystemSetting($uid: String!){
   deleteSystemSetting(uid: $uid) {
      ${responseGqlFields(systemSettingGqlFields)}
    }
  }
 `;

export const CLEAR_DASHBOARD_CACHES = gql`
  mutation clearDashboardCaches{
   clearDashboardCaches {
      ${plainResponseGqlFields}
    }
  }
 `;
