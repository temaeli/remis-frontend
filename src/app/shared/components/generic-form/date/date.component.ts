import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { CommonModule, formatDate } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // Add this import
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { AnyPipe } from '../../../pipes/any.pipe';

@Component({
  selector: 'app-date',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    IconComponent,
    MergeClassesPipe,
    AnyPipe,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <mat-form-field
      class="w-full margin-top"
      [formGroup]="group"
      [appearance]="field.appearance ?? 'outline'"
    >
      @if (field.icon) {
        <app-icon
          matPrefix
          [icon]="field.icon"
          iconClass="{{ 'opacity-60' | mergeClasses: field.iconClass }}"
        />
      }
      <mat-label> {{ field.label }} </mat-label>
      <input
        (dateChange)="onChange($event)"
        matInput
        [matDatepicker]="picker"
        [matDatepickerFilter]="field.dateFilter ?? dateFilter"
        [formControlName]="field.key"
        [placeholder]="field.label | any"
        [min]="field.minDate || null"
        [max]="field.maxDate || null"
        readonly
      />
      <mat-datepicker-toggle matSuffix [for]="picker" />
      <mat-datepicker #picker />

      @if (field.hint) {
        <mat-hint align="start"> {{ field.hint }} </mat-hint>
      }

      @if (getErrorFn(field, group); as error) {
        <mat-error>{{ error }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [],
})
export class DateComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;
  getErrorFn!: (field: FieldConfig, group: FormGroup) => string;

  ngOnInit() {
    const date = this.group?.get(this.field?.key)?.value;
    if (date) this.onChange({ value: date });
  }

  onChange(event: any) {
    const date = this.formatDate(event.value);
    if (this.field.onChange) this.field.onChange(date, this.group, this.field);
    this.field.value = date;

    //update the date's form with out triggering the onchange events
    this.group.get(this.field.key)?.setValue(date, { emitEvent: false });
  }

  formatDate(value: any) {
    return formatDate(value, this.field.dateFormat ?? 'yyyy-MM-dd', 'en-GB');
  }

  dateFilter(date: Date | null): boolean {
    return true;
  }
}
