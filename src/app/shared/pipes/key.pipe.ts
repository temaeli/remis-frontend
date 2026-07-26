import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'key',
})
export class KeyPipe implements PipeTransform {
  transform(value: string): any {
    if (!value) return value;
    return value.split(' ')?.[0] ?? value;
  }
}
