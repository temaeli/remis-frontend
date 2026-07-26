export type AppTheme = 'light' | 'dark' | 'auto';

export interface AppSettings {
  navPos: 'side' | 'top';
  dir: 'ltr' | 'rtl';
  theme: AppTheme;
  showHeader: boolean;
  headerPos: 'fixed' | 'static' | 'above';
  showUserPanel: boolean;
  sidenavOpened: boolean;
  sidenavCollapsed: boolean;
  language: string;
}

export const defaults: AppSettings = {
  navPos: 'side',
  theme: 'auto',
  dir: 'ltr',
  showHeader: true,
  headerPos: 'fixed',
  showUserPanel: true,
  sidenavOpened: true,
  sidenavCollapsed: false,
  language: 'en-US',
};

export interface EnvInterface{
  production: boolean,
  baseUrl: string,
  useHash: boolean,
  apiUrl: string,
  GRANT_TYPE: string,
  CLIENT_ID: string,
  CLIENT_SECRET: string,
  SESSION_TIME: number,
  REQUEST_TIME: number,
  FRONT_END_URL: string,
  SERVER_URL: string,
}