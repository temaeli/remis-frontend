import { gql } from '@apollo/client/core';
import {
  baseGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const nominationBatchGqlFields = `
endDate
items{
  id
  uid
  nominationDate
  nominationsCount
  status
  totalDemandMmscfd
  totalDemandSm3PerDay
  totalHourlyFlowSm3PerHour
}
migrated
nominationDate
periodType
pipelineSupervisorComments
pipelineSupervisorUser{
id
uid
fullName
}
plantNominations{
id
uid
allocatedDailyMmscfd
allocatedDailySm3
allocatedHourlyFlowSm3PerHour
plant{
id
uid
name
}
}
referenceNumber
requestDate
startDate
status
totalDemandMmscfd
totalDemandSm3PerDay
totalHourlyFlowSm3PerHour
${baseGqlFields}
`;

export const autoAggregateRunDtoGqlFields = `
aggregateRejected
autoAggregationOn
batchesCreated
cutoffEnforcementOn
days{
autoFilledNominations
gasDay
message
outcome
}
daysSkippedAlreadyAggregated
daysSkippedBeforeCutoff
finishedAt
message
nominationsAutoFilled
ran
startedAt
`;

export const plantDistributionPreviewGqlFields = `
batchUid
referenceNumber
originalDemandMmscfd
proposedDemandMmscfd
demandScale
plants{
 plantUid
 plantName
 plantCode
 plantDailyProductionCapacityMmscfd
 allocatedDailyMmscfd
 allocatedDailySm3
 allocatedHourlyFlowSm3PerHour
 assignedItemsCount
}
`;

export const nominationBatchItemGqlFields = `
batch{
 id
 uid
 referenceNumber
}
migrated
nominationDate
nominationsCount
status
totalDemandMmscfd
totalDemandSm3PerDay
totalHourlyFlowSm3PerHour
${baseGqlFields}
`;

export const plantNominationsGqlFields = `
 allocatedDailyMmscfd
 allocatedDailySm3
allocatedHourlyFlowSm3PerHour
assignedItemsCount
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
  }
 plantDailyProductionCapacityMmscfd
 reviewedAt
 reviewedByUser
{
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

export const plantNominationUpstreamerDispatchGqlFields = `
comments
communicationRef
confirmedAt
confirmedByUser
{
 id
 uid
}
confirmedDailyMmscfd
failureReason
letterAttachmentUrl
migrated
plantNomination
{
 id
 uid
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
  ${baseGqlFields}
`;

//  Mutations

export const AGGREGATE_NOMINATIONS = gql`
  mutation aggregateNominations($dto: NominationAggregationDtoInput){
   aggregateNominations(dto: $dto) {
      ${responseGqlFields(nominationBatchGqlFields)}
    }
  }
 `;

export const TRIGGER_AUTO_NOMINATION_AGGREGATE = gql`
  mutation triggerAutoNominationAggregate{
   triggerAutoNominationAggregate{
      ${responseGqlFields(autoAggregateRunDtoGqlFields)}
    }
  }
 `;

export const SUBMIT_AGGREGATE_NOMINATIONS = gql`
  mutation submitAggregateNominations($batchUid: String!){
   submitAggregateNominations(batchUid: $batchUid) {
      ${responseGqlFields(nominationBatchGqlFields)}
    }
  }
 `;

export const ADJUST_AGGREGATE_NOMINATIONS = gql`
  mutation adjustAggregateNominations($batchUid: String, $proposedDemandMmscfd: String, $comments: String){
   adjustAggregateNominations(batchUid: $batchUid, proposedDemandMmscfd: $proposedDemandMmscfd, comments: $comments) {
      ${responseGqlFields(nominationBatchGqlFields)}
    }
  }
 `;

export const PREVIEW_PLANT_DISTRIBUTIONS = gql`
  query previewPlantDistributions($batchUid: String){
   previewPlantDistributions(batchUid: $batchUid) {
      ${responseGqlFields(plantDistributionPreviewGqlFields)}
    }
  }
 `;
export const ASSIGN_BATCH_TO_PLANTS = gql`
  mutation assignBatchToPlants($batchUid: String){
   assignBatchToPlants(batchUid: $batchUid) {
      ${responseGqlFields(nominationBatchGqlFields)}
    }
  }
 `;

export const MANUAL_ASSIGN_BATCH_TO_PLANTS = gql`
  mutation manualAssignBatchToPlants($batchUid: String, $entries: [PlantAssignmentEntryDtoInput]){
   manualAssignBatchToPlants(batchUid: $batchUid, entries: $entries) {
      ${responseGqlFields(nominationBatchGqlFields)}
    }
  }
 `;

export const REVIEW_AGGREGATE_AS_PIPELINE_MANAGER = gql`
  mutation reviewAggregateAsPipelineManager($batchUid: String, $approved: Boolean, $comments: String){
   reviewAggregateAsPipelineManager(batchUid: $batchUid, approved: $approved, comments: $comments) {
      ${responseGqlFields(nominationBatchGqlFields)}
    }
  }
 `;
//  Queries

export const ALL_NOMINATION_BATCHES = gql`
  query allNominationBatches{
   allNominationBatches {
      ${nominationBatchGqlFields}
    }
  }
 `;

export const NOMINATION_BATCH_ITEMS = gql`
  query nominationBatchItems($batchUid: String!){
   nominationBatchItems(batchUid: $batchUid) {
      ${nominationBatchItemGqlFields}
    }
  }
 `;

export const PLANT_NOMINATIONS = gql`
  query plantNominations($batchUid: String!){
   plantNominations(batchUid: $batchUid) {
      ${plantNominationsGqlFields}
    }
  }
 `;

export const PLANT_NOMINATION_ITEMS = gql`
  query plantNominationItems($batchUid: String!){
   plantNominationItems(batchUid: $batchUid) {
      ${plantNominationsGqlFields}
    }
  }
 `;

export const REVIEW_PLANT_NOMINATION = gql`
  mutation reviewPlantNomination($dto: PlantNominationReviewDtoInput){
   reviewPlantNomination(dto: $dto) {
      ${responseGqlFields(plantNominationsGqlFields)}
    }
  }
 `;

export const REVIEW_AS_PLANT_SHIFT_SUPERVISOR = gql`
  mutation reviewAsPlantShiftSupervisor($plantNominationUid: String, $approved: Boolean, $comments: String){
   reviewAsPlantShiftSupervisor(plantNominationUid: $plantNominationUid, approved: $approved, comments: $comments) {
      ${responseGqlFields(plantNominationsGqlFields)}
    }
  }
 `;

export const PREVIEW_UPSTREAMER_LETTER_PDF = gql`
  query previewUpstreamerLetterPdf($plantNominationUid: String){
   previewUpstreamerLetterPdf(plantNominationUid: $plantNominationUid) {
      ${plainResponseGqlFields}
    }
  }
 `;

export const PREVIEW_UPSTREAMER_LETTER_PDF_FOR_DISPATCH = gql`
  query previewUpstreamerLetterPdfForDispatch($dispatchUid: String){
   previewUpstreamerLetterPdfForDispatch(dispatchUid: $dispatchUid) {
      ${plainResponseGqlFields}
    }
  }
 `;

export const RETURN_PLANT_NOMINATION_TO_PIPELINE_SHIFT_SUPERVISOR = gql`
  mutation returnPlantNominationToPipelineShiftSupervisor($plantNominationUid: String, $comments: String){
   returnPlantNominationToPipelineShiftSupervisor(plantNominationUid: $plantNominationUid, comments: $comments) {
      ${responseGqlFields(plantNominationsGqlFields)}
    }
  }
 `;

export const REVIEW_AS_PLANT_SUPERINTENDENT = gql`
  mutation reviewAsPlantSuperintendent($plantNominationUid: String, $approved: Boolean, $comments: String){
   reviewAsPlantSuperintendent(plantNominationUid: $plantNominationUid, approved: $approved, comments: $comments) {
      ${responseGqlFields(plantNominationsGqlFields)}
    }
  }
 `;

export const APPROVE_AS_PLANT_MANAGER = gql`
  mutation approveAsPlantManager($plantNominationUid: String, $approved: Boolean, $comments: String){
   approveAsPlantManager(plantNominationUid: $plantNominationUid, approved: $approved, comments: $comments) {
      ${responseGqlFields(plantNominationsGqlFields)}
    }
  }
 `;

export const SEND_UPSTREAMER_NOMINATION_LETTER = gql`
  mutation sendUpstreamerNominationLetter($plantNominationUid: String){
   sendUpstreamerNominationLetter(plantNominationUid: $plantNominationUid) {
      ${responseGqlFields(plantNominationUpstreamerDispatchGqlFields)}
    }
  }
 `;

export const RESEND_UPSTREAMER_NOMINATION_LETTER = gql`
  mutation resendUpstreamerNominationLetter($dispatchUid: String){
   resendUpstreamerNominationLetter(dispatchUid: $dispatchUid) {
      ${responseGqlFields(plantNominationUpstreamerDispatchGqlFields)}
    }
  }
 `;

export const UPSTREAMER_CONFIRMED_PLANT_NOMINATIONS = gql`
  query upstreamerConfirmedPlantNominations($batchUid: String){
   upstreamerConfirmedPlantNominations(batchUid: $batchUid) {
      ${plantNominationsGqlFields}
    }
  }
 `;
