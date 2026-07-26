import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { AnyPipe } from '../../../pipes/any.pipe';
import { FieldConfig } from '../field.interface';

const pad = (n: number) => `${n}`.padStart(2, '0');

const toLocalInput = (v: any): string => {
  if (v === null || v === undefined || v === '') return '';
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Native datetime-local needs "YYYY-MM-DDTHH:mm" for its [min]/[max] attrs.
const toBoundAttr = (v: any): string | null => {
  if (!v) return null;
  const formatted = toLocalInput(v);
  return formatted || null;
};

const toStoredValue = (input: string): string | null => {
  if (!input) return null;
  // <input type="datetime-local"> emits "YYYY-MM-DDTHH:mm". Append :00 so the
  // backend's LocalDateTime parser accepts it.
  return input.length === 16 ? `${input}:00` : input;
};

@Component({
  selector: 'app-date-time',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatIconButton,
    IconComponent,
    MergeClassesPipe,
    AnyPipe,
  ],
  template: `
    <mat-form-field
      class="w-full margin-top"
      [appearance]="field.appearance ?? 'outline'"
    >
      @if (field.icon) {
        <app-icon
          matPrefix
          [icon]="field.icon"
          iconClass="{{ 'opacity-60' | mergeClasses: field.iconClass }}"
        />
      }
      <mat-label>{{ field.label }}</mat-label>
      <input
        #dt
        matInput
        type="datetime-local"
        [value]="inputValue"
        (input)="onInput($event)"
        (change)="onInput($event)"
        [placeholder]="field.label | any"
        [attr.min]="minAttr"
        [attr.max]="maxAttr"
      />
      <button
        mat-icon-button
        matSuffix
        type="button"
        aria-label="Pick date and time"
        (click)="openPicker(dt)"
      >
        <mat-icon svgIcon="calendar" />
      </button>
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
export class DateTimeComponent implements OnInit, OnDestroy {
  @ViewChild('dt') input?: ElementRef<HTMLInputElement>;

  field!: FieldConfig;
  group!: FormGroup;
  getErrorFn!: (field: FieldConfig, group: FormGroup) => string;

  inputValue = '';
  private sub?: Subscription;

  get minAttr(): string | null {
    return toBoundAttr(this.field?.minDate);
  }

  get maxAttr(): string | null {
    return toBoundAttr(this.field?.maxDate);
  }

  ngOnInit(): void {
    const control = this.group?.get(this.field?.key);
    this.inputValue = toLocalInput(control?.value);

    this.sub = control?.valueChanges.subscribe((v) => {
      const next = toLocalInput(v);
      if (next !== this.inputValue) this.inputValue = next;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  openPicker(el: HTMLInputElement): void {
    const anyEl = el as any;
    if (typeof anyEl.showPicker === 'function') {
      try {
        anyEl.showPicker();
        return;
      } catch {
        // fall through to focus
      }
    }
    el.focus();
    el.click();
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value ?? '';
    this.inputValue = raw;
    const stored = toStoredValue(raw);
    const control = this.group.get(this.field.key);
    if (!control) return;
    if (this.field.onChange) this.field.onChange(stored, this.group, this.field);
    this.field.value = stored;
    control.setValue(stored, { emitEvent: false });
    control.markAsDirty();
    control.markAsTouched();
  }
}
