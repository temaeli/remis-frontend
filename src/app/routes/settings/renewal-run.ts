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
  mutation runBillRenewals($day: LocalDate) {
    runBillRenewals(day: $day) {
      status
      message
      data {
        day
        billsRaised
        itemsRaised
        skipped
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
 * Runs the renewals for this row's day.
 *
 * Every renewal falling on that day is raised, not only this one — the run is
 * keyed on the date, which is how the nightly job works too. Repeating it is
 * safe: each run raises a fresh bill, and a payer already billed simply gets
 * another. What it will not do is skip silently — a person with no renewal
 * control number comes back named in the result.
 */
export function runRenewalsForDayBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Raise Bills For This Day',
    permissions: ['ROLE_CREATE_BILL_HEADER', 'ROLE_UPDATE_BILL_HEADER'],
    hideFunction: (row: any) => !dayOf(row),
    confirmDataMapper: (row: any) => ({
      title: 'Raise Bills For This Day',
      message:
        `Raise every renewal falling on <b>${dayOf(row)}</b>, reusing each payer's own ` +
        'control number? This normally runs by itself each night — use it for a day that ' +
        'was missed. Running it again raises another bill.',
      confirmText: 'Raise',
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        mutation: RUN_BILL_RENEWALS,
        notify: true,
        loadingOn: 'content',
        variables: { day: dayOf(row) },
      });
    },
  };
}
