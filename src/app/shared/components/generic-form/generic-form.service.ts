import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldConfig, FieldType, FormStepper, ObserverParameter } from './field.interface';
import { getInvalidControls, getOptionObjectValue } from './field-helpers';
import { CrossValidator, WhenCallback } from './form.interface';
import { delayedExecution } from '@core/helpers/view.helpers';
import { matchFieldsValidator } from './form.helpers';
import { cloneDeep, stringAfterLast, setPathValue, mergeObjects } from '@core/helpers';
import { getFields, stringAfter, valueIsEither, getPathValue } from '@core/helpers';

@Injectable({ providedIn: 'root' })
export class DynamicFormService {
  private formBuilder = inject(FormBuilder);
  selectedKeyValue = {};

  handleShowWhen(key: string, value: any, form: FormGroup, fields: FieldConfig[]) {
    // update control config
    const updateControl = (field: FieldConfig, matches: boolean) => {
      field.visible = matches;
      this.handleVisibility_(form, field, matches);
      // console.log(key, matches, field.key, field);
      return field;
    };

    return this.handleWhen(key, value, 'showWhen', fields, form, updateControl);
  }

  handleSetWhen(
    key: string,
    value: any,
    form: FormGroup,
    fields: FieldConfig[],
  ): Promise<FieldConfig[]> {
    // function to handle affected fields
    const updateField = (field: FieldConfig, matches: boolean) => {
      const original: any = {};
      let previous_: any = {};
      const new_: any = {};

      // set previous_ value from all the whens //set original only once from previous
      if (!(field as any)?.['original']) {
        const setFields_ = (set: any) => getFields(set.field);
        field.setWhen?.forEach((s) =>
          setFields_(s).forEach((f) => (original[f.key] = (field as any)[f.key])),
        );
        (field as any)['original'] = { ...original };
      }

      // set new value from current key when
      const allSets =
        field.setWhen?.filter((set) => set.when.find((w) => w.key.split('.')[0] === key)) ?? [];

      const whenMatches = (w: any) =>
        w.hasOwnProperty('value')
          ? w.value === value
          : w.hasOwnProperty('checker')
            ? w.checker(value)
            : !!value;

      // let sets = allSets.filter(s => !!s.when.find(w => whenMatches(w)));
      const sets = allSets.filter((s) =>
        s.fitAll ? s.when.every((w) => whenMatches(w)) : s.when.some((w) => whenMatches(w)),
      );

      const setNew_ = (f: any) => {
        const isFn = typeof f.value === 'function';
        const key_ = isFn ? f.key.split('_')[0] : f.key;

        // get value as array from all the whens match the value;
        const values_ = (set: any) => {
          return set?.when?.reduce((a: any, b: any) => a.concat(form.get(b.key)?.value), []);
        };

        const values = sets.reduce((a, b) => a.concat(values_(b) ?? []), []);
        new_[key_] = isFn ? f.value(...values) : f.value;
      };

      sets.forEach((set) => getFields(set.field).forEach((f) => setNew_(f)));

      if (Object.keys(new_).length) {
        getFields(new_).forEach((f) => (previous_[f.key] = (field as any)?.['original'][f.key]));
        (field as any)['previous'] = previous_;
      } else previous_ = (field as any)['previous'] ?? {};

      // console.log('allSets', allSets);
      // console.log('matchingSets', sets);

      field = { ...field, ...(matches ? new_ : previous_) };

      if (new_.hasOwnProperty('disabled')) this.handleDisabling_(form, field, matches);
      if (new_.hasOwnProperty('visible')) this.handleVisibility_(form, field, matches);
      if (new_.hasOwnProperty('value')) this.handleValue_(form, field, field.value);

      return field;
    };

    return this.handleWhen(key, value, 'setWhen', fields, form, updateField);
  }

