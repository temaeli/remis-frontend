import { gql } from 'apollo-angular';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

export const securityActionItemFields = `
  observationReported
  specificLocation
  priority
  controlMeasures
  responsibleName
  responsibleUser { uid fullName }
  initiationDate
  closedDate
  status
  remarks
  sourceType
  sourceUid
  station { uid name }
  ${baseGqlFields}
`;

export const ALL_SECURITY_ACTION_ITEMS_PAGEABLE = gql`
  query allSecurityActionItemsPageable($active: Boolean, $pageableParam: PageableParamInput){
    allSecurityActionItemsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(securityActionItemFields)}
    }
  }
`;

export const SECURITY_ACTION_ITEMS_BY_SOURCE = gql`
  query securityActionItemsBySource($sourceType: String, $sourceUid: String){
    securityActionItemsBySource(sourceType: $sourceType, sourceUid: $sourceUid){
      ${securityActionItemFields}
    }
  }
`;

export const FIND_SECURITY_ACTION_ITEM = gql`
  query findSecurityActionItem($uid: String!){
    findSecurityActionItem(uid: $uid){
      ${responseGqlFields(securityActionItemFields)}
    }
  }
`;

export const SAVE_SECURITY_ACTION_ITEM = gql`
  mutation saveSecurityActionItem($dto: SecurityActionItemDtoInput){
    saveSecurityActionItem(dto: $dto){
      ${responseGqlFields(securityActionItemFields)}
    }
  }
`;

export const DELETE_SECURITY_ACTION_ITEM = gql`
  mutation deleteSecurityActionItem($uid: String){
    deleteSecurityActionItem(uid: $uid){
      ${responseGqlFields(securityActionItemFields)}
    }
  }
`;
