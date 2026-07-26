import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import { PLANTS_ROUTES } from './plants.routes';

@Component({
  selector: 'app-plants',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class PlantsManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(PLANTS_ROUTES, 'plants-management');
  }
}
