import { Injectable } from '@angular/core';
import { APP_VARIABLES } from './app-variables';

export enum LocalStorageEnum {
  USER = 'USER',
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  PERMISSIONS = 'PERMISSIONS',
  TOKEN = 'TOKEN',
  USER_DETAILS = 'USER_DETAILS',
  VISITED_IDS = 'VISITED_IDS',
  ROUTE_INFO = 'ROUTE_INFO',
}

const prefix = APP_VARIABLES.prefix!;

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  static loadInitialState() {
    return Object.keys(localStorage).reduce((state: any, storageKey) => {
      if (storageKey.includes(prefix)) {
        const stateKeys = storageKey
          .replace(prefix, '')
          .toLowerCase()
          .split('.')
          .map((key) =>
            key
              .split('-')
              .map((token, index) =>
                index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1),
              )
              .join(''),
          );

        let currentStateRef = state;

        stateKeys.forEach((key, index) => {
          if (index === stateKeys.length - 1) {
            currentStateRef[key] = JSON.parse('' + localStorage.getItem(storageKey));
            return;
          }

          currentStateRef[key] = currentStateRef[key] || {};
          currentStateRef = currentStateRef[key];
        });
      }
      return state;
    }, {});
  }

  setItem(key: string, value: any) {
    localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
  }

  getItem(key: string) {
    return JSON.parse('' + localStorage.getItem(`${prefix}${key}`));
  }

  removeItem(key: string) {
    localStorage.removeItem(`${prefix}${key}`);
  }

  has(key: string): boolean {
    return !!localStorage.getItem(key);
  }

  upsert(key: string, idKey = 'slug', item: any): any {
    let items = this.getItem(key) ?? [];

    if (!Array.isArray(items)) items = [];

    if (typeof item === 'object') {
      if (!item.hasOwnProperty(idKey)) item[idKey] = 'none';
      items = items?.filter((a: any) => a?.[idKey] !== item?.[idKey]);
    } else items = items?.filter((a: any) => a !== item);

    items.push(item);
    this.setItem(key, items);
  }

  find<T = any>(key: string, idKey = 'uid', idKeyValue: any = 'none'): T | undefined {
    let items: T[] = this.getItem(key) ?? [];
    if (!Array.isArray(items)) items = [];
    return items?.find((a: any) => a?.[idKey] === idKeyValue);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  setFromObject(object: Record<string, any>) {
    if (typeof object !== 'object') return;
    for (const key in object) this.setItem(key, object[key]);
  }

  getAsObject(keys: string[]) {
    const object: any = {};
    keys.forEach((key: string) => (object[key] = this.getItem(key)));
    return object;
  }

  clear() {
    localStorage.clear();
  }
}
