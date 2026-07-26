import { max } from 'rxjs';
import { DATE_KEYS_SUFFIX, FORMAT_THOUSANDS_KEYS } from '../details/util/field/field.constants';
import { isObject, isValue, stringAfter } from '../details/util/util.helpers';
import { camelToSpaced, capFirstChar, getFirstPresentKey } from '../details/util/util.helpers';
import { Field } from '../details/util/field/field.interface';
import {
  getPathValue,
  keyFromFieldString,
  nameFromFieldString,
  propsFromString,
  separateThousands,
} from '../details/util/field/fields.helper';
import { getFields, getNameField } from '../details/util/field/fields.helper';
import { getDisplayDate, replaceWords, arrayToDisplayString, areObjectsEqual } from '@core/helpers';
import { valueIncludes, valueEndsWith_, formatIfDate, isValidDate } from '@core/helpers';
import { GRID_COLUMN_PROPS } from './data-grid.constants';
import { GridColumn, GridKeyColumn } from './data-grid.interfaces';
import { ModifierProps } from '../generic-form/field.interface';

export function getFirstPresentField(o: any, keys_: string[]) {
  const key = getFirstPresentKey(o, keys_);
  const x = (f: any) => valueIncludes(f.key.trim(), key);
  return getFields(o).find((f) => x(f));
}

export function formatFields(fields: Field[]) {
  if (!Array.isArray(fields)) return fields;

  const isDateKey = (k: string) => {
    return ['string', 'object'].includes(typeof k) && valueEndsWith_(k, DATE_KEYS_SUFFIX);
  };

  return fields?.map((x) => ({
    ...x,
    value: isDateKey(x.key) ? formatIfDate(x.value) : x.value,
    label: capFirstChar(camelToSpaced((x.label as any))).trim(),
  }));
}

export function separteIfThousands(value: any, key: string) {
  const separate = valueIncludes(key, FORMAT_THOUSANDS_KEYS);
  if (separate) value = separateThousands(value);
  return value;
}

export function interpretValue(value: any, key?: any) {
  const replaceUnderscores = (v: any) => typeof v === 'string' && !v?.toString()?.includes('@');

  if (typeof value === 'number') value = separteIfThousands(value, key);
  else if (typeof value === 'boolean') value = value ? 'YES' : 'NO';
  else if (Array.isArray(value)) value = interpreteArray(value);
  else if (isObject(value)) value = (getNameField(value) as any)?.value;
  else if (isValidDate(value)) value = getDisplayDate(value);

  if (replaceUnderscores(value)) value = replaceWords(value, '_', ' ');
  if (!value?.toString()?.trim()) value = '--';

  return value;
}

export function getObjectValue(element: any, key: string, inter = false) {
  const getValue = (o: any, k: string, i: boolean) =>
    i ? getPathValue(o, k) : interpretValue(getPathValue(o, k));

  if (!key.includes('+')) return getValue(element, key, inter) ?? element ?? 'N/A';
  const keyValueArray = key?.split('+')?.reverse();
  let inclusiveValue = '';

  for (let i = 0; i <= keyValueArray.length; i++) {
    inclusiveValue = `${inclusiveValue}
      ${getValue(element, (keyValueArray?.pop()?.trim() as string), inter)}`;
  }

  return inclusiveValue ?? 'N/A';
}

export function interpreteArray(array: any[]) {
  let value: string | undefined = undefined;
  if (typeof array?.[0] === 'object') array = array.map((v) => getNameField(v)?.value);
  return (value = arrayToDisplayString(array));
}

export function setFieldsWidths(items: any[], width = 5, max = 60, threshold = 5) {
  const sampleRecord = items[0];
  // for each field get the longest string // max is 100 // min is 8
  const allFields = formatFields(getFields(sampleRecord)).map((field) => {
    items.forEach((item) => {
      const widthBuffer = item[field.key]?.toString()?.length ?? threshold;
      if (widthBuffer < width) return;
      if (widthBuffer > max) width = max;
      else width = widthBuffer;
    });

    const length = (field?.key?.length > width ? field?.key?.length : width) + threshold;
    return { ...field, length };
  });

  return allFields;
}

