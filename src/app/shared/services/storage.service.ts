import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  get<T = unknown>(key: string): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (!item) return undefined;
      return JSON.parse(item) as T;
    } catch (err) {
      console.error(`Failed to get item from localStorage: ${key}`, err);
      return undefined;
    }
  }

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to set item in localStorage: ${key}`, err);
    }
  }

  has(key: string): boolean {
    return !!localStorage.getItem(key);
  }

  upsert<T extends Record<string, unknown>>(
    key: string,
    item: T,
    itemIdentifier = 'uid',
  ): void {
    try {
      let items: T[] = this.get<T[]>(key) ?? [];

      if (!Array.isArray(items)) {
        items = [];
      }

      if (typeof item === 'object' && item !== null) {
        if (!(itemIdentifier in item)) {
          (item as any)[itemIdentifier] = 'none';
        }
        items = items.filter(
          (a) => a?.[itemIdentifier as keyof T] !== item?.[itemIdentifier as keyof T],
        );
      } else {
        items = items.filter((a) => a !== item);
      }

      items.push(item);
      this.set(key, items);
    } catch (err) {
      console.error(`Failed to upsert item in storage: ${key}`, err);
    }
  }

  find<T extends Record<string, unknown>>(
    key: string,
    itemIdentifier = 'uid',
    itemIdentifierValue: unknown = 'none',
  ): T | undefined {
    try {
      const items = this.get<T[]>(key) ?? [];

      if (!Array.isArray(items)) {
        return undefined;
      }

      return items.find((a) => a?.[itemIdentifier as keyof T] === itemIdentifierValue);
    } catch (err) {
      console.error(`Failed to find item in storage: ${key}`, err);
      return undefined;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  setFromObject(object: Record<string, unknown>): void {
    if (typeof object !== 'object' || object === null) return;
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        this.set(key, object[key]);
      }
    }
  }

  getAsObject<T extends Record<string, unknown>>(keys: string[]): Partial<T> {
    const object: Record<string, unknown> = {};
    keys.forEach((key) => {
      object[key] = this.get(key);
    });
    return object as Partial<T>;
  }

  clear(): void {
    localStorage.clear();
  }
}

@Injectable({
  providedIn: 'root',
})
export class MemoryStorageService {
  private store: Record<string, string> = {};

  get<T = unknown>(key: string): T | undefined {
    try {
      const item = this.store[key];
      if (!item) return undefined;
      return JSON.parse(item) as T;
    } catch (err) {
      console.error(`Failed to get item from memory storage: ${key}`, err);
      return undefined;
    }
  }

  set(key: string, value: unknown): void {
    try {
      this.store[key] = JSON.stringify(value);
    } catch (err) {
      console.error(`Failed to set item in memory storage: ${key}`, err);
    }
  }

  has(key: string): boolean {
    return !!this.store[key];
  }

  remove(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}
