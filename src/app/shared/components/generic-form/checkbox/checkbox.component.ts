import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
@Component({
  selector: 'app-checkbox',
  imports: [CommonModule, MatCheckboxModule, ReactiveFormsModule, IconComponent, MergeClassesPipe],
  template: `
    @if (field.key) {
      <div
        class="w-full margin-top border border-gray-200 rounded-lg p-1 px-3
      {{ field.innerClass }} mb-3 bg-light"
        [formGroup]="group"
      >
        @if (field.icon) {
          <app-icon
            [icon]="field.icon"
            iconClass="{{ 'opacity-60' | mergeClasses: field.iconClass }}"
          />
        }

        <mat-checkbox [formControlName]="field.key" (change)="toggleCheckbox($event)">
          {{ field.label }}
        </mat-checkbox>
      </div>
    }
  `,
  styles: [],
})
export class CheckboxComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  @Output() selectedValue = new EventEmitter();

  ngOnInit() {}

  toggleCheckbox(event: any) {
    this.selectedValue.emit({ value: event.checked, field: this.field });
    if (this.field.onChange) this.field.onChange(event.checked, this.group, this.field);
  }
}
