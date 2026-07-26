import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const clientInstalledAreaGqlFields = `
activeConnections
notActiveConnections
notes
client{
 id
 uid
 code
}
gasInstallation{
 id
 uid
 name
}
${baseGqlFields}
`;

export const SAVE_CLIENT_INSTALLED_AREA = gql`
  mutation saveClientInstalledArea($dto: ClientInstalledAreaDtoInput){
    saveClientInstalledArea(dto: $dto) {
      ${responseGqlFields(clientInstalledAreaGqlFields)}
    }
  }
`;

export const ALL_CLIENT_INSTALLED_AREAS_PAGEABLE = gql`
  query allClientInstalledAreasPageable($active: Boolean, $pageableParam: PageableParamInput){
    allClientInstalledAreasPageable(active: $active, pageableParam: $pageableParam) {
      ${pageGqlFields(clientInstalledAreaGqlFields)}
    }
  }
`;

export const CLIENT_INSTALLED_AREAS_BY_CLIENT = gql`
  query clientInstalledAreasByClient($clientUid: String){
    clientInstalledAreasByClient(clientUid: $clientUid) {
      ${clientInstalledAreaGqlFields}
    }
  }
`;

export const FIND_CLIENT_INSTALLED_AREA = gql`
  query findClientInstalledArea($uid: String){
    findClientInstalledArea(uid: $uid) {
      ${responseGqlFields(clientInstalledAreaGqlFields)}
    }
  }
`;

export const DELETE_CLIENT_INSTALLED_AREA = gql`
  mutation deleteClientInstalledArea($uid: String){
    deleteClientInstalledArea(uid: $uid) {
      ${responseGqlFields(clientInstalledAreaGqlFields)}
    }
  }
`;

export const MY_CLIENT_INSTALLED_AREAS = gql`
  query myClientInstalledAreas{
    myClientInstalledAreas {
      ${clientInstalledAreaGqlFields}
    }
  }
`;

export const SAVE_MY_CLIENT_INSTALLED_AREA = gql`
  mutation saveMyClientInstalledArea($dto: ClientInstalledAreaDtoInput){
    saveMyClientInstalledArea(dto: $dto) {
      ${responseGqlFields(clientInstalledAreaGqlFields)}
    }
  }
`;

export const DELETE_MY_CLIENT_INSTALLED_AREA = gql`
  mutation deleteMyClientInstalledArea($uid: String){
    deleteMyClientInstalledArea(uid: $uid) {
      ${responseGqlFields(clientInstalledAreaGqlFields)}
    }
  }
`;

// POST /graphql - saveClientInstalledArea
// POST /graphql - allClientInstalledAreasPageable
// POST /graphql - clientInstalledAreasByClient
// POST /graphql - findClientInstalledArea
// POST /graphql - deleteClientInstalledArea
// POST /graphql - myClientInstalledAreas
// POST /graphql - saveMyClientInstalledArea
// POST /graphql - deleteMyClientInstalledArea
