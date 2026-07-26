import { BaseConfig, FieldConfig, FormStepper } from './field.interface';
import { StepperOrientation } from '@angular/cdk/stepper';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface Option {
  name: string;
  value: any;
}

export interface FieldMap<T> extends BaseConfig {
  canMap?: boolean;

  key: string;
  property?: string;
  value?: any;

  mapObject?: T;
}

export interface ShowWhen {
  key: string;
  value?: any | any[];
  idKey?: string;
  combination?: 'and' | 'or';
  negate?: boolean;
  delay?: number;
  checker?: (val: any) => boolean;
}

export interface SetWhen<T> {
  field: T;
  when: ShowWhen[];
  fitAll?: boolean;
}

export type WhenCallback = (field: FieldConfig, match: boolean) => FieldConfig;

export interface FormParameters<T = any> {
  closeOnSubmit?: boolean;
  title?: string;
  icon?: string;
  model?: T;
  fields?: FieldConfig[];
  includeDisabled?: boolean;
  showTitle?: boolean;
  fieldsClass?: string;
  outerClass?: string;
  showFooter?: boolean;
  appearance?: 'fill' | 'outline';

  footerClass?: string;

  formSteppers?: FormStepper[];
  linearSteppers?: boolean;
  stepperOrientation?: StepperOrientation;
  stepperLabelPosition?: StepperLabelPosition;
  stepperAppearance?: StepperAppearance;
  showStepperCancel?: boolean;

  fieldsMap?: FieldMap<BaseConfig>[];
  crossValidators?: CrossValidator[];

  autoLabels?: boolean;
  closeAction$?: Observable<any> | Subject<any> | BehaviorSubject<any>;

  context?: any; // form context // commonly functionality from the componet triggering the form that is used in callbacks as last par

  onSubmit?: (data: any, props?: FormProperties) => any;
  onModalClose?: (data?: any) => any;
  onCloseAction?: (data?: any) => any;
  onValueChanged?: (field: FieldConfig, control?: AbstractControl | null, form?: FormGroup) => any;
  internalUpdateNotifier?: EventEmitter<FieldConfig>;
}

export type StepperLabelPosition = 'bottom' | 'end';

export type StepperAppearance = 'default' | 'fill' | 'outline';

export type ControlsOf<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Record<any, any> ? FormGroup<ControlsOf<T[K]>> : FormControl<T[K]>;
};

export interface FormProperties {
  form?: FormGroup;
  steps?: FormStepper[];
  isSaving$?: BehaviorSubject<boolean>;
}
export interface CrossValidator {
  type: 'match';
  fields: string[];
}
