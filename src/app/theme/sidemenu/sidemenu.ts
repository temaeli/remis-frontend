import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPermissionsModule } from 'ngx-permissions';

import { Menu, MenuService } from '@core';
import { NavAccordion } from './nav-accordion';
import { NavAccordionItem } from './nav-accordion-item';
import { NavAccordionToggle } from './nav-accordion-toggle';
import { AtIndexPipe } from '../../shared/pipes/at-index.pipe';
import { SplitPipe } from '../../shared/pipes/split.pipe';

import { AuthService } from '../../routes/auth/auth.service';
import { settings$ } from '@core/settings/settings.store';
import { MergeClassesPipe } from '../../shared/components/details/util/class-name/merge-classes.pipe';
import { NumberCounterComponent } from '@shared/components/number-counter/number-counter.component';
import { ToObservablePipe } from '../../shared/pipes/to-observable.pipe';
import { IsValuePipe } from '../../shared/pipes/is-value.pipe';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.html',
  styleUrl: './sidemenu.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    NgxPermissionsModule,
    MatIconModule,
    MatRippleModule,
    TranslateModule,
    NavAccordion,
    NavAccordionItem,
    NavAccordionToggle,
    AtIndexPipe,
    SplitPipe,
    MergeClassesPipe,
    NumberCounterComponent,
    ToObservablePipe,
    IsValuePipe,
    AsyncPipe,
  ],
})
export class Sidemenu implements OnInit {
  @Input() ripple = true;
  @Input() linkClicked: ((e: any, menu: Menu, routeArr: string[]) => any) | undefined = undefined;
  @Input() animation = settings$.value.animations?.sidebar;

  readonly menu = inject(MenuService);
  private authService = inject(AuthService);

  // Signal to hold menu data from observable
  private menuDataSignal = signal<Menu[]>([]);

  // Signal to hold user permissions
  private userPermissionsSignal = signal<string[]>([]);

  // Computed signal to filter menus based on user type and permissions
  filteredMenu = computed(() => {
    return this.filterMenusByUserType(
      this.menuDataSignal(),
      this.authService.userType(),
      this.userPermissionsSignal(),
    );
  });

  ngOnInit(): void {
    // Subscribe to menu changes and update signal
    this.menu.getAll().subscribe((menus) => {
      this.menuDataSignal.set(menus);
    });

    // Subscribe to user permission changes and update signal
    this.authService.user$.subscribe((user) => {
      const permissions = user?.permissions || [];
      this.userPermissionsSignal.set(permissions);
    });
  }

  clicked(event: any, menuItem: Menu, routeArr: string[], menuEl: HTMLUListElement) {
    this.linkClicked?.(event, menuItem, routeArr);
  }

  private filterMenusByUserType(
    menus: Menu[],
    userType: string,
    userPermissions: string[] = [],
  ): Menu[] {
    const filtered = menus
      .filter((menu) => {
        // If visibleFor is not specified, show to all users
        if (!menu.visibleFor || menu.visibleFor.length === 0) {
          return true;
        }
        // Show menu if current user type is in visibleFor array
        const visibleByType = menu.visibleFor.includes(userType as 'internal' | 'external');

        // If no permissions required, use type visibility
        if (!menu.permissions || menu.permissions.length === 0) {
          return visibleByType;
        }

        // Check if user has at least one required permission
        const hasPermission = menu.permissions.some((perm: string) =>
          userPermissions.includes(perm),
        );
        return visibleByType && hasPermission;
      })
      .map((menu) => {
        // Dynamically update menu name based on clientType for external route
        const updatedMenu = { ...menu };
        if (menu.route && menu.route.includes('external')) {
          const clientType = this.authService?.user$?.value?.clientType;
          if (clientType === 'UP') {
            updatedMenu.name = 'Upstreamer Dispatches';
          } else {
            updatedMenu.name = 'My Nominations';
          }
        }

        return {
          ...updatedMenu,
          // Recursively filter children
          children: menu.children
            ? this.filterMenusByUserType(menu.children, userType, userPermissions)
            : undefined,
        };
      });

    return filtered;
  }
}
