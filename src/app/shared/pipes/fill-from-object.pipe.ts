import { Pipe, PipeTransform } from '@angular/core';

export function fillPlaceholders(
  template: string,
  data: any,
  keepPlaceholderOnMissing = true,
) {
  return template.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
    // Handle nested properties like "user.name"
    const value = key.split('.').reduce((obj: any, k: any) => obj && obj[k], data);

    // Return value if it's not null or undefined
    if (value !== null && value !== undefined) {
      return value;
    }

    // If keepPlaceholderOnMissing is true, return the key without braces
    // Otherwise return the full placeholder
    return keepPlaceholderOnMissing ? key : match;
  });
}

@Pipe({
  name: 'fillPlaceholders',
})
export class FillPlaceholdersPipe implements PipeTransform {
  transform(str: string, object?: any): any {
    if (typeof object !== 'object') return str;
    return fillPlaceholders(str, object);
  }
}
