import { gql } from '@apollo/client/core';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * The GePG operations a raised bill can be put through.
 *
 * Every one of these takes a **bill header** uid, not a bill's. GePG issues one
 * control number per header, so the header is what it knows about — the bill
 * screen resolves `billHeader.id` before calling.
 *
 * The data they return is a bill header, but only its identity is worth reading
 * back: what actually happened is in `status` and `message`, because the reply
 * from GePG is an acknowledgement and the control number itself arrives later
 * on the callback.
 */
const headerResultFields = `
  id
  uid: id
  assignedNumber
  name
  reqId
  grpBillId
`;

/**
 * Submits the bill and waits for GePG's acknowledgement.
 *
 * `queueBillForControlNumber` exists too and only does the first half, leaving
 * the batch to send it. This one is what a person pressing a button wants: an
 * answer now rather than at the next scheduled run.
 */
export const REQUEST_CONTROL_NUMBER = gql`
  mutation requestControlNumberNow($billHeaderUid: String) {
    requestControlNumberNow(billHeaderUid: $billHeaderUid) {
      ${responseGqlFields(headerResultFields)}
    }
  }
`;

/** Puts a control number the bill already holds back into use. */
export const REUSE_CONTROL_NUMBER = gql`
  mutation reuseBillControlNumber($billHeaderUid: String, $reason: String) {
    reuseBillControlNumber(billHeaderUid: $billHeaderUid, reason: $reason) {
      ${responseGqlFields(headerResultFields)}
    }
  }
`;

/**
 * Moves the bill's expiry date at GePG, keeping its control number.
 *
 * Only possible once a control number exists — there is no expiry date at GePG
 * to move before that — and the new date has to be in the future. The backend
 * refuses both cases before sending anything and says which.
 */
export const CHANGE_BILL_EXPIRY = gql`
  mutation changeBillExpiry($billHeaderUid: String, $newExpiry: LocalDateTime, $reason: String) {
    changeBillExpiry(billHeaderUid: $billHeaderUid, newExpiry: $newExpiry, reason: $reason) {
      ${responseGqlFields(headerResultFields)}
    }
  }
`;

/** Asks GePG to cancel the control number, which retires the bill. */
export const CANCEL_CONTROL_NUMBER = gql`
  mutation cancelBillControlNumber($billHeaderUid: String, $reason: String) {
    cancelBillControlNumber(billHeaderUid: $billHeaderUid, reason: $reason) {
      ${responseGqlFields(headerResultFields)}
    }
  }
`;

/**
 * What passed between this bill and GePG on one flow, oldest first.
 *
 * A read model rather than a table: the trail behind an operation is spread
 * over three or four tables — the reason, the request, the acknowledgement, the
 * response — and this is what they look like put in order. See
 * `GepgTrailService` on the backend.
 */
export const GEPG_TRAIL_OF_BILL_HEADER = gql`
  query gepgTrailOfBillHeader($billHeaderUid: String, $flow: GepgFlow) {
    gepgTrailOfBillHeader(billHeaderUid: $billHeaderUid, flow: $flow) {
      uid
      occurredAt
      step
      reference
      summary
      payload
    }
  }
`;
