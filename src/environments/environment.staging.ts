import { EnvInterface } from '@core';

export const environment: EnvInterface = {
  production: false,
  baseUrl: '',
  useHash: false,
  apiUrl: 'localhost',
  FRONT_END_URL: 'http://training.remis.go.tz',
  // SERVER_URL: 'http://training.remis.go.tz/api',
  SERVER_URL: 'http://197.149.179.218:9091',

  GRANT_TYPE: 'password',
  CLIENT_ID: 'whi',
  CLIENT_SECRET: 'whi',
  SESSION_TIME: 9000000,
  REQUEST_TIME: 60000,
};
