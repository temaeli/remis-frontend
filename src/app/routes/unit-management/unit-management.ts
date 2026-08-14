import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import UNIT_MANAGEMENT_ROUTES from './unit-management.routes';

@Component({
  selector: 'app-unit-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class UnitManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(UNIT_MANAGEMENT_ROUTES, 'unit-management');
  }
}
