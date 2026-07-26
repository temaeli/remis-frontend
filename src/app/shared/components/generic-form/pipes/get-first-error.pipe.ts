import { Pipe, PipeTransform } from '@angular/core';
import { getFirstError } from '../field-helpers';
import { FieldConfig } from '../field.interface';
import { FormGroup } from '@angular/forms';

@Pipe({ name: 'getFirstError' })
export class GetFirstErrorPipe implements PipeTransform {
  transform(field: FieldConfig, group: FormGroup) {
    return getFirstError(field, group);
  }
}
