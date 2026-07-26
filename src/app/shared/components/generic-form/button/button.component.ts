import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-button',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatIconModule,
    IconComponent,
    MatButtonModule,
  ],
  template: `
    @if (field.key) {
      <div class="w-full {{ field.innerClass }}" [formGroup]="group">
        <button
          type="button"
          mat-stroked-button
          [class]="field.inputClass"
          disabled="{{ group.get(field.key)?.disabled }}"
          (click)="field.click?.($event, group)"
        >
          @if (field.icon) {
            <app-icon
              [icon]="field.icon"
              [ngClass]="{ 'me-2': !!field.label?.trim(), 'm-0': !field.label?.trim() }"
            />
          }

          <span class="text-bold"> {{ field.label?.trim() }} </span>
        </button>
      </div>
    }
  `,

  styles: [],
})
export class ButtonComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  ngOnInit() {}
}
