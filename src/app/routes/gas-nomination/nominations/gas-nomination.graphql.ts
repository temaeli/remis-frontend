import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  baseMinimalGqlFields,
  pageGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const gasNominationGqlFields = `
aboveMaximum
batch{
 id
 uid
 referenceNumber
}
belowMinimum
client{
 id
 uid
 contactPersonName
 user{
  id
  uid
  fullName
 }
}
endDate
evidenceAttachmentUrl
evidentAttachment
groupReferenceNumber
hourlyFlowSm3PerHour
migrated
nominationDate
periodType
quantityMmscfd
quantitySm3PerDay
reason
referenceNumber
requestDate
startDate
status
${baseGqlFields}
`;

export const ALL_GAS_NOMINATIONS_PAGEABLE = gql`
  query allGasNominationsPageable($pageableParam: PageableParamInput, $active: Boolean){
   allGasNominationsPageable(pageableParam: $pageableParam, active: $active) {
     ${pageGqlFields(gasNominationGqlFields)}
    }
  }
 `;

export const GAS_NOMINATIONS_BY_STATUS_PAGEABLE = gql`
  query allGasNominationsByStatus($pageableParam: PageableParamInput, $status: NominationStatus){
   allGasNominationsByStatus(pageableParam: $pageableParam, status: $status) {
     ${pageGqlFields(gasNominationGqlFields)}
    }
  }
 `;
