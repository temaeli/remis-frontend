import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FieldMap } from './form.interface';
import { BaseConfig, OptionsVariable } from './field.interface';
import { Obj, getFields, getPathValue } from '@core/helpers';

export const INPUT_FIELD_TYPES = [
  'text',
  'email',
  'password',
  'number',
  'tel',
  'range',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'file',
  'url',
  'toggle',
];

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'range'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'url'
  | 'toggle'
  | 'date-range'
  | 'slider-select'
  | 'date';

export function setFormFieldValue(form: FormGroup, key: string, value: any) {
  form?.get(key)?.setValue(value);
}

export function setForm(form: FormGroup, value: Obj) {
  for (const key in value) form?.get(key)?.setValue(value[key]);
}

export function mapFields(fields: BaseConfig[], fieldsMaps: FieldMap<any>[]): any[] {
  return fields.map((field: BaseConfig) => {
    const fieldMaps = fieldsMaps.filter((m) => m.key === field.key && m.canMap != false);

    fieldMaps.forEach((m) => {
      if (m.mapObject) getFields(m.mapObject).forEach((f) => ((field as any)[f.key] = f.value));
      if (m.property) (field as any)[m.property] = m.value;

      const { key, mapObject, property, ...fieldProps } = m;
      field = { ...field, ...(fieldProps ?? {}) } as any;
    });

    return field;
  });
}

export function clearValidators(f: FormGroup, keys: string[]) {
  setFormValidators(f, keys, []);
}

export function clearAllValidators(controls: any | AbstractControl[]) {
  if (!Array.isArray(controls)) controls = [controls] as AbstractControl[];

  controls.forEach((control: AbstractControl) => {
    control.clearValidators();
    control.updateValueAndValidity();
    if (!(control instanceof FormGroup)) return;
    Object.values(control.controls).forEach((nested) => clearAllValidators(nested));
  });
}

export function setFormValidators(form: FormGroup, fields: string[], validators: any[]) {
  fields.forEach((field) => {
    if (validators.length <= 0) form.get(field)?.clearValidators();
    else form.get(field)?.setValidators(validators);
    form.get(field)?.updateValueAndValidity();
  });
}

export function mapOptions(options: any[], optionsVariables?: OptionsVariable) {
  if (!options?.length || !Array.isArray(options)) return [];

  // if (optionsVariables?.optionsFunction) options = optionsVariables.optionsFunction(options); // TODO: implement optionsFunction on OptionsVariable

  const mapFunction = optionsVariables?.mapFunction;
  const mapObject = optionsVariables?.mapObject;
  let labelKey: string = optionsVariables?.labelKey as any;
  let valueKey: string = optionsVariables?.valueKey as any;
  const first = options?.[0];
  const noMap = !mapObject && !mapFunction;

  if (mapFunction) return options.map(mapFunction);

  if (mapObject) {
    return options.map((o: any) => ({
      ...o,
      label: getPathValue(o, mapObject?.label ?? 'name'),
      value: getPathValue(o, mapObject?.value ?? 'uid'),
    }));
  }

  if (first.hasOwnProperty('label') && first.hasOwnProperty('value')) return options;
  //
  else if (noMap && ['number', 'string', 'boolean'].includes(typeof first)) {
    return options.map((o) => ({ label: o, value: o }));
  }
  //

  //
  else if (noMap && typeof first === 'object') {
    if (!labelKey) {
      labelKey = ['name', 'label', 'title', 'fullName'].find((k) => !!first[k]) ?? 'name';
    }

    if (!valueKey) valueKey = 'uid';
    return options.map((o: any) => ({ ...o, label: o[labelKey ?? valueKey], value: o[valueKey] }));
  }

  return options;
}

export function matchFieldsValidator(fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (!fields || fields.length < 2) return null;

    const values = fields.map((key) => ({ key, value: group.get(key)?.value }));
    const baseValue = values[0].value;
    const mismatches = values.filter((v) => v.value !== baseValue);

    // Clear previous fieldDoesNotMatch errors without touching others
    fields.forEach((f) => {
      const control = group.get(f);
      if (!control) return;

      const errors = control.errors;

      if (errors?.['fieldDoesNotMatch']) {
        delete errors['fieldDoesNotMatch'];
        if (Object.keys(errors).length === 0) control.setErrors(null);
        else control.setErrors(errors);
      }
    });

    if (mismatches.length === 0) return null;

    // Apply field-level errors (append instead of override)
    mismatches.forEach((m) => {
      const control = group.get(m.key);
      if (!control) return;

      const existing = control.errors ?? {};

      control.setErrors({
        ...existing,

        fieldDoesNotMatch: {
          expected: baseValue,
          against: fields,
          mismatched: mismatches.map((x) => x.key),
        },
      });
    });

    return {
      fieldsNotMatch: {
        expected: baseValue,
        mismatchedFields: mismatches.map((m) => m.key),
        allFields: fields,
      },
    };
  };
}
