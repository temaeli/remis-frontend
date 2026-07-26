import { Component, inject } from '@angular/core';
import { Menu, MenuService } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';

// Top-level Reports module. Currently hosts EWURA Reports only; future report
// flavours (e.g. CNG, distribution) should add a sibling child entry rather
// than nest beneath EWURA.
const REPORTS_MENU: Menu[] = [
  {
    route: 'reports/my-reports',
    name: 'My Reports',
    icon: 'inbox',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_EWURA_REPORT'],
  },
  {
    route: 'reports/ewura',
    name: 'EWURA Reports',
    icon: 'report',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_EWURA_REPORT'],
  },
  {
    route: 'reports/hse-my-reports',
    name: 'HSE My Reports',
    icon: 'inbox',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_HSE_REPORT'],
  },
  {
    route: 'reports/hse',
    name: 'HSE Reports',
    icon: 'report',
    appendPrefix: false,
    permissions: ['ROLE_VIEW_HSE_REPORT'],
  },
];

@Component({
  selector: 'reports-wrapper',
  template: `<app-admin-layout />`,
  imports: [AdminLayout],
})
export class ReportsWrapper {
  private menuService = inject(MenuService);

  constructor() {
    this.menuService.set(
      REPORTS_MENU.map((m) => ({ ...m })),
      '',
    );
    // Menu is hardcoded with full paths (prefix ''), so set() can't infer the
    // active module. Set it explicitly so the sidebar banner + left module icon
    // highlight like every other module.
    this.menuService.module_.set(
      this.menuService.modules.find((m) => m.route === 'reports') as any,
    );
  }
}
