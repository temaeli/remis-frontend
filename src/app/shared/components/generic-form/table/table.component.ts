import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { Subscription, isObservable } from 'rxjs';

import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { objectHasKeys } from '@core/helpers';

@Component({
  selector: 'form-table',
  standalone: true,
  imports: [ReactiveFormsModule, DataGridComponent, MergeClassesPipe],
  template: `
    <div class="{{ 'mt-2 mb-3' | mergeClasses: field.innerClass }} " [formGroup]="group">
      <data-grid
        [gridData]="field.tableData ?? field.tableParameter?.gridData"
        [gridParameter]="tableParameter"
        [hasActionsColumn]="!!field.tableParameter?.actionButtons?.length"
        [noContentClass]="
          field.tableParameter?.noContentClass ??
          'my-2 h-full w-full flex items-center justify-center'
        "
      />
    </div>
  `,
  styles: [],
})
export class TableComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;
  sub = new Subscription();
  tableParameter?: any;

  tableData?: any[] = undefined;

  ngOnInit() {
    //set field value
    this.tableParameter = this.field?.tableParameter ?? {};
    const data_ = this.field?.tableData ?? this.tableParameter?.tableData;
    if (isObservable(data_)) this.sub.add(data_.subscribe((l: any) => this.setValue(l)));
    else this.setValue(data_);
  }

  async setValue(value: any) {
    let v = await value;

    if (objectHasKeys(v, ['code', 'message', 'data']) && value.code !== 9000) v = undefined;
    if (!Array.isArray(v) || !v?.length) v = undefined;
    this.group?.get(this.field.key)?.setValue(v);
    this.tableData = v ? v : [];
    // console.log(v);
  }
}
