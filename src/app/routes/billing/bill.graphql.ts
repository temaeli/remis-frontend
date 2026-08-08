import { gql } from '@apollo/client/core';
import { pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * The bill, its lines and its total.
 *
 * These tables live in the DBA-owned `remis_core_schema`, so the audit block
 * records only creation and `uid` is an alias onto the uuid primary key — the
 * same shape the lookup screens use, written out here because a bill is not a
 * lookup and has no config to build it from.
 */
const coreFields = `
  id
  uid: id
  active
  isDeleted
  createdAt
`;

/** A related record, kept shallow so a bill does not drag its whole graph along. */
const refFields = `
  id
  uid: id
  name
`;

export const billGqlFields = `
  ${coreFields}
  assignedNumber
  name
  description
  generatedAt
  approvedAt
  expiredAt
  billHeader { ${refFields} assignedNumber }
  bioData { id name }
  identityType { ${refFields} }
  tinData { ${refFields} assignedNumber }
  currency { ${refFields} }
  exchangeRate { ${refFields} rateAgainstTzs }
  financialYear { ${refFields} }
  billPayOption { ${refFields} }
  billPaymentPlan { ${refFields} }
  collectionCenter { ${refFields} }
  gepgBillType { ${refFields} }
  gepgPayType { ${refFields} }
  payPlan { ${refFields} }
  spCode { ${refFields} }
  paymentServiceProvider { ${refFields} }
`;

export const billItemGqlFields = `
  ${coreFields}
  assignedNumber
  name
  description
  refBillId
  billItemRef
  quantities
  billItemAmt
  billItemEqvAmt
  finalBillItemAmt
  finalBillItemEqvAmt
  fee { ${refFields} amount }
  vat { ${refFields} vat }
  withholdingTax { ${refFields} withholdingTax }
  discount { ${refFields} discounts }
  subSpCode { ${refFields} }
  gfsCode { ${refFields} }
  useItemRefOnPay { ${refFields} }
  financialYear { ${refFields} }
  collsp { ${refFields} }
`;

//  Queries

export const ALL_BILLS_PAGEABLE = gql`
  query allBillDetailsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    allBillDetailsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(billGqlFields)}
    }
  }
`;

export const FIND_BILL = gql`
  query findBillDetail($uid: String) {
    findBillDetail(uid: $uid) {
      ${responseGqlFields(billGqlFields)}
    }
  }
`;

/** The lines of one bill, which its total is summed from. */
export const BILL_ITEMS_OF_BILL = gql`
  query billItemsOfBill($billDetailUid: String) {
    billItemsOfBill(billDetailUid: $billDetailUid) {
      ${billItemGqlFields}
    }
  }
`;

/** What one bill comes to. Absent until the bill has at least one line. */
export const BILL_AMOUNT_OF_BILL = gql`
  query billAmountOfBill($billDetailUid: String) {
    billAmountOfBill(billDetailUid: $billDetailUid) {
      ${coreFields}
      billAmt
      billEqvAmt
    }
  }
`;

//  Mutations

/**
 * Raises a whole bill — header, bill, lines and total — in one transaction.
 * Anything less than all of it is not a bill anyone could pay, so the backend
 * rolls the lot back on any failure.
 */
export const RAISE_BILL = gql`
  mutation raiseBill($input: BillDtoInput) {
    raiseBill(input: $input) {
      ${responseGqlFields(billGqlFields)}
    }
  }
`;
