import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';

/** Notifies the list that a bill was raised. */
export const bill$ = new Subject<unknown>();

//  Permissions, as declared on the bill controllers.
export const BILL_VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_BILL_DETAIL', 'ROLE_VIEW_BILL_DETAIL'];
export const BILL_RAISE_PERMISSIONS = ['ROLE_CREATE_BILL_DETAIL', 'ROLE_UPDATE_BILL_DETAIL'];

export function billViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Bill',
    click: (data: { id?: string }) => navigateRelativeTo(comp, 'bills', data?.id),
    permissions: BILL_VIEW_PERMISSIONS,
  };
}

/**
 * Opens the raise form. A bill is never created a piece at a time — the header,
 * the bill, its lines and its total are one transaction — so this is the only
 * way in.
 */
export function raiseBillBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'add',
    label: 'Raise Bill',
    class: 'btn-add-primary',
    click: () => comp.router.navigate(['../raise'], { relativeTo: comp.route }),
    permissions: BILL_RAISE_PERMISSIONS,
  };
}
