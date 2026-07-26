import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { FieldConfig, ObserverParameter } from './field.interface';
import { getDisplayName } from '@core/helpers/view.helpers';
import { getPathValue, nameFromFieldString } from '../details/util/field/fields.helper';
import { stringAfter } from '@core/helpers';

export type ValueMapper = ((value: any) => any) | Record<string | number, any>;

export type FieldProperty = ObserverParameter | any;

export const obs = observe; //alias

export const obs$ = observe$; //alias

export type StrArr = string | string[];

export function getObserveParamFn(key?: string, path?: string, temp?: any) {
  return { key, path, ...temp } as ObserverParameter;
}

export function setFormFetching(form: FormGroup, key: string, val: boolean, emit = true) {
  form.get(key)?.setValue(val, { emitEvent: emit });
}

export function observe$(observedKeys: StrArr, map?: ValueMapper, delay?: number): FieldProperty {
  if (!Array.isArray(observedKeys)) observedKeys = [observedKeys];
  const temp = { valueMapper: map, delay, observedKeys, useObservable: true };
  return { type: 'observeParameter', ...temp } as any;
}

export function observe(observedKeys: StrArr, map?: ValueMapper, delay?: number): FieldProperty {
  if (!Array.isArray(observedKeys)) observedKeys = [observedKeys];
  const temp = { valueMapper: map, delay, observedKeys, useObservable: false };
  return { type: 'observeParameter', ...temp } as any;
}

export function isFunctionNamed(variable: any, functionName: string): boolean {
  return typeof variable === 'function' && variable.name === functionName;
}

export function getOptionObjectValue(value: string, path: string, field: FieldConfig) {
  if (value === undefined) return undefined;
  const selected = field.options?.find((o: any) => o?.value ?? o?.uid === value);
  if (!selected) return undefined;
  return getPathValue(selected, (stringAfter(path, '.') as any));
}

export interface InvalidControl {
  key: string;
  control: AbstractControl;
  label: string;
}

export function getInvalidControls(form: FormGroup, fields: FieldConfig[] = []): InvalidControl[] {
  const invalidControls: InvalidControl[] = [];

  const labelFor = (key: string, ctx: FieldConfig[]): string => {
    const f: any = ctx.find((item) => item.key === key);
    return f?.label ?? getDisplayName(key) as any;
  };

  const recursiveCheck = (
    controls: Record<string, AbstractControl>,
    ctx: FieldConfig[],
    prefix: string,
  ) => {
    for (const key in controls) {
      if (!controls.hasOwnProperty(key)) continue;
      const control = controls[key];
      const fieldDef = ctx.find((f) => f.key === key) as FieldConfig | undefined;
      const ownLabel = `${prefix}${labelFor(key, ctx)}`;

      if (control instanceof FormGroup) {
        recursiveCheck(control.controls, fieldDef?.fields ?? ctx, prefix);
      } else if (control instanceof FormArray) {
        control.controls.forEach((rowCtrl, i) => {
          const rowPrefix = `${ownLabel} #${i + 1} / `;
          if (rowCtrl instanceof FormGroup) {
            recursiveCheck(rowCtrl.controls, fieldDef?.fields ?? [], rowPrefix);
          } else if (rowCtrl.invalid) {
            invalidControls.push({
              key: `${key}[${i}]`,
              control: rowCtrl,
              label: `${ownLabel} #${i + 1}`,
            });
          }
        });
      } else if (control.invalid) {
        invalidControls.push({ key, control, label: ownLabel });
      }
    }
  };

  recursiveCheck(form.controls, fields, '');
  return invalidControls;
}

export function getCombinations(str: string, value: any, sep = ''): Record<string, any> {
  const groups = str.split(/\s*[&]+\s*/);

  return groups.reduce(
    (obj: any, group) => {
      const leftSideItems = group.split(/\s*[|]+\s*/);
      const combinedObject: Record<string, any> = {};

      leftSideItems.forEach((leftItem, index) => {
        Object.keys(obj).forEach((key) => {
          const combinedKey = `${key}${key ? sep : ''}${leftItem}`;
          combinedObject[combinedKey] = value;
        });
      });

      return combinedObject;
    },
    { '': value },
  ) as any; // Initialize with an empty string key
}

/**
 * Get the first validation error message for a field
 * @param field The field configuration
 * @param group The form group containing the field
 * @returns The first error message or null if no errors
 */
export function getFirstError(field?: FieldConfig, group?: FormGroup): string | null {
  if (!field || !group) return null;

  const control = group.get(field.key);
  if (!control || !control.invalid || !control.touched) return null;

  for (const validation of field.validations || []) {
    if (control.hasError(validation.name)) return validation.message;
  }

  return null;
}

/**
 * Check if a field has any errors and has been touched
 * @param field The field configuration
 * @param group The form group containing the field
 * @returns True if the field has errors and has been touched
 */
export function hasError(field: FieldConfig, group: FormGroup): boolean {
  const control = group.get(field.key);
  return !!(control && control.invalid && control.touched);
}

/**
 * Recursively set labels for fields that don't have one
 * @param fields Array of field configurations
 * @param defaultLabel Default label to use if field label is empty (optional)
 */
export function setFieldLabels(
  fields: FieldConfig[],
  strippedSuffixes = ['Id', 'Uid'],
  defaultLabel = '',
) {
  const notStripped = ['National'];
  if (!fields || !Array.isArray(fields)) return;

  fields.forEach((field) => {
    // Set label if it's empty, null, or undefined
    if (!field.label) {
      let label = nameFromFieldString(field.key) || defaultLabel || '';

      strippedSuffixes.forEach(
        (s) =>
          !notStripped.find((s) => label.includes(s)) &&
          label?.endsWith(s) &&
          (label = label.slice(0, label.length - 1 - s.length)),
      );

      field.label = label;
    }

    // Recursively process nested fields if they exist
    if (field.fields && Array.isArray(field.fields)) {
      setFieldLabels(field.fields, strippedSuffixes, defaultLabel);
    }
  });
}
