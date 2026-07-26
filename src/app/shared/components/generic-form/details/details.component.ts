import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { Subscription, isObservable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from '@shared/components/details/details.component';
import { objectHasKeys } from '@core/helpers';

@Component({
  selector: 'app-details',
  imports: [CommonModule, ReactiveFormsModule, DetailsComponent],
  template: `
    <div class="{{ field.innerClass }} mb-3" [formGroup]="group">
      <app-details
        [detailsParameter]="detailsParameter"
        [fieldsClass]="detailsParameter?.fieldsClass ?? 'col-md-6 col-lg-4 py-1 '"
        [fieldsInnerClass]="detailsParameter?.fieldsInnerClass ?? 'label h-full'"
        [labelsClass]="detailsParameter?.labelsClass ?? 'faded text-bold pb-2'"
      />
    </div>
  `,
  styles: [],
})
export class FormDetailsComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;

  sub = new Subscription();
  detailsParameter?: any;

  constructor() {}

  ngOnInit() {
    // this.detailsParameter = this.field.[detailsParameter] ?? {};
    const entity_ = this.field.entity ?? this.detailsParameter?.entity;
    if (isObservable(entity_)) this.sub.add(entity_.subscribe((l: any) => this.setValue(l)));
    else this.setValue(entity_);
  }

  async setValue(value: any) {
    let v = await value;
    this.detailsParameter = { ...this.detailsParameter, entity: v };
    if (objectHasKeys(v, ['code', 'message', 'data']) && value.code !== 9000) v = undefined;
    this.group.get(this.field.key)?.setValue(v);
  }
}
