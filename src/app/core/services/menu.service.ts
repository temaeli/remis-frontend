import { Injectable, signal, WritableSignal } from '@angular/core';
import { Route } from '@angular/router';
import { capFirstChar } from '@shared/components/details/util/util.helpers';
import { BehaviorSubject, Observable, share } from 'rxjs';
import { Module } from './modules.service';
import { APP_ROUTES } from 'app/app.routes';

export interface MenuTag {
  color: string; // background color
  value: string;
}

export interface Menu {
  route: string;
  name?: string;
  type?: 'link' | 'sub' | 'extLink' | 'extTabLink';
  icon?: string;
  label?: MenuTag;
  badge?: any | Observable<any>;
  badgeFn?: (badge: any) => any | Observable<any>;
  children?: Menu[];
  permissions?: string[];
  active?: WritableSignal<boolean>;
  isFullLink?: boolean;
  appendPrefix?: boolean;
  visibleFor?: ('internal' | 'external')[]; // 'internal' = staff/admin, 'external' = client users
  /** Keeps this submenu permanently expanded in the sidebar, ignoring the usual accordion collapse. */
  expanded?: boolean;
}

export interface AppRouteData extends Menu {
  isMenu?: boolean;
  title?: string;
  subtitle?: string;
  /** Short blurb describing what the module does, shown on the staff landing tiles. */
  description?: string;
  /** Mounts a shared detail component in view-only mode (no mutation actions). */
  readOnly?: boolean;
  /**
   * Slug of the `remis_core_schema` lookup table this route renders. The settings
   * module's billing and reference screens are one generic pair of components,
   * and this is how each route says which table it is.
   */
  lookup?: string;
}

export interface TypedRoute<TData = AppRouteData> extends Omit<Route, 'data' | 'children'> {
  data?: Partial<TData>;
  children?: TypedRoutes<Partial<TData>>;
}

