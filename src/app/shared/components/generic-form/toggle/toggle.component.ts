import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [MatSlideToggle, ReactiveFormsModule, MatFormFieldModule],
  template: `
    <div
      class="w-full margin-top border border-gray-200 rounded-lg p-1 px-3
      {{ field.innerClass }} mb-3 bg-gray-100/50 min-h-[54px] flex  items-center"
      [formGroup]="group"
    >
      <mat-slide-toggle
        class="w-full padding-1"
        [formControlName]="field.key"
        (change)="toggleCheckbox($event)"
      >
        <div class="ps-3 d-inline-block py-2 w-full">{{ field.label }}</div>
      </mat-slide-toggle>
    </div>
    @if (field.hint) {
      <mat-hint class="text-sm relative -top-3 left-4">
        <small> {{ field.hint }} </small>
      </mat-hint>
    }
  `,
})
export class ToggleComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  @Output() selectedValue = new EventEmitter();

  ngOnInit() {}

  toggleCheckbox(event: any) {
    this.selectedValue.emit({ value: event.checked, field: this.field });
    if (this.field.onChange) this.field.onChange(event.checked, this.group, this.field);
  }
}