export function mapVisibleItem(items: any[], columnsKeys?: string[]) {
  let autoMappedKeys: string[] = [];

  const mappedItems: any[] = items.map((item) => {
    const allFields = formatFields(getFields(item));
    const mappedItem: any = { ...item };

    allFields.forEach((field: Field) => {
      let interpret = true;
      if (!Array.isArray(field.value) && isObject(field.value)) {
        const colkey = columnsKeys?.find((c) => c.split('.')?.[0] === field.key);
        if (colkey?.includes('.') || colkey?.includes('Mod')) interpret = false;
      }
      if (interpret && isValue(field.value)) {
        const v = interpretValue(field.value);

        if (v !== field.value) {
          mappedItem[`${field.key}Mapped`] = v ?? field.value;
          autoMappedKeys = [...new Set(autoMappedKeys?.concat([field.key]))];
        }
      }
    });
  });

  return [mappedItems, autoMappedKeys];
}

export function removeMod(s: string) {
  const suffix = stringAfter(s, ' ');
  let key = s.split(' ')[0];
  key = key.endsWith('Mod') ? key.substring(0, key.length - 3) : key;
  if (suffix) key = `${key} ${suffix}`;
  return key;
}

export function mergeUnique(keys: string | undefined | string[], ...arrays: any[][]) {
  const arr = [...arrays?.[0]];

  const valueNotIn = (item: any) => {
    let p = true;
    if (!Array.isArray(keys)) keys = [(keys as any)];
    keys.forEach(
      (k) => (p = p && (!item.hasOwnProperty(k) || !arr.find((i) => i?.[k] == item?.[k]))),
    );
  };

  const objectNotIn = (item: any) => arr.find((obj) => !areObjectsEqual(obj, item));

  [...arrays]
    .slice(1)
    .forEach((a) =>
      [...a].forEach((i) => (keys ? valueNotIn(i) : objectNotIn(i)) && arr.push(i)),
    );

  return arr;
}

export function flattenColumns(columns: GridColumn[], ancestors: GridColumn[] = []): GridColumn[] {
  const result: GridColumn[] = [];

  function trimColumn(col: GridColumn): GridColumn {
    const { columns, ...rest } = col;
    return { ...rest };
  }

  for (const col of columns) {
    // create a trimmed version of this column (no nesting props)
    const trimmed: GridColumn = trimColumn(col);

    const newAncestors = [...ancestors, trimmed];

    if (col.columns && col.columns.length > 0) {
      // parent itself is NOT added, only its children in its place
      const { columns, headers, ...inheritProps } = col;
      const children = col.columns.map((c) => ({ ...inheritProps, ...c }));
      const flattenedChildren = flattenColumns(children, newAncestors);
      result.push(...flattenedChildren);
    } else {
      // leaf column → include with full headers ancestry
      result.push({ ...col, headers: newAncestors });
    }
  }

  return result;
}

export function columnFromKeyColumn(str: string, lastDotAsName?: boolean): GridColumn {
  let column: GridColumn = { field: keyFromFieldString(str) };

  if (str) {
    const props: ModifierProps = {
      childrenKey: 'columns',
      inherit: true,
      key: 'field',
      label: 'header',
      lastDotAsName,
    };

    column = { ...column, ...propsFromString(str, GRID_COLUMN_PROPS, props) };
  }

  const header_ = (s: string) => nameFromFieldString(s, lastDotAsName);
  if (!column.header) column.header = header_(column.field);

  return column;
}

export function parseKeyColumns(
  keyCols: GridKeyColumn[],
  lastDotAsName?: boolean,
  nestedChildren?: boolean,
): GridColumn[] {
  return keyCols.map((kc) => {
    // -----------------------------
    // STRING → convert to column
    // -----------------------------
    if (typeof kc === 'string') return columnFromKeyColumn(kc, lastDotAsName);

    // parse but maintain header if present
    const header = kc.header;
    kc = { ...kc, ...columnFromKeyColumn(kc.field, lastDotAsName) };
    if (header) kc.header = header;

    const header_ = (s: string) => nameFromFieldString(s, lastDotAsName);
    if (!kc.header) kc.header = header_(kc.field);
    // -----------------------------
    // HAS NESTED keyColumns → recurse and replace with columns
    // -----------------------------
    if (kc.keyColumns && Array.isArray(kc.keyColumns)) {
      const parsedChildren = parseKeyColumns(kc.keyColumns, lastDotAsName, nestedChildren);
      // clone WITHOUT keyColumns, and add columns instead
      const { keyColumns, ...rest } = kc as any;
      return {
        ...rest,
        columns: parsedChildren.map((c) => ({
          ...c,
          field: nestedChildren ? `${kc.field}.${c.field}` : c.field,
        })),
      };
    }

    // -----------------------------
    // NORMAL OBJECT COLUMN
    // -----------------------------
    return kc;
  });
}
