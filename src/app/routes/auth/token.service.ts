import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { Token } from './auth.interface';
import { BaseToken } from './token';
import { StorageService } from '@shared/services/storage.service';
import { currentTimestamp } from '@core/helpers/string.helpers';
import { TokenFactory } from './token-factory.service';
import { filterObject } from '@core/helpers/object.helpers';

@Injectable({
  providedIn: 'root',
})
export class TokenService implements OnDestroy {
  public key = 'app-token';

  private change$ = new BehaviorSubject<BaseToken | undefined>(undefined);
  private refresh$ = new Subject<BaseToken | undefined>();
  private timer$?: Subscription;
  private subs = new Subscription();

  private _token?: BaseToken;
  private storage = inject(StorageService);
  private factory = inject(TokenFactory);

  private get token(): BaseToken | undefined {
    if (!this._token) {
      const storedToken = this.storage.get<Token>(this.key);
      if (storedToken) {
        this._token = this.factory.create(storedToken);
      }
    }

    return this._token;
  }

  change(): Observable<BaseToken | undefined> {
    return this.change$.asObservable();
  }

  refresh(): Observable<BaseToken | undefined> {
    this.buildRefresh();

    return this.refresh$.asObservable();
  }

  set(token?: Token): TokenService {
    this.save(token);

    return this;
  }

  clear(): void {
    this.save();
  }

  valid(): boolean {
    return this.token?.valid() ?? false;
  }

  getBearerToken(): string {
    return this.token?.getBearerToken() ?? '';
  }

  getRefreshToken(): string | undefined {
    return this.token?.refresh_token;
  }

  ngOnDestroy(): void {
    this.change$.complete();
    this.refresh$.complete();
    this.clearRefresh();
    this.subs.unsubscribe();
  }

  private save(token?: Token): void {
    this._token = undefined;

    if (!token) {
      this.storage.remove(this.key);
    } else {
      const value = Object.assign({ access_token: '', token_type: 'Bearer' }, token, {
        exp: token.expires_in ? currentTimestamp() + token.expires_in : null,
      });
      const filtered = filterObject(value);
      this.storage.set(this.key, filtered);
    }

    this.change$.next(this.token);
    this.buildRefresh();
  }

  private buildRefresh(): void {
    this.clearRefresh();

    if (this.token?.needRefresh()) {
      this.timer$ = timer(this.token.getRefreshTime() * 1000).subscribe(() => {
        this.refresh$.next(this.token);
      });
      this.subs.add(this.timer$);
    }
  }

  private clearRefresh(): void {
    if (this.timer$ && !this.timer$.closed) {
      this.timer$.unsubscribe();
    }
  }
}
