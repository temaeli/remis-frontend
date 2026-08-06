import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import PROJECT_MANAGEMENT_ROUTES from './project-management.routes';

@Component({
  selector: 'app-project-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class ProjectManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(PROJECT_MANAGEMENT_ROUTES, 'project-management');
  }
}
