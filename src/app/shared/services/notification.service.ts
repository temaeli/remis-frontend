import { inject, Injectable } from '@angular/core';
import Swal, { SweetAlertInput } from 'sweetalert2';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AppColors } from '@core/settings/app-variables';
import { ConfirmComponent } from '@shared/components/confirm/confirm.component';
import { NotificationDialog } from '@shared/components/confirm/confirm.interface';

export const customClass = {
  confirmButton: 'confirm-button-class',
  cancelButton: 'cancel-button-class',
  title: 'title-class',
  icon: 'icon-class',

  container: 'container-class',
  popup: 'popup-class',
  // closeButton: 'close-button-class',
  // image: 'image-class',
  // input: 'input-class',
  // inputLabel: 'input-lable-class',
  // validationMessage: 'validation-message-class',
  // actions: 'actions-class',
  // denyButton: 'deny-button-class',
  // loader: 'loader-class',
  // footer: 'footer-class',
  // timerProgressBar: 'timer-progress-bar-class',
};

export interface PageError {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);
  private tls = inject(TranslateService);

  // all user's notifications from backend
  notifications$ = new BehaviorSubject<any[]>([
    'Server Error Reports',
    'Server Error Reports',
    'Server Error Reports',
  ]);

  private defaultConfig: MatSnackBarConfig = {
    duration: 10000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  onOpenSnackBar(message: string, panelClass: string | null = null, config = this.defaultConfig) {
    if (panelClass) config = { ...config, panelClass };
    this.snackbar.open(message, '✕', config);
  }

  warn(message: string, panelClass = 'notification-warn') {
    this.onOpenSnackBar(message, panelClass);
  }

  info(message: string, panelClass = 'notification-info') {
    this.onOpenSnackBar(message, panelClass);
  }

  async successSnackBar(
    message = 'Success',
    closeText = 'Dismiss',
    duration = 3500,
    verticalPosition: MatSnackBarVerticalPosition = 'top',
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
  ) {
    message = this.tls.instant(message);
    closeText = this.tls.instant(closeText);

    this.snackbar.open(message, closeText, {
      duration,
      verticalPosition,
      horizontalPosition,
      panelClass: ['green-snackbar'],
    });
  }

  errorSnackBar(
    message = 'An Error Occured',
    closeText = 'Dismiss',
    duration = 3500,
    verticalPosition: MatSnackBarVerticalPosition = 'top',
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
  ) {
    message = this.tls.instant(message);
    closeText = this.tls.instant(closeText);

    this.snackbar.open(message, closeText, {
      duration,
      verticalPosition,
      horizontalPosition,
      panelClass: ['danger-snackbar'],
    });
  }

  success(message: string, timer = 3000) {
    if (!message?.trim()) message = 'Action completed Succefully';

    const title = this.tls.instant('Success');
    message = this.tls.instant(message);

    return Swal.fire({
      title,
      html: message,
      icon: 'success',
      customClass,
      timer,
      timerProgressBar: true,
      allowOutsideClick: false,
    });
  }

  error(message = 'An Error Occured') {
    const title = this.tls.instant('Attention');
    message = this.tls.instant(message);

    return Swal.fire({
      title,
      html: message,
      icon: 'error',
      customClass,
      allowOutsideClick: false,
    });
  }

  catchError(message?: string) {
    message = message ? message : 'Internal Server Error';
    message = this.tls.instant(message);
    const text = this.tls.instant('Unable to access resources');

    return catchError((error) => {
      Swal.fire({
        icon: 'error',
        title: message,
        text,
        customClass,
        // text: error,
      });

      return of([]);
    });
  }

  inputDialogue(
    message = 'Fill in Input',
    input: SweetAlertInput = 'text',
    text = 'Input',
    cancelButtonText = 'cancel',
  ) {
    message = this.tls.instant(message ?? ' ');
    text = this.tls.instant(text);
    cancelButtonText = this.tls.instant(cancelButtonText);

    return Swal.fire({
      title: message,
      icon: 'question',
      cancelButtonText,
      html: text,
      input,
      customClass,
      showCancelButton: true,
    });
  }

  confirm(data: NotificationDialog, dialogConfig?: MatDialogConfig) {
    return this.dialog.open(ConfirmComponent, {
      data: { ...data, confirmText: data.confirmText ?? 'Confirm' }, // must have confirmText for confirm
      width: '280px',
      minHeight: '300px',
      hasBackdrop: true,
      disableClose: true,
      ...dialogConfig,
    });
  }

  confirm_(
    title = 'Are you sure?',
    message: string | undefined = undefined,
    confirmButtonText = 'YES',
    cancelButtonText = 'cancel',
  ) {
    message = this.tls.instant(message ?? ' ');
    confirmButtonText = this.tls.instant(confirmButtonText);
    cancelButtonText = this.tls.instant(cancelButtonText);

    return Swal.fire({
      title,
      html: message,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText,
      confirmButtonText,
      customClass,
      allowOutsideClick: false,
    });
  }

  async successWithRedirect(message: string, route: string) {
    this.success(message);
    return this.router.navigate([route]);
  }

  async errorWithRedirect(message: string, route: string) {
    this.error(message);
    return this.router.navigate([route]);
  }
}
