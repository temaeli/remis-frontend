import { Component, inject } from '@angular/core';
import { MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import WORKFLOW_MANAGEMENT_ROUTES from './workflow-management.routes';

@Component({
  selector: 'app-workflow-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class WorkflowManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(WORKFLOW_MANAGEMENT_ROUTES, 'workflow-management');
  }
}
