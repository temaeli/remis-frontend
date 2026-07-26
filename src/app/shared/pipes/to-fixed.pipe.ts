import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed',
})
export class ToFixedPipe implements PipeTransform {
  transform( n?: number, x?:number): any {
    return n? n.toFixed(x? x: 2) : 0;  
  }
}
