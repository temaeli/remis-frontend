import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const cngStationGqlFields = `
  uid
  code
  name
  stationType
  region
  location
  contact
  description
  active
  equipments {
    uid
    equipmentType {
      uid
      name
      symbol
    }
    name
    capacity
    capacityUnit {
      uid
      name
      symbol
    }
    orderIndex
  }
  ${baseGqlFields}
`;

export const ALL_CNG_STATIONS = gql`
  query allCngStations {
    allCngStations {
      ${cngStationGqlFields}
    }
  }
`;

export const ALL_CNG_STATIONS_PAGEABLE = gql`
  query allCngStationsPageable($active: Boolean, $pageableParam: PageableParamInput) {
    allCngStationsPageable(active: $active, pageableParam: $pageableParam) {
      ${pageGqlFields(cngStationGqlFields)}
    }
  }
`;

export const FIND_CNG_STATION = gql`
  query findCngStation($uid: String!) {
    findCngStation(uid: $uid) {
      ${responseGqlFields(cngStationGqlFields)}
    }
  }
`;

export const SAVE_CNG_STATION = gql`
  mutation saveCngStation($dto: CngStationDtoInput) {
    saveCngStation(dto: $dto) {
      ${responseGqlFields(cngStationGqlFields)}
    }
  }
`;

export const DELETE_CNG_STATION = gql`
  mutation deleteCngStation($uid: String!) {
    deleteCngStation(uid: $uid) {
      ${responseGqlFields(cngStationGqlFields)}
    }
  }
`;
