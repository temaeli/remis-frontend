import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';

/** Reload signal, so a check run refreshes the grid it was launched from. */
export const payment$ = new Subject<any>();

export const PAYMENT_VIEW_PERMISSIONS = [
  'ROLE_VIEW_ALL_PAYMENT_HEADER',
  'ROLE_VIEW_PAYMENT_HEADER',
];

/**
 * Opens one payment from the payments list, where the route is already the
 * parent of the target.
 *
 * Payments are never edited, so this is the only row action either version has.
 */
export function paymentViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Payment',
    click: (data: { id?: string }) => navigateRelativeTo(comp, 'payments', data?.id),
    permissions: PAYMENT_VIEW_PERMISSIONS,
  };
}

/**
 * The same, from somewhere that is not under /billing/payments — the bill detail
 * page, say.
 *
 * navigateRelativeTo appends to the current route, which from a bill would give
 * /billing/bills/<uid>/payments/<id>. This jumps to the absolute path instead.
 */
export function paymentViewBtnFrom(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Payment',
    click: (data: { id?: string }) => comp.router.navigate(['/billing/payments', data?.id]),
    permissions: PAYMENT_VIEW_PERMISSIONS,
  };
}
