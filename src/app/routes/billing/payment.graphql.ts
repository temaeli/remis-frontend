import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * The GePG payment chain: payment_headers -> payment_transaction_details -> paidamt.
 *
 * Read-only from the UI's point of view. Every row here is written from a GePG
 * callback rather than by a clerk, and the amounts are derived from the bill
 * behind them, so there is nothing to edit — a payment that disagrees with its
 * bill is a fact to investigate, not a field to correct.
 *
 * Written out rather than built from a lookup config: the backend exposes
 * `paymentTransactionsByHeader` and `paymentTotalByHeader` rather than the
 * standard five, and the two `check` operations have no lookup equivalent at all.
 */
const coreFields = `
  id
  uid: id
  active
  isDeleted
  createdAt
`;

/** A related record, kept shallow so a payment does not drag its whole graph along. */
const refFields = `
  id
  uid: id
  name
`;

export const paymentHeaderGqlFields = `
  ${coreFields}
  reqId
  grpBillId
  customerControlNumber
  entryCount
  billHeader { ${refFields} assignedNumber }
`;

export const paymentTransactionGqlFields = `
  ${coreFields}
  assignedNumber
  name
  description
  billId
  billControlNumber
  transactionId
  paymentReferenceId
  billAmount
  paidAmount
  balance
  paidAmountEquivalentTzs
  balanceEquivalentTzs
  collectionAccountNumber
  transactionDateTime
  usedPaymentChannel
  quoteReferenceId
  payerName
  payerEmail
  payerCellNumber
  currency { ${refFields} assignedNumber }
  spCode { ${refFields} }
  billPayOption { ${refFields} }
  paymentServiceProvider { ${refFields} }
  billItems { ${refFields} finalBillItemAmt finalBillItemEqvAmt gfsCode { ${refFields} } }
`;

export const paymentTotalGqlFields = `
  ${coreFields}
  totalBillAmount
  totalPaidAmount
  totalPaidAmountEquivalentTzs
  totalBalance
  totalBalanceEquivalentTzs
`;

export const ALL_PAYMENTS_PAGEABLE = gql`
  query allPaymentHeadersPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allPaymentHeadersPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(paymentHeaderGqlFields)}
    }
  }
`;

export const FIND_PAYMENT = gql`
  query findPaymentHeader($uid: String) {
    findPaymentHeader(uid: $uid) {
      ${responseGqlFields(paymentHeaderGqlFields)}
    }
  }
`;

export const PAYMENT_TRANSACTIONS_OF_PAYMENT = gql`
  query paymentTransactionsByHeader($paymentHeaderUid: String) {
    paymentTransactionsByHeader(paymentHeaderUid: $paymentHeaderUid) {
      ${paymentTransactionGqlFields}
    }
  }
`;

export const PAYMENT_TOTAL_OF_PAYMENT = gql`
  query paymentTotalByHeader($paymentHeaderUid: String) {
    paymentTotalByHeader(paymentHeaderUid: $paymentHeaderUid) {
      ${responseGqlFields(paymentTotalGqlFields)}
    }
  }
`;

/**
 * Whether GePG delivered as many transactions as its header claimed. A shortfall
 * is a partial delivery, which is a different problem from a payment that
 * disagrees with its bill.
 */
export const PAYMENT_DELIVERY_STATUS = gql`
  query paymentDeliveryStatus($uid: String) {
    paymentDeliveryStatus(uid: $uid)
  }
`;

/**
 * The integrity rules, run against what is already stored.
 *
 * Both return a plain list of strings: empty means every rule passes. Worth
 * running after the fact rather than only on write, because a rate edited or a
 * fee corrected can make a payment that was clean when it arrived stop agreeing
 * with its bill.
 */
export const CHECK_PAYMENT_TOTAL = gql`
  query checkPaymentTotal($uid: String) {
    checkPaymentTotal(uid: $uid)
  }
`;

export const CHECK_PAYMENT_TRANSACTION = gql`
  query checkPaymentTransactionDetail($uid: String) {
    checkPaymentTransactionDetail(uid: $uid)
  }
`;

export const PAYMENTS_OF_BILL_HEADER = gql`
  query paymentHeadersByBillHeader($billHeaderUid: String) {
    paymentHeadersByBillHeader(billHeaderUid: $billHeaderUid) {
      ${paymentHeaderGqlFields}
    }
  }
`;
