import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

/**
 * Raising the bill a recorded quantity belongs on.
 *
 * A row of `bill_headers_settings_quantities` says so many of a setting's fee
 * are owed by a person from a started day to a deadline. Nothing raises that
 * bill by itself: it is asked for here, on the row, on a new control number or
 * on the one the person already holds — the same two choices a renewal's row
 * offers.
 *
 * The same person's other rows for the same started day, deadline and
 * financial year go on the bill with it, a line each, so the bill's total is
 * their sum.
 */
export const RAISE_QUANTITY_BILL = gql`
  mutation raiseQuantityBill($uid: String, $newControlNumber: Boolean) {
    raiseQuantityBill(uid: $uid, newControlNumber: $newControlNumber) {
      status
      message
      data {
        day
        billsRaised
        itemsRaised
        reusesSent
        skipped
        unsent
      }
    }
  }
`;

/** Which control number the bill is put on. The two buttons differ in nothing else. */
type QuantityControlNumber = 'new' | 'reuse';

const WORDING: Record<
  QuantityControlNumber,
  { label: string; icon: string; asks: string; sent: string; unsent: string }
> = {
  new: {
    label: 'Raise Bill (New Control Number Request)',
    icon: 'send',
    asks: 'asking GePG for a new control number',
    sent: 'control number request(s) sent to GePG',
    unsent: 'Control number request not sent',
  },
  reuse: {
    label: 'Raise Bill (Reuse Control Number Request)',
    icon: 'refresh',
    asks: 'reusing the control number the payer already holds and sending the re-use to GePG',
    sent: 're-use(s) sent to GePG',
    unsent: 'Re-use not sent',
  },
};

/**
 * Raises this row's bill on the control number asked for.
 *
 * Reusing needs the payer to hold a number on record; one without is not
 * billed and comes back named. Asking for a new number needs none.
 *
 * Raising a second time does not bill a second time: a row already billed for
 * its started day is left out, and with nothing left the bill is not raised
 * and says so.
 */
function raiseQuantityBillBtn(
  comp: BaseComponent,
  controlNumber: QuantityControlNumber,
): ActionButton {
  const wording = WORDING[controlNumber];
  return {
    icon: wording.icon,
    label: wording.label,
    permissions: ['ROLE_CREATE_BILL_HEADER', 'ROLE_UPDATE_BILL_HEADER'],
    confirmDataMapper: (row: any) => ({
      title: wording.label,
      message:
        `Raise the bill for <b>${row?.name}</b>, ${wording.asks}? ` +
        "The same person's other quantities for the same started day, deadline and " +
        'financial year go on the bill with it. A quantity already billed is left out.',
      confirmText: 'Raise',
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        mutation: RAISE_QUANTITY_BILL,
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.id, newControlNumber: controlNumber === 'new' },
        successFn: (res: any) => {
          const run = res?.data;
          if (!run) return;
          // The counts alone read as a success even when nothing reached GePG,
          // so what did not go is said out loud. `reusesSent` counts whichever
          // request this bill sent.
          comp.notify.info(
            `${run.billsRaised} bill(s), ${run.itemsRaised} line(s), ` +
              `${run.reusesSent} ${wording.sent}.`,
          );
          for (const why of run.unsent ?? []) comp.notify.warn(`${wording.unsent} — ${why}`);
          for (const why of run.skipped ?? []) comp.notify.warn(`Bill not raised — ${why}`);
        },
      });
    },
  };
}

/** Raises the row's bill and asks GePG for a new control number for it. */
export const raiseQuantityBillForNewNumberBtn = (comp: BaseComponent): ActionButton =>
  raiseQuantityBillBtn(comp, 'new');

/** Raises the row's bill on the control number its payer already holds. */
export const raiseQuantityBillForReuseBtn = (comp: BaseComponent): ActionButton =>
  raiseQuantityBillBtn(comp, 'reuse');
