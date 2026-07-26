import { Pipe, PipeTransform } from '@angular/core';

/**
 * A search pipe to help to search items using their property
 * just pass multiple properties using comma separated list
 * Usage: items | search:'obj_property_1,obj_property_2...,obj_property_n':searchValue
 */
@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  public transform(value: any, keys: string[] | any, term: any, strict: any = false) {
    if (!term) return value;

    if (!Array.isArray(keys)) keys = ['label'];

    if (typeof term === 'string') {
      if (strict) {
        return (value || []).filter((item: any) =>
          keys.some((k: string) => item.hasOwnProperty(k) && new RegExp(term, 'gy').test(item[k])),
        );
      } else {
        return (value || []).filter((item: any) =>
          keys.some((k: string) => item.hasOwnProperty(k) && new RegExp(term, 'gi').test(item[k])),
        );
      }
    } else {
      let retValue: any[] = [];
      term.forEach((t: any) => {
        retValue = retValue.concat(
          (value || []).filter((item: any) =>
            keys.some((k: string) => item.hasOwnProperty(k) && new RegExp(t, 'gi').test(item[k])),
          ),
        );
      });
      return retValue;
    }
  }
}
