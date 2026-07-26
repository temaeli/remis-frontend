import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import SECURITY_ROUTES from './security.routes';

@Component({
  selector: 'security-wrapper',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class SecurityWrapper {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(SECURITY_ROUTES, 'security');
  }
}
