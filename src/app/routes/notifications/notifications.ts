import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import NOTIFICATIONS_ROUTES from './notifications.routes';

@Component({
  selector: 'app-notifications',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class Notifications {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(NOTIFICATIONS_ROUTES, 'notifications');
  }
}
