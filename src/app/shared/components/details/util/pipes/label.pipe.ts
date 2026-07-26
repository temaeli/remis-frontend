import { isSignal, Pipe, PipeTransform } from '@angular/core';
import { isObject, toTitleCase } from '../util.helpers';
import { getNameField } from '../field/fields.helper';
import { getName } from '@shared/components/view-component/view.helpers';
import { truncate } from '@core/helpers/string.helpers';

@Pipe({
  name: 'label',
})
export class LabelPipe implements PipeTransform {
  transform(value: any, parsePrimitives = false): string {
    const item = value;

    if (!parsePrimitives && ['boolean', 'number', 'string'].includes(typeof item)) return item;
    //
    if (typeof item == 'string') return getName(toTitleCase(item));
    //
    else if (Array.isArray(item)) {
      return item.length ? truncate(item.map((i) => this.transform(i)).join(', '), 100) : '--';
    }
    //
    else if (isObject(item)) return getNameField(item)?.value;
    //
    return item;
  }
}
