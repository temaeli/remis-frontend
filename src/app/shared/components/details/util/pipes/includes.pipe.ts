import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'includes',
})
export class IncludesPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (Array.isArray(value)) return value.includes(args);
    if (typeof value === 'string') value.includes(args);
    return value?.toString()?.includes(args);
  }
}
