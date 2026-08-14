import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  lastValueFrom,
  merge,
  of,
  throwError,
} from 'rxjs';
import { catchError, map, share, switchMap, take, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { environment as env } from '@env/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '@shared/services/notification.service';
import { StorageService } from '@shared/services/storage.service';
import { LoginCredentials, Token } from './auth.interface';
import { FetchService } from '@shared/fetch/fetch.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  public user$ = new BehaviorSubject<any>({}); // user always begin with empty object
  private userSignal = signal<any>({});
  public userType = computed(() => {
    const user = this.userSignal();
    return user?.isStaff === false ? 'external' : 'internal';
  });

  storageRetainedKeys = ['redirectUrl', 'app-settings'];
  subscriptions = new Subscription();
  private backendUrl = env.SERVER_URL;

  user = () => this.user$.pipe(share());
  init = () => new Promise<void>((resolve) => this.change$.subscribe(() => resolve()));
  check = () => this.tokenService.valid();
  change = () => this.change$;

  private change$ = merge(
    this.tokenService.change(),
    this.tokenService.refresh().pipe(switchMap(() => this.refresh())),
  ).pipe(
    switchMap(() => this.fetchUser()),
    share(),
  );

  ngOnDestroy = () => this.subscriptions.unsubscribe();

  constructor(
    private tokenService: TokenService,
    private http: HttpClient,
    private permissionsService: NgxPermissionsService,
    private rolesService: NgxRolesService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private storage: StorageService,
    private notify: NotificationService,
  ) {}

  login(creds: LoginCredentials): Observable<any> {
    localStorage.clear();

    this.user$.next({});
    this.tokenService.clear();

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: 'Basic ' + btoa(env.CLIENT_ID + ':' + env.CLIENT_SECRET),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    });

    const username = `username=${encodeURIComponent(creds.username)}`;
    const body = `${username}&password=${encodeURIComponent(creds.password)}&grant_type=password`;

    // const token$ = of(TEST_TOKEN); //// test // comment this
    const token$ = this.http.post<Token>(`${this.backendUrl}/oauth/token`, body, { headers }); //for actual token req

    return token$
      .pipe(tap((token: Token) => token && this.tokenService.set(token)))
      .pipe(switchMap(() => (this.check() ? this.fetchUser() : of(undefined))));
    // .pipe(tap(user => delayedExecution(() => this.redirectFromStorage(user), 1000)));
  }

  getToken() {
    this.user$.next({});
    this.tokenService.clear();

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: 'Basic ' + btoa(env.CLIENT_ID + ':' + env.CLIENT_SECRET),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    });

    const body = `grant_type=client_credentials`;
    const token$ = this.http.post<Token>(`${this.backendUrl}/oauth/token`, body, { headers }); //for actual token req

    return token$
      .pipe(tap((token: Token) => token && this.tokenService.set({ ...token, anonymous: true })))
      .pipe(tap((t) => this.subscriptions?.add(this.change$.subscribe())))
      .pipe(switchMap((x) => of(x)));
  }

  redirectFromStorage(user: any) {
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (!!user && redirectUrl) this.router.navigateByUrl(redirectUrl.trim());
  }

  goToLogin() {
    this.router.navigateByUrl('auth/login');
  }

  fetchUser() {
    const token = this.storage.get<Token>(this.tokenService.key);

    // Return empty if token is anonymous
    if (token?.anonymous) return of({});

    // Return empty user if token is not valid
    if (!this.check()) return of({}).pipe(tap((user) => this.user$.next(user)));

    // Return existing user if already loaded to avoid redundant API calls
    const currentUser = this.user$.value;
    if (currentUser && Object.keys(currentUser).length > 0) {
      return of(currentUser);
    }

    return this.http.get(this.backendUrl + '/user').pipe(
      map((response: any) => {
        const permissions =
          response?.authorities?.map((obj: any) =>
            typeof obj === 'string' ? obj : obj.authority,
          ) ?? [];
        const attrs = response?.attributes ?? {};
        const user: any = { ...attrs, permissions, ...this.mapUser(response) };
        this.setPermissions(user);
        return user;
      }),
      switchMap((user) => this.fetchAndStoreRoles(user).pipe(map(() => user))),
      tap((user) => {
        this.user$.next(user);
        this.userSignal.set(user);
      }),
    );
  }

  private fetchAndStoreRoles(user: any): Observable<void> {
    const query = `query { myProfile { rolesList { role { name } } } }`;
    return this.http.post<any>(this.backendUrl + '/graphql', { query }).pipe(
      map((res) => {
        const roles: string[] =
          res?.data?.myProfile?.rolesList?.map((r: any) => r?.role?.name).filter(Boolean) ?? [];
        this.storage.set('roles', roles);
        user.roles = roles;
      }),
      catchError(() => {
        this.storage.set('roles', []);
        return of(void 0);
      }),
    );
  }

  mapUser(u: any) {
    const loc = ` /assets/images/icons`;
    if (!u.image) u.image = `${loc}/${u.gender === 'MALE' ? 'man' : 'woman'}.png`;
    if (!u.name) u.name = `${u.firstName ?? ''}${u.lastName ? ' ' + u.lastName : ''}`;
    return u;
  }

  setPermissions(user: any) {
    if (!user.permissions) user.permissions = [];

    this.storage.set('userUid', user?.uid);
    this.storage.set('username', user?.username);
    this.storage.set('isStaff', user.isStaff);
    this.storage.set('perms', user.permissions);

    this.permissionsService.loadPermissions(user.permissions);
    this.rolesService.flushRoles();
    this.rolesService.addRoles({ ADMIN: user.permissions });
    // Tips: Alternatively you can add permissions with role at the same time.
    // this.rolesService.addRolesWithPermissions({ ADMIN: permissions });
  }

  refresh() {
    return of(true);
    // refresh doesn't work for now

    return this.http
      .post<Token>('/auth/refresh', { refresh_token: this.tokenService.getRefreshToken() })
      .pipe(
        catchError(() => of(undefined)),
        tap((token) => this.tokenService.set(token)),
        map(() => this.check()),
      );
  }

  //   backend-url/anonymous/forgot-password; //For external Request for password reset LINK
  // backend-url/anonymous/password-reset/token; //For external password change

  resetRequest(formData: any) {
    return this.getClientToken().pipe(
      switchMap((token) => {
        let access_token: any = token?.access_token;

        let headers = new HttpHeaders({
          Accept: 'application/json',
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
        }).set('ngLoader', 'false');

        const body = { email: formData };
        return this.http.post(`${this.backendUrl}/anonymous/forgot-password`, body, { headers });
      }),
    );
  }

  resetConfirm(data: { newPassword: string }, token: string) {
    return this.getClientToken().pipe(
      switchMap((token_) => {
        let access_token: any = token_?.access_token;

        let headers = new HttpHeaders({
          Accept: 'application/json',
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
        }).set('ngLoader', 'false');

        return this.http.post(`${this.backendUrl}/anonymous/password-reset`, data, {
          headers,
        });
      }),
    );
  }

  getClientToken() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: 'Basic ' + btoa(env.CLIENT_ID + ':' + env.CLIENT_SECRET),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    });

    const body = `grant_type=client_credentials`;
    return this.http.post<Token>(`${this.backendUrl}/oauth/token`, body, { headers }); //for actual token req
  }

  anonymousLogout(toUrl = '/') {
    this.logout()
      .pipe(take(1))
      .subscribe((x) => this.router.navigateByUrl(toUrl));
  }

  logout() {
    const logout = (response: any) => {
      this.tokenService.clear();
      this.permissionsService.flushPermissions();
      localStorage.clear();
      this.router.navigateByUrl('/auth/login');
      return true;
    };

    // Get token details from storage
    const tokenDetails = this.storage.get<Token>(this.tokenService.key);

    if (tokenDetails?.access_token && tokenDetails?.refresh_token) {
      const params = new HttpParams()
        .set('token', encodeURIComponent(tokenDetails.access_token))
        .set('refresh-token', encodeURIComponent(tokenDetails.refresh_token));

      return this.http
        .post<any>(`${this.backendUrl}/users/logout`, params, { responseType: 'any' as 'json' })
        .pipe(
          map((response) => logout(response)),
          map(() => !this.check()),
          catchError((error) => {
            console.error('Logout request error:', error);
            return of(logout(null));
          }),
        );
    }

    return of(true).pipe(tap(() => logout(null)));
  }
}
