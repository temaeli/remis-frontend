import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, FieldType } from '../field.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';

@Component({
  selector: 'app-input',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    IconComponent,
    MergeClassesPipe,
  ],
  template: `
    @if (field.key) {
      <mat-form-field
        class=" {{ 'w-full' | mergeClasses: field.innerClass }}"
        [style]="field.innerStyle"
        [formGroup]="group"
        [appearance]="field.appearance ?? 'outline'"
      >
        <mat-label> {{ field.label }} </mat-label>

        <input
          matInput
          [formControlName]="field.key"
          [placeholder]="field.placeholder || (field.label ?? '')"
          [type]="types[changeCount % types.length]"
          step="any"
          [attr.data-inputkey]="field.key"
          [attr.min]="field.min"
          [attr.max]="field.max"
          (input)="onInput($event)"
          (change)="onChange($event)"
          (paste)="onInput($event)"
        />

        @if (field.icon) {
          <app-icon
            matPrefix
            [icon]="field.icon"
            iconClass="{{ 'mx-3' | mergeClasses: field.iconClass }}"
          />
        }

        @if (types.length > 1) {
          <div (click)="changeCount = changeCount + 1" class="relative stack top--5" matSuffix>
            <app-icon
              icon="{{ changeCount % types.length == 0 ? 'visibility' : 'password' }}"
              class="faded hover-show mx-2"
            />
          </div>
        }

        @if (field.hint) {
          <mat-hint align="start"> {{ field.hint }} </mat-hint>
        }

        <!-- //TODO: concatnate errors -->
        @if (getErrorFn(field, group); as error) {
          <mat-error>{{ error }}</mat-error>
        }
      </mat-form-field>
    }
  `,
})
export class InputComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;
  getErrorFn!: (field: FieldConfig, group: FormGroup) => string;

  changeCount = 0;
  types: any[] = [];

  isDecimal = false;
  isNumber = false;

  ngOnInit() {
    if (!this.field.key) return;

    this.types = [this.field?.inputType] as any;
    this.isDecimal = this.field.inputType === 'decimal' || this.field.type === FieldType.decimal;
    this.isNumber = this.field.inputType === 'number' || this.field.type === FieldType.number;

    if (this.field?.inputType === 'password') this.types.push('text');

    if (this.field.hasOwnProperty('value') && this.field.value !== undefined) {
      this.group.get(this.field?.key)?.setValue(this.field.value);
    }
  }

  onValueChange(event: any) {
    let value = event?.target?.value;

    if (this.isNumber) value = Number(value);
    else if (this.isDecimal) {
      value = parseFloat(value);
      if (!isNaN(value)) {
        const d = typeof this.field.decimals === 'number' ? this.field.decimals : 2;
        const f = 10 ** d;
        value = Math.round(value * f) / f;
      }
    }

    if (this.field.onChange) this.field.onChange(value, this.group, this.field);

    this.field.value = value;
    this.group.get(this.field.key)?.setValue(value, { emitEvent: false });
  }

  // for text and numbers
  onInput(event: any) {
    if (!this.isDecimal) this.onValueChange(event);
  }

  //only for decimal
  onChange(event: any) {
    if (this.isDecimal) this.onValueChange(event);
  }
}
