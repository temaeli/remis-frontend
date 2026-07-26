import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewContainerRef,
  inject,
  ComponentRef,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { FieldConfig, FieldType, FormStepper, ObserverParameter } from './field.interface';
import { InputComponent } from './input/input.component';
import { SelectComponent } from './select/select.component';
import { DateComponent } from './date/date.component';
import { RadiobuttonComponent } from './radiobutton/radiobutton.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { Subscription } from 'rxjs';
import { AttachmentComponent } from './attachment/attachment.component';
import { TextareaComponent } from './textarea/textarea.component';
import { DateRangeComponent } from './date-range/dateRange.component';
import { AttachmentListComponent } from './attachment-list/attachment-list.component';
import { FormGroupArrayComponent } from './form-group-array/form-group-array.component';
import { DateTimeComponent } from './date-time/date-time.component';
import { LabelComponent } from './label/label.component';
import { ToggleComponent } from './toggle/toggle.component';
import { RadioGroupComponent } from './radio-group/radio-group.component';
import { FormDetailsComponent } from './details/details.component';
import { FormGroupComponent } from './form-group/form-group.component';
import { ToggleButtonsGroupComponent } from './toggle-buttons-group/toggle-buttons-group.component';
import { TableComponent } from './table/table.component';
import { ButtonComponent } from './button/button.component';
import { SubmitComponent } from './submit/submit.component';
import { getFirstError } from './field-helpers';

const componentMapper: any = {
  input: InputComponent,
  number: InputComponent,
  decimal: InputComponent,
  button: ButtonComponent,
  submit: SubmitComponent,
  select: SelectComponent,
  multiple_select: SelectComponent,
  attachment: AttachmentComponent,
  attachmentList: AttachmentListComponent,
  date: DateComponent,
  dateTime: DateTimeComponent,
  dateRange: DateRangeComponent,
  radiobutton: RadiobuttonComponent,
  checkbox: CheckboxComponent,
  toggle: ToggleComponent,
  textarea: TextareaComponent,
  formGroupArray: FormGroupArrayComponent,
  formGroup: FormGroupComponent,
  label: LabelComponent,
  details: FormDetailsComponent,
  radioGroup: RadioGroupComponent,
  toggleButtonsGroup: ToggleButtonsGroupComponent,
  table: TableComponent,
};

@Directive({
  selector: '[genericField]',
  standalone: true,
})
export class GenericFieldDirective implements OnInit, OnChanges, OnDestroy {
  @Input() field?: FieldConfig;
  @Input() group?: FormGroup;
  @Input() control?: FormGroup | AbstractControl<any, any>;
  @Input() formSteppers?: FormStepper[];
  @Input() formObservers?: ObserverParameter[];

  @Output() selectedValue = new EventEmitter();
  @Output() cancelForm = new EventEmitter();
  @Output() scrolledToBottom = new EventEmitter();
  @Output() scrolledToTop = new EventEmitter();

  compRef?: ComponentRef<any>;

  private cdr = inject(ChangeDetectorRef);
  private container = inject(ViewContainerRef);

  ngOnInit(): void {
    this.clear();

    let sub = new Subscription();
    const type: string = this.field?.type as any;

    // Modern approach: directly create component without factory
    const component = componentMapper[type];

    if (this.field) {
      if (type === FieldType.number) this.field.inputType = 'number';
      if (type === FieldType.multiple_select) this.field.multiple = true;
    }

    this.compRef = this.container.createComponent(component);

    this.compRef.instance.field = this.field;
    this.compRef.instance.group = this.group;
    this.compRef.instance.formSteppers = this.formSteppers;
    this.compRef.instance.control = this.control;
    this.compRef.instance.formObservers = this.formObservers;
    this.compRef.instance.getErrorFn = getFirstError;

    if (type === FieldType.select || type === FieldType.checkbox) {
      sub = this.compRef.instance.selectedValue.subscribe((x: any) => this.selectedValue.emit(x));
      this.compRef.onDestroy(() => sub.unsubscribe());
    }

    if (type === FieldType.select) {
      sub.add(
        this.compRef.instance.scrolledToBottom.subscribe((x: any) => this.scrolledToBottom.emit(x)),
      );

      sub.add(
        this.compRef.instance.scrolledToTop.subscribe((x: any) => this.scrolledToTop.emit(x)),
      );
    }
  }

  ngOnDestroy(): void {
    this.compRef?.destroy();
  }

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  clear() {
    this.container.clear();
  }
}
