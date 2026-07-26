import {
  ATTACHMENT_KEYS,
  COMMENT_KEYS,
  COMPOUND_NAMED_KEYS,
  FIELD_PROPS,
  GROUP_PROPS,
  NAME_KEYS,
  PERCENTAGE_KEYS,
  SENSITIVE_KEYS,
  SUFFIX_PIPE_MAP,
  UNDEFINED_VALUES,
  USE_TABLE_THRES,
} from './field.constants';
import {
  objectHasKeys,
  camelToSpaced,
  isValue,
  isEmpty,
  isObject,
  stringAfter,
  capFirstChar,
} from '../util.helpers';
import { Obj } from '../util.interface';
import { getBase64Object, isValidBase64 } from '../base-64/base-64.helpers';
import {
  CompoundParameter,
  DetailGroup,
  Field,
  FieldGroup,
  FieldsGroupsMap,
  FieldsSort,
  FieldsSpecs,
  FieldType,
  KeyField,
  ModifierProps,
} from './field.interface';
import { formatDate } from '@angular/common';
import { mergeClasses } from '../class-name/class-name.helpers';
import { mergeUnique } from '@shared/components/data-grid/data-grid.helpers';
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { deepClone } from '@core/helpers';
import { fileExtensionAttributeMap } from '@shared/components/generic-form/attachment/attachment.interface';

export function getNameField(object: Obj): Field {
  // Check for null and object type properly
  if (!object || typeof object !== 'object') {
    return { key: '', value: object, label: 'item' };
  }

  // Check if can be compounded
  let cmp: CompoundParameter | null | any = null;

  const setCompound = (c: any) => {
    if (objectHasKeys(object, c.keys, false)) {
      cmp = { ...c, object };
      return true;
    }
    return false;
  };

  //  Break early when compound is found
  for (const c of COMPOUND_NAMED_KEYS) if (setCompound(c)) break;

  // Fix 3: Check if comp is not null (not just truthy)
  if (cmp !== null) return { key: '', value: cmp.mapper ? cmp.mapper(cmp) : combineValues(cmp) };

  const endsWith = ['Id', 'Uid'];

  // Priority as in NAME_KEYS
  const nameFieldFromFields = (fields: Field[]): Field | undefined => {
    const fs = fields.filter((f) => !endsWith.some((s) => f.key?.endsWith(s)));
    let field: Field | undefined = undefined;
    const n = NAME_KEYS;

    // Exact match
    for (const k of n) {
      field = fs?.find((f) => f.key === k);
      if (field) return field;
    }

    // Ends with match
    for (const k of n) {
      field = fs.find((f) => f.key?.toLowerCase()?.endsWith(k.toLowerCase()));
      if (field) return field;
    }

    // Includes match
    for (const k of n) {
      field = fs.find((f) => f.key?.toLowerCase()?.includes(k.toLowerCase()));
      if (field) return field;
    }

    return field;
  };

  const fields = Object.entries(object)
    .filter(([key]) => !SENSITIVE_KEYS.includes(key) && !endsWith.some((s) => key.endsWith(s)))
    .map(([key, value]) => ({ key, value, label: camelToSpaced(key) }));

  let field: Field | undefined = nameFieldFromFields(fields);

  //  Find first value field only if no name field found
  if (!field) field = fields.find((f) => isValue(f.value));

  //  Recursively handle nested objects/arrays
  if (field && isObject(field.value)) {
    const nestedField = getNameField(field.value);
    // Preserve the parent key information
    return { ...nestedField, key: field.key };
  } else if (field && Array.isArray(field.value) && field.value.length > 0) {
    const nestedField = getNameField(field.value[0]);
    return { ...nestedField, key: field.key };
  }

  // Return field with proper fallback
  if (!field) field = { label: 'item', key: 'item', value: undefined };

  return field;
}

