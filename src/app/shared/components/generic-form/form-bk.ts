// import { Component, OnInit, Input, inject, Inject } from '@angular/core';
// import { FormGroup } from '@angular/forms';
// import {
//   MatDialogRef,
//   MAT_DIALOG_DATA,
//   MatDialogContent,
//   MatDialogContainer,
//   MatDialogActions,
//   MatDialogTitle,
// } from '@angular/material/dialog';
// import {
//   cloneDeep,
//   getPathsToObservables,
//   getPathValue,
//   setPathValue,
//   getPathsToObject,
//   stringBeforeLast,
//   removeWords,
//   getFields,
//   findReplace,
// } from '@core';
// import { Subscription, BehaviorSubject } from 'rxjs';
// import { DynamicFormService } from './generic-form.service';
// import { getCombinations, setFieldLabels } from './field-helpers';
// import {
//   FieldConfig,
//   ObserverParameter,
//   FieldType,
//   FormStepper,
//   FormChangeDetail,
// } from './field.interface';
// import { mapFields } from './form.helpers';
// import { FormParameters } from './form.interface';
// import { GenericFormComponent } from './generic-form.component';
// import { ResetComponent } from 'src/app/module/auth/pages/register/reset/reset.component';
// import { DetailsHeaderComponent } from '../details/details-header/details-header.component';
// import { ActionButton } from '../action-buttons/action-buttons.inteface';
// import { CommonModule } from '@angular/common';
// import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';

// @Component({
//   selector: 'app-form',
//   standalone: true,
//   imports: [
//     GenericFormComponent,
//     DetailsHeaderComponent,
//     MatDialogContent,
//     MatDialogActions,
//     CommonModule,
//     ActionButtonsComponent,
//   ],
//   template: `
// @if (form) {
//   <div class="{{ outerClass }} overflow-hidden {{ animation }} --order-2">
//     @if (isLoading) {
//       <p>{{ loadingMessage }}</p>
//     }

//     <form
//       [hidden]="isLoading"
//       class="dynamic-form"
//       [formGroup]="form"
//       (submit)="onSubmit($event)"
//       autocomplete="off"
//     >
//       <!-- show field in stepper -->
//       <div [hidden]="!formSteppers.length">
//         @if (['fill', 'outline'].includes(stepperAppearance)) {
//           <step-indicator
//             [mode]="stepperAppearance | any"
//             [steps]="formSteppers"
//             [progress]="stepper._getFocusIndex()"
//             (goToStep)="goToStep(stepper, $event)"
//           ></step-indicator>
//         }

//         <mat-stepper
//           [linear]="linearSteppers"
//           [orientation]="stepperOrientation"
//           [labelPosition]="stepperLabelPosition"
//           (selectionChange)="stepperIndexChange($event.selectedIndex)"
//           [class.hide-header]="['fill', 'outline'].includes(stepperAppearance)"
//           #stepper
//         >
//           @for (step of formSteppers; track step; let index = $index) {
//             <mat-step
//               [stepControl]="step.formGroup | any"
//               [state]="step.icon | any"
//               [label]="step.name | any"
//             >
//               <ng-container
//                 *ngTemplateOutlet="fieldsTpl; context: { formFields: step.fields, step }"
//               ></ng-container>

//               <!-- step navigations -->
//               <div class="w-full d-flex justify-between align-items-center">
//                 <div class="flex items-center">
//                   @if (index !== 0) {
//                     <button type="button" mat-button matStepperPrevious>
//                       {{ 'Back' }}
//                     </button>
//                   }

//                   @if (index === 0) {
//                     <button (click)="stepperClose.emit(true)" type="button" mat-button>
//                       {{ 'Cancel' }}
//                     </button>
//                   }
//                 </div>

//                 <div class="flex flex-wrap items-center">
//                   @if (step?.formGroup?.touched && step?.formGroup?.invalid) {
//                     <button
//                       mat-stroked-button
//                       [matTooltip]="'View Missing Inputs'"
//                       (click)="viewInvalid(step.formGroup)"
//                       type="button"
//                     >
//                       <mat-icon svgIcon="exclamation" class="mx-2"></mat-icon>
//                     </button>
//                   }

//                   <!-- proceed btn that saves if has onSubmit -->

