import { base64, capitalize, currentTimestamp, timeLeft } from '@core/helpers/string.helpers';
import { Token } from './auth.interface';

export const TEST_TOKEN = {
  access_token: '17cb146a-38b0-44bf-ae2f-1fcd103a6847',
  token_type: 'bearer',
  refresh_token: 'ea80dab8-eafd-4b92-a31b-6bb2c0f7d1e9',
  expires_in: 33944,
  scope: 'read write',
  exp: 1738880045,
};

export abstract class BaseToken {
  constructor(protected attributes: Token) {}

  get access_token(): string | undefined {
    return this.attributes.access_token;
  }

  get refresh_token(): string | undefined {
    return this.attributes.refresh_token;
  }

  get token_type(): string {
    return this.attributes.token_type ?? 'bearer';
  }

  get exp(): number | undefined {
    return this.attributes.exp;
  }

  valid(): boolean {
    return this.hasAccessToken() && !this.isExpired();
  }

  getBearerToken(): string {
    return this.access_token
      ? [capitalize(this.token_type), this.access_token].join(' ').trim()
      : '';
  }

  needRefresh(): boolean {
    return this.exp !== undefined && this.exp >= 0;
  }

  getRefreshTime(): number {
    return timeLeft((this.exp ?? 0) - 5);
  }

  private hasAccessToken(): boolean {
    return !!this.access_token;
  }

  private isExpired(): boolean {
    return this.exp !== undefined && this.exp - currentTimestamp() <= 0;
  }
}

export class SimpleToken extends BaseToken {}

export class JwtToken extends SimpleToken {
  private _payload?: { exp?: number | void };

  static is(accessToken: string): boolean {
    try {
      const [_header] = accessToken.split('.');
      const header = JSON.parse(base64.decode(_header));

      return header.typ.toUpperCase().includes('JWT');
    } catch (e) {
      return false;
    }
  }

  get exp(): any {
    return this.payload?.exp;
  }

  private get payload(): { exp?: number | void } {
    if (!this.access_token) {
      return {};
    }

    if (this._payload) {
      return this._payload;
    }

    const [, payload] = this.access_token.split('.');
    const data = JSON.parse(base64.decode(payload));
    if (!data.exp) {
      data.exp = this.attributes.exp;
    }

    return (this._payload = data);
  }
}