export function combineValues(x: CompoundParameter) {
  let value = '';

  x?.keys?.forEach((key) => {
    const v = x?.object?.[key];
    const sep = () => `${value ?? ''}${value ? x?.separator : ''}`;
    if (v) value = `${sep()} ${(isObject(v) ? getNameField(v)?.value : v) ?? ''}`;
  });

  return value;
}

export function splitFieldString(input: string) {
  if (!input || !input.includes(',')) return [input?.trim()].filter(Boolean); // Handle no commas

  // Find the start of modifiers (first occurrence of "word(")
  const modifierStart = input.search(/\b\w+\(/);

  if (modifierStart === -1) {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean); // No modifiers
  }

  // Split into fields and modifiers
  const fieldsPart = input.slice(0, modifierStart).trim();
  const modifiers = input.slice(modifierStart).trim();

  return fieldsPart
    .split(',')
    .map((field) => field.trim())
    .filter((field) => field)
    .map((field) => `${field} ${modifiers}`); // Add space before modifiers
}

export function sortFieldsByKeys(fields: Field[], fieldsStrings: string[]) {
  const topKeys = getKeysOnly(fieldsStrings);
  const top = topKeys.map((key: string) => fields.find((f) => f.key?.includes(key)));
  const notTop = fields.filter((f) => !topKeys.includes((f.key as any)));
  return top.filter((f) => !!f).concat(notTop);
}

export function getKeysOnly(keyStrings: string[] | string): string[] {
  if (!Array.isArray(keyStrings)) keyStrings = [keyStrings];
  return keyStrings.map((k) => keysFromFieldString(k)).reduce((a, b) => a.concat(b), []);
}

export function keyFromFieldString(s: string): string {
  let key = s;
  if (!s) return s;
  return (key = s.split(' ')[0]);
}

export function keysFromFieldString(s: string): string[] {
  let keys = [];
  if (!s) return [];
  if (s.includes(',')) keys = s.split(',').map((k) => k.trim().split(' ')[0]);
  else keys = [s.split(' ')[0]];
  return keys;
}

// ('defn innerKeys(name {name, uid}, uid, rrrTypeDetails innerKeys(name, uid))');
// ('denf.name.name');

export function innerKeysFromFieldString(s: string) {
  if (!s) return [];

  let fieldStrings =
    inParensAfter(s, 'innerKeys')
      ?.split(',')
      .filter((x) => !!x?.trim()) ?? [];

  if (s.split(' ')[0].includes('.')) fieldStrings = [(stringAfter(s, '.') as any)];

  if (!s.includes('{') || !s.includes('}')) return fieldStrings;

  s.substring(s.indexOf('{') + 1, s.lastIndexOf('}'))
    .trim()
    .split(',')
    .forEach((x) => fieldStrings.push(x.trim()));

  return fieldStrings;
}

export function getFields(obj: Obj, hiddenKeys?: string[], types?: FieldType[]): Field[] {
  if (typeof obj !== 'object' || !obj) return [];

  let fields: Field[] = Object.keys(obj)
    .filter((key) => !hiddenKeys?.includes(key))
    .map((key) => ({ key, value: obj[key], label: camelToSpaced(key) }))
    .map((field: Field) => {
      let type: FieldType = typeof field.value;
      if (Array.isArray(field.value) && typeof field.value?.[0] === 'object') type = 'objectArray';
      field.type = type;
      return field;
    });

  if (types) fields = fields.filter((f) => f.type && types.includes(f.type));
  return fields;
}

export function inParensAfter(str: string, searchString: string): string | undefined {
  if (typeof str !== 'string') return undefined;

  const startIndex = str.indexOf(searchString);
  if (startIndex === -1) return undefined;

  const openIndex = str.indexOf('(', startIndex);
  if (openIndex === -1) return undefined;

  let depth = 0;
  for (let i = openIndex + 1; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    else if (char === ')') {
      if (depth === 0) return str.slice(openIndex + 1, i).trim();
      else depth--;
    }
  }

  return undefined; // no matching closing parenthesis found
}

