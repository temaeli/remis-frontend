import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const inspectionTypeFields = `
  code
  name
  description
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const inspectionTypeChecklistFields = `
  question
  groupName
  mandatory
  description
  ${baseGqlFields}
`;

export const GET_ALL_INSPECTION_TYPES = gql`
  query getAllInspectionTypesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllInspectionTypesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(inspectionTypeFields)}
    }
  }
`;

export const GET_INSPECTION_TYPE_BY_UID = gql`
  query getInspectionTypeByUid($uid: String!){
    getInspectionTypeByUid(uid: $uid){
      ${responseGqlFields(inspectionTypeFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INSPECTION_TYPE = gql`
  mutation createOrUpdateInspectionType($input: InspectionTypeDtoInput!){
    createOrUpdateInspectionType(input: $input){
      ${responseGqlFields(inspectionTypeFields)}
    }
  }
`;

export const DELETE_INSPECTION_TYPE = gql`
  mutation deleteInspectionType($uid: String!){
    deleteInspectionType(uid: $uid){
      ${responseGqlFields(inspectionTypeFields)}
    }
  }
`;

// Checklists
export const GET_INSPECTION_CHECKLISTS_BY_INSPECTION_TYPE = gql`
  query getInspectionChecklistsByInspectionType($inspectionTypeUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getInspectionChecklistsByInspectionType(inspectionTypeUid: $inspectionTypeUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(inspectionTypeChecklistFields)}
    }
  }
`;

export const GET_INSPECTION_CHECKLIST_BY_UID = gql`
  query getInspectionChecklistByUid($uid: String!){
    getInspectionChecklistByUid(uid: $uid){
      ${responseGqlFields(inspectionTypeChecklistFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INSPECTION_CHECKLIST = gql`
  mutation createOrUpdateInspectionChecklist($inspectionTypeUid: String!, $input: InspectionTypeChecklistDtoInput!){
    createOrUpdateInspectionChecklist(inspectionTypeUid: $inspectionTypeUid, input: $input){
      ${responseGqlFields(inspectionTypeChecklistFields)}
    }
  }
`;

export const DELETE_INSPECTION_CHECKLIST = gql`
  mutation deleteInspectionChecklist($uid: String!){
    deleteInspectionChecklist(uid: $uid){
      ${responseGqlFields(inspectionTypeChecklistFields)}
    }
  }
`;
