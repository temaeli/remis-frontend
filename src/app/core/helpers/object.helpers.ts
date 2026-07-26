import { isObservable } from 'rxjs';
import { Obj, Option, ValueType } from './data.interfaces';
import {
  capitalizeFirstLetter,
  toTitleCase,
  replaceWords,
  valueIsEither,
  camelToSpaced,
} from './string.helpers';

export function isObject(x: any) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

export function enumToObjectArray(enum_obj: any, rm_scores = true, titleCase = false): Option[] {
  const array = [];
  const parseString = (s: string) => (titleCase ? capitalizeFirstLetter(toTitleCase(s)) : s);

  for (const key in enum_obj) {
    array.push({
      label: parseString(replaceWords(key, '_', rm_scores ? ' ' : '_')),
      value: enum_obj[key],
    });
  }
  return array;
}

export function enumToArray(enum_obj: any): string[] {
  const array = [];
  for (const key in enum_obj) array.push(key);
  return array;
}

export function isValue(value: any): boolean {
  return !!value || value === false || value === 0;
}

export function copyObjectValues(cxt: any, obj: Obj, onlyInitialized = true, exclude?: string[]) {
  if (!obj || typeof obj !== 'object') return;
  const fields = getFields(obj);

  fields.forEach((field) => {
    const key = field.key as string;
    const notInContext = onlyInitialized && !cxt.hasOwnProperty(key);
    if (exclude?.includes(key) || notInContext) return;
    cxt[key] = field.value;
  });
}

export function getFields(
  obj: any,
  hiddenKeys?: string[],
): { key: string; value: any; name: string }[] {
  const fields: any[] = [];
  if (typeof obj !== 'object' || !obj) return [];

  Object.keys(obj)
    .filter((key) => !valueIsEither(key, (hiddenKeys as string[])))
    .forEach((key) =>
      fields.push({
        key,
        value: obj[key],
        name: camelToSpaced(key),
      }),
    );

  return fields;
}

export function deepClone(obj: Obj) {
  if (obj === null || typeof obj !== 'object') return undefined;

  let clone = { ...obj };

  // Simple conversion
  try {
    const objJSON = JSON.stringify(obj);
    clone = JSON.parse(objJSON);
  } catch (err) {
    console.log('CLN Err');
  }

  return clone;
}

export function setPathValue(obj: Obj, path: string, value: any): any {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) current[key] = {};
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;

  return obj;
}

export function toOptionsArray(array: string[]): { name: string; value: string }[] {
  return array.map((v) => ({ name: v, value: v }));
}

export function objectHasKeys(object: Obj, keys: string[] | string, checkAll = true): boolean {
  if (typeof object !== 'object') return false;
  if (!object || !keys) return false;
  let hasKeys = checkAll ? true : false;
  if (!Array.isArray(keys)) keys = [keys];
  const hasProp = (key: string) => object?.hasOwnProperty(key);
  const hasKey = (key: string) => (checkAll ? hasKeys && hasProp(key) : hasKeys || hasProp(key));

  keys?.forEach((key) => (hasKeys = hasKey(key)));
  return hasKeys;
}

export function haveCommonFieldsValues(obj1: Obj, obj2: Obj, fields: string[]) {
  for (const field of fields) {
    if (obj1?.[field] === obj2?.[field]) return true;
  }
  return false;
}

export function getObject(obj: Obj, keys: string[]): Obj {
  const res: Obj = {};
  keys.forEach((key) => (res[key] = obj[key]));
  return res;
}

export function mergeObjects(obj1: Obj, obj2: Obj) {
  const result = { ...obj1 };
  // array are treated as objects in ts so add Is Array check
  const isObj = (o: any) => !Array.isArray(o) && typeof o === 'object';

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (isObj(obj2[key]) && obj1.hasOwnProperty(key) && isObj(obj1[key])) {
        // Recursively merge nested objects
        result[key] = mergeObjects(obj1[key], obj2[key]);
      }
      // Non-object properties are overwritten by the second object
      else result[key] = obj2[key];
    }
  }

  return result;
}

export function mergeObjectsFrom(arr1: Obj[], arr2: Obj[], key: string) {
  return arr1.map((a: Obj) => {
    const b = arr2.find((b_) => b_[key] === a[key]);
    if (b) return { ...a, ...b };
    else return a;
  });
}

export function findReplace(items1: any[], items2: any[], idKey: string): any[] {
  const items1_ = items1.map((item) => items2?.find((f) => f?.[idKey] === item?.[idKey]) ?? item);
  return items1_;
}

