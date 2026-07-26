import { gql } from 'apollo-angular';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

export const anticipatedProductionFields = `
  plant { uid name }
  productionDate
  anticipatedMmscfd
  anticipatedSm3PerDay
  remarks
  status
  submittedAt
  submittedByUser { uid fullName }
  reviewedAt
  reviewedByUser { uid fullName }
  reviewComments
  ${baseGqlFields}
`;

const workflowReturn = responseGqlFields('uid status reviewComments');

export const ALL_ANTICIPATED_PRODUCTIONS_PAGEABLE = gql`
  query allAnticipatedProductionsPageable($active: Boolean, $pageableParam: PageableParamInput) {
    allAnticipatedProductionsPageable(active: $active, pageableParam: $pageableParam) {
      ${pageGqlFields(anticipatedProductionFields)}
    }
  }
`;

export const FIND_ANTICIPATED_PRODUCTION = gql`
  query findAnticipatedProduction($uid: String!) {
    findAnticipatedProduction(uid: $uid) {
      ${responseGqlFields(anticipatedProductionFields)}
    }
  }
`;

export const ANTICIPATED_PRODUCTIONS_BY_PLANT = gql`
  query anticipatedProductionsByPlant($plantUid: String) {
    anticipatedProductionsByPlant(plantUid: $plantUid) {
      ${anticipatedProductionFields}
    }
  }
`;

export const SAVE_ANTICIPATED_PRODUCTION = gql`
  mutation saveAnticipatedProduction($dto: AnticipatedProductionDtoInput) {
    saveAnticipatedProduction(dto: $dto) {
      ${responseGqlFields(anticipatedProductionFields)}
    }
  }
`;

export const SUBMIT_ANTICIPATED_PRODUCTION = gql`
  mutation submitAnticipatedProduction($dto: WorkflowActionDtoInput) {
    submitAnticipatedProduction(dto: $dto) { ${workflowReturn} }
  }
`;

export const REVIEW_ANTICIPATED_PRODUCTION = gql`
  mutation reviewAnticipatedProduction($dto: WorkflowActionDtoInput, $approved: Boolean) {
    reviewAnticipatedProduction(dto: $dto, approved: $approved) { ${workflowReturn} }
  }
`;

export const DELETE_ANTICIPATED_PRODUCTION = gql`
  mutation deleteAnticipatedProduction($uid: String) {
    deleteAnticipatedProduction(uid: $uid) { ${workflowReturn} }
  }
`;
