import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import CONSTRUCTION_ROUTES from './construction.routes';

@Component({
  selector: 'construction-wrapper',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class ConstructionWrapper {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(CONSTRUCTION_ROUTES, 'construction');
  }
}