export function upsertItems(items1: any[], items2: any[], idKey: string): any[] {
  const items1_ = items1.map((item) => items2?.find((f) => f?.[idKey] === item?.[idKey]) ?? item);
  items2.forEach((item) => !items1.find((i) => i?.[idKey] === item?.[idKey]) && items1.push(item));
  return items1_;
}

export function areObjectsEqual(obj1: Obj, obj2: Obj, matchLength = true) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length && matchLength) return false;
  for (const key of keys1) if (obj1[key] !== obj2[key]) return false;
  return true;
}

export function sortByRelation(objectList: Obj[], key = 'parent') {
  // Create a map for quick access to objects by their unique ID
  const objectMap = new Map(objectList.map((obj) => [obj['id'], obj]));

  // Recursive function to calculate levels
  const calculateLevel = (object: Obj) => {
    if (!object[key]) object['level'] = 0;
    else if (objectMap.has(object[key])) {
      const parentObject: Partial<{ level: number }> | any = objectMap.get(object[key]);

      // Calculate the parent's level if not already done
      if (!('level' in parentObject)) calculateLevel(parentObject);
      object['level'] = parentObject.level + 1;
    }
  };

  // Calculate levels for all objects
  objectList.forEach(calculateLevel);

  // Sort the objects by level
  objectList.sort((a, b) => a['level'] - b['level']);

  return objectList;
}

export function uniqueSetFromArrays(key: string, ...arrays: any[][]): any[] {
  let uniqueArray = [...arrays?.[0]],
    value: any;

  arrays.slice(1).forEach((array) =>
    array.forEach((item) => {
      const valueNotPresent = (value = item?.[key]) && !uniqueArray.find((i) => i?.[key] == value);
      if (valueNotPresent || !item.hasOwnProperty(key)) uniqueArray.push(item);
    }),
  );

  return uniqueArray;
}

export function uniqueSet(items: any[], key?: string) {
  if (Array.isArray(items) && items.length > 0) {
    if (typeof items[0] === 'object' && key) {
      const uniqueValues = new Set();
      const resultArray: any[] = [];

      items.forEach((item) => {
        const value = item[key];
        if (!uniqueValues.has(value)) {
          uniqueValues.add(value);
          resultArray.push(item);
        }
      });

      return resultArray;
    }
    // If it's not an array of objects or no key is provided, return a unique array of values
    else return Array.from(new Set(items));
  } else return [];
}

export function filterBy(items: any[], prop: string, value?: any) {
  return items?.filter((i) => (value ? i?.[prop] === value : !!i?.[prop])) ?? [];
}

export function getPathValue(obj: Obj, path: string): any {
  if (typeof obj !== 'object') return obj;
  if (!path?.trim()) return obj;

  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) value = value[key];
    else return undefined;
  }

  return value;
}

export function getKeyValues(obj: object | any[], key: string, valueType?: ValueType): any[] {
  const values: any[] = [];
  const visited = new Set();

  const traverse = (object: any) => {
    if (visited.has(object)) return;
    visited.add(object);

    Object.keys(object ?? {}).forEach((prop) => {
      if (object.hasOwnProperty(prop)) {
        const value = object[prop];

        if (prop === key) {
          if (!valueType) values.push(value);
          else if (valueType === 'array' && Array.isArray(value)) values.push(value);
          else if (typeof value === valueType) value.push(value);
        }
        //
        else if (typeof value === 'object') traverse(value);
      }
    });
  };

  traverse(obj);
  return values;
}

export function getFirstKeyValue(obj: object, key: string, valueType?: ValueType) {
  let value: any = undefined;
  const visited = new Set();

  const traverse = (object: any) => {
    if (visited.has(object)) return;
    visited.add(object);

    Object.keys(object ?? {}).forEach((prop) => {
      const v = object[prop];
      if (!object.hasOwnProperty(prop) || typeof value !== 'undefined') return;

      if (prop === key) {
        if (!valueType) value = v;
        else if (valueType === 'array' && Array.isArray(value)) value = v;
        else if (typeof v === valueType) value = v;
      }
      ///
      else if (typeof v === 'object') traverse(v);
    });
  };

  traverse(obj);
  return value;
}

export function objectFromKeys(obj: Obj, keys: string[]) {
  return keys.reduce((a, b) => ({ ...a, [b]: getFirstKeyValue(obj, b) }), {});
}