export function nameFromFieldString(str: string, lastDotAsName = false): string {
  if (typeof str !== 'string') return str;

  str = str.split('innerKeys')[0];
  const asIndex = str.indexOf(' as ');

  // -----------------------------
  // NO "as"
  // -----------------------------
  if (asIndex === -1) {
    let base = str.split(' ')[0]?.trim();

    if (base.includes('.')) {
      if (lastDotAsName) base = base.split('.').pop() ?? base;
      else base = readDotProperty(base);
    }

    return capFirstChar(camelToSpaced(base));
  }

  // -----------------------------
  // HAS "as"
  // -----------------------------
  let label = str.slice(asIndex + 4).trim();
  // Remove only "word(" patterns (NO SPACE)
  label = label.replace(/\b\w+\(.+$/, '').trim();
  return label;
}

export function nameFromFieldString_(str: string, lastDotAsName = false): string {
  // Find the index of "as" followed by a space
  if (typeof str !== 'string') return str;
  str = str?.split('innerKeys')?.[0];

  const asIndex = str.indexOf(' as ');

  if (asIndex === -1) {
    let str_: string = str.split(' ')[0]?.trim();
    if (str_.includes('.')) {
      if (lastDotAsName) return str.split('.').pop()?.split(' ')[0] ?? '';
      str_ = readDotProperty(str_);
    }
    return capFirstChar(camelToSpaced(str_?.trim()));
  }

  let end = -1;

  if (asIndex !== -1) {
    // find the index of the first space follwed by "(" after the appearace of " as "
    const sub = str.substring(asIndex + 4); // text after " as "
    const matchIndex = sub.search(/\w+\s?\(/); // find first word + "("
    end = matchIndex === -1 ? -1 : asIndex + 4 + matchIndex;
  } else end = str.search(/\w+\s?\(/); // fallback if " as " not found

  // let end = str.search(/\w+\s?\(/);// Find the index of the first space followed by "("

  if (end === -1) return str.split(' as ')[1]?.trim();
  return str.slice(asIndex + 3, end)?.trim(); // Extract the substring between start and end
}

export function nameFieldString(str: string) {
  if (typeof str !== 'string') return str;

  // Find the index of the first space followed by "("
  const end = str.search(/\w+\s?\(/);
  if (end === -1) return str;
  // Extract the substring between start and end
  return str.slice(0, end)?.trim();
}

export function readDotProperty(string: string) {
  return string; // TODO: implement read dot prop
}

export function getPathValue(obj: any, path: string) {
  if (!path?.trim()) return obj;
  const normalized = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
  return normalized.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function getFieldType(f: Field): FieldType {
  // | 'number'
  // | 'string'
  // | 'object'
  // | 'boolean'
  // | 'function'
  // | 'undefined'
  // //
  // | 'pdf'
  // | 'image'
  // | 'base64'
  // | 'comment'
  // | 'percentage'
  // | 'attachment'
  // //
  // | 'array'
  // | 'stringArray'
  // | 'objectArray'
  // | 'numberArray'
  // | 'booleanArray'
  // | 'hexColorCode'
  // | 'commentArray'
  // | 'attachmentArray';

  if (!isValue(f.value) || f.value === null || f.value === undefined) return 'undefined';

  const isArray = Array.isArray(f.value);
  const isCommentKey = (key: string) => COMMENT_KEYS.find((c) => key.includes(c));
  const isAttachmentKey = (key: string) => ATTACHMENT_KEYS.find((c) => key.includes(c));
  const isNumber = typeof f.value === 'number';
  const isHex = (value: any) => /^#([0-9a-fA-F]{3}){1,2}$/.test(value);
  const isString = (value: any) => typeof value === 'string';
  const isNumber_ = (value: any) => typeof value === 'string';

  const fVal = f?.value?.[0];

  const extensions = Object.keys(fileExtensionAttributeMap);

  if (isArray && Object.keys(fVal ?? {}).some((k) => isCommentKey(k))) return 'commentArray';
  if (isArray && Object.keys(fVal ?? {}).some((k) => isAttachmentKey(k))) return 'attachmentArray';
  if (isArray && isObject(fVal)) return 'objectArray';
  if (isArray && isString(fVal)) return 'stringArray';
  if (isArray && isNumber_(fVal)) return 'numberArray';

  if (isAttachmentKey(f.key)) return 'attachment';
  if (isString(f.value) && extensions.find((e) => f.value.includes(e))) return 'attachment';
  if (isObject(f.value) && Object.keys(f.value).some((k) => isCommentKey(k))) return 'comment';
  if (PERCENTAGE_KEYS.find((c) => f.key.includes(c)) && isNumber) return 'percentage';
  if (isString(f.value) && isHex(f.value)) return 'hexColorCode';
  if (isObject(f.value)) return 'object';

  const validBase64 = isValidBase64(f.value);
  const bObj = validBase64 ? getBase64Object(f.value) : undefined;

  if (validBase64 && bObj?.extension !== 'pdf') return 'image';
  if (validBase64 && bObj?.extension === 'pdf') return 'pdf';
  return Array.isArray(f.value) ? 'array' : typeof f.value as any;
}

export function stringIncludesBoth(str: string, strs: string[]) {
  return strs.every((s) => str.includes(s));
}

export function stringBetween(str: string, char: string, char2?: string): string {
  str = str?.toString();
  if (!str?.includes(char)) return '';

  const startIndex = str?.indexOf(char);
  let lastIndex = char2 ? str?.indexOf(char2, startIndex + char.length) : str?.lastIndexOf(char);

  if (char && lastIndex === -1) return str?.substring(startIndex + char.length);
  if (startIndex == lastIndex) return '';

  const specials = ['()', '{}', '[]', '<>', '--', '**', '!!', '__', '++'];
  const specials_ = specials.map((e) => e?.[0]);

  if (specials_.includes(char)) {
    lastIndex = str.lastIndexOf((specials?.find((e) => e.includes(char[0]))?.[1] as any));
  }

  return str?.substring(startIndex + char.length, lastIndex);
}

export function separateThousands(n: number, separator = ',') {
  return n.toString().replace(/\B(?=(\d3)+(?!\d))/g, separator);
}

export function formatDate_(value: string | undefined | any, format = 'yyyy-MM-dd') {
  if (value != undefined) return formatDate(value, format, 'en-GB');
  return value;
}

export function propsFromString(
  str: string,
  fieldsProps: string[] = FIELD_PROPS,
  modifierProps?: ModifierProps,
): Obj {
  if (!str) return {};
  const props: Obj = {};

  if (modifierProps?.key) props[modifierProps.key] = keyFromFieldString(str);

  if (modifierProps?.label) {
    props[modifierProps.label] = nameFromFieldString(str, modifierProps?.lastDotAsName);
  }

  fieldsProps.forEach((propDef) => {
    const prop = propDef.split(' ')[0]?.trim();
    if (!prop) return;

    let searchIndex = 0;

    while (searchIndex < str.length) {
      // Look for both patterns: "prop(" and "prop ("
      const modIndexA = str.indexOf(`${prop}(`, searchIndex);
      const modIndexB = str.indexOf(`${prop} (`, searchIndex); //

      // Find the earliest valid occurrence
      let modIndex = -1;
      if (modIndexA !== -1 && modIndexB !== -1) modIndex = Math.min(modIndexA, modIndexB);
      else if (modIndexA !== -1) modIndex = modIndexA;
      else if (modIndexB !== -1) modIndex = modIndexB;

      if (modIndex === -1) break; // No more occurrences found

      // Check if we're inside nested parentheses
      const before = str.substring(0, modIndex);
      const openParenCount = (before.match(/\(/g) || []).length;
      const closeParenCount = (before.match(/\)/g) || []).length;
      const isNestedMod = openParenCount > closeParenCount;

      if (isNestedMod) {
        searchIndex = modIndex + prop.length + 1;
        continue;
      }

      // Extract the value after this property
      const value = inParensAfter(str.substring(modIndex), prop);

      if (value === undefined) {
        searchIndex = modIndex + prop.length + 1;
        continue;
      }

      // Parse the value based on type
      const typeMatch = propDef.match(/type\(([^)]+)\)/);
      const type = typeMatch?.[1]?.trim();

      let parsedValue: any = value;

      if (type === 'boolean') parsedValue = /^true$/i.test(value);
      //
      else if (type === 'number') {
        parsedValue = Number(value);
        if (isNaN(parsedValue)) parsedValue = value; // fallback to string if invalid number
      }
      //
      else if (type === 'numberArray') {
        parsedValue = value.split(',').map((v: string) => {
          const num = Number(v.trim());
          return isNaN(num) ? v.trim() : num; // fallback to string for invalid numbers
        });
      }
      //
      else if (['stringArray', 'array'].includes((type as any))) {
        parsedValue = value.split(',').map((v: string) => v.trim());
      }

      // Handle mergeWith functionality
      const mergeWithMatch = str.match(/mergeWith\(([^)]+)\)/);
      const mergeWith = mergeWithMatch?.[1]?.trim();

      if (mergeWith && typeof parsedValue === 'string') {
        parsedValue = mergeClasses(parsedValue, modifierProps?.defaults?.[mergeWith] ?? '');
      }

      props[prop] = parsedValue;

      // Move search index past current match
      searchIndex = modIndex + prop.length + value.length + 3; // +3 for "()" and space
    }
  });

  // account for nested children
  if (modifierProps?.childrenKey && str.includes(modifierProps?.childrenKey)) {
    const temp = props[modifierProps?.childrenKey];
    const children_: string[] = Array.isArray(temp) ? temp : [];
    let children = children_.map((s) => propsFromString(s, fieldsProps, modifierProps));

    if (modifierProps?.inherit) {
      const propsToInherit = { ...props };
      delete propsToInherit[modifierProps?.childrenKey];
      children = children.map((c) => ({ ...deepClone(propsToInherit), ...c }));
    }

    props[modifierProps?.childrenKey] = children;
  }

  return props;
}
export const isEither = (value: any, values: any[] | string): boolean => {
  if (!Array.isArray(values)) values = [values];
  return values.findIndex((v) => v === value) > -1;
};

export const endsWithEither = (value: string, values: any[] | string): boolean => {
  if (!Array.isArray(values)) values = [values];
  return !!values.find((v) => value.endsWith(v));
};

export function mergeFieldStrings(fieldStrings: string[]): string[] {
  const mergedMap = new Map<string, string>();

  fieldStrings.forEach((fs) => {
    const key = keyFromFieldString(fs);
    const existingValue = mergedMap.get(key);

    if (existingValue) {
      // Extract modifiers from both field strings
      const existingModifiers = existingValue.replace(key, '').trim();
      const newModifiers = fs.replace(key, '').trim();

      //TODO: separate modifiers

      // Combine modifiers, removing duplicates
      const items = [...existingModifiers.split(/\s+/), ...newModifiers.split(/\s+/)].filter(Boolean);
      const allModifiers = [...new Set(items)].join(' ');

      mergedMap.set(key, `${key} ${allModifiers}`.trim());
    } else mergedMap.set(key, fs);
  });

  // Convert map values to array
  return Array.from(mergedMap.values());
}

export function expandKeyFields(keyFields: KeyField[]) {
  const isString = (k: any) => typeof k === 'string';
  return keyFields?.reduce((p: KeyField[], k: KeyField) => {
    const e = isString(k) ? [k] : k.siblings ? k.siblings.map((s) => ({ ...k, key: s })) : [k];
    return p.concat(e);
  }, []);
}

export function parseFieldsSpecs(specs: FieldsSpecs = {}) {
  // expand siblings //merge visibible keys
  specs.keyFields = expandKeyFields(specs.keyFields ?? []);

  const visibleKeys_ = specs.keyFields?.map((k) => {
    let key: string;
    const props = specs.fieldsProperties;

    if (typeof k !== 'string') {
      key = k.key.split(' ')[0];
      specs.fieldsProperties = { ...props, [key]: { ...props?.[key], ...k } };
    } else key = k;

    return key;
  });

  //consolidate visible keys
  specs.visibleKeys = [...new Set((specs.visibleKeys ?? []).concat(visibleKeys_ ?? []))];

  // merge fields strings
  const isString = (k: any) => typeof k === 'string';

  const groupsKeyFields = [
    ...keyFieldsFromMap(specs.fieldGroupsMap ?? {}),
    ...keyFieldsFromDetail(specs.detailsGroups ?? []),
  ];

  // add fields props from groups keyFields
  groupsKeyFields.forEach((keyFields) => {
    expandKeyFields(keyFields).forEach((k) => {
      if (isString(k)) return;
      const key = k.key.split(' ')[0];
      const props = specs.fieldsProperties;
      specs.fieldsProperties = { ...props, [key]: { ...props?.[key], ...k } };
    });
  });

  const getFString = (k: KeyField) => (isString(k) ? k : (k.fieldString ?? k.key ?? ''));

  //consolidate all fieldstrings
  const ss: string[] = (specs?.fieldsStrings ?? [])
    .concat(specs?.keyFields?.map((k) => getFString(k)) ?? [])
    .concat(specs?.visibleKeys ?? [])
    .concat(specs?.sortedKeys ?? [])
    .concat(groupsKeyFields.reduce((p: string[], c) => p.concat(c.map((k) => getFString(k))), []));

  const splitedStrings = ss.map((s) => splitFieldString(s)).reduce((a, b) => a.concat(b), []);
  const fieldsStrings = mergeFieldStrings(splitedStrings);
  specs.fieldsStrings = fieldsStrings;

  return specs;
}

export function getAllFields(obj: any, specs: FieldsSpecs = {}, path = ''): Field[] {
  if (!Object.keys(obj ?? {}).length) return [];

  //parse spes / visibles keys / fieldsprops / fieldsstrings
  specs = parseFieldsSpecs(specs);

  // set paths from visible or use all object's keys
  const paths = specs.visibleKeys?.length ? specs.visibleKeys : (Object.keys(obj ?? {}) ?? []);
  const keyPaths = paths.map((p) => p.split(' ')[0]);

  let allFields: Field[] = [];

  while (keyPaths.length) {
    const keyPath: string = keyPaths.shift() as any;
    const value = getPathValue(obj, keyPath);
    const type: FieldType = getFieldType({ key: keyPath, value });

    const fullPath = path ? `${path}.${keyPath}` : keyPath;
    const endsWithSensitive = SENSITIVE_KEYS.map((k) => capFirstChar(k));
    const fieldsStrings = specs.fieldsStrings ?? [];
    const value_ = specs.undefinedValue && !isValue(value) ? specs.undefinedValue : value;

    // set up base Field
    const baseField: Field = { type, key: keyPath, path: fullPath, value: value_ };
    // set auto icon on attachment fields
    if (['attachment'].includes(type)) baseField.labelIcon = getAttachmentIcon(baseField);

    const undefinedHide = specs.hideUndefined && !isValue(value);
    const hiddenHide = !!specs?.hiddenKeys?.length && isEither(fullPath, specs.hiddenKeys);

    const p = fullPath;
    const x = keyPath;
    const ss = fieldsStrings;

    const k_ = (s: string) => s.split(' ')[0];
    const fs =
      ss?.find((s) => k_(s) === p || k_(s) === x || p.endsWith(`.${k_(s)}`)) ?? keyPath ?? '';
    const fieldString = fs;

    let field: Field = {
      sensitive: isEither(keyPath, SENSITIVE_KEYS) || endsWithEither(keyPath, endsWithSensitive),
      hidden: hiddenHide || undefinedHide,
      label: nameFromFieldString(fieldString),
      fieldString,
      showColon: true,
      showLabel: true,
      showUnderline: true,

      ...baseField,
      ...propsFromString(fieldString, FIELD_PROPS, specs?.defaults),
      ...specs.fieldsProperties?.[fullPath],
    };

    // set autopipe
    if (!field.pipe && specs.autoPipeValues) {
      const key = Object.keys(SUFFIX_PIPE_MAP).find((k: string) => field.key?.endsWith(k));
      if (key) field.pipe = SUFFIX_PIPE_MAP[key];
    }

    const hasObjectItem = () => typeof value?.[0] === 'object';
    const hasNestedFields = (type?.includes('Array') && hasObjectItem()) || type?.includes('object');
    if (hasNestedFields) field = attachNestedFields(field, specs);
    allFields.push(field);
  }

  // sort by sortedkeys order
  if (specs.sortedKeys?.length) {
    const inSorted = (f: Field) => (specs.sortedKeys?.find((s) => f.key.includes(s)) ? 1 : 0);
    allFields = [...allFields].sort((a, b) => inSorted(b) - inSorted(a));
  }

  if (specs.sortby) sortFields(allFields, specs.sortby);

  return allFields;
}

export function getAttachmentIcon(field: Field) {
  const value = field.value;
  let icon = undefined;

  const isStr = (v: any) => typeof v === 'string';

  const map = { '.pdf': 'pdf', '.doc': 'word', '.xls': 'excel' };
  const entries = Object.entries(map);
  if (isStr(value)) entries.forEach(([k, val]) => value.includes(k) && (icon = val));

  if (Array.isArray(value) && !!value[0]) {
    const vals = Object.values(value[0]);
    entries.forEach(([k, val]) => !!vals.find((v) => isStr(v) && v.includes(k)) && (icon = val));
  }

  return icon;
}

export function attachNestedFields(field: Field, specs: FieldsSpecs): Field {
  const value = field.value;
  const hasObjectItem = () => typeof value?.[0] === 'object';

  // use field 's data for inner childrens specs
  const fieldSpecs: FieldsSpecs = {
    ...specs,
    visibleKeys: field.visibleKeys ?? [],
    keyFields: field.keyFields ?? [],
    sortedKeys: field.sortedKeys ?? specs.sortedKeys ?? [],
    fieldGroupsMap: undefined,
    detailsGroups: undefined,
  };

  //handle objects // arrays
  //TODO: try to avoid max-stack for object  and array on large hightly nested objects
  if (isObject(value)) {
    const nameField = getNameField(field.value);
    const fields = getAllFields(value, fieldSpecs, field.path);
    field = { ...field, nameField, isObject: true, fields };
  }

  // object array value // items list are fieldgroups
  else if (field.type?.includes('Array') && hasObjectItem()) {
    const fieldGroups: FieldGroup[] = [];

    for (let index = 0; index < field.value.length; index++) {
      const nameField = getNameField(field.value[index]);
      let fields = getAllFields(field.value[index], fieldSpecs, `${field.path}[${index}]`);
      // remove namefield from fields
      fields = fields.filter((f) => f.key !== nameField.key);
      fieldGroups.push({ label: nameField?.value, fields });
    }

    const useTable = value?.length >= (specs?.useTableThres ?? USE_TABLE_THRES);
    field = { ...field, useTable, fieldGroups };
  }

  return field;
}

export function sortFields(fields: Field[], sortby: FieldsSort | FieldsSort[]) {
  if (!Array.isArray(sortby)) sortby = sortby ? [sortby] : [];

  sortby.forEach((s) => {
    const u = UNDEFINED_VALUES;
    const stringFromField = (f: Field) => f?.[s.sortby]?.toString();
    const compare = (a: Field, b: Field) => stringFromField(a)?.localeCompare(stringFromField(b));
    const has = (a: Field, b: Field) => (u.includes(a.value) as any) - (u.includes(b.value) as any);

    fields.sort((a: Field, b: Field) => (s.sortby === 'value' ? has(a, b) : compare(a, b)));
    if (s.direction == 'DESC') fields.reverse();
  });
}

export function key(fieldString: string) {
  if (!fieldString) return;
  return fieldString.split(' ')?.[0] ?? fieldString;
}

export function keys(items: string[] | any[]) {
  let keys = [];
  if (typeof items[0] === 'string') keys = items.map((s) => s.split(' ')?.[0]?.trim() ?? s);
  else if (items[0]?.hasOwnProperty('key')) {
    keys = items.map((s) => s.key.split(' ')?.[0]?.trim() ?? s);
  }
  return keys;
}

export function flattenFields(fields: Field[]): Field[] {
  return fields.reduce((p, field) => {
    p.push(field);
    if (field.fields && Array.isArray(field.fields)) p.push(...flattenFields(field.fields));
    return p;
  }, [] as Field[]);
}

export function keyFieldsFromMap(map: FieldsGroupsMap): KeyField[][] {
  let result: KeyField[][] = [];

  // Iterate through every value in the current object level
  for (const value of Object.values(map)) {
    // Base case: It's a KeyField[], add it to our collection
    if (Array.isArray(value)) result.push(value);
    // Recursive case: It's another FieldsGroupsMap, dig deeper
    else result = result.concat(keyFieldsFromMap(value));
  }

  return result;
}

export function keyFieldsFromDetail(groups: DetailGroup[]): KeyField[][] {
  let result: KeyField[][] = [];

  for (const group of groups) {
    // If this group has fields directly, add them
    if (group.fields && group.fields.length > 0) result.push(group.fields);

    // If this group has nested groups, process them
    if (group.groups) {
      // Case 1: groups is a FieldsGroupsMap
      if (!Array.isArray(group.groups)) result = result.concat(keyFieldsFromMap(group.groups));
      // Case 2: groups is an array of DetailGroup[]
      else result = result.concat(keyFieldsFromDetail(group.groups));
    }
  }

  return result;
}

export function getGroupsFromMap(fieldsGroupsMap: FieldsGroupsMap): FieldGroup[] {
  if (!fieldsGroupsMap) return [];

  const groups: FieldGroup[] = Object.entries(fieldsGroupsMap).map(([key, value]) => {
    const label = camelToSpaced(key);
    let group: FieldGroup = { label, ...propsFromString(key, GROUP_PROPS) };

    if (Array.isArray(value)) {
      const values: KeyField[] = expandKeyFields(value ?? []);
      const fieldsStrings = values.map((k) => (typeof k === 'object' ? k.key : k));
      const keys = fieldsStrings.map((s) => s?.split(' ')?.[0]);
      group = { ...group, keys, fieldsStrings };
    } else group = { ...group, groups: getGroupsFromMap(value) };

    return group;
  });

  return groups;
}

export function getGroupsFromDetailsGroups(detailsGroups: DetailGroup[]): FieldGroup[] {
  if (!detailsGroups || !Array.isArray(detailsGroups)) return [];

  return detailsGroups.map((detailGroup) => {
    const label = camelToSpaced(detailGroup.label ?? '');
    const { fields, groups, ...group_ } = detailGroup;
    let group: FieldGroup = { label, ...group_, ...propsFromString(label, GROUP_PROPS) };

    // Handle fields if present
    if (detailGroup.fields && Array.isArray(detailGroup.fields)) {
      const values: KeyField[] = expandKeyFields(detailGroup.fields);
      const fieldsStrings = values.map((k) => (typeof k === 'object' ? k.key : k));
      const keys = fieldsStrings.map((s) => s?.split(' ')?.[0]);
      group = { ...group, keys, fieldsStrings };
    }

    // Handle nested groups
    if (detailGroup.groups) {
      if (Array.isArray(detailGroup.groups)) {
        // Recursive case: groups is an array of DetailGroup
        group.groups = getGroupsFromDetailsGroups(detailGroup.groups);
        // groups is a FieldsGroupsMap
      } else group.groups = getGroupsFromMap(detailGroup.groups);
    }

    return group;
  });
}
