import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import CLIENT_REGISTRATION_ROUTES from './client-registration.routes';

@Component({
  selector: 'app-client-registration',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class ClientRegistration {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(CLIENT_REGISTRATION_ROUTES, 'client-registration');
  }
}
