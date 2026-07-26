import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import USERS_MANAGEMENT_ROUTES from './users-management.routes';

@Component({
  selector: 'app-users-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class UsersManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(USERS_MANAGEMENT_ROUTES, 'users-management');
  }
}
