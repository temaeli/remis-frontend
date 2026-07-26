import { BidiModule } from '@angular/cdk/bidi';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, ViewEncapsulation, computed, inject, signal, viewChild } from '@angular/core';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { NgProgressbar } from 'ngx-progressbar';
import { NgProgressRouter } from 'ngx-progressbar/router';
import { Subscription, filter } from 'rxjs';

import { Header } from '../header/header';
import { SidebarNotice } from '../sidebar-notice/sidebar-notice';
import { Sidebar } from '../sidebar/sidebar';
import { Topmenu } from '../topmenu/topmenu';
import { SettingsService } from '@core/settings/settings.service';
import { ModulesService } from '@core/services/modules.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconsViewerComponent } from '@shared/components/icon/icons-viewer.component';
import { ViewService } from '@shared/services/view.service';
import { MenuService } from '@core';
import { AppSettings, settings$ } from '@core/settings/settings.store';
import { AuthService } from '../../routes/auth/auth.service';

const MOBILE_MEDIAQUERY = 'screen and (max-width: 599px)';
const TABLET_MEDIAQUERY = 'screen and (min-width: 600px) and (max-width: 959px)';
const MONITOR_MEDIAQUERY = 'screen and (min-width: 960px)';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet,
    BidiModule,
    MatSidenavModule,
    NgProgressbar,
    NgProgressRouter,
    Header,
    Topmenu,
    Sidebar,
    SidebarNotice,
    MatIconModule,
    MatTooltipModule,
    RouterLinkWithHref,
  ],
  host: {
    '[class.app-content-width-fix]': 'contentWidthFix',
    '[class.app-sidenav-collapsed-fix]': 'collapsedWidthFix',
  },
})
export class AdminLayout implements OnDestroy {
  readonly sidenav = viewChild.required<MatSidenav>('sidenav');
  readonly content = viewChild.required<MatSidenavContent>('content');

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly st = inject(SettingsService);
  private readonly authService = inject(AuthService);
  private readonly allModules = inject(ModulesService).modules;
  private readonly userPermissionsSignal = signal<string[]>([]);
  readonly modules = computed(() =>
    this.allModules.filter((m: any) => {
      if (!m.permissions || m.permissions.length === 0) return true;
      const perms = this.userPermissionsSignal();
      return m.permissions.some((p: string) => perms.includes(p));
    }),
  );
  readonly vs = inject(ViewService);

  settings = this.st.settings$.value;
  animationSidebar = settings$.getValue().animations?.sidebar;

  animation = settings$.getValue().animations?.pages;
  module = inject(MenuService).module_;

  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private layoutChangesSubscription = Subscription.EMPTY;

  get isOver() {
    return this.isMobileScreen;
  }

  get contentWidthFix() {
    return (
      this.isContentWidthFixed &&
      this.settings.navPos === 'side' &&
      this.settings.sidenavOpened &&
      !this.isOver
    );
  }

  get collapsedWidthFix() {
    return (
      this.isCollapsedWidthFixed &&
      (this.settings.navPos === 'top' || (this.settings.sidenavOpened && this.isOver))
    );
  }

  constructor() {
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_MEDIAQUERY, TABLET_MEDIAQUERY, MONITOR_MEDIAQUERY])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.settings.sidenavOpened = true;

        this.isMobileScreen = state.breakpoints[MOBILE_MEDIAQUERY];
        //ovoid auto collapsing on resize
        // this.settings.sidenavCollapsed = state.breakpoints[TABLET_MEDIAQUERY];
        this.isContentWidthFixed = state.breakpoints[MONITOR_MEDIAQUERY];
      });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((e) => {
      if (this.isOver) this.sidenav().close();
      this.content().scrollTo({ top: 0 });
    });

    this.authService.user$.subscribe((user) => {
      this.userPermissionsSignal.set(user?.permissions ?? []);
    });
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.settings.sidenavCollapsed = !this.settings.sidenavCollapsed;
    this.resetCollapsedState();
  }

  // TODO: Trigger when transition end
  resetCollapsedState(timer = 400) {
    setTimeout(() => this.st.setSettings(this.settings), timer);
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.settings.sidenavOpened = isOpened;
    this.st.setSettings(this.settings);
  }

  updateOptions(settings: AppSettings) {
    this.settings = settings as any;
    this.st.setSettings((settings as any));
  }

  homeClick() {
    this.vs.onMultipleEvent([
      {
        callback: () =>
          this.vs.openDialog({ component: IconsViewerComponent, width: '90%', maxWidth: '920px' }),
        threshold: 7,
      },
      { callback: () => this.router.navigate(['/staff-landing']), threshold: 1 },
    ]);
  }
}
