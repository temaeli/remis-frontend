export * from './base-url.interceptor';
export * from './settings.interceptor';
export * from './token.interceptor';
export * from './error.interceptor';
export * from './logging.interceptor';
export * from './loading.interceptor';

import { baseUrlInterceptor } from './base-url.interceptor';
import { errorInterceptor } from './error.interceptor';
import { loadingInterceptor } from './loading.interceptor';
import { loggingInterceptor } from './logging.interceptor';
import { settingsInterceptor } from './settings.interceptor';
import { tokenInterceptor } from './token.interceptor';

// Http interceptor providers in outside-in order
export const interceptors = [
  baseUrlInterceptor,
  loadingInterceptor,
  settingsInterceptor,
  tokenInterceptor,
  errorInterceptor,
  loggingInterceptor,
];
