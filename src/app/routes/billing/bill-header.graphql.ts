import { gql } from '@apollo/client/core';

import { billGqlFields } from './bill.graphql';

/**
 * What hangs off a bill header, for the tabs on the header's own screen.
 *
 * The header is the hub of the billing module: bills are raised under it,
 * GePG issues a control number against it, payments are reported against it,
 * and its status history is what the flow advances. Fourteen more tables record
 * the GePG conversation itself — those are read through `gepgTrailOfBillHeader`
 * rather than one by one, and live in `bill-gepg.graphql`.
 */

/** The bills raised under this header. */
export const BILLS_OF_BILL_HEADER = gql`
  query billDetailsByBillHeader($billHeaderUid: String) {
    billDetailsByBillHeader(billHeaderUid: $billHeaderUid) {
      ${billGqlFields}
    }
  }
`;

/**
 * Every status the header has reached, newest first.
 *
 * A history rather than a column: each status is reachable once — the pair is
 * UNIQUE — so the rows are the path the header took, not a log of attempts. A
 * retry leaves no row, which is why a header can sit at one status for a while.
 */
export const STATUSES_OF_BILL_HEADER = gql`
  query billHeaderStatusesByBillHeader($billHeaderUid: String) {
    billHeaderStatusesByBillHeader(billHeaderUid: $billHeaderUid) {
      id
      uid: id
      status
      createdAt
    }
  }
`;

/**
 * Control numbers recorded as used again on this header.
 *
 * The `reuses` table, which is the decision written down — distinct from the
 * Reuse tab of the GePG trail, which is what was actually sent and answered.
 */
export const REUSES_OF_BILL_HEADER = gql`
  query reusesByBillHeader($billHeaderUid: String) {
    reusesByBillHeader(billHeaderUid: $billHeaderUid) {
      id
      uid: id
      controlNumber
      assignedCode
      reason
      createdAt
    }
  }
`;
