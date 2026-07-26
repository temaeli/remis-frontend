import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-radiobutton',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <fieldset *ngFor="let item of field.options">
      <label for="{{ item.name }}_name">{{ item.name }}</label>

      <input
        id="{{ item.name }}_name"
        type="radio"
        formControlName="{{ field.key }}"
        value="{{ item.value }}"
      />
    </fieldset>
  `,
})
export class RadiobuttonComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  ngOnInit() {}
}
