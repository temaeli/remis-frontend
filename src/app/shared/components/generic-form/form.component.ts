import { Component, OnInit, Input, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DynamicFormService } from './generic-form.service';
import { getCombinations, setFieldLabels } from './field-helpers';
import { FieldConfig, ObserverParameter, FieldType } from './field.interface';
import { mapFields } from './form.helpers';
import { FormParameters } from './form.interface';
import { GenericFormComponent } from './generic-form.component';
import { DetailsHeaderComponent } from '../details/details-header/details-header.component';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { CommonModule } from '@angular/common';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { getPathValue, removeWords, setPathValue, stringBeforeLast } from '@core/helpers';
import { cloneDeep, getPathsToObject, getPathsToObservables } from '@core/helpers';
import { getFields } from '../details/util/field/fields.helper';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    GenericFormComponent,
    DetailsHeaderComponent,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    ActionButtonsComponent,
    DragDropModule,
    MergeClassesPipe,
  ],
  template: `
    @if (dialogRef) {
      @if (fp.title || fp.icon) {
        <details-header
          cdkDrag
          cdkDragHandle
          cdkDragRootElement=".cdk-overlay-pane"
          [title]="fp.title"
          [icon]="fp.icon"
          class="border-b border-b-gray-200 cursor-drag"
        />
      }

      <mat-dialog-content>
        <ng-container [ngTemplateOutlet]="formTpl" />
      </mat-dialog-content>

      @if (fp.showFooter !== false) {
        <mat-dialog-actions>
          <action-buttons
            class="inline-flex flex-wrap gap-2  "
            [actionButtons]="dialogButtons.concat(actionButtons)"
          />
        </mat-dialog-actions>
      }
      <!--  -->
    } @else {
      <ng-container [ngTemplateOutlet]="formTpl" />

      @if (fp.showFooter !== false) {
        <action-buttons
          class="{{ 'flex flex-wrap gap-2 mx-1 ' | mergeClasses: fp.footerClass }}"
          [actionButtons]="actionButtons"
        />
      }
    }

    <ng-template #formTpl>
      @if (fields.length && !!form && !isLoading) {
        <generic-form
          [fields]="fields"
          [formSteppers]="fp.formSteppers ?? []"
          [linearSteppers]="fp.linearSteppers ?? true"
          [stepperOrientation]="fp.stepperOrientation ?? 'horizontal'"
          [stepperLabelPosition]="fp.stepperLabelPosition ?? 'end'"
          [stepperAppearance]="fp.stepperAppearance ?? 'fill'"
          [showStepperCancel]="fp.showStepperCancel ?? true"
          [form]="form"
          [fieldsClass]="fp.fieldsClass"
          [outerClass]="fp.outerClass"
          [formObservers]="formObservers"
          (stepperClose)="closeThisModal($event)"
          (submit)="submitForm($event)"
          (selectedData)="selectedData($event)"
          [emitChange]="true"
          (change)="valueChanged($event)"
        />
      } @else {
        <ng-template #noFieldsTpl> No Fields ?? </ng-template>
      }
    </ng-template>
  `,
})
export class FormComponent implements OnInit {
  @Input() fp!: FormParameters<any>;
  subscriptions = new Subscription();

