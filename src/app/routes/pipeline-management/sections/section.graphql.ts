import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
} from '@shared/fetch/graphql.constants';

export const pipelineSectionFields = `
  sectionId
  diameter
  designPressure
  maxPressure
  minPressure
  materialUsed
  installationDate
  area
  pipeline {
    uid
    name
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINE_SECTIONS = gql`
  query getAllPipelineSectionsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllPipelineSectionsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineSectionFields)}
    }
  }
`;

export const GET_PIPELINE_SECTION_BY_UID = gql`
  query getPipelineSectionByUid($uid: String!){
    getPipelineSectionByUid(uid: $uid){
      ${responseGqlFields(pipelineSectionFields)}
    }
  }
`;

export const GET_PIPELINE_SECTIONS_BY_PIPELINE = gql`
  query getPipelineSectionsByPipeline($pipelineUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getPipelineSectionsByPipeline(pipelineUid: $pipelineUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineSectionFields)}
    }
  }
`;

export const CREATE_PIPELINE_SECTION = gql`
  mutation createPipelineSection($input: PipelineSectionDtoInput!){
    createPipelineSection(input: $input){
      ${responseGqlFields(pipelineSectionFields)}
    }
  }
`;

export const CREATE_PIPELINE_SECTION_BEFORE = gql`
  mutation createPipelineSectionBefore($input: PipelineSectionDtoInput!, $beforeSectionUid: String!){
    createPipelineSectionBefore(input: $input, beforeSectionUid: $beforeSectionUid){
      ${responseGqlFields(pipelineSectionFields)}
    }
  }
`;

export const UPDATE_PIPELINE_SECTION = gql`
  mutation updatePipelineSection($input: PipelineSectionDtoInput!){
    updatePipelineSection(input: $input){
      ${responseGqlFields(pipelineSectionFields)}
    }
  }
`;

export const DELETE_PIPELINE_SECTION = gql`
  mutation deletePipelineSection($uid: String!){
    deletePipelineSection(uid: $uid){
      ${responseGqlFields(pipelineSectionFields)}
    }
  }
`;

export const GET_PIPELINE_SECTION_GEO_JSON = gql`
  query getPipelineSectionGeoJson($sectionUid: String!) {
    getPipelineSectionGeoJson(sectionUid: $sectionUid) {
      ${plainResponseGqlFields}
    }
  }
`;
