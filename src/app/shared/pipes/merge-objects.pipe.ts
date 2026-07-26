import { Pipe, PipeTransform } from '@angular/core';
import { mergeObjects } from '@core/helpers';

@Pipe({
  name: 'mergeObjects',
})
export class MergeObjectsPipe implements PipeTransform {
  transform(obj1: any, obj2: any): any {
    return mergeObjects(obj1, obj2);
  }
}