//                   @if (index < formSteppers.length - 1 || step.onSubmit) {
//                     <button
//                       type="button"
//                       mat-button
//                       (click)="onProceed(step, index, stepper)"
//                       [disabled]="linearSteppers && !!!step.optional && step?.formGroup?.invalid"
//                     >
//                       {{ index < formSteppers.length - 1 ? 'Proceed' : 'Complete' }}
//                     </button>
//                   }

//                   <!-- save button -->
//                   @if (saveButton && index === formSteppers.length - 1 && !step.onSubmit) {
//                     <span>
//                       <ng-container
//                         *ngTemplateOutlet="fieldTpl; context: { field: saveButton, index: 2 }"
//                       ></ng-container>
//                     </span>
//                   }
//                 </div>
//               </div>
//             </mat-step>
//           }
//           <!-- Icon overrides. -->
//           @for (step of formSteppers; track $index) {
//             <ng-template [matStepperIcon]="step.icon">
//               @if (step.icon) {
//                 <mat-icon [svgIcon]="step.icon"> </mat-icon>
//               }
//             </ng-template>
//           }
//           <!--  -->
//         </mat-stepper>
//       </div>

//       <!-- All field if no stepper -->
//       @if (!formSteppers.length) {
//         <ng-container
//           #allFieldsTpl
//           *ngTemplateOutlet="fieldsTpl; context: { formFields: fields }"
//         ></ng-container>
//       }

//       @if (form.errors?.['fieldDoesNotMatch']) {
//         <div class="text-red-500 text-sm">
//           Must match: {{ form.errors?.['fieldDoesNotMatch']?.against.join(', ') }}
//         </div>
//       }
//     </form>
//   </div>
// }

// <ng-template #formErrorTpl>
//   <div class="p-5">{{ 'Form Error' }}</div>
// </ng-template>

// <ng-template #fieldsTpl let-formFields="formFields" let-step="step">
//   <div
//     class="
//     {{
//       'overflow-hidden w-full grid gap-3 xl:grid-cols-2 auto-rows-min p-3 lg:p-4'
//         | mergeClasses: field?.fieldsClass ?? step?.fieldClass ?? fieldsClass
//     }}"
//   >
//     <ng-container *ngFor="let field of formFields; let index = index">
//       <ng-container *ngTemplateOutlet="fieldTpl; context: { field, index }"></ng-container>
//     </ng-container>
//   </div>
// </ng-template>

// <ng-template #fieldTpl let-field="field" let-index="index">
//   @if (field.visible !== false) {
//     <div
//       class="{{ animation }} --order-{{ index + 1 }}
//       {{
//         '  w-full ' + (field.type == 'submit' ? ' col-span-ful ' : '  ') | mergeClasses: field.class
//       }}"
//     >
//       <div class="grow">
//         <ng-container
//           genericField
//           [control]="form.controls[field.key]"
//           [field]="field"
//           [formObservers]="formObservers"
//           [formSteppers]="formSteppers"
//           [group]="form"
//           (cancelForm)="cancelForm()"
//           (selectedValue)="selectedValue($event)"
//           (scrolledToTop)="scrolledToTop.emit($event)"
//           (scrolledToBottom)="scrolledToBottom.emit($event)"
//         ></ng-container>
//       </div>
//     </div>
//   }
// </ng-template>

//   `,
// })
// export class FormBkComponent implements OnInit {
//   @Input() fp!: FormParameters<any>;
//   subscriptions = new Subscription();

//   dfs = inject(DynamicFormService);
//   dialogData = inject(MAT_DIALOG_DATA, { optional: true });
//   dialogRef = inject(MatDialogRef<ResetComponent>, { optional: true });

//   form!: FormGroup;
//   filterFields = [];
//   fields: FieldConfig[] = [];
//   allFields: FieldConfig[] = [];

//   formObservers: ObserverParameter[] = [];
//   static isSaving$ = new BehaviorSubject<boolean>(false);
//   formValue: any;
//   isLoading = true;

//   dialogButtons: ActionButton[] = [
//     {
//       // icon: 'cancel',
//       label: 'Close',
//       iconClass: 'small',
//       click: () => this.closeThisModal(true),
//     },
//   ];

//   ngOnInit(): void {
//     if (this.dialogRef && this.dialogData) this.fp = { ...this.dialogData };

