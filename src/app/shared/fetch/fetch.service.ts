import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, shareReplay, Subscription, tap } from 'rxjs';
import { catchError, firstValueFrom, map, merge } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { loadingService } from '@core/loading/loader.service';
import { isValue } from '@core/helpers';
import { Apollo } from 'apollo-angular';
import { AppResponse, CacheEntry, FetchParameter } from './fetch.interface';
import { getApolloOptions } from './grapql.helpers';

@Injectable({
  providedIn: 'root',
})
export class FetchService {
  private http = inject(HttpClient);
  private notify = inject(NotificationService);
  private ls = inject(loadingService);
  private apollo = inject(Apollo);

  private baseUrl = ''; // environment.apiUrl;
  private cache = new Map<string, CacheEntry>();
  private defaultCacheTTL = 0.5 * 60 * 1000; // 30sec

  private refetchActionSubs = new Map<string, Subscription>();

  async fetch(fp: FetchParameter): Promise<any> {
    return firstValueFrom(this.fetch$(fp));
  }

  fetch$(fp: FetchParameter): Observable<any> {
    if (!fp?.url && !fp?.fetchFn && !fp.query && !fp.mutation) {
      return of(fp?.list ? [] : undefined);
    }

    let queryKey = '';

    if (!!fp.query || !!fp.mutation) {
      queryKey = (fp as any)?.query?.definitions[0]?.name?.value;
    }

    const getOptions = (vars: any) => {
      return getApolloOptions({ ...fp, variables: { ...fp.variables, vars } }) as any;
    };

    if (fp.query) fp.fetchFn = (variables) => this.apollo.query(getOptions(variables));
    if (fp.mutation) fp.fetchFn = (variables) => this.apollo.mutate(getOptions(variables));

    let key = `${fp.url ?? fp.fetchFn?.toString()}`.slice(0, 40);
    if (fp.variables) key = `${key}?${JSON.stringify(fp.variables)}`;
    if (queryKey) key = `${key}-${queryKey}`;

    // Register cache invalidation listeners
    this.listenToRefetchActions(fp, key);

    const cached = this.cache.get(key);
    // console.log('=================> ', key, cached);

    // in-flight
    let storedObs = cached?.observable;
    const shouldCache = fp.fetchPolicy === 'cache-first' || (fp?.cacheTTL ?? 0) > 0;

    // Check if request is in-cache
    if (!storedObs && shouldCache) {
      const cacheTTL = fp.cacheTTL ?? this.defaultCacheTTL;
      if (cached?.data && Date.now() - cached.timestamp < cacheTTL) storedObs = of(cached.data);
    }

    // in-flight or use cache and in cache
    if (storedObs) {
      return storedObs.pipe(
        tap((res) => fp.finalFn && fp.finalFn(res)),
        map((res) => this.mapResponse(res, fp)),
        tap((res) => this.handleListeners(res, fp)),
      );
    }

    return this.makeRequest(fp, key, shouldCache);
  }

  private handleListeners(res: AppResponse, fp: FetchParameter) {
    //final return data
    if (fp.data$) fp.data$.next(this.mapResponse(res, fp));

    // res
    if (fp.query || fp.mutation) res = this.resFromGql(res, fp);
    if (fp.res$) fp.res$.next(res);
  }

