import { Pipe, PipeTransform } from '@angular/core';
import { intToRoman } from '@core/helpers';

@Pipe({
  name: 'intToRoman',
})
export class IntToRomanPipe implements PipeTransform {
  transform(interger: number): string {
    return intToRoman(interger);
  }
}
