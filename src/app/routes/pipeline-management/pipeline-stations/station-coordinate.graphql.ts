import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
} from '@shared/fetch/graphql.constants';

// Station survey coordinates. Projected coords (northing/easting + sourceSrid)
// are reprojected server-side into a `geometry(PointZ, 4326)` (`geom4326`,
// @GraphQLIgnore'd — not selectable). Render via `getStationGeoJSON`.
export const stationCoordinateFields = `
  name
  sequence
  northing
  easting
  sourceSrid
  ${baseGqlFields}
`;

export const GET_ALL_STATION_COORDINATES_BY_STATION = gql`
  query getAllStationCoordinatesByStation($StationUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getAllStationCoordinatesByStation(StationUid: $StationUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(stationCoordinateFields)}
    }
  }
`;

export const GET_STATION_COORDINATES_BY_UID = gql`
  query getStationCoordinatesByUid($uid: String!){
    getStationCoordinatesByUid(uid: $uid){
      ${responseGqlFields(stationCoordinateFields)}
    }
  }
`;

// Bulk upsert: takes the station uid + the full list of coordinate DTOs (entered
// via the "Manage Coordinates" formGroupArray). Upsert-only — removals are
// reconciled separately via DELETE_STATION_COORDINATES. Returns
// Response<List<StationCoordinate>>.
export const CREATE_OR_UPDATE_STATION_COORDINATES = gql`
  mutation createOrUpdateStationCoordinates($stationUid: String!, $dtos: [StationCoordinateDtoInput]){
    createOrUpdateStationCoordinates(stationUid: $stationUid, dtos: $dtos){
      ${responseGqlFields(stationCoordinateFields)}
    }
  }
`;

export const DELETE_STATION_COORDINATES = gql`
  mutation deleteStationCoordinates($uid: String!){
    deleteStationCoordinates(uid: $uid){
      ${responseGqlFields(stationCoordinateFields)}
    }
  }
`;

// Stringified GeoJSON FeatureCollection (WGS84) — feed straight to <pipeline-map>.
export const GET_STATION_GEO_JSON = gql`
  query getStationGeoJSON($StationUid: String!){
    getStationGeoJSON(StationUid: $StationUid){
      ${plainResponseGqlFields}
    }
  }
`;
