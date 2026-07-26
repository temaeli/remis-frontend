import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

@Injectable({
  providedIn: 'root',
})
export class SecurityFormSubmissionFieldsService {
  private formFieldsSubject = new BehaviorSubject<FieldConfig[]>([]);
  public formFields$ = this.formFieldsSubject.asObservable();

  /**
   * Generate dynamic values fields based on selected form fields
   * Creates ONE nested field configuration that will be used for each FormGroup in the FormArray
   */
  generateValueFields(selectedFormFields?: any[]): FieldConfig[] {
    // ALWAYS return the same structure, whether selectedFormFields is provided or not
    // This ensures consistency across initial form creation and form field loading
    return [
      {
        key: 'fieldKey',
        label: 'Field Key',
        type: FieldType.input,
        validations: [VALIDATOR_REQUIRED],
        visible: false,
      },
      {
        key: 'fieldType',
        label: 'Field Type',
        type: FieldType.input,
        validations: [],
        visible: false,
      },
      {
        key: 'fieldOptions',
        label: 'Field Options',
        type: FieldType.input,
        validations: [],
        visible: false,
      },
      {
        key: 'fieldLabel',
        label: 'Field',
        type: FieldType.label,
        validations: [],
        class: 'col-span-1 md:col-span-2 font-semibold text-lg',
      },
      {
        key: 'valueText',
        label: 'Value',
        type: FieldType.textarea,
        validations: [],
        class: 'col-span-1 md:col-span-2',
        showWhen: [{ key: 'fieldType', value: ['TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'TABLE'] }],
      },
      {
        key: 'valueSelect',
        label: 'Value',
        type: FieldType.select,
        options: [],
        validations: [],
        class: 'col-span-1 md:col-span-2',
        visible: false,
        showWhen: [{ key: 'fieldType', value: ['SELECT', 'MULTISELECT'] }],
        setWhen: [
          {
            when: [{ key: 'fieldOptions' }],
            field: {
              options_: (csv: string) => {
                if (!csv) return [];
                return csv.split(',').map((o: string) => ({ label: o.trim(), value: o.trim() }));
              },
            } as any,
          },
        ],
      },
      {
        key: 'valueNumber',
        label: 'Value',
        type: FieldType.number,
        validations: [],
        class: 'col-span-1 md:col-span-2',
        visible: false,
        showWhen: [{ key: 'fieldType', value: ['NUMBER'] }],
      },
      {
        key: 'valueDate',
        label: 'Value',
        type: FieldType.date,
        validations: [],
        class: 'col-span-1 md:col-span-2',
        visible: false,
        showWhen: [{ key: 'fieldType', value: ['DATE'] }],
      },
      {
        key: 'valueBoolean',
        label: 'Value',
        type: FieldType.toggle,
        validations: [],
        class: 'col-span-1 md:col-span-2',
        visible: false,
        showWhen: [{ key: 'fieldType', value: ['TOGGLE'] }],
      },
    ];
  }

  /**
   * Map backend field types to frontend FieldType
   */
  private mapFieldType(backendType: string): FieldType {
    const typeMap: { [key: string]: FieldType } = {
      TEXT: FieldType.input,
      TEXTAREA: FieldType.textarea,
      NUMBER: FieldType.number,
      DATE: FieldType.date,
      TOGGLE: FieldType.toggle,
      SELECT: FieldType.select,
      MULTISELECT: FieldType.multiple_select,
      EMAIL: FieldType.input,
      PHONE: FieldType.phoneInput,
      TABLE: FieldType.table,
    };

    return typeMap[backendType] || FieldType.input;
  }

  /**
   * Parse CSV options into array
   */
  private parseOptions(optionsCsv: string): any[] {
    if (!optionsCsv) return [];
    return optionsCsv.split(',').map((opt) => ({ label: opt.trim(), value: opt.trim() }));
  }

  /**
   * Default value fields when no form is selected
   */
  private getDefaultValueFields(): FieldConfig[] {
    return [
      {
        key: 'fieldKey',
        label: 'Field Key',
        type: FieldType.input,
        validations: [VALIDATOR_REQUIRED],
      },
      { key: 'valueText', label: 'Text Value', type: FieldType.input, validations: [] },
      { key: 'valueNumber', label: 'Number Value', type: FieldType.number, validations: [] },
      { key: 'valueDate', label: 'Date Value', type: FieldType.date, validations: [] },
      { key: 'valueBoolean', label: 'Boolean Value', type: FieldType.toggle, validations: [] },
    ];
  }

  /**
   * Update the form fields observable
   */
  updateFormFields(fields: FieldConfig[]): void {
    this.formFieldsSubject.next(fields);
  }
}
