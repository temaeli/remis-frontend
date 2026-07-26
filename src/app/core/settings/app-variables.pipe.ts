import { Pipe, PipeTransform } from '@angular/core';
import { APP_VARIABLES, AppVariables } from './app-variables';

@Pipe({
  name: 'appVariables',
})
export class AppVariablesPipe implements PipeTransform {
  transform(key: keyof AppVariables): any {
    return APP_VARIABLES?.[key];
  }
}