  dfs = inject(DynamicFormService);
  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<FormComponent>, { optional: true });

  form!: FormGroup;
  filterFields = [];
  fields: FieldConfig[] = [];
  allFields: FieldConfig[] = [];

  formObservers: ObserverParameter[] = [];
  isSaving$ = new BehaviorSubject<boolean>(false);
  formValue: any;
  isLoading = true;

  actionButtons: ActionButton[] = [
    {
      // icon: 'cancel',
      label: 'Submit',
      slug: 'submit-button',
      class: 'submit-button bg-primary text-white',
      iconClass: 'small',
      loading: this.isSaving$,
      click: () => {
        this.form.updateValueAndValidity();
        this.form.invalid ? this.form.markAllAsTouched() : this.submitForm(this.form.value);
      },
    },
  ];

  dialogButtons: ActionButton[] = [
    {
      // icon: 'cancel',
      label: 'Close',
      iconClass: 'small',
      click: () => this.closeThisModal(true),
    },
  ];

  ngOnInit(): void {
    if (this.dialogRef && this.dialogData) this.fp = { ...this.dialogData };

    this.setFields();
    this.retainExternalObservables(); // this has to come before setting internal ones
    this.setInternalFieldsObservers();
    this.setForm(this.fp?.model);

    this.listenToActions();
    this.handleFormSteppers();

    this.isLoading = false;
  }

  handleFormSteppers() {
    if (!this.fp?.formSteppers?.length) return;
    if (!this.fp?.stepperAppearance) this.fp.stepperAppearance = 'fill';
    if (['outline', 'fill'].includes(this.fp.stepperAppearance)) this.fp.showTitle = false;
  }

  setForm(formValue?: any) {
    this.form = this.dfs.createControl(this.fields, { ...formValue }, this.fp.crossValidators);
  }

  setFields() {
    // clone the fields so that the base fields are left unmutated for reference

    let fields: FieldConfig[] = [];
    if (this.fp.fields) fields = [...this.fp?.fields.map((f) => cloneDeep(f))];
    if (this.fp.fieldsMap) fields = mapFields(fields, this.fp.fieldsMap);

    if (fields.find((f) => f.type === FieldType.submit)) {
      this.actionButtons = this.actionButtons.filter((b) => b.slug !== 'submit-button');
    }

    this.fields = fields.map((field) => {
      if (this.fp.appearance) field.appearance = this.fp.appearance;

      if (field.type === FieldType.input) {
        const callback = field.onChange || ((event: any) => {});

        field.onChange = (value, form, field) => {
          callback(value, form, field);
          this.notifyChanges(field);
        };
      }

      // add saving event listener to save button
      if (field.type === FieldType.submit) {
        field.isSaving$ = field.isSaving$ ?? this.isSaving$;
      }

      return field;
    });

    this.filterFields = this.fields.filter((field) => !!field.removeFieldsWhen) as any;
    this.allFields = [...this.fields];

    if (this.fp.autoLabels !== false) setFieldLabels(this.allFields);
  }

  listenToActions() {
    if (this.fp?.closeAction$) {
      this.subscriptions.add(
        this.fp?.closeAction$.subscribe((res) => {
          this.closeThisModal(true);
          if (this.fp.onCloseAction) this.fp.onCloseAction();
        }),
      );
    }

    if (this.fp.internalUpdateNotifier) {
      this.subscriptions.add(
        this.fp.internalUpdateNotifier.subscribe((field) => this.notifyChanges(field)),
      );
    }
  }

  selectedData(data: any) {
    const filterField = this.filterFields.find((f: any) => f.key === data.key);
    if (filterField) this.handleFilterField(filterField, data);
    this.notifyChanges(filterField || this.fields.find((f) => f.key === data.key));
  }

  valueChanged(event: any) {
    this.formValue = event;
    this.isSaving$.next(false); // Can be removed later
  }

  notifyChanges(field?: FieldConfig) {
    if (field && this.fp?.onValueChanged) {
      this.fp.onValueChanged(field, this.form?.get(field.key), this.form);
    }

    // Update disabled status
    this.fields
      .filter((f) => f.key !== field?.key)
      .forEach((f) => this.dfs.setDisabled(f, (this.form as any)));
  }

  handleFilterField(filterField: any, data: any) {
    const keysToHide = filterField.removeFieldsWhen.keys;
    const hideField = getFields(filterField.removeFieldsWhen.value)?.[0];

    if (data?.object?.[hideField?.key] === hideField?.value) {
      this.fields = this.allFields.filter((field) => !keysToHide.includes(field.key));
    } else this.fields = [...this.allFields];

    this.setForm({ ...this.form?.value });
    const control = this.form?.get(filterField?.key);
    if (control) control.setValue(data.value);
  }

  async submitForm(formValues: any): Promise<void> {
    this.isSaving$.next(true);

    // include disabled
    if (this.fp.includeDisabled !== false) {
      formValues = { ...formValues, ...this.form?.getRawValue() };
    }

    const removeIgnored = (data: any, fields: any[]) => {
      if (!data || typeof data !== 'object') return;

      if (Array.isArray(data)) {
        data.forEach((item) => removeIgnored(item, fields));
        return;
      }

      Object.entries(data).forEach(([key, value]) => {
        const field = fields.find((f) => f.key === key);
        if (!field) return;

        if (field.ignoreOnSubmit) {
          delete data[key];
          return; // stop processing this key
        }

        if (field.fields?.length) {
          removeIgnored(value, field.fields);
        }
      });
    };

    removeIgnored(formValues, this.fields);

    if (this.fp?.onSubmit) {
      await this.fp.onSubmit(formValues, { form: this.form, isSaving$: this.isSaving$ });
    }

    if (this.fp?.closeOnSubmit) this.closeThisModal(true);

    this.isSaving$.next(false);
  }

  retainExternalObservables() {
    this.fields.forEach((field) => {
      const ob_paths = getPathsToObservables(field);
      // use the original field to get some ref since this will be mutated
      const og_field = this.fp.fields?.find((f) => f.key === field.key);

      if (og_field) {
        ob_paths.forEach((path) => {
          // insert the same observable from the OG field
          const observable = getPathValue(og_field, path);
          setPathValue(field, path, observable);
        });
      }
    });
  }

  setInternalFieldsObservers() {
    this.formObservers = [];

    this.fields.forEach((field) => {
      const ob_paths = getPathsToObject(field, { type: 'observeParameter' });
      // use the original field to get some ref since this will be mutated
      const og_field = this.fp.fields?.find((f) => f.key === field.key);

      // console.log(ob_paths);

      ob_paths.forEach((path) => {
        // add observer
        if (!og_field) return;
        const path_ = stringBeforeLast(path, /fields\.\d+/, true) as string;
        const observerField = getPathValue(field, path_) ?? field;
        const op_ = getPathValue(og_field, path);
        const op: ObserverParameter = { ...op_, key: observerField.key, path };
        // console.log({ op });

        // get initial values from observed fields
        const values: any = [];
        const observedKeys = op.observedKeys.map((k) => k.split('.')[0]);
        const path2Fields = stringBeforeLast(path, /fields+/, true);
        const peerFields = path2Fields ? getPathValue(og_field, path2Fields) : this.fields;

        observedKeys.forEach((key) => {
          const field_ = peerFields?.find((f: any) => f.key === key);
          const value_ = field_?.value ?? this.fp?.model?.[key];
          values.push(value_);
        });

        // set mapper to function if object is passed
        if (typeof op?.valueMapper === 'object') {
          op.map = {};
          const og: any = op.valueMapper;
          const sep = '_';

          // map the or's to separate keys // concat if string and has +
          Object.keys(og).forEach((key) => {
            const keyObj = getCombinations(key, og[key], sep);
            const concat = typeof og[key] === 'string' && og[key].trim().startsWith('+');
            const getValue = (k: any) =>
              concat && og.hasOwnProperty(k) ? `${og[key]} ${og[k]}` : og[key];
            const innerKeys = Object.keys(keyObj).filter((k) => !!k.trim());
            const removeNulls = (key: string) => removeWords(key, ['undefined', 'null']).trim();
            innerKeys.forEach((key_) => (op.map[removeNulls(key_)] = getValue(key_)));
          });

          // set the mapper from map object
          op.valueMapper = (...v) => {
            const mapHasProp = (prop: string) => op.map.hasOwnProperty(prop);
            return mapHasProp(v.join(sep)) ? op.map?.[v.join(sep)] : op.map['else'];
          };
        }

        // set the observer value from the observed values // if no mapper just take the first
        let observerValue = values?.[0];

        // if has context add the context as the last parameter
        if (this.fp.context) {
          const mapper_ = cloneDeep(op.valueMapper);
          op.valueMapper = (...v) => mapper_(...[...v.concat([this.fp.context])]);
        }

        /// get initial value
        if (op.valueMapper) observerValue = op.valueMapper(...values);

        // add observable
        this.formObservers.push(op);
        op.observable = new BehaviorSubject(observerValue);
        if (op.useObservable) setPathValue(field, path, op.observable);
        else setPathValue(field, path, observerValue);

        // console.log({ key: op.key, value: observerValue });
      });
    });
  }

  closeThisModal(close: boolean) {
    this.formObservers.forEach((obs) => obs?.observable?.complete());
    this.formObservers = [];

    this.isSaving$.next(false);
    if (this.fp.onModalClose) this.fp.onModalClose(this);

    try {
      if (close && this.dialogRef) this.dialogRef.close();
    } catch (er) {}
  }
}