//     this.setFields();
//     this.retainExternalObservables(); // this has to come before setting internal ones
//     this.setInternalFieldsObservers();
//     this.setForm(this.fp?.model);
//     this.listenToObservers();
//     this.listenToActions();
//     this.handleFormSteppers();

//     this.isLoading = false;
//   }

//   handleFormSteppers() {
//     if (!this.fp?.formSteppers?.length) return;
//     if (!this.fp?.stepperAppearance) this.fp.stepperAppearance = 'fill';
//     if (['outline', 'fill'].includes(this.fp.stepperAppearance)) this.fp.showTitle = false;
//   }

//   setForm(formValue?: any) {
//     this.form = this.dfs.createControl(this.fields, { ...formValue }, this.fp.crossValidators);
//   }

//   setFields() {
//     // clone the fields so that the base fields are left unmutated for reference

//     let fields: FieldConfig[] = [];
//     if (this.fp.fields) fields = [...this.fp?.fields.map((f) => cloneDeep(f))];
//     if (this.fp.fieldsMap) fields = mapFields(fields, this.fp.fieldsMap);

//     this.fields = fields.map((field) => {
//       if (field.type === FieldType.input) {
//         const callback = field.onChange || ((event: any) => {});

//         field.onChange = (value, form, field) => {
//           callback(value, form, field);
//           this.notifyChanges(field);
//         };
//       }

//       // add saving event listener to save button
//       if (field.type === FieldType.button) field.isSaving$ = FormComponent.isSaving$;

//       return field;
//     });

//     this.filterFields = <any>this.fields.filter((field) => !!field.removeFieldsWhen);
//     this.allFields = [...this.fields];

//     if (this.fp.autoLabels !== false) setFieldLabels(this.allFields);
//   }

//   listenToActions() {
//     // if (this.fp?.closeAction) {
//     //   this.subscriptions.add(
//     //     this.actions$.pipe(ofType(this.fp?.closeAction)).subscribe((res) => {
//     //       this.closeThisModal(true);
//     //       if (this.fp.onCloseAction) this.fp.onCloseAction();
//     //     }),
//     //   );
//     // }

//     if (this.fp.internalUpdateNotifier) {
//       this.subscriptions.add(
//         this.fp.internalUpdateNotifier.subscribe((field) => this.notifyChanges(field)),
//       );
//     }
//   }

//   selectedData(data: any) {
//     const filterField = this.filterFields.find((f: any) => f.key === data.key);
//     if (filterField) this.handleFilterField(filterField, data);
//     this.notifyChanges(filterField || this.fields.find((f) => f.key === data.key));
//   }

//   valueChanged(event: any) {
//     this.formValue = event;
//     FormComponent.isSaving$.next(false); // Can be removed later
//   }

//   notifyChanges(field?: FieldConfig) {
//     if (field && this.fp?.onValueChanged) {
//       this.fp.onValueChanged(field, this.form?.get(field.key), this.form);
//     }

//     // Update disabled status
//     this.fields
//       .filter((f) => f.key !== field?.key)
//       .forEach((f) => this.dfs.setDisabled(f, <any>this.form));
//   }

//   handleFilterField(filterField: any, data: any) {
//     const keysToHide = filterField.removeFieldsWhen.keys;
//     const hideField = getFields(filterField.removeFieldsWhen.value)?.[0];

//     if (data?.object?.[hideField?.key] === hideField?.value) {
//       this.fields = this.allFields.filter((field) => !keysToHide.includes(field.key));
//     } else this.fields = [...this.allFields];

//     this.setForm({ ...this.form?.value });
//     const control = this.form?.get(filterField?.key);
//     if (control) control.setValue(data.value);
//   }

//   submitForm(formValues: any): void {
//     FormComponent.isSaving$.next(true);

//     // include disabled
//     if (this.fp.includeDisabled !== false) {
//       formValues = { ...formValues, ...this.form?.getRawValue() };
//       formValues = this.dfs.formatFormValues(formValues, this.fields);
//     }

//     //TODO: also handle nested keys i.e objs and objs arrays
//     const ingoredKeys = this.fields.filter((f) => !!f.ignoreOnSubmit).map((f) => f.key);
//     ingoredKeys.forEach((key) => delete formValues[key]);

//     if (this.fp?.onSubmit) this.fp.onSubmit(formValues);
//     if (this.fp?.closeOnSubmit) this.closeThisModal(true);
//   }

