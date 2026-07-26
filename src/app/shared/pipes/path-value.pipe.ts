import { Pipe, PipeTransform } from '@angular/core';
import { getPathValue } from '@core/helpers';

@Pipe({
  name: 'pathValue',
})
export class PathValuePipe implements PipeTransform {
  transform(obj: any, path?: string): any {
    return getPathValue(obj, path ?? '');
  }
}
