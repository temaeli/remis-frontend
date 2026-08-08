import { gql } from '@apollo/client/core';
import { DocumentNode } from '@apollo/client/core';

/**
 * The lists the raise form's selects choose from.
 *
 * Declared here rather than read off the lookup registries: those build a full
 * record for a grid, and a select needs a name, an id and — for the fee and the
 * three rates — the one number the formula multiplies by.
 */
const named = `
  id
  name
`;

export const BILL_OPTION_QUERIES: Record<string, DocumentNode> = {
  systemCodes: gql`query allSystemCodes { allSystemCodes { ${named} } }`,
  spGrpCodes: gql`query allSpGrpCodes { allSpGrpCodes { ${named} } }`,
  spCodes: gql`query allSpCodes { allSpCodes { ${named} } }`,
  subSpCodes: gql`query allSubSpCodes { allSubSpCodes { ${named} } }`,
  gfsCodes: gql`query allGfsCodes { allGfsCodes { ${named} } }`,
  billPayOptions: gql`query allBillPayOptions { allBillPayOptions { ${named} } }`,
  billPaymentPlans: gql`query allBillPaymentPlans { allBillPaymentPlans { ${named} } }`,
  collectionCenters: gql`query allCollectionCenters { allCollectionCenters { ${named} } }`,
  gepgBillTypes: gql`query allGepgBillTypes { allGepgBillTypes { ${named} } }`,
  gepgPayTypes: gql`query allGepgPayTypes { allGepgPayTypes { ${named} } }`,
  payPlans: gql`query allPayPlans { allPayPlans { ${named} } }`,
  useItemRefOnPays: gql`query allUseItemRefOnPays { allUseItemRefOnPays { ${named} } }`,
  financialYears: gql`query allFinancialYears { allFinancialYears { ${named} } }`,
  currencies: gql`query allCurrencies { allCurrencies { ${named} } }`,
  identityTypes: gql`query allIdentityTypes { allIdentityTypes { ${named} } }`,
  tinDatas: gql`query allTinDatas { allTinDatas { ${named} assignedNumber } }`,
  // The payer. bio_data had no list query until this form needed one.
  people: gql`query allBioData { allBioData { ${named} } }`,

  // The four the formula reads a number from.
  exchangeRates: gql`query allExchangeRates { allExchangeRates { ${named} rateAgainstTzs } }`,
  fees: gql`query allFees { allFees { ${named} amount } }`,
  vats: gql`query allVats { allVats { ${named} vat } }`,
  withholdingTaxes: gql`query allWithholdingTaxes { allWithholdingTaxes { ${named} withholdingTax } }`,
  discounts: gql`query allDiscounts { allDiscounts { ${named} discounts } }`,
};

export interface NamedOption {
  id: string;
  name: string;
  assignedNumber?: string;
  amount?: number;
  vat?: number;
  withholdingTax?: number;
  discounts?: number;
  rateAgainstTzs?: number;
}

export type BillOptions = Record<keyof typeof BILL_OPTION_QUERIES, NamedOption[]>;

export const emptyOptions = (): BillOptions =>
  Object.fromEntries(Object.keys(BILL_OPTION_QUERIES).map((k) => [k, []])) as BillOptions;
