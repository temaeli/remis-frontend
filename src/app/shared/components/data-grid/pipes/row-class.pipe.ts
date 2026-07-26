import { Pipe, PipeTransform } from '@angular/core';
import { RowClassFormatter } from '../data-grid.interfaces';

@Pipe({
  name: 'rowClasses',
})
export class RowClassesPipe implements PipeTransform {
  transform<T>(
    row: T,
    index: number,
    formatter: RowClassFormatter<T>,
  ): Record<string, boolean> {
    const classes: Record<string, boolean> = {};

    if (formatter) {
      for (const className in formatter) {
        if (formatter[className](row, index)) classes[className] = true;
      }
    }

    return classes;
  }
}
