import { gql } from '@apollo/client/core';
import { baseGqlFields, responseGqlFields, pageGqlFields } from '@shared/fetch/graphql.constants';

// GSA Fields for nomination validation
export const gasSalesAgreementGqlFields = `
minimumDailyMmscfd
maximumDailyMmscfd
contractName
contractNumber
startDate
endDate
status
${baseGqlFields}
`;

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
 email
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

export const NominationCutoffScenarioDto = `
deadline
label
late
nominationDate
outcomeIfSubmittedNow
`;

export const NominationCutoffCheckDto = `
cutoffEnforced
dailyCutoffTime
deadline
late
lateBehaviour
nominationDate
now
outcomeIfSubmittedNow
periodType
reasoning
scenarios{
${NominationCutoffScenarioDto}
}
weeklyLeadHours
`;

//  Mutations
export const SAVE_MY_GAS_NOMINATION = gql`
  mutation saveMyGasNomination($dto: GasNominationDtoInput){
   saveMyGasNomination(dto: $dto) {
      ${responseGqlFields(gasNominationGqlFields)}
    }
  }
 `;

export const SUBMIT_MY_GAS_NOMINATION = gql`
  mutation submitMyGasNomination($groupReferenceNumber: String!){
   submitMyGasNomination(groupReferenceNumber: $groupReferenceNumber) {
      ${responseGqlFields(gasNominationGqlFields)}
    }
  }
 `;

//  Queries
export const MY_GAS_NOMINATIONS = gql`
  query myGasNominations{
   myGasNominations {
      ${gasNominationGqlFields}
    }
  }
 `;

export const CHECK_NOMINATION_CUTOFF = gql`
  query checkNominationCutoff($periodType: String, $nominationDate: String){
   checkNominationCutoff(periodType: $periodType, nominationDate: $nominationDate) {
      ${NominationCutoffCheckDto}
    }
  }
 `;

export const MY_GAS_SALES_AGREEMENT = gql`
  query myGasSalesAgreements{
   myGasSalesAgreements {
      ${gasSalesAgreementGqlFields}
    }
  }
 `;

export const PlantNomination = `
allocatedDailyMmscfd
allocatedDailySm3
allocatedHourlyFlowSm3PerHour
assignedItemsCount
batch{
 id
 uid
 referenceNumber
}
dispatches{
 id
 uid
}
items{
 id
 uid
}
migrated
plant{
 id
 uid
 name
}
plantDailyProductionCapacityMmscfd
reviewedAt
reviewedByUser{
id
uid
}
sentToUpstreamerAt
status
supervisorComments
supervisorReviewStatus
upstreamerCapacityMmscfd
${baseGqlFields}
`;

export const PlantNominationUpstreamerDispatch = `
uid
comments
communicationRef
confirmedAt
confirmedByUser{
 id
 uid
}
confirmedDailyMmscfd
failureReason
letterAttachmentUrl
migrated
plantNomination{
 id
  uid
  batch{
    id
    uid
    referenceNumber
  }
}
recipientEmail
sentAt
sentByUser{
 id
 uid
}
status
upstreamerClient{
 id
 uid
}
`;

export const assignedNominationGqlFields = `
uid
status
supervisorReviewStatus
allocatedDailyMmscfd
upstreamerCapacityMmscfd
submittedToPlantSupervisorAt
reviewedAt
plant {
  uid
  code
  name
}
batch {
  uid
  referenceNumber
  nominationDate
  status
}
${baseGqlFields}
`;

export const MY_ASSIGNED_PLANT_NOMINATIONS_PAGEABLE = gql`
  query myAssignedPlantNominationsPageable($batchStatus: String, $pageableParam: PageableParamInput){
   myAssignedPlantNominationsPageable(batchStatus: $batchStatus, pageableParam: $pageableParam) {
      ${pageGqlFields(PlantNomination)}
    }
  }
 `;

export const MY_PLANT_NOMINATION_COUNTS = gql`
  query myPlantNominationCounts {
    myPlantNominationCounts {
      total
      waitingOnMe
      approvedByMe
      rejectedByMe
      sentToUpstreamer
      confirmedByUpstreamer
    }
  }
`;

export const MY_ASSIGNED_UPSTREAMER_DISPATCHES_PAGEABLE = gql`
  query myAssignedUpstreamerDispatchesPageable($status: String!, $pageableParam: PageableParamInput){
   myAssignedUpstreamerDispatchesPageable(status: $status, pageableParam: $pageableParam) {
      ${pageGqlFields(PlantNominationUpstreamerDispatch)}
    }
  }
 `;

export const RECORD_UPSTREAMER_CONFIRMATION = gql`
   mutation recordUpstreamerConfirmation($dto: UpstreamerConfirmationDtoInput) {
     recordUpstreamerConfirmation(dto: $dto) {
       ${responseGqlFields(PlantNominationUpstreamerDispatch)}
     }
   }
 `;

export const REVIEW_AS_PLANT_SHIFT_SUPERVISOR = gql`
   mutation reviewAsPlantShiftSupervisor($approved: Boolean, $plantNominationUid: String, $comments: String) {
     reviewAsPlantShiftSupervisor(approved: $approved, plantNominationUid: $plantNominationUid, comments: $comments) {
       ${responseGqlFields(PlantNomination)}
     }
   }
 `;

export const RETURN_PLANT_NOMINATION_TO_PIPELINE_SHIFT_SUPER = gql`
   mutation returnPlantNominationToPipelineShiftSuper($plantNominationUid: String, $comments: String) {
     returnPlantNominationToPipelineShiftSuper(plantNominationUid: $plantNominationUid, comments: $comments) {
       ${responseGqlFields(PlantNomination)}
     }
   }
 `;

export const REVIEW_AS_PLANT_SUPERINTENDENT = gql`
   mutation reviewAsPlantSuperintendent($approved: Boolean,$plantNominationUid: String, $comments: String) {
     reviewAsPlantSuperintendent(approved: $approved, plantNominationUid: $plantNominationUid, comments: $comments) {
       ${responseGqlFields(PlantNomination)}
     }
   }
 `;
