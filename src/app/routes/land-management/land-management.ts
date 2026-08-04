import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import LAND_MANAGEMENT_ROUTES from './land-management.routes';

@Component({
  selector: 'app-land-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class LandManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(LAND_MANAGEMENT_ROUTES, 'land-management');
  }
}
