// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { EnvInterface } from '@core';

export const environment: EnvInterface = {
  production: false,
  baseUrl: '',
  useHash: false,
  apiUrl: 'localhost',
  GRANT_TYPE: 'password',
  CLIENT_ID: 'gasco',
  CLIENT_SECRET: 'gasco',
  SESSION_TIME: 9000000,
  REQUEST_TIME: 60000,

  ///// staging
  // FRONT_END_URL: 'http://localhost:4300',
  // SERVER_URL: 'http://41.59.86.73:9001',

  ///// staging private
  // FRONT_END_URL: 'http://localhost:4300',
  // SERVER_URL: 'http://10.76.100.30:9001',

  ///// gasco dev
  // FRONT_END_URL: 'http://localhost:4300',
  SERVER_URL: 'https://dev.gasco.co.tz/bkend',

  //// local
  FRONT_END_URL: 'http://192.168.1.11:4200',
  // SERVER_URL: 'http://192.168.1.11:9091',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
