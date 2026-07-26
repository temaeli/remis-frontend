import { gql } from 'apollo-angular';
import { baseGqlFields, pageGqlFields, plainResponseGqlFields } from '@shared/fetch/graphql.constants';

export const pipelineSectionCoordinateFields = `
  name
  northing
  easting
  elevation
  distance
  mileage
  sourceSrid
  ${baseGqlFields}
`;

export const GET_ALL_PIPELINE_SECTIONS_COORDINATES_PAGEABLE = gql`
  query getAllPipelineSectionsCoordinatesPageable($sectionUid: String!, $pageableParam: PageableParamInput){
    getAllPipelineSectionsCoordinatesPageable(sectionUid: $sectionUid, pageableParam: $pageableParam){
      ${pageGqlFields(pipelineSectionCoordinateFields)}
    }
  }
`;

export const UPLOAD_PIPELINE_SECTION_POINT_COORDINATES = gql`
  mutation uploadPipelineSectionPointCoordinates($uid: String!, $excelFile: String!){
    uploadPipelineSectionPointCoordinates(uid: $uid, excelFile: $excelFile){
      ${plainResponseGqlFields}
    }
  }
`;
