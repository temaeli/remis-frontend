import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import INQUIRIES_ROUTES from './inquiries.routes';

@Component({
  selector: 'app-inquiries-management',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class InquiriesManagement {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.setFromRoutes(INQUIRIES_ROUTES, 'inquiries-management');
  }
}
