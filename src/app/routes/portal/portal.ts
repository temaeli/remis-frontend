import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import PORTAL_ROUTES from './portal.routes';

/**
 * The external user's portal: the same shell as the staff modules, with its
 * own menu from PORTAL_ROUTES.
 */
@Component({
  selector: 'app-portal',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class Portal {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(PORTAL_ROUTES, 'portal');
  }
}
