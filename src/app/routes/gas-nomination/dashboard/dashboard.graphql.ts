import { gql } from '@apollo/client/core';

export const NOMINATION_STATUS_BREAKDOWN = gql`
  query NominationStatusBreakdown($from: LocalDate, $to: LocalDate) {
    nominationStatusBreakdown(from: $from, to: $to) {
      status
      count
      totalQuantityMmscfd
    }
  }
`;

export const NOMINATIONS_BY_CLIENT = gql`
  query NominationsByClient($from: LocalDate, $to: LocalDate) {
    nominationsByClient(from: $from, to: $to) {
      clientUid
      clientName
      clientStreamType
      nominations
      totalRequestedMmscfd
      belowMinimumCount
      aboveMaximumCount
      lateCount
    }
  }
`;

export const NOMINATIONS_BY_PLANT = gql`
  query NominationsByPlant($from: LocalDate, $to: LocalDate) {
    nominationsByPlant(from: $from, to: $to) {
      plantUid
      plantCode
      plantName
      batches
      totalAllocatedMmscfd
      totalUpstreamerConfirmedMmscfd
      pendingUpstreamerReply
    }
  }
`;

// POST /graphql - nominationStatusBreakdown
// POST /graphql - nominationsByClient
// POST /graphql - nominationsByPlant
