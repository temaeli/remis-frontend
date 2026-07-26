import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelToTitleCase',
})
export class CamelToTitleCasePipe implements PipeTransform {
  transform(string: string): string {
    if (typeof string !== 'string') return string;
    return (string.charAt(0).toUpperCase() + string.slice(1))
      .replace(/([A-Z]+)/g, ' $1')
      .replace(/([A-Z][a-z])/g, '$1');
  }
}
