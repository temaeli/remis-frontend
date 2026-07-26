import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const pipelineStationFields = `
  name
  description
  stationType
  pipelineSegment {
    uid
    segmentId
    pipelineSection {
      uid
      sectionId
      pipeline { uid name }
    }
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINE_STATIONS = gql`
  query getAllPipelineStationsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineStationsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineStationFields)}
    }
  }
`;

export const GET_ALL_PIPELINE_STATIONS_BY_PIPELINE = gql`
  query getAllPipelineStationsByPipeline(
    $pipelineUid: String!
    $pageableParam: PageableParamInput
    $active: Boolean
  ){
    getAllPipelineStationsByPipeline(
      pipelineUid: $pipelineUid
      pageableParam: $pageableParam
      active: $active
    ){
      ${pageGqlFields(pipelineStationFields)}
    }
  }
`;

export const GET_PIPELINE_STATIONS_BY_PIPELINE_SEGMENT = gql`
  query getPipelineStationsByPipelineSegment(
    $segmentUid: String!
    $pageableParam: PageableParamInput
    $active: Boolean
  ){
    getPipelineStationsByPipelineSegment(
      segmentUid: $segmentUid
      pageableParam: $pageableParam
      active: $active
    ){
      ${pageGqlFields(pipelineStationFields)}
    }
  }
`;

export const GET_PIPELINE_STATION_BY_UID = gql`
  query getPipelineStationByUid($uid: String!){
    getPipelineStationByUid(uid: $uid){
      ${responseGqlFields(pipelineStationFields)}
    }
  }
`;

export const CREATE_PIPELINE_STATION = gql`
  mutation createPipelineStation($input: PipelineStationDtoInput!){
    createPipelineStation(input: $input){
      ${responseGqlFields(pipelineStationFields)}
    }
  }
`;

export const UPDATE_PIPELINE_STATION = gql`
  mutation updatePipelineStation($input: PipelineStationDtoInput!){
    updatePipelineStation(input: $input){
      ${responseGqlFields(pipelineStationFields)}
    }
  }
`;

export const DELETE_PIPELINE_STATION = gql`
  mutation deletePipelineStation($uid: String!){
    deletePipelineStation(uid: $uid){
      ${responseGqlFields(pipelineStationFields)}
    }
  }
`;
