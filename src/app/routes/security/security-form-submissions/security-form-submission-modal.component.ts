import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Inject, Optional, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GenericFormComponent } from '@shared/components/generic-form/generic-form.component';
import { FieldConfig } from '@shared/components/generic-form/field.interface';
import { FetchService } from '@shared/fetch/fetch.service';
import { GET_SECURITY_FORM_FIELDS } from './security-form-submission.graphql';
import { getSecurityFormSubmissionFormFields } from './security-form-submission.form';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'security-form-submission-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, GenericFormComponent],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4">Form Submission</h2>

      <!-- Form -->
      <generic-form
        [fields]="formFields"
        [formData]="initialData"
        [form]="form"
        (submit)="onSubmit($event)"
        (closeForm)="onCancel()"
      />

      <!-- Verification: Show FormArray entry labels -->
      <!-- <div *ngIf="getValuesArray().length > 0" class="mb-4 p-3 bg-green-50 border border-green-300 rounded text-xs">
        <div><strong>✅ Form Entries (showing field labels you need to fill):</strong></div>
        <div *ngFor="let entry of getValuesArray(); let i = index" class="ml-2 font-medium text-green-700">
          {{ i + 1 }}. {{ entry.get('fieldLabel')?.value }}
        </div>
      </div> -->

      <!-- Action Buttons (fallback if generic-form doesn't show them) -->
      <div class="flex gap-2 justify-end mt-6">
        <button
          mat-raised-button
          (click)="onCancel()"
          class="bg-gray-300 hover:bg-gray-400 text-gray-900"
        >
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onSubmit(form.value)"
          [disabled]="form.invalid"
        >
          Submit
        </button>
      </div>
    </div>
  `,
})
export class SecurityFormSubmissionModalComponent implements OnInit, OnDestroy, AfterViewInit {
  formFields: FieldConfig[] = [];
  selectedFormFields: any[] = [];
  form: FormGroup;

  private destroy$ = new Subject<void>();
  initialData: any = {};

  constructor(
    private fs: FetchService,
    private dialogRef: MatDialogRef<SecurityFormSubmissionModalComponent>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any,
  ) {
    this.initialData = data?.row ?? {};
    this.form = this.fb.group({});
  }

  async ngOnInit(): Promise<void> {
    // Initialize form fields with base fields first
    const baseFormFields = getSecurityFormSubmissionFormFields();
    this.formFields = baseFormFields;

    console.log('Initial form fields:', this.formFields);
    console.log('formUid field:', baseFormFields.find((f) => f.key === 'formUid'));
    console.log('Initial data:', this.initialData);

    // Build form with controls from field definitions
    this.buildFormControls(baseFormFields);

    // Set initial form values from data using patchValue
    console.log('Setting initial form values...');
    const formValue: any = {};

    const formUid = this.initialData?.formUid || this.initialData?.form?.uid;
    if (formUid) {
      formValue.formUid = formUid;
      console.log('Setting formUid:', formUid);
    }

    const stationUid = this.initialData?.stationUid || this.initialData?.station?.uid;
    if (stationUid) {
      formValue.stationUid = stationUid;
      console.log('Setting stationUid:', stationUid);
    }

    if (this.initialData?.periodStart) {
      formValue.periodStart = this.initialData.periodStart;
      console.log('Setting periodStart:', this.initialData.periodStart);
    }

    if (this.initialData?.periodEnd) {
      formValue.periodEnd = this.initialData.periodEnd;
      console.log('Setting periodEnd:', this.initialData.periodEnd);
    }

    if (Object.keys(formValue).length > 0) {
      this.form.patchValue(formValue);
      console.log('Patched form values:', formValue);
    }

    // If editing, load existing data and form fields
    if (formUid) {
      console.log('Loading form fields for formUid:', formUid);
      await this.loadFormFields(formUid);
    }
  }

  private buildFormControls(fields: FieldConfig[], selectedFormFields?: any[]): void {
    const controls: any = {};
    const existingValues: any = {};

    // Preserve existing form values before rebuilding
    if (this.form) {
      existingValues.formUid = this.form.get('formUid')?.value;
      existingValues.stationUid = this.form.get('stationUid')?.value;
      existingValues.periodStart = this.form.get('periodStart')?.value;
      existingValues.periodEnd = this.form.get('periodEnd')?.value;
    }

    fields.forEach((field) => {
      // For formGroupArray fields, create a FormArray
      if (field.type === 'formGroupArray') {
        // Just create an empty FormArray
        // The generic-form component will render entries based on field.fields template
        const formArray = this.fb.array([]);

        // If we have selectedFormFields, pre-populate the FormArray with entries
        // so the user sees them immediately without having to click "Add"
        if (selectedFormFields && selectedFormFields.length > 0) {
          selectedFormFields.forEach((selectedField: any) => {
            const groupControls: any = {
              fieldKey: [selectedField.fieldKey],
              fieldLabel: [selectedField.required ? `${selectedField.label} *` : selectedField.label],
              fieldType: [selectedField.fieldType || 'TEXT'],
              fieldOptions: [selectedField.optionsCsv || ''],
              valueText: [''],
              valueSelect: [''],
              valueNumber: [''],
              valueDate: [''],
              valueBoolean: [false],
            };
            (formArray as any).push(this.fb.group(groupControls));
          });
          console.log(
            `✅ Pre-populated FormArray "${field.key}" with ${selectedFormFields.length} entries`,
          );
        }

        controls[field.key] = formArray;
      } else {
        const validatorList: any[] = [];

        // Convert field validations to Angular validators
        if (field.validations && Array.isArray(field.validations)) {
          field.validations.forEach((validation: any) => {
            if (validation.type === 'required') {
              validatorList.push(Validators.required);
            } else if (validation.type === 'minLength') {
              validatorList.push(Validators.minLength(validation.value || 1));
            } else if (validation.type === 'maxLength') {
              validatorList.push(Validators.maxLength(validation.value || 255));
            } else if (validation.type === 'pattern') {
              validatorList.push(Validators.pattern(validation.value));
            } else if (validation.type === 'email') {
              validatorList.push(Validators.email);
            } else if (validation.type === 'min') {
              validatorList.push(Validators.min(validation.value || 0));
            } else if (validation.type === 'max') {
              validatorList.push(Validators.max(validation.value || 999999));
            }
          });
        }

        // Use existing value if available, otherwise empty string
        const initialValue = existingValues[field.key] !== undefined ? existingValues[field.key] : '';
        controls[field.key] = [initialValue, validatorList.length > 0 ? validatorList : []];
      }
    });
    this.form = this.fb.group(controls);
    console.log('Built form controls:', Object.keys(controls));
  }

  async loadFormFields(formUid: string): Promise<void> {
    try {
      console.log('Loading form fields for formUid:', formUid);
      const res = await this.fs.fetch({
        query: GET_SECURITY_FORM_FIELDS,
        variables: { formUid },
      });

      console.log('=== GraphQL Response Full Object ===');
      console.log('Response:', res);
      console.log('Response is array?:', Array.isArray(res));
      console.log('Response keys:', Object.keys(res || {}));
      console.log('res.securityFormFields:', res?.securityFormFields);
      console.log('res.data:', res?.data);

      // The response might be the array directly, or nested in an object
      let fields = Array.isArray(res)
        ? res
        : res?.securityFormFields ?? res?.data?.securityFormFields ?? res?.data ?? [];
      console.log('Extracted fields:', fields);

      this.selectedFormFields = Array.isArray(fields) ? fields : [];
      console.log(
        'Loaded form fields count:',
        this.selectedFormFields.length,
      );
      console.log('Loaded form fields:', this.selectedFormFields);

      if (this.selectedFormFields.length === 0) {
        console.warn(
          '⚠️ No form fields returned from backend for formUid:',
          formUid,
        );
      }

      // Regenerate form fields configuration WITH the selected form fields
      const newFormFields = getSecurityFormSubmissionFormFields(
        this.selectedFormFields ?? [],
      );
      console.log('New form fields with values nested:', newFormFields);

      // Log the values field details
      const valuesField = newFormFields.find((f) => f.key === 'values');
      console.log('Values field:', valuesField);
      if (valuesField && valuesField.fields) {
        console.log('Values field.fields count:', valuesField.fields.length);
        console.log('Values field.fields:', valuesField.fields);
      }

      // Update formFields array, creating a new reference to trigger change detection
      this.formFields = [...newFormFields];
      console.log('Updated this.formFields:', this.formFields);

      // Trigger initial change detection so generic-form component sees the template
      this.cdr.detectChanges();

      // IMPORTANT: Now that generic-form has seen the template, update the FormArray entries
      // The form structure is already built in ngOnInit
      const valuesControl = this.form.get('values') as any;
      if (valuesControl && valuesControl.length !== this.selectedFormFields.length) {
        // Clear and rebuild FormArray
        while (valuesControl.length > 0) {
          valuesControl.removeAt(0);
        }

        // Add entries for each selected field
        this.selectedFormFields.forEach((selectedField: any) => {
          const groupControls: any = {
            fieldKey: [selectedField.fieldKey],
            fieldLabel: [selectedField.required ? `${selectedField.label} *` : selectedField.label],
            fieldType: [selectedField.fieldType || 'TEXT'],
            fieldOptions: [selectedField.optionsCsv || ''],
            valueText: [''],
            valueSelect: [''],
            valueNumber: [''],
            valueDate: [''],
            valueBoolean: [false],
          };
          valuesControl.push(this.fb.group(groupControls));
        });

        console.log(
          `✅ Updated FormArray with ${this.selectedFormFields.length} entries`,
        );
      }

      // CRITICAL: Refresh formFields reference and force final change detection
      // This tells generic-form to update the FormArray display
      this.formFields = [...this.formFields];

      this.ngZone.run(() => {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });

      console.log('Updated formFields:', this.formFields);
    } catch (error) {
      console.error('❌ Failed to load form fields:', error);
      this.selectedFormFields = [];
    }
  }

  async onFormUidChange(formUid: string): Promise<void> {
    console.log('Form UID changed to:', formUid);
    await this.loadFormFields(formUid);
  }

  onSubmit(data: any): void {
    console.log('Form submitted with data:', data);
    // Close dialog and return the form data
    this.dialogRef.close(data);
  }

  onCancel(): void {
    console.log('Form cancelled');
    this.dialogRef.close(null);
  }

  getValuesArray(): any[] {
    const valuesControl = this.form.get('values');
    return valuesControl ? (valuesControl as any).controls || [] : [];
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Setting up form listeners');
    // Now that the form is built and the component is initialized, set up the listener
    if (this.form) {
      const formUidControl = this.form.get('formUid');
      console.log('formUidControl found:', !!formUidControl);
      console.log('formUidControl value:', formUidControl?.value);

      if (formUidControl) {
        console.log('Setting up formUid listener from AfterViewInit');
        formUidControl.valueChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe((formUid: string) => {
            console.log('formUid changed to:', formUid);
            if (formUid && formUid !== '') {
              console.log('Calling onFormUidChange with:', formUid);
              this.onFormUidChange(formUid);
            } else {
              console.log('formUid is empty, skipping loadFormFields');
            }
          });
      } else {
        console.warn('formUid control not found!');
      }
    } else {
      console.warn('Form not initialized in ngAfterViewInit!');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