export function getPathsToObservables(obj: any): string[] {
  const matchingPaths: string[] = [];
  const stack: [any, string][] = [[obj, '']];
  const visited = new Set();

  while (stack.length > 0) {
    const [currentObj, currPath] = stack.pop()!;
    if (visited.has(currentObj)) continue; // Avoid revisiting the same object
    visited.add(currentObj);

    if (typeof currentObj === 'object') {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          const newPath = currPath.length ? `${currPath}.${key}` : key;
          const value = currentObj[key];
          if (isObservable(value)) matchingPaths.push(newPath);
          stack.push([value, newPath]);
        }
      }
    }
  }
  return matchingPaths;
}

export function getPathToValue(obj: Obj, value: any): string | undefined {
  const stack: [any, string][] = [[obj, '']];
  const visited = new Set();

  while (stack.length > 0) {
    const [currentObj, currPath] = stack.pop()!;
    if (visited.has(currentObj)) continue; // Avoid revisiting the same object
    visited.add(currentObj);

    if (typeof currentObj === 'object') {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          const newPath = currPath.length ? `${currPath}.${key}` : key;
          const value_ = currentObj[key];
          if (typeof value_ === 'object' && isSubset(value_, value)) return newPath;
          else if (value_ === value) return newPath;
          stack.push([value_, newPath]);
        }
      }
    }
  }
  return undefined;
}

export function getPathsToValue(obj: Obj, value: any): string[] {
  const matchingPaths: string[] = [];
  const stack: [any, string][] = [[obj, '']];
  const visited = new Set();

  while (stack.length > 0) {
    const [currentObj, currPath] = stack.pop()!;
    if (visited.has(currentObj)) continue; // Avoid revisiting the same object
    visited.add(currentObj);

    if (typeof currentObj === 'object') {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          const newPath = currPath.length ? `${currPath}.${key}` : key;
          const value_ = currentObj[key];
          if (typeof value_ === 'object' && isSubset(value_, value)) matchingPaths.push(newPath);
          else if (value_ === value) matchingPaths.push(newPath);
          stack.push([value_, newPath]);
        }
      }
    }
  }
  return matchingPaths;
}

export function getPathToObject(
  obj: any,
  vOjb: Record<string, any>,
  exact = true,
): string | undefined {
  const stack: [any, string][] = [[obj, '']];
  const visited = new Set();

  while (stack.length > 0) {
    const [currentObj, currPath] = stack.pop()!;
    if (visited.has(currentObj)) continue; // Avoid revisiting the same object
    visited.add(currentObj);

    if (typeof currentObj === 'object') {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          const newPath = currPath.length ? `${currPath}.${key}` : key;
          const value = currentObj[key];
          if (typeof value === 'object' && isSubset(value, vOjb, exact)) return newPath;
          stack.push([value, newPath]);
        }
      }
    }
  }
  return undefined;
}

export function isSubset(superset: Obj, subset: Obj, exact = true) {
  if (!superset || !subset) return false;

  for (const key in subset) {
    if (superset?.hasOwnProperty(key)) {
      if (exact && subset[key] !== superset[key]) return false;

      if (!exact && typeof subset[key] === 'string' && !superset[key]?.includes(subset[key])) {
        return false;
      }
    } else return false;
  }
  return true;
}

// get unchanged fields in object list and the objects that are changed
export function splitFields(objects: Obj[]): { changed: Obj[]; unchanged: Obj } {
  // Check if the list is empty or has only one object
  if (objects.length < 2) return { changed: objects, unchanged: {} };

  // Get the first object to use as a reference for comparison
  const referenceObject = objects[0];

  // Create arrays to store the changed and unchanged objects
  const changedObjects: any[] = [];
  const unchangedFields: Obj = {};

  // Iterate through each object in the list
  for (const obj of objects) {
    const modifiedObject: Obj = {};

    // Compare each field with the reference object
    for (const key in obj) {
      if (obj[key] !== referenceObject[key]) modifiedObject[key] = obj[key];
      else unchangedFields[key] = obj[key];
    }

    // Add the modified object to the changedObjects array
    changedObjects.push(modifiedObject);
  }

  return { changed: changedObjects, unchanged: unchangedFields };
}

export function withCloserValue(items: Obj[], key: string, value: number) {
  const closestItem = items.reduce((closest, current) => {
    const closestDiff = Math.abs(closest?.[key] - value);
    const currentDiff = Math.abs(current?.[key] - value);
    return currentDiff < closestDiff ? current : closest;
  });

  return closestItem;
}

