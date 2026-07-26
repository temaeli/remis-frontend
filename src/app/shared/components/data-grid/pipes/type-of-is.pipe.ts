import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeOfIs',
})
export class TypeOfIsPipe implements PipeTransform {
  transform(value: any, type: string): boolean {
    return typeof value === type;
  }
}
