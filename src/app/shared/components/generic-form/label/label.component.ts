import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { isObservable } from 'rxjs';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
@Component({
  selector: 'app-button',
  imports: [SafeHtmlPipe, ReactiveFormsModule, MergeClassesPipe],
  template: `
    <div
      [innerHTML]="(field.valueAsLabel ? group.get(field.key)?.value : label) | safeHtml"
      [formGroup]="group"
      class="{{ ' ' | mergeClasses: field.innerClass }} "
    ></div>
  `,
  styles: [],
})
export class LabelComponent implements OnInit {
  field!: FieldConfig;
  group!: FormGroup;
  label?: string;

  ngOnInit() {
    if (isObservable(this.field.label)) this.field.label.subscribe((l: any) => (this.label = l));
    else this.label = this.field.label;
  }
}
