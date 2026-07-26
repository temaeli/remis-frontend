import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of, isObservable } from 'rxjs';

@Pipe({ name: 'split' })
export class SplitPipe implements PipeTransform {
  transform(value: string, str:string): any[] {
    let array = [value];
    if(typeof value === 'string') array = value.split(str);
    return array;
  }
}


@Pipe({ name: 'splitAt' })
export class SplitAtPipe implements PipeTransform {
  transform(value: string, str:string, index:number): any {
    let array = [value];
    if(typeof value === 'string') array = value.split(str);
    return array?.[index];
  }
}
