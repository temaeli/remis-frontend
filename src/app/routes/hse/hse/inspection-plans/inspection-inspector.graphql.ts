import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const inspectionInspectorFields = `
  inspector {
    uid
    firstName
    middleName
    lastName
    username
  }
  ${baseGqlFields}
`;

export const GET_INSPECTION_INSPECTORS_BY_INSPECTION = gql`
  query getInspectionInspectorsByInspection($planUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getInspectionInspectorsByInspection(planUid: $planUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(inspectionInspectorFields)}
    }
  }
`;

export const SAVE_INSPECTION_INSPECTOR = gql`
  mutation saveInspectionInspector($planUid: String!, $inspectorUid: String!){
    saveInspectionInspector(planUid: $planUid, inspectorUid: $inspectorUid){
      ${responseGqlFields(inspectionInspectorFields)}
    }
  }
`;

export const DELETE_INSPECTION_INSPECTOR = gql`
  mutation deleteInspectionInspector($inspectorUid: String!){
    deleteInspectionInspector(inspectorUid: $inspectorUid){
      ${responseGqlFields(inspectionInspectorFields)}
    }
  }
`;
