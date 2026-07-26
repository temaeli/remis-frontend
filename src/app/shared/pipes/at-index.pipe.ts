import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'atIndex' })
export class AtIndexPipe implements PipeTransform {
  transform(value: any[] | unknown, index = 0): any {
    let atIndex = value;
    if(Array.isArray(value) && value.length) {
      atIndex = (index < 0 || !value?.[index])? value.pop() : value[index];
    }
    return atIndex;
  }
}
