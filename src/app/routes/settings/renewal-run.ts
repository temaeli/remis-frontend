import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';

/**
 * Raising a renewal day by hand.
 *
 * The run is scheduled and needs nobody — it goes at 00:05 every night and
 * raises whatever falls on that day. This is for the day that was missed: the
 * service was down, or a setting was wrong and has since been fixed, and
 * waiting a year for the date to come round again is not an answer.
 *
 * Offered on the renewal row rather than as a screen of its own, because the
 * row already says which day it falls on.
 */
export const RUN_BILL_RENEWALS = gql`
  mutation runBillRenewals($day: LocalDate, $newControlNumber: Boolean) {
    runBillRenewals(day: $day, newControlNumber: $newControlNumber) {
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

/** `renewsDay`/`renewsMonth` as this year's date, which is what the run takes. */
const dayOf = (row: any): string | undefined => {
  const day = Number(row?.renewsDay);
  const month = Number(row?.renewsMonth);
  if (!day || !month) return undefined;
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${new Date().getFullYear()}-${pad(month)}-${pad(day)}`;
};

/**
 * Which control number the bills of a run are put on. The two buttons differ in
 * nothing else.
 */
type RunControlNumber = 'new' | 'reuse';

const RUN_WORDING: Record<
  RunControlNumber,
  { label: string; icon: string; asks: string; sent: string; unsent: string }
> = {
  new: {
    label: 'Raise Bills For This Day (New Control Number Request)',
    icon: 'send',
    asks: 'asking GePG for a new control number for each bill',
    sent: 'control number request(s) sent to GePG',
    unsent: 'Control number request not sent',
  },
  reuse: {
    label: 'Raise Bills For This Day (Reuse Control Number Request)',
    icon: 'refresh',
    asks: 'reusing the control number each payer already holds and sending each re-use to GePG',
    sent: 're-use(s) sent to GePG',
    unsent: 'Re-use not sent',
  },
};

/**
 * Runs the renewals for this row's day, on the control number asked for.
 *
 * Every renewal falling on that day is raised, not only this one — the run is
 * keyed on the date, which is how the nightly job works too.
 *
 * Reusing puts each bill on the number its payer already holds, which is what
 * the nightly run does; a payer with no number on record is not billed, and
 * comes back named. Asking for new numbers queues each bill and requests a
 * number of its own, as a bill raised by hand is asked for, and needs no number
 * on record.
 *
 * Repeating either is safe in the sense that nothing breaks: each run raises a
 * fresh bill and sends a fresh request, and a payer already billed simply gets
 * another. What it will not do is skip silently — a bill that was not raised,
 * and a bill GePG would not take, both come back named.
 */
function runRenewalsBtn(comp: BaseComponent, controlNumber: RunControlNumber): ActionButton {
  const wording = RUN_WORDING[controlNumber];
  return {
    icon: wording.icon,
    label: wording.label,
    permissions: ['ROLE_CREATE_BILL_HEADER', 'ROLE_UPDATE_BILL_HEADER'],
    hideFunction: (row: any) => !dayOf(row),
    confirmDataMapper: (row: any) => ({
      title: wording.label,
      message:
        `Raise every renewal falling on <b>${dayOf(row)}</b>, ${wording.asks}? ` +
        'This normally runs by itself each night, reusing control numbers — use it for a ' +
        'day that was missed. Running it again raises another bill and sends another request.',
      confirmText: 'Raise',
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        mutation: RUN_BILL_RENEWALS,
        notify: true,
        loadingOn: 'content',
        variables: { day: dayOf(row), newControlNumber: controlNumber === 'new' },
        successFn: (res: any) => {
          const run = res?.data;
          if (!run) return;
          // The counts alone read as a success even when nothing reached GePG,
          // so what did not go is said out loud rather than left in the log.
          // `reusesSent` counts whichever request this run sent.
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

/** Raises the day's bills and asks GePG for a new control number for each. */
export const runRenewalsForNewNumberBtn = (comp: BaseComponent): ActionButton =>
  runRenewalsBtn(comp, 'new');

/** Raises the day's bills on the control number each payer already holds. */
export const runRenewalsForReuseBtn = (comp: BaseComponent): ActionButton =>
  runRenewalsBtn(comp, 'reuse');
