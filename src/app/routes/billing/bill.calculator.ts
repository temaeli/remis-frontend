/**
 * The billing formula, mirrored from `BillItemCalculator` on the backend so the
 * form can show what a line will come to before it is sent.
 *
 *   bill item amount       = fee amount x quantity
 *   vat / discount / whT   = rate x bill item amount
 *   final                  = amount + vat - discount - withholding
 *   equivalent             = exchange rate x amount
 *   final equivalent       = exchange rate x final
 *
 * The three rates are multipliers, not percentages — 18% is held as 0.18 —
 * because the formula multiplies the amount by them directly.
 *
 * This is a preview only. The backend recomputes all of it on save and stores
 * its own result; nothing here is sent. If the two ever disagree the backend
 * wins, which is why the arithmetic and the rounding are kept identical: each
 * stored figure is rounded half-up to two places, so a total equals the sum of
 * the lines as they are displayed.
 */
export interface BillLineAmounts {
  billItemAmt: number;
  vatAmount: number;
  discountAmount: number;
  withholdingAmount: number;
  finalBillItemAmt: number;
  billItemEqvAmt: number;
  finalBillItemEqvAmt: number;
}

export interface BillLineInputs {
  feeAmount?: number | string | null;
  quantity?: number | string | null;
  vatRate?: number | string | null;
  discountRate?: number | string | null;
  withholdingRate?: number | string | null;
  exchangeRate?: number | string | null;
}

const num = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Half-up to two places, matching the scale every amount column holds. */
const money = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateLine = (inputs: BillLineInputs): BillLineAmounts => {
  const billItemAmt = money(num(inputs.feeAmount) * num(inputs.quantity));
  const exchangeRate = num(inputs.exchangeRate);

  const vatAmount = money(num(inputs.vatRate) * billItemAmt);
  const discountAmount = money(num(inputs.discountRate) * billItemAmt);
  const withholdingAmount = money(num(inputs.withholdingRate) * billItemAmt);

  const finalBillItemAmt = money(billItemAmt + vatAmount - discountAmount - withholdingAmount);

  return {
    billItemAmt,
    vatAmount,
    discountAmount,
    withholdingAmount,
    finalBillItemAmt,
    billItemEqvAmt: money(exchangeRate * billItemAmt),
    finalBillItemEqvAmt: money(exchangeRate * finalBillItemAmt),
  };
};

/** What the bill comes to: the sum of its lines' final amounts. */
export const calculateBillTotals = (lines: BillLineAmounts[]) => ({
  billAmt: money(lines.reduce((sum, line) => sum + line.finalBillItemAmt, 0)),
  billEqvAmt: money(lines.reduce((sum, line) => sum + line.finalBillItemEqvAmt, 0)),
});