export function getFirstPresentKeyValue(object: object, keys: string[]): any {
  let value = undefined;
  keys.forEach((key) => !!(object as any)[key] && (value = (object as any)[key]));
  return value;
}

export function getFirstPresentKey(object: object, keys: string[]): any {
  let key = undefined;
  if (!object) return key;
  keys.forEach((key_) => !!(object as any)?.[key_] && (key = key_));
  return key;
}

export function getPathsToObject(obj: any, vOjb: Record<string, any>): string[] {
  const matchingPaths: string[] = [];
  const stack: [any, string][] = [[obj, '']];
  const visited = new Set();

  while (stack.length > 0) {
    const [currentObj, currPath] = stack.pop()!;
    if (visited.has(currentObj)) continue; // Avoid revisiting the same object
    visited.add(currentObj);

    if (typeof currentObj === 'object') {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          const newPath = currPath.length ? `${currPath}.${key}` : key;
          const value = currentObj[key];
          if (typeof value === 'object' && isSubset(value, vOjb)) matchingPaths.push(newPath);
          stack.push([value, newPath]);
        }
      }
    }
  }
  return matchingPaths;
}

export function cloneDeep<T>(value: T, seen = new WeakMap()): T {
  // Handle primitives and null/undefined
  if (value === null || value === undefined) return value;
  if (typeof value === 'function') return value;
  if (typeof value !== 'object') return value; // string, number, boolean

  // Check for circular reference
  if (seen.has(value as any)) return seen.get(value as any);

  // Handle Date
  if (value instanceof Date) return new Date(value.getTime()) as T;

  // Handle RegExp
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as T;

  // Handle Map
  if (value instanceof Map) {
    const clonedMap = new Map();
    seen.set(value as any, clonedMap as any);
    value.forEach((val, key) => clonedMap.set(cloneDeep(key, seen), cloneDeep(val, seen)));
    return clonedMap as T;
  }

  // Handle Set
  if (value instanceof Set) {
    const clonedSet = new Set();
    seen.set(value as any, clonedSet as any);
    value.forEach((val) => clonedSet.add(cloneDeep(val, seen)));
    return clonedSet as T;
  }

  // Handle Array
  if (Array.isArray(value)) {
    const clonedArray: any[] = [];
    seen.set(value as any, clonedArray as any);
    value.forEach((item) => clonedArray.push(cloneDeep(item, seen)));
    return clonedArray as T;
  }

  // Handle Object
  const clonedObj: any = {};
  seen.set(value as any, clonedObj);

  // Clone all enumerable properties
  Object.keys(value).forEach((key) => {
    const prop = (value as any)[key];
    // Functions are copied by reference
    if (typeof prop === 'function') clonedObj[key] = prop;
    else clonedObj[key] = cloneDeep(prop, seen);
  });

  // Preserve prototype chain
  Object.setPrototypeOf(clonedObj, Object.getPrototypeOf(value));

  return clonedObj as T;
}

export function toJson<T = any>(input: any, seen = new WeakSet()): T {
  // primitives
  if (
    input === null ||
    typeof input === 'string' ||
    typeof input === 'number' ||
    typeof input === 'boolean'
  ) {
    return input;
  }

  // BigInt → string
  if (typeof input === 'bigint') return input.toString() as any;
  // Date → ISO string
  if (input instanceof Date) return input.toISOString() as any;

  // Map → object
  if (input instanceof Map) {
    return Object.fromEntries(
      Array.from(input.entries()).map(([k, v]) => [k, toJson(v, seen)]),
    ) as any;
  }

  // Set → array
  if (input instanceof Set) return Array.from(input).map((v) => toJson(v, seen)) as any;
  // Functions / symbols → drop
  if (typeof input === 'function' || typeof input === 'symbol') return undefined as any;

  if (typeof input === 'object') {
    if (seen.has(input)) return '[Circular]' as any;
    seen.add(input);
  }

  // Arrays
  if (Array.isArray(input)) {
    return input.map((v) => toJson(v, seen)).filter((v) => v !== undefined) as any;
  }

  // Plain objects / class instances
  if (typeof input === 'object') {
    const result: any = {};

    for (const [key, value] of Object.entries(input)) {
      const safeValue = toJson(value, seen);
      if (safeValue !== undefined) result[key] = safeValue;
    }

    return result;
  }

  return undefined as any;
}

export function filterObject<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null),
  );
}

export function isEmptyObject(obj: Record<string, any>) {
  return Object.keys(obj).length === 0;
}