//   retainExternalObservables() {
//     this.fields.forEach((field) => {
//       const ob_paths = getPathsToObservables(field);
//       // use the original field to get some ref since this will be mutated
//       const og_field = this.fp.fields?.find((f) => f.key === field.key);

//       if (og_field) {
//         ob_paths.forEach((path) => {
//           // insert the same observable from the OG field
//           const observable = getPathValue(og_field, path);
//           setPathValue(field, path, observable);
//         });
//       }
//     });
//   }

//   setInternalFieldsObservers() {
//     this.formObservers = [];

//     this.fields.forEach((field) => {
//       const ob_paths = getPathsToObject(field, { type: 'observeParameter' });
//       // use the original field to get some ref since this will be mutated
//       const og_field = this.fp.fields?.find((f) => f.key === field.key);

//       // console.log(ob_paths);

//       ob_paths.forEach((path) => {
//         // add observer
//         if (!og_field) return;
//         const path_ = <string>stringBeforeLast(path, /fields\.\d+/, true);
//         const observerField = getPathValue(field, path_) ?? field;
//         const op_ = getPathValue(og_field, path);
//         const op: ObserverParameter = { ...op_, key: observerField.key, path };
//         // console.log({ op });

//         // get initial values from observed fields
//         const values: any = [];
//         const observedKeys = op.observedKeys.map((k) => k.split('.')[0]);
//         const path2Fields = stringBeforeLast(path, /fields+/, true);
//         const peerFields = path2Fields ? getPathValue(og_field, path2Fields) : this.fields;

//         observedKeys.forEach((key) => {
//           const field_ = peerFields?.find((f: any) => f.key === key);
//           const value_ = field_?.value ?? this.fp?.model?.[key];
//           values.push(value_);
//         });

//         // set mapper to function if object is passed
//         if (typeof op?.valueMapper === 'object') {
//           op.map = {};
//           const og: any = op.valueMapper;
//           const sep = '_';

//           // map the or's to separate keys // concat if string and has +
//           Object.keys(og).forEach((key) => {
//             const keyObj = getCombinations(key, og[key], sep);
//             const concat = typeof og[key] === 'string' && og[key].trim().startsWith('+');
//             const getValue = (k: any) =>
//               concat && og.hasOwnProperty(k) ? `${og[key]} ${og[k]}` : og[key];
//             const innerKeys = Object.keys(keyObj).filter((k) => !!k.trim());
//             const removeNulls = (key: string) => removeWords(key, ['undefined', 'null']).trim();
//             innerKeys.forEach((key_) => (op.map[removeNulls(key_)] = getValue(key_)));
//           });

//           // set the mapper from map object
//           op.valueMapper = (...v) => {
//             const mapHasProp = (prop: string) => op.map.hasOwnProperty(prop);
//             return mapHasProp(v.join(sep)) ? op.map?.[v.join(sep)] : op.map['else'];
//           };
//         }

//         // set the observer value from the observed values // if no mapper just take the first
//         let observerValue = values?.[0];

//         // if has context add the context as the last parameter
//         if (this.fp.context) {
//           const mapper_ = cloneDeep(op.valueMapper);
//           op.valueMapper = (...v) => mapper_(...[...v.concat([this.fp.context])]);
//         }

//         /// get initial value
//         if (op.valueMapper) observerValue = op.valueMapper(...values);

//         // add observable
//         this.formObservers.push(op);
//         op.observable = new BehaviorSubject(observerValue);
//         if (op.useObservable) setPathValue(field, path, op.observable);
//         else setPathValue(field, path, observerValue);

//         // console.log({ key: op.key, value: observerValue });
//       });
//     });
//   }

//   // listenToObservers() {
//   //   // all keys having showWhen property
//   //   this.allShowKeys = this.getWhenKeys('showWhen');
//   //   this.allSetKeys = this.getWhenKeys('setWhen');
//   //   this.allDisableKeys = this.getWhenKeys('disableWhen');
//   //   this.allObservedKeys = this.getObservedKeys();

//   //   let whenKeys = this.allShowKeys.concat(this.allSetKeys).concat(this.allDisableKeys);
//   //   let allEventKeys = [...new Set(whenKeys.concat(this.allObservedKeys))];

//   //   let control: AbstractControl = undefined;

//   //   allEventKeys.forEach((key) => {
//   //     control = this.form.get(key) ?? this.originalForm?.get(key);
//   //     if (!control) return;

