import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const pipelineFields = `
  name
  description
  status
  spatialLength
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINES = gql`
  query getAllPipelinesPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelinesPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineFields)}
    }
  }
`;

export const GET_PIPELINE_BY_UID = gql`
  query getPipelineByUid($uid: String!){
    getPipelineByUid(uid: $uid){
      ${responseGqlFields(pipelineFields)}
    }
  }
`;

export const CREATE_PIPELINE = gql`
  mutation createPipeline($input: PipelineDtoInput!){
    createPipeline(input: $input){
      ${responseGqlFields(pipelineFields)}
    }
  }
`;

export const UPDATE_PIPELINE = gql`
  mutation updatePipeline($input: PipelineDtoInput!){
    updatePipeline(input: $input){
      ${responseGqlFields(pipelineFields)}
    }
  }
`;

export const DELETE_PIPELINE = gql`
  mutation deletePipeline($uid: String!){
    deletePipeline(uid: $uid){
      ${responseGqlFields(pipelineFields)}
    }
  }
`;

export const GET_PIPELINE_GEO_JSON = gql`
  query getPipelineGeoJson($pipelineUid: String!) {
    getPipelineGeoJson(pipelineUid: $pipelineUid) {
      ${plainResponseGqlFields}
    }
  }
`;
