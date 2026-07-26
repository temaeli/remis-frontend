import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import PROFILE_ROUTES from './user.routes';

@Component({
  selector: 'app-user-mod',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class UserModuleComp {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(PROFILE_ROUTES, 'user');
  }
}
