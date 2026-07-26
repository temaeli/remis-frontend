import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const stationSuctionReadingFields = `
  temperature
  pressure
  suctionPoint {
    uid
    name
  }
  ${baseGqlFields}
`;

export const stationDischargeReadingFields = `
  temperature
  pressure
  dischargePoint {
    uid
    name
  }
  ${baseGqlFields}
`;

export const pipelineStationReadingFields = `
  readingTime
  remarks
  comment
  submittedAt
  approvedAt
  approvedBy {
    uid
    username
    firstName
    lastName
  }
  rejectedAt
  rejectedBy {
    uid
    username
    firstName
    lastName
  }
  station {
    uid
    name
  }
  suctionReadings {
    ${stationSuctionReadingFields}
  }
  dischargeReadings {
    ${stationDischargeReadingFields}
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

// ---------- Parent reading ----------

export const GET_ALL_PIPELINE_STATION_READINGS = gql`
  query getAllPipelineStationReadingsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineStationReadingsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const GET_PIPELINE_STATION_READINGS_BY_STATION = gql`
  query getPipelineStationReadingsByStation($stationUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPipelineStationReadingsByStation(stationUid: $stationUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const GET_PIPELINE_STATION_READING_BY_UID = gql`
  query getPipelineStationReadingByUid($uid: String!){
    getPipelineStationReadingByUid(uid: $uid){
      ${responseGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const CREATE_PIPELINE_STATION_READING = gql`
  mutation createPipelineStationReading($input: PipelineStationReadingDtoInput!){
    createPipelineStationReading(input: $input){
      ${responseGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const UPDATE_PIPELINE_STATION_READING = gql`
  mutation updatePipelineStationReading($input: PipelineStationReadingDtoInput!){
    updatePipelineStationReading(input: $input){
      ${responseGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const DELETE_PIPELINE_STATION_READING = gql`
  mutation deletePipelineStationReading($uid: String!){
    deletePipelineStationReading(uid: $uid){
      ${responseGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const SUBMIT_PIPELINE_STATION_READING = gql`
  mutation submitPipelineStationReading($uid: String!){
    submitPipelineStationReading(uid: $uid){
      ${responseGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const APPROVE_PIPELINE_STATION_READING = gql`
  mutation approvePipelineStationReading($uid: String!, $comment: String!){
    approvePipelineStationReading(uid: $uid, comment: $comment){
      ${responseGqlFields(pipelineStationReadingFields)}
    }
  }
`;

export const REJECT_PIPELINE_STATION_READING = gql`
  mutation rejectPipelineStationReading($uid: String!, $comment: String!){
    rejectPipelineStationReading(uid: $uid, comment: $comment){
      ${responseGqlFields(pipelineStationReadingFields)}
    }
  }
`;

// ---------- Nested suction sub-readings ----------

export const GET_STATION_SUCTION_READINGS_BY_STATION_READING = gql`
  query getAllStationSuctionReadingsByStationReadingUid($stationReadingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllStationSuctionReadingsByStationReadingUid(stationReadingUid: $stationReadingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(stationSuctionReadingFields)}
    }
  }
`;

export const GET_STATION_SUCTION_READING_BY_UID = gql`
  query getStationSuctionReadingByUid($uid: String!){
    getStationSuctionReadingByUid(uid: $uid){
      ${responseGqlFields(stationSuctionReadingFields)}
    }
  }
`;

export const CREATE_STATION_SUCTION_READING = gql`
  mutation createStationSuctionReading($input: StationSuctionReadingDtoInput!, $stationReadingUid: String!){
    createStationSuctionReading(input: $input, stationReadingUid: $stationReadingUid){
      ${responseGqlFields(stationSuctionReadingFields)}
    }
  }
`;

export const UPDATE_STATION_SUCTION_READING = gql`
  mutation updateStationSuctionReading($input: StationSuctionReadingDtoInput!){
    updateStationSuctionReading(input: $input){
      ${responseGqlFields(stationSuctionReadingFields)}
    }
  }
`;

export const DELETE_STATION_SUCTION_READING = gql`
  mutation deleteStationSuctionReading($uid: String!){
    deleteStationSuctionReading(uid: $uid){
      ${responseGqlFields(stationSuctionReadingFields)}
    }
  }
`;

// ---------- Nested discharge sub-readings ----------

export const GET_STATION_DISCHARGE_READINGS_BY_STATION_READING = gql`
  query getAllStationDischargeReadingsByStationReadingUid($stationReadingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllStationDischargeReadingsByStationReadingUid(stationReadingUid: $stationReadingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(stationDischargeReadingFields)}
    }
  }
`;

export const GET_STATION_DISCHARGE_READING_BY_UID = gql`
  query getStationDischargeReadingByUid($uid: String!){
    getStationDischargeReadingByUid(uid: $uid){
      ${responseGqlFields(stationDischargeReadingFields)}
    }
  }
`;

export const CREATE_STATION_DISCHARGE_READING = gql`
  mutation createStationDischargeReading($input: StationDischargeReadingDtoInput!, $stationReadingUid: String!){
    createStationDischargeReading(input: $input, stationReadingUid: $stationReadingUid){
      ${responseGqlFields(stationDischargeReadingFields)}
    }
  }
`;

export const UPDATE_STATION_DISCHARGE_READING = gql`
  mutation updateStationDischargeReading($input: StationDischargeReadingDtoInput!){
    updateStationDischargeReading(input: $input){
      ${responseGqlFields(stationDischargeReadingFields)}
    }
  }
`;

export const DELETE_STATION_DISCHARGE_READING = gql`
  mutation deleteStationDischargeReading($uid: String!){
    deleteStationDischargeReading(uid: $uid){
      ${responseGqlFields(stationDischargeReadingFields)}
    }
  }
`;
