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
