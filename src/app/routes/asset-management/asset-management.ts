import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import ASSET_MANAGEMENT_ROUTES from './asset-management.routes';

@Component({
  selector: 'app-asset-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class AssetManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(ASSET_MANAGEMENT_ROUTES, 'asset-management');
  }
}
