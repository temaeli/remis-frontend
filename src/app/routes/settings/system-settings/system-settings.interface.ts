import { User } from 'app/routes/auth/auth.interface';

export interface SystemSetting {
  active: boolean;
  category?: string;
  createdAt: Date;
  createdBy?: User;
  createdById?: number;
  defaultValue?: string;
  deletedAt?: Date;
  deletedBy?: number;
  deletedId?: number;
  description?: string;
  id: number;
  isDeleted: boolean;
  migrated?: boolean;
  settingKey: string;
  settingValue: string;
  systemSeed: boolean;
  uid: string;
  updatedAt: Date;
  updatedBy?: number;
  valueType?: string;
}

export interface SystemSettingDtoInput {
  category?: string;
  defaultValue?: string;
  description?: string;
  settingKey: string;
  settingValue: string;
  systemSeed?: boolean;
  uid?: string;
  valueType?: string;
}
