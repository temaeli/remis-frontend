import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { MatError, MatFormField, MatLabel } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatLabel,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    IconComponent,
    MergeClassesPipe,
  ],
  template: `
    @if (field.key) {
      <mat-form-field
        class="w-full {{ field.innerClass }}"
        [formGroup]="group"
        [appearance]="field.appearance || 'outline'"
      >
        @if (field.icon) {
          <app-icon
            matPrefix
            [icon]="field.icon"
            iconClass="{{ 'mx-2' | mergeClasses: field.iconClass }}"
          />
        }

        <mat-label> {{ field.label }} </mat-label>

        <textarea
          (keyup)="onChange($event)"
          matInput
          [rows]="field.rows"
          cdkTextareaAutosize
          [formControlName]="field.key"
          [placeholder]="field.label ?? ''"
        ></textarea>

        @if (field.hint) {
          <mat-hint align="start"> {{ field.hint }} </mat-hint>
        }

        @if (getErrorFn(field, group); as error) {
          <mat-error>{{ error }}</mat-error>
        }
      </mat-form-field>
    }
  `,
})
export class TextareaComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;
  getErrorFn!: (field: FieldConfig, group: FormGroup) => string;

  ngOnInit() {}

  onChange(event: any) {
    if (this.field.onChange) this.field.onChange(event?.target?.value, this.group, this.field);
    this.field.value = event?.target?.value;
  }
}