export type TypedRoutes<TData = AppRouteData> = TypedRoute<TData>[];

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly menu$ = new BehaviorSubject<Menu[]>([]);

  readonly module_ = signal<Module | undefined>(undefined);
  readonly modules = this.getMenuFromRoutes(APP_ROUTES, false);

  /** Get all the menu data. */
  getAll() {
    return this.menu$.asObservable();
  }

  /** Observe the change of menu data. */
  change() {
    return this.menu$.pipe(share());
  }

  /** Initialize the menu data. */
  set(menu: Menu[], prefix?: string) {
    if (prefix) this.addPrefixAndNamespace(menu, prefix);
    this.mapMenu(menu);
    this.menu$.next(menu);

    if (prefix) this.module_.set((this.modules.find((m) => m.route.includes(prefix)) as any));

    return this.menu$.asObservable();
  }

  setFromRoutes(routes: TypedRoutes, prefix?: string) {
    const menus: Menu[] = this.getMenuFromRoutes(routes);
    this.set(menus, prefix);
  }

  getMenuFromRoutes(routes: TypedRoutes, deep = true): Menu[] {
    return routes
      .filter((r) => !!r.data?.isMenu)
      .map((r) => {
        const children = deep && r.children?.length ? this.getMenuFromRoutes(r.children) : [];

        const ownPermissions = r.data?.permissions as string[] | null | undefined;

        const aggregatedChildPermissions = children
          .flatMap((child) => child.permissions ?? [])
          .filter((permission, index, arr) => arr.indexOf(permission) === index);

        return {
          route: r.path ?? '',
          children,
          name: typeof r.title === 'string' ? r.title : capFirstChar(r.path ?? ''),
          permissions: ownPermissions == null ? aggregatedChildPermissions : ownPermissions,
          visibleFor: r.data?.visibleFor,
          ...r.data,
        };
      });
  }

  /** Add one item to the menu data. */
  add(menu: Menu) {
    const tmpMenu = this.menu$.value;
    tmpMenu.push(menu);
    this.menu$.next(tmpMenu);
  }

  /** Reset the menu data. */
  reset() {
    this.menu$.next([]);
  }

  /** Delete empty values and rebuild route. */
  buildRoute(routeArr: string[]) {
    let route = '';

    routeArr.forEach((item) => {
      if (item && item.trim()) route += '/' + item.replace(/^\/+|\/+$/g, '');
    });

    return route;
  }

  /** Get the menu item name based on current route. */
  getItemName(routeArr: string[]) {
    return this.getLevel(routeArr)[routeArr.length - 1];
  }

  // Whether is a leaf menu
  private isLeafItem(item: Menu) {
    const cond0 = item.route === undefined;
    const cond1 = item.children === undefined;
    const cond2 = !cond1 && item.children?.length === 0;
    return cond0 || cond1 || cond2;
  }

  // Deep clone object could be jsonized
  private deepClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Whether two objects could be jsonized equal
  private isJsonObjEqual(obj0: any, obj1: any) {
    return JSON.stringify(obj0) === JSON.stringify(obj1);
  }

  // Whether routeArr equals realRouteArr (after remove empty route element)
  private isRouteEqual(routeArr: string[], realRouteArr: string[]) {
    realRouteArr = this.deepClone(realRouteArr);
    realRouteArr = realRouteArr.filter((r) => r !== '');
    return this.isJsonObjEqual(routeArr, realRouteArr);
  }

  /** Get the menu level. */
  getLevel(routeArr: string[]): string[] {
    let tmpArr: any[] = [];
    this.menu$.value.forEach((item) => {
      // Breadth-first traverse
      let unhandledLayer = [{ item, parentNamePathList: [], realRouteArr: [] }];
      while (unhandledLayer.length > 0) {
        let nextUnhandledLayer: any[] = [];

        for (const ele of unhandledLayer) {
          const eachItem: any = ele.item;
          const currentNamePathList = this.deepClone(ele.parentNamePathList).concat(eachItem.name);
          const currentRealRouteArr = this.deepClone(ele.realRouteArr).concat(eachItem.route);

          // Compare the full Array for expandable
          if (this.isRouteEqual(routeArr, currentRealRouteArr)) {
            tmpArr = currentNamePathList;
            break;
          }

          if (!this.isLeafItem(eachItem)) {
            const wrappedChildren = eachItem.children?.map((child: any) => ({
              item: child,
              parentNamePathList: currentNamePathList,
              realRouteArr: currentRealRouteArr,
            }));

            nextUnhandledLayer = nextUnhandledLayer.concat(wrappedChildren);
          }
        }

        unhandledLayer = nextUnhandledLayer;
      }
    });
    return tmpArr;
  }

  mapMenu(menu: Menu[]) {
    //set // icon // linktype // external
    menu.forEach((item: Menu) => {
      item.type = item.type ?? (item?.children?.length ? 'sub' : 'link');
      // this.iconsService.setType(item);
      if (item?.children?.length) this.mapMenu(item.children);
    });
  }

  /** Add namespace for translation. */
  addNamespace(menu: Menu[], namespace: string) {
    menu.forEach((item: Menu) => {
      item.name = `${namespace}.${item.name}`;
      if (item?.children?.length) this.addNamespace(item.children, item.name);
    });
  }

  /** Add prefix */
  addPrefix(menu: Menu[], prefix: string, deep = false) {
    menu.forEach((item: Menu) => {
      const route = item.route?.trim();
      const canAdd = item.isFullLink !== true && !(route.split('/')?.[0] == prefix);
      if (canAdd && item.appendPrefix !== false) item.route = `${prefix}/${item?.route}`;
      if (deep && item?.children?.length) this.addPrefix(item.children, prefix);
    });
  }

  addPrefixAndNamespace(menu: Menu[] | Menu[], namedPrefix: string, deep = false) {
    this.addPrefix(menu, namedPrefix, deep);
    this.addNamespace(menu, namedPrefix);
  }
}
