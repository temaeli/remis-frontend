import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'round',
})
export class RoundPipe implements PipeTransform {
  transform( n?: number, x = 1): number {
    return n? Math.ceil(n/x)*x : 0;  
  }
}
