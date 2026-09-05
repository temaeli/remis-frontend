import { gql } from '@apollo/client/core';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * Asks GePG for every payment it took on one day.
 *
 * The only GePG operation that names a date rather than a bill, which is why it
 * lives with the payments and not with a bill: the answer spans every bill paid
 * that day.
 *
 * What comes back is the request as recorded, not the statement. GePG
 * acknowledges the request and delivers the statement separately, the same way
 * a control number arrives after a bill is submitted.
 */
export const REQUEST_RECONCILIATION = gql`
  mutation requestReconciliation(
    $spGrpCodeUid: String
    $systemCodeUid: String
    $transactionDate: LocalDateTime
  ) {
    requestReconciliation(
      spGrpCodeUid: $spGrpCodeUid
      systemCodeUid: $systemCodeUid
      transactionDate: $transactionDate
    ) {
      ${responseGqlFields(`
        id
        uid: id
        assignedNumber
        name
        transactionDate
        requestedAt
      `)}
    }
  }
`;

/**
 * Records a reconciliation without sending it.
 *
 * The first of the two steps: it says which day and under which codes, and GePG
 * hears nothing until the row is sent. A row saved this way carries a placeholder
 * where its ReqId will go — the request id is minted by the send.
 */
export const SAVE_RECONCILIATION_REQUEST = gql`
  mutation saveReconciliationRequest(
    $spGrpCodeUid: String
    $systemCodeUid: String
    $transactionDate: LocalDateTime
  ) {
    saveReconciliationRequest(
      spGrpCodeUid: $spGrpCodeUid
      systemCodeUid: $systemCodeUid
      transactionDate: $transactionDate
    ) {
      ${responseGqlFields(`
        id
        uid: id
        assignedNumber
        name
        transactionDate
        requestedAt
      `)}
    }
  }
`;

/**
 * Sends a saved reconciliation to GePG.
 *
 * Takes the record's identifier and nothing else, so what is asked is what the
 * record says. Sending the same row again asks the same question again — a
 * retry, or a payment that landed late — and GePG tells each attempt apart by
 * its own ReqId, which the row picks up when it is accepted.
 */
export const SEND_RECONCILIATION_REQUEST = gql`
  mutation sendReconciliationRequest($uid: String) {
    sendReconciliationRequest(uid: $uid) {
      ${responseGqlFields(`
        id
        uid: id
        assignedNumber
        name
        transactionDate
        requestedAt
      `)}
    }
  }
`;

/** The reconciliations asked for, newest first. */
export const ALL_RECONCILIATION_REQUESTS = gql`
  query allReconciliationRequests {
    allReconciliationRequests {
      id
      uid: id
      assignedNumber
      name
      transactionDate
      requestedAt
      createdAt
      spGrpCode {
        id
        assignedNumber
        name
      }
      systemCode {
        id
        assignedNumber
        name
      }
    }
  }
`;

/**
 * The statements GePG has sent back.
 *
 * A request with no statement beside it is one GePG has not answered yet, which
 * is the thing this screen exists to make visible.
 */
export const ALL_RECONCILIATION_STATEMENTS = gql`
  query allReconciliationStatements {
    allReconciliationStatements {
      id
      uid: id
      responseId
      requestId
      spGrpCode
      systemCode
      paymentStatusCode
      paymentStatusDescription
      createdAt
    }
  }
`;
