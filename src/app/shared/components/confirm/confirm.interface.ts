import { AppColors } from '@core/settings/app-variables';

export interface NotificationDialog {
  title?: string | null | undefined;
  icon?: string | null | undefined;
  iconClass?: string | null | undefined;
  imgSrc?: string | null | undefined;
  subTitle?: string | null | undefined;
  message?: string | null | undefined;
  completeText?: string | null | undefined;
  cancelText?: string | null | undefined;
  confirmText?: string | null | undefined;
  confirmButtonColor?: AppColors;
  confirmButtonClass?: string | null | undefined;
}
