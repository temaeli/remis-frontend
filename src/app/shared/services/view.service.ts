import { inject, Injectable } from '@angular/core';
import { DialogPosition, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, fromEvent, map, Observable, switchMap, take } from 'rxjs';
import { LocationInfo } from '@shared/components/view-component/view-interface';
import { Router } from '@angular/router';
import { cloneDeep, withCloserValue, truncate } from '@core/helpers';
import { LocalStorageService, LocalStorageEnum } from '@core/settings/local-storage.service';

import {
  BaseAttachment,
  FileExtension,
  getAcceptAttribute,
} from '@shared/components/generic-form/attachment/attachment.interface';
import { settings$ } from '@core/settings/settings.store';

export interface ActionListener {
  // actions?: ActionCreator<any>[] | ActionCreator<any>;
  observables?: Observable<any>[] | Observable<any>;
  delay?: number; // delay in ms
  debounceTime?: number;
  callback: (data: any) => any;
}

export type ActionMapper<T> = Record<string, (context?: T) => any>;

export interface ClickAction {
  threshold?: number;
  callbackInput?: any;
  confirmMessage?: string;
  confirmFirst?: boolean;
  slug?: string;

  callback?: (data?: any) => void | any;
  queryMapFunction?: (data: any) => any;
}

export interface DialogProps extends MatDialogConfig {
  panelClass?: string[];
  showLoading?: boolean;
  closeAction$?: Observable<any>;

  data?: any;
  component?: any;
  width?: string;
  position?: DialogPosition;
  maxHeight?: string;
  height?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  dialog = inject(MatDialog);
  storage = inject(LocalStorageService);
  router = inject(Router);

  trigger = 0;
  triggerTimer: any = undefined;
  delayTimer: any = undefined;

  imminentAction?: ClickAction = undefined;

  // set from the app comp
  scrollTop$ = new BehaviorSubject(0);
  windowWidth$ = new BehaviorSubject(document.documentElement.clientWidth);

  wheelDeltaY$ = new BehaviorSubject(0);
  wheelDeltaX$ = new BehaviorSubject(0);

  previousUrl?: string = undefined;
  currentUrl?: string = undefined;
  lastOpenedUids = this.storage.getItem(LocalStorageEnum.VISITED_IDS)?.reverse();

  prevCallBackInput = undefined;

  onMultiClick(callback?: (x?: any) => void | any, threshold?: number, callbackInput?: any) {
    // restart count if input  is provided and changed
    if (this.prevCallBackInput && callbackInput && this.prevCallBackInput !== callbackInput) {
      this.trigger = 0;
      this.prevCallBackInput = undefined;
    }

    // prevent from restarting if clicked againg before 500ms
    if (this.triggerTimer) clearTimeout(this.triggerTimer);
    this.triggerTimer = setTimeout(() => (this.trigger = 0), 500);

    // update counter and preve value
    this.prevCallBackInput = callbackInput;
    if (++this.trigger < (threshold ?? 3)) return;

    callback?.(callbackInput);
    this.trigger = 0;
    this.prevCallBackInput = undefined;
  }

  delayedExecution(callback: (data?: any) => any, time = 500) {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    this.delayTimer = setTimeout(() => {
      callback();
    }, time);
  }

  async onMultipleEvent(actions: ClickAction[] | any[], input?: any) {
    this.trigger = this.trigger + 1;
    if (this.triggerTimer) clearTimeout(this.triggerTimer);

    const runCallback = async () => {
      let data = this.imminentAction?.callbackInput ?? input;
      const hasMap = this.imminentAction?.hasOwnProperty('queryMapFunction');
      const action = cloneDeep(this.imminentAction);
      if (hasMap) data = await action?.queryMapFunction?.(data);
      action?.callback?.(data);
    };

    this.triggerTimer = setTimeout(async () => {
      const atThres =
        this.imminentAction && this.trigger >= (this.imminentAction?.threshold as any);
      if (atThres) runCallback();
      this.imminentAction = undefined;
      this.trigger = 0;
    }, 500);

    const mapToObject = (e: any) => ({
      callback: e?.[0],
      threshold: e?.[1],
      callbackInput: e?.[2],
    });

    actions = actions.map((e: any) => (Array.isArray(e) ? mapToObject(e) : e));
    this.imminentAction = withCloserValue(actions, 'threshold', this.trigger);

    const lastThesh = Math.max(...actions.map((a) => a.threshold));

    if (lastThesh <= this.trigger) {
      runCallback();
      clearTimeout(this.triggerTimer);
      this.trigger = 0;
    }
  }

