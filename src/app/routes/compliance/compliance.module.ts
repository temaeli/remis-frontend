import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import { COMPLIANCE_ROUTES } from './compliance.routes';

@Component({
  selector: 'app-compliance-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class ComplianceManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(COMPLIANCE_ROUTES, 'compliance');
  }
}
