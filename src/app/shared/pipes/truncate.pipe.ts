import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(string: string, n?: number, addDots = true, removeTrailing?: string[]): string {
    if (typeof string !== 'string' || !n) return string;
    const suffix = string.length > n && addDots ? '...' : '';
    let s = string.length > n ? string.substring(0, n) : string;
    removeTrailing?.forEach((c) => s.endsWith(c) && (s = s.substring(0, s.length - 1 - c.length)));
    s = `${s}${suffix}`;
    return s;
  }
}
