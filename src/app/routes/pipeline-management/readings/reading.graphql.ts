import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const pipelineReadingFields = `
  readingTime
  temperatureIn
  pressureIn
  temperatureOut
  pressureOut
  flowRate
  status
  pipelineSegment {
    uid
    segmentId
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINE_READINGS = gql`
  query getAllPipelineReadingsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineReadingsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineReadingFields)}
    }
  }
`;

export const GET_PIPELINE_READING_BY_UID = gql`
  query getPipelineReadingByUid($uid: String!){
    getPipelineReadingByUid(uid: $uid){
      ${responseGqlFields(pipelineReadingFields)}
    }
  }
`;

export const CREATE_PIPELINE_READING = gql`
  mutation createPipelineReading($input: PipelineReadingDtoInput!){
    createPipelineReading(input: $input){
      ${responseGqlFields(pipelineReadingFields)}
    }
  }
`;

export const UPDATE_PIPELINE_READING = gql`
  mutation updatePipelineReading($input: PipelineReadingDtoInput!){
    updatePipelineReading(input: $input){
      ${responseGqlFields(pipelineReadingFields)}
    }
  }
`;

export const DELETE_PIPELINE_READING = gql`
  mutation deletePipelineReading($uid: String!){
    deletePipelineReading(uid: $uid){
      ${responseGqlFields(pipelineReadingFields)}
    }
  }
`;

export const SUBMIT_PIPELINE_READING = gql`
  mutation submitPipelineReading($input: PipelineReadingDtoInput!){
    submitPipelineReading(input: $input){
      ${responseGqlFields(pipelineReadingFields)}
    }
  }
`;
