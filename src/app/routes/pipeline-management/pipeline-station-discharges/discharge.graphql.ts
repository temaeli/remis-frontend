import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const pipelineStationDischargeFields = `
  name
  description
  station {
    uid
    name
    stationType
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINE_STATION_DISCHARGES = gql`
  query getAllPipelineStationDischargesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineStationDischargesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineStationDischargeFields)}
    }
  }
`;

export const GET_PIPELINE_DISCHARGES_BY_STATION = gql`
  query getAllPipelineDischargesByStation($stationUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineDischargesByStation(stationUid: $stationUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineStationDischargeFields)}
    }
  }
`;

export const GET_PIPELINE_STATION_DISCHARGE_BY_UID = gql`
  query getPipelineStationDischargeByUid($uid: String!){
    getPipelineStationDischargeByUid(uid: $uid){
      ${responseGqlFields(pipelineStationDischargeFields)}
    }
  }
`;

export const CREATE_PIPELINE_STATION_DISCHARGE = gql`
  mutation createPipelineStationDischarge($input: PipelineStationDischargeDtoInput!){
    createPipelineStationDischarge(input: $input){
      ${responseGqlFields(pipelineStationDischargeFields)}
    }
  }
`;

export const UPDATE_PIPELINE_STATION_DISCHARGE = gql`
  mutation updatePipelineStationDischarge($input: PipelineStationDischargeDtoInput!){
    updatePipelineStationDischarge(input: $input){
      ${responseGqlFields(pipelineStationDischargeFields)}
    }
  }
`;

export const DELETE_PIPELINE_STATION_DISCHARGE = gql`
  mutation deletePipelineStationDischarge($uid: String!){
    deletePipelineStationDischarge(uid: $uid){
      ${responseGqlFields(pipelineStationDischargeFields)}
    }
  }
`;
