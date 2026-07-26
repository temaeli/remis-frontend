import { Component, OnInit, AfterViewInit, inject, OnDestroy, HostListener } from '@angular/core';
import { PreloaderService } from '@core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { valueIncludes } from '@core/helpers';
import { KEY_BOARD_EVENT$ } from '@core/settings/app-shortcuts';
import { LocalStorageService, LocalStorageEnum } from '@core/settings/local-storage.service';
import { SvgIcons } from '@shared/components/icon/svg-icons.constants';
import { SVG_ICONS } from '@shared/components/icon/tag-icons.constants';
import { getLastIdFromUrl } from '@shared/components/view-component/view.helpers';
import { Subscription, filter, pairwise } from 'rxjs';
import { ViewService } from '@shared/services/view.service';
import { APP_VARIABLES } from '@core/settings/app-variables';

@Component({
  selector: 'app-root',
  template: ` <router-outlet /> `,
  imports: [RouterOutlet],
})
export class App implements OnDestroy, AfterViewInit {
  private readonly preloader = inject(PreloaderService);
  private readonly iconReg = inject(MatIconRegistry);
  private readonly ds = inject(DomSanitizer);

  vs = inject(ViewService);
  router = inject(Router);
  storage = inject(LocalStorageService);

  subs = new Subscription();

  constructor() {
    this.setIcons();
    this.listenToActions();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setIcons() {
    //combine svg in assets and svg it tags
    const path = '/images/svg/';

    SvgIcons.forEach((n) => {
      this.iconReg.addSvgIcon(n, this.ds.bypassSecurityTrustResourceUrl(path + n + '.svg'));
    });

    SVG_ICONS.forEach((i) => {
      this.iconReg.addSvgIconLiteral(i.name, this.ds.bypassSecurityTrustHtml(i.tag));
    });
  }

  @HostListener('body:scroll', ['$event'])
  onWindowScroll(event: any) {
    this.vs.scrollTop$.next(document.body.scrollTop);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.vs.windowWidth$.next(document.body.clientWidth);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    //all closing of dialogs (opened via viewService) using escap key
    if (valueIncludes(event.key, ['Escape'])) this.vs.closeTopDialog();
    const thres = APP_VARIABLES.keyDownEventThres;
    this.vs.onMultiClick(() => KEY_BOARD_EVENT$.next(event), thres, event.key);
  }

  // Listen for the mouse wheel event
  @HostListener('window:wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    this.vs.wheelDeltaY$.next(event.deltaY);
    this.vs.wheelDeltaX$.next(event.deltaX);
  }

  listenToActions() {
    //listen when route changes
    const routeChangeEvents$ = this.router.events.pipe(filter((e) => e['type'] === 1));
    this.subs.add(routeChangeEvents$.subscribe((n: NavigationEnd) => this.handleRouteChange(n)));

    //sets previous & currel url
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        pairwise(), // Emits the previous and current navigation events as a tuple
      )
      .subscribe(([previous, current]: [NavigationStart, NavigationStart]) => {
        this.vs.previousUrl = previous.url;
        this.vs.currentUrl = current.url;
      });
  }

  handleRouteChange(navEnd: NavigationEnd) {
    this.saveLastVisited();
  }

  saveLastVisited() {
    const uid = getLastIdFromUrl(this.router.url);
    if (!uid) return;
    this.storage.upsert(LocalStorageEnum.VISITED_IDS, undefined, uid);
  }

  ngAfterViewInit() {
    this.preloader.hide();
  }
}
