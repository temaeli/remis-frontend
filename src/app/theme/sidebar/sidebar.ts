import { Component, ViewEncapsulation, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Sidemenu } from '../sidemenu/sidemenu';
import { Branding } from '../widgets/branding';
import { UserPanel } from './user-panel';

import { ModulesService } from '@core/services/modules.service';
import { MenuService } from '@core';
import { IconTypePipe } from '@shared/components/icon/icon-type.pipe';
import { CommonModule } from '@angular/common';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    Branding,
    Sidemenu,
    UserPanel,
    CommonModule,
    IconTypePipe,
  ],
})
export class Sidebar {
  readonly showToggle = input(false);
  readonly showUser = input(true);
  readonly showHeader = input(true);
  readonly toggleChecked = input(false);

  readonly toggleCollapsed = output<void>();
  readonly closeSidenav = output<void>();

  animation = settings$.getValue().animations?.sidebar;

  module = inject(MenuService).module_;
}