  private makeRequest(fp: FetchParameter, key: string, shouldCache?: boolean): Observable<any> {
    let res$: Observable<any>;

    // Show loader
    if (fp.showLoading !== false) this.ls.show(fp.loadingOn ?? 'no-content');

    if (fp.defaultRes !== undefined && Object.values(fp.variables || {}).some((v) => !isValue(v))) {
      res$ = of(fp.defaultRes);
    }

    // Fetch by url
    else if (fp.url) {
      const hasBase = fp.url.startsWith('http');
      const url = hasBase ? fp.url : `${this.baseUrl}${fp.url.startsWith('/') ? '' : '/'}${fp.url}`;

      //set params
      const variables = { ...(fp?.variables || {}) };
      const params = new HttpParams({ fromObject: variables });

      res$ = this.http.get(`${url}`, { params });
      if (fp.method === 'POST') res$ = this.http.post(url, { ...variables });
    }
    // Fetch from an observable callback
    else res$ = (fp as any).fetchFn(fp.variables);

    // Apply operators and cache management
    const request$ = res$.pipe(
      tap((res: any) => this.handleNotification({ ...res }, fp)),
      fp.handleException === false
        ? tap()
        : catchError((err: HttpErrorResponse, x) => this.handleException(err, fp, x)),
      tap((res) => fp.loadingOn && this.ls.hide(fp.loadingOn)),
      // Store the final data in cache if caching is enabled
      tap((res) => shouldCache && this.cache.set(key, { data: res, timestamp: Date.now() })),
      tap((res) => this.handleListeners(res, fp)),
      shareReplay(1),
      // Remove in-flight observable reference
      tap({ finalize: () => this.cache.get(key) && delete this.cache.get(key)?.observable }),
      tap((res) => fp.finalFn && fp.finalFn(res)),
    );

    //allways Store the in-flight observable
    const cached = this.cache.get(key);
    const timestamp = cached?.timestamp || Date.now();
    this.cache.set(key, { data: cached?.data, timestamp, observable: request$ });

    //return the possibly map res
    return request$.pipe(map((res) => this.mapResponse(res, fp)));
  }

  private resFromGql(res: AppResponse, fp: FetchParameter) {
    if (fp.query || fp.mutation) {
      res = Object.values({ ...(res ?? {}) })?.[0]; // get data
      res = Object.values({ ...(res ?? {}) })?.[0]; // get query/mutation
    }

    return res;
  }

  private mapResponse(res: AppResponse, fp: FetchParameter) {
    if (fp.query || fp.mutation) res = this.resFromGql(res, fp);

    if (fp.resMapFn) return fp.resMapFn(res);

    if (fp.mapData === false) return res;

    res = res?.hasOwnProperty('data') ? res.data : res;

    return res;
  }

  private handleNotification(res: AppResponse, fp: FetchParameter) {
    if (fp.query || fp.mutation) {
      res = Object.values({ ...(res ?? {}) })?.[0];
      res = Object.values({ ...(res ?? {}) })?.[0];
    }

    const data = res?.hasOwnProperty('data') ? res.data : res;

    const success = !!res?.status || !!data || res?.code === 2000;

    if (success && fp.successFn) fp.successFn(res);
    if (!success && fp.failedFn) fp.failedFn(res);

    if (!fp.notify && !fp.notifySuccess && !fp.notifyError) return;

    const msg = fp.successMessage ?? res.message;
    //
    if ((fp.notify || !!fp.successMessage || !!fp.notifySuccess) && success) {
      this.notify.success(fp.succesMessageFn?.(res) ?? msg ?? 'Completed Successfully');
    }
    //
    else if ((fp.notify || fp.notifyError !== false) && !success) {
      this.notify.error(fp.errorMessageFn?.(res) ?? msg ?? 'Failed to Complete');
    }
    //
    else if (msg) this.notify.info(msg);
  }

  handleException(err: any, fp: FetchParameter, x: any) {
    console.log(err.errors);

    if (fp.exceptionFn) fp.exceptionFn((err as any));

    if (fp.notifyError !== false) {
      // Prefer OAuth error_description if present
      const oauthMsg = err?.error?.error_description;
      let message =
        oauthMsg || err?.error?.error || err?.error?.message || err?.message || 'An Error Occurred';
      if (err.status == 0) message = 'Network Error';
      this.notify.error(message);
    }

    return of(undefined);
  }

  private listenToRefetchActions(fp: FetchParameter, key: string) {
    const actions = fp.refetchActions?.filter(Boolean);

    if (!actions?.length) return;

    // Avoid duplicate subscriptions
    if (this.refetchActionSubs.has(key)) return;

    const sub = merge(...actions).subscribe(() => this.clearCache(key));

    this.refetchActionSubs.set(key, sub);
  }

  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
      this.refetchActionSubs.get(key)?.unsubscribe();
      this.refetchActionSubs.delete(key);
      return;
    }

    this.cache.clear();
    this.refetchActionSubs.forEach((s) => s.unsubscribe());
    this.refetchActionSubs.clear();
  }
}
