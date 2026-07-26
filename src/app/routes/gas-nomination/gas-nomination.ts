import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import GAS_NOMINATION_ROUTES from './gas-nomination.routes';

@Component({
  selector: 'app-gas-nomination',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class GasNomination {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(GAS_NOMINATION_ROUTES, 'gas-nomination');
  }
}
