import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import { HSE_ROUTES } from './hse.routes';

@Component({
  selector: 'hse-wrapper',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class HseWrapper {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(HSE_ROUTES, 'hse');
  }
}