//   //     let action$ = control.valueChanges.pipe(distinctUntilChanged());
//   //     this.subscriptions.add(action$.subscribe((value) => this.doFieldActions(key, value)));
//   //     this.doFieldActions(key, control.value); // for onload
//   //   });
//   // }

//   // async doFieldActions(key: string, value: any) {
//   //   let getFormChange = (key: string, value: any): FormChangeDetail => {
//   //     return {
//   //       key,
//   //       value,
//   //       form: this.form,
//   //       fields: this.fields,
//   //     };
//   //   };

//   //   // order is important
//   //   // handle fields observers1// onload is already handled on observer creation
//   //   if (this.allObservedKeys.includes(key)) {
//   //     let change = getFormChange(key, value);
//   //     change.observers = this.formObservers;
//   //     await new Promise((resolve, reject) => {
//   //       let promises = this.dfs.handleObservers(change);

//   //       promises.forEach(async (promise, index) => {
//   //         let affectedField = await promise;
//   //         this.upsertFields([affectedField]);
//   //         //resolve on the last observing field on the key
//   //         if (index === promises.length - 1) resolve(true);
//   //       });
//   //     });
//   //   }

//   //   // handle conditional changes in field props
//   //   if (this.allSetKeys.includes(key)) {
//   //     let change = getFormChange(key, value);
//   //     let affectedFields = await this.dfs.handleSetWhen(change);
//   //     this.upsertFields(affectedFields);
//   //   }

//   //   // handle conditional fields visibility
//   //   if (this.allShowKeys.includes(key)) {
//   //     let change = getFormChange(key, value);
//   //     let affectedFields = await this.dfs.handleShowWhen(change);
//   //     this.upsertFields(affectedFields);
//   //   }

//   //   // Update disabled status
//   //   if (this.allDisableKeys.includes(key)) {
//   //     let change = getFormChange(key, value);
//   //     let affectedFields = await this.dfs.handleDisableWhen(change);
//   //     this.upsertFields(affectedFields);
//   //   }

//   //   this.cdr.detectChanges();
//   // }

//   // upsertFields(fields: FieldConfig[]) {
//   //   //affect fields //affect the one in steps too
//   //   this.fields = findReplace(this.fields, fields, 'key');

//   //   this.formSteppers.forEach(
//   //     (s: FormStepper) => (s.fields = findReplace(s?.fields ?? [], fields, 'key')),
//   //   );
//   // }

//   //   onSubmit(event: Event) {
//   //   this.submit.emit(this.dfs.onSubmit(event, this.form, this.fields, this.formSteppers));
//   // }

//   // onProceed(step: FormStepper, index: number, stepper: MatStepper) {
//   //   this.stepper = this.stepper ?? stepper;
//   //   if (!step.onSubmit) return this.stepper.next();

//   //   this.stepValue = this.dfs?.onSubmit(<any>undefined, <any>step.formGroup, <any>step.fields);

//   //   if (!areObjectsEqual(this.stepValue, <any>step.value)) {
//   //     if (!step.hasOwnProperty('onSubmit')) this.submit.emit(step);
//   //     else step.onSubmit(this.stepValue, step);
//   //   }
//   // }

//   // handleProceedAction(step: FormStepper, index: number) {
//   //   //update step's value on success save // proceed
//   //   step.value = this.stepValue;
//   //   if (this.formSteppers.length - 1 === index) this.stepperClose.emit(true);
//   //   else this.stepper?.next();
//   // }

//   // async viewInvalid(stepForm: FormGroup | undefined) {
//   //   if (!stepForm) return;
//   //   let dis = await this.notify.error(this.dfs.getFormInvalidMsg(stepForm, []));

//   //   // getInvalidControls(stepForm, []).forEach((inv: InvalidControl) => {
//   //   //   this.ds.highlightFormField(inv.key, this.r2);
//   //   // });
//   // }

//   closeThisModal(close: boolean) {
//     this.formObservers.forEach((obs) => obs?.observable?.complete());
//     this.formObservers = [];

//     FormComponent.isSaving$.next(false);
//     if (this.fp.onModalClose) this.fp.onModalClose(this);

//     try {
//       if (close && this.dialogRef) this.dialogRef.close();
//     } catch (er) {}
//   }
// }
