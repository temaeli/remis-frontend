import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import PORTAL_ROUTES from './portal.routes';

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
