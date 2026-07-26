import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getArray'
})
export class GetArrayPipe implements PipeTransform {

  transform(len: number,  defaultValue = 'item'): any[] {
    return  Array.from({ length: len }).fill(defaultValue);
  }
}

