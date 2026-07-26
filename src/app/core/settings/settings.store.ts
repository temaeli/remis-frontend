import { Direction } from '@angular/cdk/bidi';
import { BehaviorSubject } from 'rxjs';

export type Language = 'sw-TZ' | 'en-US' | 'auto';

export type SidebarLayout = 'default' | 'slim';

export type Theme = 'light' | 'dark' | 'auto';
export type HeaderPos = 'fixed' | 'static' | 'above';
export type NavPos = 'side' | 'top';

export interface AppSettings {
  theme?: Theme;
  language?: Language;
  dir?: Direction;

  navPos?: NavPos;
  showHeader?: boolean;
  headerPos?: HeaderPos;
  showBrandPanel?: boolean;
  sidenavOpened?: boolean;
  sidenavCollapsed?: boolean;
  sidebarLayout?: SidebarLayout;
  showUserPanel?: boolean;

  animations?: {
    pages?: Animation_;
    auth?: Animation_;
    landing?: Animation_;
    button?: Animation_;
    sidebar?: Animation_;
    tableRow?: Animation_;
    tabs?: Animation_;
    modals?: Animation_;
  };
}

export type Animation_ = AnimationEnum | undefined | '';

export enum AnimationEnum {
  moveLeft = 'move-left',
  moveRight = 'move-right',
  moveUp = 'move-up',
  moveDown = 'move-down',
  scaleUp = 'scale-up',
  scaleUpRight = 'scale-up-right',
  scaleUpLeft = 'scale-up-left',
  scaleUpTop = 'scale-up-top',
  scaleDown = 'scale-down',
  fadeOn = 'fade-on',
  noAnimation = 'no-animation',
}

export const defSettings: AppSettings = {
  theme: 'auto',

  navPos: 'side',
  dir: 'ltr',
  showHeader: true,
  headerPos: 'fixed',
  showBrandPanel: true,
  showUserPanel: true,
  sidenavOpened: true,
  sidenavCollapsed: false,
  language: 'en-US',
  sidebarLayout: 'default',

  animations: {
    pages: AnimationEnum.moveRight,
    auth: AnimationEnum.moveDown,
    landing: AnimationEnum.moveDown,
    button: AnimationEnum.scaleUp,
    sidebar: AnimationEnum.moveRight,
    tableRow: AnimationEnum.scaleUpLeft,
    tabs: AnimationEnum.moveRight,
    modals: AnimationEnum.fadeOn,
  },
};

export const settings$ = new BehaviorSubject<AppSettings>(defSettings);
export const menuItems$ = new BehaviorSubject<any[]>([]); //SidebarItem
