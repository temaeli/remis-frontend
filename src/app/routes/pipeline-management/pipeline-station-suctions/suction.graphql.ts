import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const pipelineStationSuctionFields = `
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

export const GET_ALL_PIPELINE_STATION_SUCTIONS = gql`
  query getAllPipelineStationSuctionsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineStationSuctionsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineStationSuctionFields)}
    }
  }
`;

export const GET_PIPELINE_SUCTIONS_BY_STATION = gql`
  query getAllPipelineSuctionsByStation($stationUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineSuctionsByStation(stationUid: $stationUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineStationSuctionFields)}
    }
  }
`;

export const GET_PIPELINE_STATION_SUCTION_BY_UID = gql`
  query getPipelineStationSuctionByUid($uid: String!){
    getPipelineStationSuctionByUid(uid: $uid){
      ${responseGqlFields(pipelineStationSuctionFields)}
    }
  }
`;

export const CREATE_PIPELINE_STATION_SUCTION = gql`
  mutation createPipelineStationSuction($input: PipelineStationSuctionDtoInput!){
    createPipelineStationSuction(input: $input){
      ${responseGqlFields(pipelineStationSuctionFields)}
    }
  }
`;

export const UPDATE_PIPELINE_STATION_SUCTION = gql`
  mutation updatePipelineStationSuction($input: PipelineStationSuctionDtoInput!){
    updatePipelineStationSuction(input: $input){
      ${responseGqlFields(pipelineStationSuctionFields)}
    }
  }
`;

export const DELETE_PIPELINE_STATION_SUCTION = gql`
  mutation deletePipelineStationSuction($uid: String!){
    deletePipelineStationSuction(uid: $uid){
      ${responseGqlFields(pipelineStationSuctionFields)}
    }
  }
`;
