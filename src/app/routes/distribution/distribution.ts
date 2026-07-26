import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import DISTRIBUTION_ROUTES from './distribution.routes';

@Component({
  selector: 'app-distribution',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class Distribution {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(DISTRIBUTION_ROUTES, 'distribution');
  }
}
