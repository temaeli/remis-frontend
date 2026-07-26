import { Pipe, PipeTransform } from '@angular/core';
import { isValue } from '@core/helpers';

@Pipe({
  name: 'isValue',
})
export class IsValuePipe implements PipeTransform {
  transform(value: any): boolean {
    return isValue(value);
  }
}
