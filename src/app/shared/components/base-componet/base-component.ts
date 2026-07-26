import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationBehaviorOptions, NavigationEnd } from '@angular/router';
import { ContentParameter, LocationInfo } from '@shared/components/view-component/view-interface';
import { ActionListener, ViewService } from '@shared/services/view.service';
import { debounceTime, filter, merge, Subscription } from 'rxjs';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { ToggleButton } from '../toggle-buttons/toggle-buttons.component';
import { LocalStorageEnum, LocalStorageService } from '@core/settings/local-storage.service';
import { SettingsService } from '@core/settings/settings.service';
import { FetchService } from '@shared/fetch/fetch.service';
import { NotificationService } from '@shared/services/notification.service';
import { getContentTree } from '../view-component/view.helpers';
import { AuthService } from 'app/routes/auth';
import { settings$ } from '@core/settings/settings.store';

export interface Base extends BaseComponent {}

const locationsInfosKey = LocalStorageEnum.ROUTE_INFO;

@Component({
  selector: 'app-base-component',
  template: '',
})
export class BaseComponent implements OnDestroy, AfterViewInit {
  // common services
  storage = inject(LocalStorageService);

  notify = inject(NotificationService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  cdr = inject(ChangeDetectorRef);

  subs = new Subscription();
  auth = inject(AuthService);
  vs = inject(ViewService);
  fs = inject(FetchService);
  // fl = inject(FileApi);
  st = inject(SettingsService);

  // common properties
  title?: string | number | undefined;
  subtitle: any | string | number | undefined;
  animation = settings$.value.animations?.pages;
  message?: string;
  slug?: string;

  isLoading = false;
  viewHasInit = false;

  actionButtons: ActionButton[] = [];
  toggleButtons: ToggleButton[] = [];

  contents: ContentParameter[] | undefined | any = [];
  slugTree?: string[];

  timer: any = undefined;

  log = (...e: any) => console.log(...e);
  lastOpenedUids = this.storage.getItem(LocalStorageEnum.VISITED_IDS)?.reverse();

  columnKeys: any[] = [];
  queryVariables: Record<string, any> = { active: true };

  selfNavSub?: Subscription;

  getLocationInfo = (url?: string): LocationInfo => {
    url = url ?? this.slug ?? this.router.url;

    const info: LocationInfo = {
      ...this.storage.find(locationsInfosKey, 'url', url),
      fromUrl: this.vs.previousUrl,
      url,
    };

    this.storage.upsert(locationsInfosKey, 'url', info);
    return info;
  };

  locationInfo: LocationInfo = this.getLocationInfo();

  getLocValue(property: keyof LocationInfo, url?: string): any {
    return this.getLocationInfo(url)?.[property];
  }

  setLocInfo(property: keyof LocationInfo, value: any, url?: string) {
    url = url ?? this.slug ?? this.router.url;

    const info: LocationInfo = {
      ...this.storage.find(locationsInfosKey, 'url', url),
      [property]: value,
    };

    this.storage.upsert(locationsInfosKey, 'url', info);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.viewHasInit = true;
  }

  addActionListeners(actionsListeners: ActionListener[]) {
    actionsListeners.forEach((l) => {
      let obs: any[] = [];
      const getArray = (item: any): any[] => (Array.isArray(item) ? item : [item]);
      if (l.observables) obs = [...getArray(l.observables)];

      //add to subscription
      const onEmitt = (d: any) => {
        if (l.delay) setTimeout(() => l.callback(d), l.delay);
        else l.callback(d);
      };

      obs = obs.filter((o) => !!o);
      if (obs.length)
        this.subs.add(
          merge(...obs)
            .pipe(debounceTime(l.debounceTime ?? 0))
            .subscribe((d) => onEmitt(d)),
        );
    });
  }

  reloadComponent() {
    const url = this.router.url;
    const opt: NavigationBehaviorOptions = { skipLocationChange: true };
    this.router.navigateByUrl('/', opt).then(() => this.router.navigate([url]));
  }

  selectedContentChange(slug: string | undefined, slugTree: string[] = []) {
    if (!slug) slug = this.getLocValue('slugTree')?.[0] ?? this.contents?.[0]?.slug;
    if (!slug) return;

    //set tree
    let tree: ContentParameter[] = [];
    const contents = this.contents;
    const allc = contents?.reduce((p: any, c: any) => p.concat([c].concat(c.children)), []) ?? [];
    if (slugTree.length) tree = slugTree.map((s) => allc.find((c: any) => c.slug == s));
    else tree = getContentTree(slug, contents ?? []);

    // if the last content has children, push it's last child to tree
    const cc = [...tree]?.pop()?.children;
    if (cc?.length) tree.push(cc.find((c) => c.active || c.slug == [...slugTree]?.pop()) ?? cc[0]);

    // others inactive
    [tree[0]]?.concat(tree[0]?.children ?? []).forEach((c) => !!c && (c.active = false));
    tree.forEach((c) => (c.active = true));

    //set the clicked to loading to force re-render
    const clicked = tree.find((c) => c.slug === slug);
    if (clicked) (clicked.isLoading = true) && setTimeout(() => (clicked.isLoading = false), 0);

    //update the tree
    slugTree = tree.map((c) => c.slug) as any;
    this.setLocInfo('slugTree', (this.slugTree = slugTree));
  }

  onNavigateToSelf(callback: () => any) {
    if (this.selfNavSub) return;

    this.selfNavSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => callback());

    this.subs.add(this.selfNavSub);
  }
}
