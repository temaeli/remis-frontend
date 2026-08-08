import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import BILLING_ROUTES from './billing.routes';

@Component({
  selector: 'app-billing',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class Billing {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(BILLING_ROUTES, 'billing');
  }
}
