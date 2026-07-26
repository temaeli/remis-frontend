import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { CommonModule, formatDate } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDatepickerModule,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';

@Component({
  selector: 'app-date-range',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    IconComponent,
    MergeClassesPipe,
  ],
  template: `
    <mat-form-field class="example-form-field" [formGroup]="group" appearance="outline">
      @if (field.icon) {
        <app-icon
          matPrefix
          [icon]="field.icon"
          iconClass="{{ 'opacity-60' | mergeClasses: field.iconClass }}"
        />
      }
      <mat-label>{{ field.label }} </mat-label>
      <mat-date-range-input [rangePicker]="dateRangePicker">
        <input
          matStartDate
          (dateChange)="setStart($event)"
          [formControlName]="field.dateRangeFirstKey ?? from"
          [placeholder]="field.dateRangeFirstLabel"
          readonly
        />

        <input
          matEndDate
          (dateChange)="setEnd($event)"
          [formControlName]="field.dateRangeLastKey ?? to"
          [placeholder]="field.dateRangeLastLabel"
          readonly
        />
      </mat-date-range-input>

      <mat-datepicker-toggle matSuffix [for]="dateRangePicker" />

      <mat-date-range-picker #dateRangePicker />

      @if (field.hint) {
        <mat-hint align="start"> {{ field.hint }} </mat-hint>
      }

      @for (validation of field.validations; track $index) {
        @if (group.get(field.dateRangeFirstKey ?? from)?.hasError(validation.name)) {
          <ng-container ngProjectAs="mat-error">
            <mat-error>{{ validation.message }}</mat-error>
          </ng-container>
        }

        @if (group.get(field.dateRangeLastKey ?? to)?.hasError(validation.name)) {
          <ng-container ngProjectAs="mat-error">
            <mat-error>{{ validation.message }}</mat-error>
          </ng-container>
        }
      }
    </mat-form-field>
  `,
  // host: {'class': 'col-md-6'},
  styles: [],
})
export class DateRangeComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  startDateValue: any;
  endDateValue: any;

  from = 'from';
  to = 'to';

  ngOnInit() {
    const date = this.group?.get(this.field?.key)?.value;

    if (typeof date == 'object' && Object.keys(date).length >= 2) {
      this.from = Object.keys(date)[0];
      this.to = Object.keys(date)[1];

      this.startDateValue = Object.values(date)[0];
      this.endDateValue = Object.values(date)[2];
      this.onChange();
    }
  }

  onChange() {
    const from = this.formatDate(this.startDateValue);
    const to = this.formatDate(this.endDateValue);

    const value = { from, to };

    if (this.field.onChange) this.field.onChange(value, this.group, this.field);
    this.field.value = value;
  }

  formatDate(value: any) {
    return formatDate(value, this.field.dateFormat ?? 'YYYY-MM-dd', 'en-GB');
  }

  setStart($event: any) {
    this.startDateValue = $event;
    this.onChange();
  }

  setEnd($event: any) {
    this.endDateValue = $event;
    this.onChange();
  }
}