  handleWhen(
    key: string,
    value: any,
    prop: any,
    fields: any[],
    form: FormGroup,
    act: WhenCallback,
  ): Promise<FieldConfig[]> {
    ////
    const getWhens = (field: any) => {
      let whens = field?.[prop];
      if (prop === 'setWhen')
        whens = whens.map((w: any) => w.when).reduce((w1: any, w2: any) => w1.concat(w2), []);
      return whens;
    };

    let fields_: FieldConfig[] = [...fields.filter((f) => !!f?.[prop])];
    fields_ = [
      ...fields_.filter((f) => !!getWhens(f)?.find((w: any) => w.key?.split('.')?.[0] === key)),
    ];

    let delay = 0;
    const affectedFields: FieldConfig[] = [];
    const formValues = { ...form.value, [key]: value };

    fields_.forEach((field) => {
      let matches = true;

      getWhens(field)?.forEach((when: any, index: number) => {
        //if combination is or,  start with false
        if (index === 0 && when['combination'] !== 'and') matches = false;

        // get inner value other than id if has (.)
        let path = undefined;

        if ((path = stringAfter(when.key, '.'))) {
          const options = fields?.find((f) => f.key === key)?.options ?? [];
          const selected = options?.find((o: any) => valueIsEither(o?.value ?? o?.id, value));
          formValues[when.key] = getPathValue(selected, path) ?? formValues[when.key];
        }

        // if values not given check if input have value
        const valued = when.hasOwnProperty('value');
        const hasChecker = when.hasOwnProperty('checker');
        const v_ = (value: any) => !!value && ![null, undefined, 'null', 'undefined'].includes(value);
        let v = valued
          ? valueIsEither(formValues[when.key], when.value)
          : hasChecker
            ? when.checker(formValues[when.key])
            : v_(formValues[when.key]);
        if (when.negate === true) v = !v;
        if (when.combination === 'and') matches = matches && v;
        else matches = matches || v;
      });

      const delay_ = Math.max(...(field as any)?.[prop]?.map((w: any) => w?.delay ?? 0));
      if (delay_ > delay) delay = delay_;

      // no delay on hidding
      clearTimeout(field.timer);
      if (!delay_) affectedFields.push(act(field, matches));
      else field.timer = setTimeout(() => affectedFields.push(act(field, matches)), delay_);
    });

    return new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve(affectedFields), delay);
    });
  }

  handleVisibility_(form: FormGroup, field: FieldConfig, visible: boolean) {
    const ctrl: AbstractControl = form.controls[field.key];
    if (!ctrl) return;

    if (ctrl instanceof FormArray) {
      const contrArr = (ctrl.controls[0] as FormGroup).controls;

      for (const [key, control] of Object.entries(contrArr)) {
        if (!visible) control.clearValidators();
        else {
          const v = this.bindValidations(field.fields?.find((f) => f.key === key)?.validations ?? []);
          control.setValidators(v);
        }
        control.updateValueAndValidity();
      }
      return;
    }

    if (!visible) ctrl.clearValidators();
    else ctrl.setValidators(this.bindValidations(field?.validations ?? []));
    ctrl.updateValueAndValidity();
  }

  handleDisabling_(form: FormGroup, field: FieldConfig, disabled: boolean) {
    const ctrl: AbstractControl = form.controls[field.key];
    const prop = { onlySelf: true };

    if (ctrl instanceof FormArray) {
      const contrArr = (ctrl.controls[0] as FormGroup).controls;
      ///
      for (const [key, control] of Object.entries(contrArr)) {
        if (!disabled) {
          control.enable(prop);
          const v = this.bindValidations(field.fields?.find((f) => f.key === key)?.validations ?? []);
          control.setValidators(v);
          //
        } else {
          control.disable(prop);
          control.clearValidators();
        }
        control.updateValueAndValidity();
      }
      return;
    }

    disabled ? ctrl.disable(prop) : ctrl?.enable(prop);
    if (disabled) ctrl.clearValidators();
    else ctrl.setValidators(this.bindValidations(field?.validations ?? []));
    ctrl.updateValueAndValidity();
  }

  handleValue_(form: FormGroup, field: FieldConfig, value: any) {
    const ctrl: AbstractControl = form.controls[field.key];
    ctrl.setValue(value);
  }

  setDisabled(field: FieldConfig, form: FormGroup) {
    if (!field?.disabledWhen) return;

    let disabled = false;

    field?.disabledWhen?.forEach(({ value, key, checker, combination, negate }) => {
      const value_ = form.get(key)?.value;
      let disabled_;
      if (value !== undefined) disabled_ = (Array.isArray(value) ? value : [value]).includes(value_);
      else if (checker) disabled_ = checker(value_);
      else disabled_ = !!value_;
      if (combination === 'and') disabled = disabled && disabled_;
      else disabled = disabled || disabled_;
      if (negate) disabled = !disabled;
    });

    const dControl = form.get(field.key);
    if (disabled) dControl?.disable({ onlySelf: true });
    else dControl?.enable({ onlySelf: true });
    //  dControl.clearValidators();
  }

  // Creating Form Control and Assigning Initial Values
  createControl(fields: FieldConfig[], formData?: Record<string, any>, cv?: CrossValidator[]) {
    const group = this.formBuilder.group({});

    //TODO: also apply field cross validators
    if (cv?.length) {
      group.setValidators(
        cv
          .map((v) => (v.type === 'match' ? matchFieldsValidator(v.fields) : null))
          .filter((v) => !!v),
      );
    }

    formData = cloneDeep(formData);

    fields.forEach((field) => {
      // button and label now need form control to handle disabling and visibility from other fields observers
      // if (field.type === 'button' || field.type === 'label') return;

      const key = field.key;
      let initialValue = formData ? formData[key] : null;

      if (field.type === FieldType.checkbox) initialValue = initialValue || false;
      else if (field.type === FieldType.toggle) initialValue = initialValue || false;
      else if (field.inputType === 'number') initialValue = initialValue || null;

      // create the control
      let control: FormControl<any> | FormArray<FormControl<unknown>> | FormGroup | undefined =
        undefined;

      // form group
      if (field.type === FieldType.formGroup) {
        control = this.createControl(field.fields ?? [], formData?.[key]);
      }
      // form group Array
      else if (field.type === FieldType.formGroupArray) {
        control = this.formBuilder.array([], this.bindValidations(field.validations || []));
        const formArray = control as FormArray;
        const v = initialValue;

        if (Array.isArray(v)) {
          v.forEach((d) => formArray.push(this.createControl((field.fields as any), d)));
        }

        if ((Array.isArray(v) && !v.length) || !v) {
          formArray.push(this.createControl((field.fields as any)));
        }
      }
      //inner control // Priority to Field Value
      else {
        const value = field.value || initialValue;
        const disabled = field.disabled || false;
        const validatorFn = this.bindValidations(field.validations || []);
        control = this.formBuilder.control({ value, disabled }, validatorFn);
      }

      // add the control
      group.addControl(key, control);

      if (field.hasOwnProperty('visible')) this.handleVisibility_(group, field, (field.visible as any));
    });

    return group;
  }

  bindValidations(validations: any) {
    if (validations.length > 0) {
      const validList: any[] = [];
      validations.forEach((valid: any) => validList.push(valid.validator));
      return Validators.compose(validList);
    }
    return null;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  onSubmit(event: Event, form: FormGroup, fields: FieldConfig[], steppers: FormStepper[] = []) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const data = {
      ...form.value,
      ...steppers.reduce((a, b) => ({ ...a, ...b.formGroup?.value }), {}),
    };

    const ingoredKeys = fields.filter((f) => !!f.ignoreOnSubmit).map((f) => f.key);
    ingoredKeys.forEach((key) => delete data[key]);

    return data;
    //form is always valid when submiting
    //  this.validateAllFormFields(form);
  }

  handleObservers(
    key: string,
    observers: ObserverParameter[],
    form: FormGroup,
    fields: FieldConfig[],
  ): Promise<FieldConfig>[] {
    ///
    const keyPart = (keys: string[]) => keys.map((key) => key.split('.')[0]);
    const affectedObservers = [...observers.filter((o) => keyPart(o.observedKeys).includes(key))];
    const aKeys = affectedObservers.map((o) => o.key);
    let affectedFields: FieldConfig[] = [...fields.filter((f) => aKeys.includes(f.key))];
    let fieldPromises: Promise<FieldConfig>[] = [];

    //if field has observers with different delays treat them a different fields sorted by delays
    const splitField = (f: FieldConfig) => {
      const fobs = affectedObservers.filter((o) => o.key === f.key);
      const delaysSet = [...new Set(fobs.map((o) => o.delay ?? 0))].sort((a, b) => a - b);
      return delaysSet.map((delay) => ({ ...f, delay }));
    };

    affectedFields = affectedFields.reduce((a, b) => a.concat((splitField(b) as any)), []);

    fieldPromises = affectedFields.map((field) => {
      return new Promise(async (resolve, reject) => {
        const fieldObservers = affectedObservers.filter((o) => o.key === field.key);
        const temp: any = {};

        // update the temp field if not using observable
        const updateTempField = (observer: ObserverParameter, v: any) => {
          const nested = observer.path?.includes('fields');
          const path_ = nested ? stringAfterLast((observer.path as any), /fields\.\d\.+/) : observer.path;
          setPathValue(temp, (path_ as any), v);

          if (observer.path?.endsWith('disabled')) this.handleDisabling_(form, field, !!v);
          if (observer.path?.endsWith('visible')) this.handleVisibility_(form, field, !!v);
          if (observer.path?.endsWith('value')) this.handleValue_(form, field, v);
        };

        const handleFieldObservers = async (observers: ObserverParameter[]) => {
          if (!observers.length) return;
          const obs = observers.pop();
          if (!obs) return;
          obs.values = [];

          obs.observedKeys.forEach((keyStr) => {
            const observedKey = keyStr.split('.')[0];
            const observedField = fields.find((f) => f.key === observedKey);
            const value_ = form?.get(observedKey)?.value;
            const nestedKey = keyStr.includes('.');
            const v = nestedKey ? getOptionObjectValue(value_, keyStr, (observedField as any)) : value_;
            obs.values?.push(v);
          });

          // before evaluation compound value// init value with the first observed key'value
          obs.value = obs?.values[0];
          if (obs.valueMapper) obs.value = await obs.valueMapper(...obs?.values);

          // assign the value
          const assingValue = () => {
            if (!obs.useObservable) updateTempField(obs, obs.value);
            else obs.observable?.next(obs.value);
            // console.log(observer.key, observer.value, typeof observer.value);
          };

          // assign observer value
          const delay = obs.delay ?? 0;
          await new Promise(async (res, rej) => delayedExecution(() => res(assingValue()), delay));
          handleFieldObservers(observers);
        };

        // handle each observer in the field to temp, merge temp with actual field
        await handleFieldObservers([...fieldObservers]);
        const modField = mergeObjects(field, temp);
        // console.log('b4 after ', field.visible, modField.visible);
        delayedExecution(() => resolve((modField as any)), (field as any)?.['delay'] ?? 0); // TODO Add delay to field config
      });
    });

    // console.log({ key, affectedFields });
    return fieldPromises;
  }

  getFormInvalidMsg(form: FormGroup, fields: FieldConfig[], groupName?: string): string {
    const c = getInvalidControls(form, fields).map((i) => i.label);
    if (groupName?.trim()) groupName = `${'in'} <b>${groupName}</b>`;
    const field = `Field${c.length > 1 ? 's' : ''}`;
    const notValid = `${c.length > 1 ? 'are' : 'is'} not Valid`;
    const number = `<b>${c.length}</b>`;

    let msg = `${number} ${field} ${groupName} ${notValid} `;
    msg = `${msg} : <b> ${c.map((x: any) => x).join(', ')}</b> `;

    return msg;
  }
}
