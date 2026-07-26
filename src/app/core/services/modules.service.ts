import { inject, Injectable } from '@angular/core';
import { Menu, MenuService, TypedRoute, TypedRoutes } from './menu.service';
import { APP_ROUTES } from 'app/app.routes';

export interface Module {
  name: string;
  route: string;
  icon: string;
  children?: TypedRoutes;
}

@Injectable({
  providedIn: 'root',
})
export class ModulesService {
  ms = inject(MenuService);

  modules: Module[] = this.ms.getMenuFromRoutes(APP_ROUTES, false) as any;
}
