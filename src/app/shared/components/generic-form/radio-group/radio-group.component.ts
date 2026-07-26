import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { ReplacePipe } from '../../../pipes/replace.pipe';

@Component({
  selector: 'app-checkbox',
  imports: [ReactiveFormsModule, CommonModule, MatRadioModule, ReplacePipe],
  template: `
    <div
      class="w-full margin-top border border-gray-200 rounded-lg p-1 px-3
      {{ field.innerClass }} mb-3 bg-light"
      [formGroup]="group"
    >
      <span class="pe-3"> {{ field.label }} </span>

      <mat-radio-group [formControlName]="field.key" (change)="toggleCheckbox($event)">
        <mat-radio-button *ngFor="let option of field.options" [value]="option?.value ?? option">
          @if (field.removeUnderscore === false) {
            {{ option?.label ?? option?.[field.labelKey ?? 'name'] ?? option | replace: '_' : ' ' }}
          } @else {
            {{ option?.label ?? option?.[field.labelKey ?? 'name'] ?? option }}
          }
        </mat-radio-button>
      </mat-radio-group>
    </div>
  `,
})
export class RadioGroupComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  @Output() selectedValue = new EventEmitter();

  ngOnInit() {}

  toggleCheckbox(event: any) {
    this.selectedValue.emit({ value: event.value, field: this.field });
    if (this.field.onChange) this.field.onChange(event.value, this.group, this.field);
  }
}