  openModal(component: any, data?: any, width?: any, maxHeight?: any, dialogProps?: DialogProps) {
    return this.openDialog({ component, data, width, maxHeight, ...dialogProps });
  }

  openDialog(dialog: DialogProps): MatDialogRef<any> {
    // set up defualts
    const animation = settings$.value?.animations?.modals ?? 'fade-on';
    const panelClass: string[] = [animation, 'rounded-lg'].concat(...(dialog.panelClass ?? []));

    if (dialog?.maxHeight != null && !dialog?.height) dialog.height = dialog?.maxHeight;

    const dialogConfig: MatDialogConfig = {
      //defaults
      disableClose: true,
      autoFocus: true,
      width: '50%',

      ...dialog,
      panelClass,
    };

    let dialogRef!: MatDialogRef<any>;

    if (dialog.showLoading) {
      // this.spinner.show(); //TODO: impl loading on dialog

      setTimeout(() => {
        dialogRef = this.dialog.open(dialog?.component, dialogConfig);
        const ref$ = dialogRef.afterOpened().pipe(take(1));
        // ref$.subscribe((x) => this.spinner.hide());
      }, 100);
      //
    } else dialogRef = this.dialog.open(dialog?.component, dialogConfig);

    if (dialog.closeAction$) dialog.closeAction$.pipe(take(1)).subscribe((x) => dialogRef.close());

    return dialogRef;
  }

  showOutlineBlink(className: string, duration = 500) {
    //TODO impl highlight on tagged element
  }

  fileAsAttachment(extensions: FileExtension[] = [], multiple = false): Observable<BaseAttachment> {
    return this.openFileSelector_(extensions, multiple).pipe(
      switchMap((files) => {
        const file = files[0];
        const reader: FileReader = new FileReader();

        const fileName = file.name.length > 40 ? truncate(file.name, 40) : file.name;
        let extension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
        extension = extension.includes('pdf') ? 'pdf' : extension;
        const mediaSize = `${(file.size / 1024).toFixed(2)} KB`;

        reader.readAsDataURL(file);

        return fromEvent(reader, 'loadend').pipe(
          map(() => {
            const data = reader.result?.toString()?.replace(`data:${file.type};base64,`, '');
            const attachment: BaseAttachment = { fileName, data, extension, mediaSize };
            return attachment;
          }),
        );
      }),
    );
  }

  openFileSelector_(extensions: FileExtension[] = [], multiple = false): Observable<FileList> {
    return this.openFileSelector(extensions, multiple).pipe(
      map((event) => (event.target as HTMLInputElement).files),
    ) as any;
  }

  openFileSelector(extensions: FileExtension[] = [], multiple = false): Observable<Event> {
    return new Observable((observer) => {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = getAcceptAttribute(extensions);
      fileInput.multiple = multiple;

      // Listen for file selection changes
      const change$ = fromEvent(fileInput, 'change').pipe(take(1));

      change$.subscribe((event: Event) => {
        observer.next(event); // Emit the change event
        observer.complete();
      });

      // Trigger the file selection dialog
      fileInput.click();

      // Cleanup: Remove the input element after selection
      return () => fileInput.remove();
    });
  }

  closeTopDialog() {
    const dialogRefs: MatDialogRef<any>[] = this.dialog?.openDialogs;
    if (!dialogRefs?.length) return;
    const activeDialogRef = dialogRefs[dialogRefs.length - 1];
    activeDialogRef.close();
  }

  getLocationInfo = (url?: string): LocationInfo => {
    url = url ?? this.router.url;

    const info: LocationInfo = {
      ...this.storage.find(LocalStorageEnum.ROUTE_INFO, 'url', url),
      fromUrl: this.previousUrl,
      url,
    };

    this.storage.upsert(LocalStorageEnum.ROUTE_INFO, 'url', info);
    return info;
  };

  getLocValue(property: keyof LocationInfo, url?: string): any {
    return this.getLocationInfo(url)?.[property];
  }

  setLocInfo(property: keyof LocationInfo, value: any, url?: string) {
    url = url ?? this.router.url;

    let info: LocationInfo | undefined = this.storage.find(LocalStorageEnum.ROUTE_INFO, 'url', url);

    if (property === 'variables') info = { ...info, variables: { ...info?.variables, ...value } };
    else info = { ...info, [property]: value };

    this.storage.upsert(LocalStorageEnum.ROUTE_INFO, 'url', info);
  }
}
