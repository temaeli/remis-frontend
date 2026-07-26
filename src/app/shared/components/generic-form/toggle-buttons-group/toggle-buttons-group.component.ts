import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { ReplacePipe } from '@shared/pipes/replace.pipe';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonToggle, MatIcon, MatButtonToggleGroup, ReplacePipe],
  template: `
    <div
      class="w-full margin-top border border-gray-200 rounded-lg p-1 px-3
      {{ field.innerClass }} mb-3 bg-light"
      [formGroup]="group"
    >
      <!-- TODO: add vertical to Field for toggle, iconClass,labelClass -->
      <mat-button-toggle-group
        [multiple]="field.multiple"
        [vertical]="$any(field)['vertical']"
        (change)="toggleCheckbox($event)"
        [formControlName]="field.key"
      >
        <mat-button-toggle
          *ngFor="let option of field.options"
          [value]="option?.value ?? option?.name ?? option"
          [disabled]="option.disabled"
          (click)="option?.callback ? option.callback() : ''"
          class="d-flex justify-content-between align-items-center pe-2 h-full"
        >
          <mat-icon
            *ngIf="option.icon"
            class="{{ field.iconClass }} me-2 top--1 faded"
            [svgIcon]="option.icon"
          />

          <span class="small d-inline-block  {{ field.labelClass }}">
            @if (field.removeUnderscore === false) {
              {{ option?.name ?? option?.[$any(field.nameKey)] ?? option }}
            } @else {
              {{ option?.name ?? option?.[$any(field.nameKey)] ?? option | replace: '_' : ' ' }}
            }
          </span>
          <!--  -->
        </mat-button-toggle>
      </mat-button-toggle-group>
    </div>
  `,
  styles: [],
})
export class ToggleButtonsGroupComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  @Output() selectedValue = new EventEmitter();

  ngOnInit() {}

  toggleCheckbox(event: any) {
    this.selectedValue.emit({ value: event.value, field: this.field });
    if (this.field.onChange) this.field.onChange(event.value, this.group, this.field);
  }
}
