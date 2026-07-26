import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import SETTINGS_ROUTES from './settings.routes';

@Component({
  selector: 'app-settings',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class Settings {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(SETTINGS_ROUTES, 'settings');
  }
}
