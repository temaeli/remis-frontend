import { Component, OnInit, HostBinding, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, FormStepper } from '../field.interface';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoadingDirective } from '@core/loading/loader.directive';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-submit',
  imports: [MatButtonModule, MatIcon, LoadingDirective, AsyncPipe, ReactiveFormsModule],
  template: `
    <div class="w-full flex justify-end  items-center  my-3" [formGroup]="group">
      <button
        type="submit"
        mat-stroked-button
        [disabled]="
          !!(field.isSaving$ | async) || formSteppers.length ? !allSteppersValid() : group.invalid
        "
        [loading]="!!(field.isSaving$ | async)"
        class=" py-2 px-3 {{ field.inputClass }}"
      >
        {{ field.label }}
      </button>

      @if (field.isSaving$ | async) {
        <mat-icon
          (click)="field.isSaving$?.next(false)"
          class="ps-3 cursor-pointer fade-on-hover"
          icon="cancel"
        />
      }
    </div>
  `,

  styles: [],
})
export class SubmitComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  formSteppers: FormStepper[] = [];

  ngOnInit() {}

  allSteppersValid() {
    const valid = this.formSteppers.reduce((a, b: any) => a && b?.formGroup?.valid, true);
    return valid;
  }
}
