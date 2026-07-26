import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const incidentTypeFields = `
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

export const GET_ALL_INCIDENT_TYPES = gql`
  query getAllIncidentTypesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllIncidentTypesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(incidentTypeFields)}
    }
  }
`;

export const GET_INCIDENT_TYPE_BY_UID = gql`
  query getIncidentTypeByUid($uid: String!){
    getIncidentTypeByUid(uid: $uid){
      ${responseGqlFields(incidentTypeFields)}
    }
  }
`;

export const CREATE_INCIDENT_TYPE = gql`
  mutation createIncidentType($input: IncidentTypeDtoInput!){
    createIncidentType(input: $input){
      ${responseGqlFields(incidentTypeFields)}
    }
  }
`;

export const UPDATE_INCIDENT_TYPE = gql`
  mutation updateIncidentType($input: IncidentTypeDtoInput!){
    updateIncidentType(input: $input){
      ${responseGqlFields(incidentTypeFields)}
    }
  }
`;

export const DELETE_INCIDENT_TYPE = gql`
  mutation deleteIncidentType($uid: String!){
    deleteIncidentType(uid: $uid){
      ${responseGqlFields(incidentTypeFields)}
    }
  }
`;
