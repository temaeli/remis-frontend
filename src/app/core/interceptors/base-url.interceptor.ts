import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';

export const BASE_URL = new InjectionToken<string>('BASE_URL');

export function hasHttpScheme(url: string) {
  return new RegExp('^http(s)?://', 'i').test(url);
}

export function baseUrlInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const baseUrl = inject(BASE_URL, { optional: true });

  const hasScheme = (url: string) => baseUrl && hasHttpScheme(url);

  if (hasHttpScheme(req.url)) {
    return next(req);
  }

  //If BASE_URL missing developer friendly error-for toubleshooting
  if (!baseUrl) {
    console.error(
      `[BaseUrlInterceptor Error]: API request to '${req.url}' failed. ` +
      `BASE_URL is null or undefined! Please ensure 'environment.baseUrl' is set and provided in app.config.ts.`
    );
    return next(req);
  }

  // Prepend Base URL
  const formattedBaseUrl = baseUrl.replace(/\/$/g, '');
  const formattedRelativeUrl = req.url.replace(/^\.?\//, '');
  const fullUrl = [formattedBaseUrl, formattedRelativeUrl].filter(Boolean).join('/');

  return next(req.clone({ url: fullUrl }));
}
