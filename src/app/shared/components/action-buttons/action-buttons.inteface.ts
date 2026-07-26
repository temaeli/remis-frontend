import { Signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FileChangeEvent, FileExtension } from '../generic-form/attachment/attachment.interface';
import { NotificationDialog } from '../confirm/confirm.interface';

export type ButtonType = 'button' | 'fab' | 'mini-fab' | 'icon' | 'mini-icon';

export interface ActionButton {
  label?: string;
  showLabel?: string;
  slug?: string;
  icon?: string | Observable<string>;
  class?: string | Observable<string>;
  loading?: boolean | Observable<boolean>;
  toolTip?: string;
  color?: string;
  loadingMessage?: string;

  confirmMessage?: string;
  confirmData?: NotificationDialog;

  disabled?: boolean;
  visible?: boolean;
  hide?: boolean;
  iconPosition?: 'before' | 'after';
  iconClass?: string | Observable<string>;
  iconType?: 'src' | 'base64' | 'url';
  labelClass?: string;
  outerClass?: string;
  innerMenuClass?: string;
  menuClass?: string;
  type?: ButtonType;
  data?: any;
  permissions?: string[];
  buttons?: ActionButton[];

  isFileSelector?: boolean;
  allowedExtensions?: FileExtension[];

  labelLength?: number; // if exeed this truncate
  removeFile$?: Subject<any>;

  onFileChange?: (fileChangeEvent: FileChangeEvent) => any;
  queryMapFunction?: (data: any) => any;
  click?: (data?: any) => void | any;

  showFunction?: (data: any) => boolean;
  hideFunction?: (data: any) => boolean;
  disabledFunction?: (data?: any) => boolean;

  classMapper?: (data: any) => string | Observable<string>;
  iconMapper?: (data: any) => string | Observable<string>;
  iconClassMapper?: (data: any) => string | Observable<string>;
  labelMapper?: (data: any) => string;
  fileLabelMapper?: (file: any) => string;
  toolTipMapper?: (data: any) => string;
  confirmMessageMapper?: (data: any) => string;
  confirmDataMapper?: (data: any) => NotificationDialog;
}

export interface ButtonsParameter {
  actionButtons?: ActionButton[];
  animation?: any;
  data?: any;
  hasRightSeparator?: boolean;
  onMenu?: boolean;
  index?: number;

  buttonHolderClass?: string;
  floatClass?: string;
  float?: boolean;

  queryMapFunction?: (data: any) => any;
  actionButtonsFn?: (data?: any) => ActionButton[] | Observable<ActionButton[]>;
}
