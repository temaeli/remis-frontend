export class AppVariables {
  name?: string;
  prefix?: string;
  fullName?: string;
  website?: string;
  logo?: string;
  keyDownEventThres?: number;
  owner?: string;
  icon?: string;
  avatar?: string;
}

export const APP_VARIABLES: AppVariables = {
  name: 'REMIS',
  prefix: 'REMIS-',
  fullName: 'Remis',
  website: 'www.remis.co.tz',
  logo: './images/logo.png',
  icon: './images/icon.png',
  avatar: './images/avatar.jpg',
  keyDownEventThres: 7,
  owner: 'Remis',
};

export type AppColors = 'primary' | 'secondary' | 'red' | 'green';
