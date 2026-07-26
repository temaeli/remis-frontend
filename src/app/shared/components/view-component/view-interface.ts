import { Type } from '@angular/core';
import { Observable } from 'rxjs';
// import { GridParameter } from '../data-grid/data-grid.interfaces';
import { ToggleButton } from '../toggle-buttons/toggle-buttons.component';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { DetailsParameter } from '../details/details.interface';
import { GridParameter } from '../data-grid/data-grid.interfaces';

export interface ContentListener {
  observables?: Observable<any>[] | Observable<any>;
  delay?: number; // delay in ms
  debounceTime?: number;
  callback: (content: ContentParameter, data?: any) => ContentParameter;
}

export interface HasChildren<T = any> {
  children?: T[];
  [key: string]: any;
}

export interface ViewParameter {
  icon?: string;
  title?: string;
  subtitle?: string;
  animation?: string;

  // inputs?: DataInput[];
  actionButtons?: ActionButton[];
  toggleButtons?: ToggleButton[];

  noContentLabel?: string;
  showContentInTabs?: boolean;

  contentClass?: string;

  contentsParameters?: ContentParameter[];

  // queryParameter?: QueryParameter;
  initializer?: (view: ViewParameter) => ViewParameter;

  appearance?: 'outer' | 'inner';
}

export interface LocationInfo {
  url?: string;
  fromUrl?: string;
  slugTree?: string[];
  variables?: Record<string, any>;
}

export type ContentType = 'table' | 'details' | 'attachment' | 'html' | 'component';

export interface ContentParameter extends Partial<DetailsParameter & GridParameter> {
  value?: any;
  name?: string;
  title?: string;
  icon?: string;
  slug?: string;
  type?: ContentType;
  label?: string;
  content?: string;
  isLoading?: boolean;
  active?: boolean;
  badge?: any | Observable<any>;
  callback?: (value?: any) => any;

  // dataInputs?: DataInput[];
  actionButtons?: ActionButton[];
  children?: ContentParameter[];
  permissions?: string[];

  class?: string;
  contentContainerClass?: string;
  contentClass?: string;
  contentChildrenClass?: string;

  whenActive?: Record<string, ContentParameter>;
  onActive?: (content?: ContentParameter, viewParameter?: ViewParameter) => any;
  mods?: Partial<ContentParameter>;

  showContentInTabs?: boolean;
  // queryParameter?: QueryParameter; // TODO: implement fetch service
  contentListeners?: ContentListener[];
  context?: Record<string, any>; // to pass additional data   other components
  initializer?: (content: ContentParameter) => Promise<ContentParameter>;

  /** For `type: 'component'`: the standalone component class to render in this tab. */
  componentType?: Type<any>;
  /** For `type: 'component'`: inputs bound onto the rendered component instance. */
  componentInputs?: Record<string, any>;
}
