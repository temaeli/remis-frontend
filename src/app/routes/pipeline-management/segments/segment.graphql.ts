import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const pipelineSegmentFields = `
  segmentId
  wallThickness
  elevation
  pipelineSection {
    uid
    sectionId
  }
  suction {
    uid
    name
    station { uid name }
  }
  discharge {
    uid
    name
    station { uid name }
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINE_SEGMENTS = gql`
  query getAllPipelineSegmentsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineSegmentsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineSegmentFields)}
    }
  }
`;

export const GET_PIPELINE_SEGMENT_BY_UID = gql`
  query getPipelineSegmentByUid($uid: String!){
    getPipelineSegmentByUid(uid: $uid){
      ${responseGqlFields(pipelineSegmentFields)}
    }
  }
`;

export const GET_PIPELINE_SEGMENTS_BY_SECTION = gql`
  query getPipelineSegmentsBySection($sectionUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPipelineSegmentsBySection(sectionUid: $sectionUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineSegmentFields)}
    }
  }
`;

export const CREATE_PIPELINE_SEGMENT = gql`
  mutation createPipelineSegment($input: PipelineSegmentDtoInput!){
    createPipelineSegment(input: $input){
      ${responseGqlFields(pipelineSegmentFields)}
    }
  }
`;

export const UPDATE_PIPELINE_SEGMENT = gql`
  mutation updatePipelineSegment($input: PipelineSegmentDtoInput!){
    updatePipelineSegment(input: $input){
      ${responseGqlFields(pipelineSegmentFields)}
    }
  }
`;

export const DELETE_PIPELINE_SEGMENT = gql`
  mutation deletePipelineSegment($uid: String!){
    deletePipelineSegment(uid: $uid){
      ${responseGqlFields(pipelineSegmentFields)}
    }
  }
`;

// BE arg names end in *StationUid but the service resolves them against
// suction/discharge POINT repositories — pass POINT uids, not station uids.
export const SET_PIPELINE_SEGMENT_SUCTION_AND_DISCHARGE = gql`
  mutation setPipelineSegmentSuctionAndDischarge(
    $segmentUid: String!
    $suctionStationUid: String!
    $dischargeStationUid: String!
  ){
    setPipelineSegmentSuctionAndDischarge(
      segmentUid: $segmentUid
      suctionStationUid: $suctionStationUid
      dischargeStationUid: $dischargeStationUid
    ){
      ${responseGqlFields(pipelineSegmentFields)}
    }
  }
`;
