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
  billHeader { ${refFields} assignedNumber grpBillId }
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

/**
 * What each line of one bill follows — `bill_items_bill_items`. A renewal's
 * line sits under the earlier line for the same fee; a line with no row here is
 * a first line.
 */
export const BILL_ITEM_CONNECTIONS_OF_BILL = gql`
  query billItemConnectionsOfBill($billDetailUid: String) {
    billItemConnectionsOfBill(billDetailUid: $billDetailUid) {
      uid
      parent {
        id
        assignedNumber
      }
      child {
        id
      }
    }
  }
`;

/** Every bill line, for choosing the one a line follows: its reference and name. */
export const ALL_BILL_ITEMS_TO_FOLLOW = gql`
  query allBillItems {
    allBillItems {
      id
      assignedNumber
      name
    }
  }
`;

/** Places one bill line under the line it follows. */
export const LINK_BILL_ITEM_CONNECTION = gql`
  mutation linkBillItemConnection($parentUid: String, $childUid: String) {
    linkBillItemConnection(parentUid: $parentUid, childUid: $childUid) {
      ${responseGqlFields('uid')}
    }
  }
`;

export const UNLINK_BILL_ITEM_CONNECTION = gql`
  mutation unlinkBillItemConnection($uid: String) {
    unlinkBillItemConnection(uid: $uid) {
      ${responseGqlFields('uid')}
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

/**
 * What the printed bill needs beyond what the screen shows: the payer's phone,
 * the service provider's code and the currency's three-letter code. Asked for
 * apart from `FIND_BILL` so the details panel does not grow fields nobody reads
 * there.
 */
export const BILL_PAPER = gql`
  query findBillDetail($uid: String) {
    findBillDetail(uid: $uid) {
      ${responseGqlFields(`
        id
        assignedNumber
        name
        description
        expiredAt
        bioData { id name mobileNumber }
        currency { id name assignedNumber }
        collectionCenter { id name }
        spCode { id name assignedNumber }
      `)}
    }
  }
`;

/** The control number a bill is paid on: the newest issued, else the one it reuses. */
export const CONTROL_NUMBER_OF_BILL = gql`
  query controlNumberOfBill($billDetailUid: String) {
    controlNumberOfBill(billDetailUid: $billDetailUid)
  }
`;

/**
 * Where a bill is paid into: the institution's internal bank accounts kept in
 * the bill's currency. These are the beneficiary on a transfer form.
 */
export const COLLECTION_ACCOUNTS_OF_BILL = gql`
  query collectionAccountsOfBill($billDetailUid: String) {
    collectionAccountsOfBill(billDetailUid: $billDetailUid) {
      id
      name
      accountName
      accountNumber
      swiftCode
      issuer { id name }
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
