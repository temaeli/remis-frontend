import { gql } from '@apollo/client/core';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/** The permission the report screen and its query are guarded by. */
export const BILL_ITEMS_REPORT_PERMISSIONS = ['ROLE_VIEW_BILL_ITEMS_REPORT'];

/**
 * One page of the bill items report, read from the DBA's report function.
 *
 * The function returns no total, so a page says only whether another follows
 * (`hasNext`). `page` is zero-based.
 */
export const BILL_ITEMS_REPORT = gql`
  query billItemsReport($filter: BillItemsReportFilterInput, $page: Int, $size: Int) {
    billItemsReport(filter: $filter, page: $page, size: $size) {
      ${responseGqlFields(`
        page
        size
        hasNext
        rows {
          billItemUid
          billItemNumber
          billItemName
          billItemRef
          quantity
          billItemAmount
          billItemEqvAmount
          finalBillItemAmount
          finalBillItemEqvAmount
          billItemCreatedAt
          feeCode
          feeName
          currencyCode
          exchangeRate
          billDetailUid
          billId
          billName
          billAmount
          generatedAt
          approvedAt
          expiredAt
          billHeaderUid
          billHeaderNumber
          billHeaderName
          grpBillId
          status
          statusAt
          controlNumber
          billExpiryDate
          paymentHeaderUid
          trxId
          trxDate
          paidControlNumber
          paidAmount
          paidAmountTzs
          balance
          payerName
          payerEmail
          payerCellNumber
          payRefId
          pspTrxId
          usedPayChannel
          totalBillAmount
          totalPaidAmount
          totalBalance
        }
      `)}
    }
  }
`;

/** The latest status a bill header can be in, as remis_core_schema.statuses lists them. */
export const BILL_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'CONTROL_NUMBER_REQUESTED',
  'WAITING_FOR_CONTROL_NUMBER',
  'WAITING_FOR_PAYMENT',
  'PARTIALLY_PAID',
  'FULL_PAID',
  'OVERPAID',
  'EXACTLY_PAID',
  'PARTIALLY_SETTLED',
  'FULL_SETTLED',
  'CANCELLED',
  'EXPIRED',
  'CREATED',
  'PENDING',
  'FORWARDED',
  'PASSED',
  'FAILED',
  'WIP',
];
