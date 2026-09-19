import { gql } from '@apollo/client/core';

/**
 * The sixteen GePG tables a bill header owns, read one at a time.
 *
 * `gepgTrailOfBillHeader` reads the same rows folded into four conversations,
 * which answers what happened. These answer what a row says — every column the
 * table has, rather than the five a trail step reduces it to.
 *
 * Every query is gated on viewing a bill header, as the trail is: none of these
 * rows exists apart from the header, and all of them are written by a flow or a
 * callback rather than by hand.
 *
 * `payload` is selected wherever a table holds one. A signed GePG body is
 * thousands of characters, so the grids show it truncated; the whole thing is on
 * the record for anyone who needs it.
 */

/** The audit fields every one of these tables carries. */
const recordFields = `
  id
  uid: id
  createdAt
`;

/** Who asked and when, on the tables that record it. */
const requestedFields = `
  requestedAt
  requestedBy {
    id
    name
  }
`;

export const CONTROL_NUMBER_REQUESTS_OF_BILL_HEADER = gql`
  query controlNumberRequestsByBillHeader($billHeaderUid: String) {
    controlNumberRequestsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      payload
      ${requestedFields}
    }
  }
`;

export const ACKNOWLEDGEMENTS_OF_BILL_HEADER = gql`
  query acknowledgementsByBillHeader($billHeaderUid: String) {
    acknowledgementsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedCode
      name
      payload
    }
  }
`;

export const FINAL_RESPONSES_OF_BILL_HEADER = gql`
  query finalResponsesByBillHeader($billHeaderUid: String) {
    finalResponsesByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      gepgCode
      respondedAt
      payload
    }
  }
`;

export const CONTROL_NUMBERS_OF_BILL_HEADER = gql`
  query controlNumbersByBillHeader($billHeaderUid: String) {
    controlNumbersByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      controlNumber
      billId
      resultStatus
      resultStatusCode
      resultStatusDescription
    }
  }
`;

export const REUSE_REASONS_OF_BILL_HEADER = gql`
  query reuseReasonsByBillHeader($billHeaderUid: String) {
    reuseReasonsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      reason
      ${requestedFields}
      reuse {
        id
        controlNumber
      }
    }
  }
`;

export const REUSE_REQUESTS_OF_BILL_HEADER = gql`
  query reuseRequestsByBillHeader($billHeaderUid: String) {
    reuseRequestsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      payload
      ${requestedFields}
      reuseReason {
        id
        reason
      }
    }
  }
`;

export const CANCELLATION_SAVED_REQUESTS_OF_BILL_HEADER = gql`
  query billCancellationRequestsByBillHeader($billHeaderUid: String) {
    billCancellationRequestsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedCode
      name
      reason
    }
  }
`;

export const EXTENSION_SAVED_REQUESTS_OF_BILL_HEADER = gql`
  query billChangeRequestsByBillHeader($billHeaderUid: String) {
    billChangeRequestsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedCode
      name
      updateReason
      latestExpiryDate
    }
  }
`;

export const CHANGE_REQUESTS_OF_BILL_HEADER = gql`
  query changeRequestsByBillHeader($billHeaderUid: String) {
    changeRequestsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      updateReason
      latestExpiryDate
      ${requestedFields}
    }
  }
`;

export const CHANGE_REQUEST_PAYLOADS_OF_BILL_HEADER = gql`
  query changeRequestPayloadsByBillHeader($billHeaderUid: String) {
    changeRequestPayloadsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedCode
      name
      payload
      changeRequest {
        id
        assignedNumber
      }
    }
  }
`;

export const EXPIRY_EXTENSIONS_OF_BILL_HEADER = gql`
  query expiryExtensionsByBillHeader($billHeaderUid: String) {
    expiryExtensionsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      payload
    }
  }
`;

export const EXPIRY_DATES_OF_BILL_HEADER = gql`
  query billExpiryDatesByBillHeader($billHeaderUid: String) {
    billExpiryDatesByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      description
      expiryDate
    }
  }
`;

export const CANCELLATION_REASONS_OF_BILL_HEADER = gql`
  query cancellationReasonsByBillHeader($billHeaderUid: String) {
    cancellationReasonsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      reason
      cancelledControlNumber
      ${requestedFields}
      cancelledAt
      approvedAt
    }
  }
`;

export const CANCELLATION_REQUESTS_OF_BILL_HEADER = gql`
  query cancellationRequestsByBillHeader($billHeaderUid: String) {
    cancellationRequestsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedNumber
      name
      payload
      ${requestedFields}
      cancellationReason {
        id
        reason
      }
    }
  }
`;

export const CANCELLATION_RESPONSES_OF_BILL_HEADER = gql`
  query cancellationResponsesByBillHeader($billHeaderUid: String) {
    cancellationResponsesByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      responseId
      requestId
      groupBillId
      cancellationStatus
      cancellationStatusCode
      cancellationStatusDescription
    }
  }
`;

export const CANCELLATION_RESPONSE_PAYLOADS_OF_BILL_HEADER = gql`
  query cancellationResponsePayloadsByBillHeader($billHeaderUid: String) {
    cancellationResponsePayloadsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${recordFields}
      assignedCode
      name
      payload
    }
  }
`;
