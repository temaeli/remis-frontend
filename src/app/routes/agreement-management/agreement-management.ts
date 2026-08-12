import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import AGREEMENT_MANAGEMENT_ROUTES from './agreement-management.routes';

@Component({
  selector: 'app-agreement-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class AgreementManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(AGREEMENT_MANAGEMENT_ROUTES, 'agreement-management');
  }
}
