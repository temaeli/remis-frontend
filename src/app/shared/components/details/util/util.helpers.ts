import { Obj } from './util.interface';

export function setObjectParameters(obj: any, obj2: {}, onlyInitialized = true, skip?: string[]) {
  if (!obj2 || typeof obj2 !== 'object') return;

  Object.entries(obj2 ?? {}).forEach(([key, value]) => {
    const notInContext = onlyInitialized && !obj.hasOwnProperty(key);
    if (skip?.includes(key) || notInContext) return;
    obj[key] = value;
  });

  return obj;
}

export function camelToSpaced(y: string) {
  if (typeof y !== 'string' || y.includes(' ')) return y;
  return capFirstChar(y.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, '$1'));
}

export function capFirstChar(s: string): string {
  return !s ? '' : s?.charAt(0).toUpperCase() + s?.slice(1);
}

export function compareFn(item1: any, item2: any, fn: (item: any) => any) {
  return fn(item1) === fn(item2);
}

export function objectHasKeys(object: any, keys: string[] | string, checkAll = true): boolean {
  if (typeof object !== 'object') return false;
  if (!object || !keys) return false;

  let hasKeys = checkAll ? true : false;
  if (!Array.isArray(keys)) keys = [keys];

  const hasProp = (key: string) => object?.hasOwnProperty(key);
  const hasKey = (key: string) => (checkAll ? hasKeys && hasProp(key) : hasKeys || hasProp(key));
  keys?.forEach(key => (hasKeys = hasKey(key)));

  return hasKeys;
}

export function isEmpty(obj: Obj) {
  return !Object.keys(obj ?? {})?.length;
}

export function isValue(value: any): boolean {
  return !!value || value === false || value === 0;
}

export function isObject(x: any) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

export function getFirstPresentKeyValue(object: Obj, keys: string[]): any {
  let value = undefined;
  keys.forEach(key => !!object[key] && (value = object[key]));
  return value;
}

export function getFirstPresentKey(object: Obj, keys: string[]): any {
  let key = undefined;
  if (!object) return key;
  keys.forEach(key_ => !!object?.[key_] && (key = key_));
  return key;
}

export function stringAfter(str: string, char: string) {
  const index = str.indexOf(char);
  if (index !== -1) return str.substring(index + 1); // Or str.slice(index + 1);
  return undefined;
}

export function stringBefore(str: string, char: string) {
  const index = str.indexOf(char);
  if (index !== -1) return str.substring(0, index - 1); // Or str.slice(index + 1);
  return undefined;
}

export function toTitleCase(str: string) {
  return (
    str
      // Replace underscores, hyphens with space
      ?.replace(/[-_]+/g, ' ')
      // Put space between lower & upper (camel/Pascal case → spaced)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Put space between consecutive uppers followed by lower (e.g. "NASAProject" → "NASA Project")
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      // Normalize spaces
      .trim()
      .split(/\s+/)
      // Capitalize each word
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  );
}

export function getLevenshteinDistance(a: string, b: string) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const mat = [];
  for (let i = 0; i <= b.length; i++) mat[i] = [i];
  for (let j = 0; j <= a.length; j++) mat[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) mat[i][j] = mat[i - 1][j - 1];
      else mat[i][j] = Math.min(mat[i - 1][j - 1] + 1, mat[i][j - 1] + 1, mat[i - 1][j] + 1);
    }
  }

  return mat[b.length][a.length];
}
