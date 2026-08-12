import { OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ActionButton, ButtonsParameter } from './action-buttons.inteface';
import { firstValueFrom, isObservable, Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { ToObservablePipe } from '../../pipes/to-observable.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { LoadingDirective } from '@core/loading/loader.directive';
import { ParseBase64Pipe } from '../details/util/base-64/parse-base-64.pipe';
import { IconTypePipe } from '../icon/icon-type.pipe';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { NotificationService } from '@shared/services/notification.service';
import { settings$ } from '@core/settings/settings.store';
import { NotificationDialog } from '../confirm/confirm.interface';

@Component({
  selector: 'action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ParseBase64Pipe,
    ToObservablePipe,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    HasPermissionDirective,
    SafeHtmlPipe,
    LoadingDirective,
    MergeClassesPipe,
    IconTypePipe,
  ],
})
export class ActionButtonsComponent implements OnInit, OnDestroy, OnChanges {
  notify = inject(NotificationService);

  @Input() buttonParameters: Partial<ButtonsParameter> = {};
  @Input() actionButtons: ActionButton[] = [];
  @Input() actionButtonsFn?: (data?: any) => ActionButton[] | Observable<ActionButton[]>;
  @Input() animation? = settings$.value.animations?.pages;
  @Input() data: any = undefined;

  @Input() buttonHolderClass = '';
  @Input() floatClass = 'bottom-right m-3 m-lg-4 p-2 round';

  fabClass = 'bg-primary text-white';
  files: any[] = [];
  subs = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    this.setButtons();
  }

  ngOnInit() {
    const entries = Object.entries(this.buttonParameters ?? {});
    entries.forEach(([key, value]) => this.hasOwnProperty(key) && ((this as any)[key] = value));

    const btns = this.actionButtonsFn?.(this.data) ?? this.actionButtons;
    if (isObservable(btns)) this.subs.add(btns.subscribe((x) => this.setButtons(x)));
    else this.setButtons(btns);
  }

  setButtons(buttons?: ActionButton[]) {
    if (buttons) {
      this.actionButtons = buttons;
      this.listenToButtonEvents();
    }

    const mapButtonsRecursive = (buttons: any[], data: any): any[] => {
      if (!buttons) return [];

      return buttons.map((b: ActionButton) => {
        const mapped = {
          ...b,
          icon: b.iconMapper ? b.iconMapper(data) : b.icon,
          class: b.classMapper ? b.classMapper(data) : b.class,
          label: b.labelMapper ? b.labelMapper(data) : b.label,
          toolTip: b.toolTipMapper ? b.toolTipMapper(data) : b.toolTip,
          confirmMessage: b.confirmMessageMapper ? b.confirmMessageMapper(data) : b.confirmMessage,
          confirmData: b.confirmDataMapper ? b.confirmDataMapper(data) : b.confirmData,
        } as ActionButton;

        //  RECURSE into nested buttons
        if (Array.isArray(b.buttons)) mapped.buttons = mapButtonsRecursive(b.buttons, data);

        return mapped;
      });
    };

    this.actionButtons = mapButtonsRecursive(this.actionButtons, this.data);
  }

  listenToButtonEvents() {
    this.actionButtons.forEach((btn, i) => {
      if (btn.removeFile$) this.subs.add(btn.removeFile$.subscribe((x) => this.files.splice(i, 1)));
    });
  }

  isDisabled(btn: ActionButton) {
    if (btn.hasOwnProperty('disabled')) return btn.disabled;
    if (btn.hasOwnProperty('disabledFunction')) return btn.disabledFunction?.(this.data);
    return false;
  }

  async action(btn: ActionButton) {
    if (this.isDisabled(btn)) return;

    if (!!btn.confirmMessage || !!btn.confirmData || !!btn.confirmDataMapper) {
      const par: NotificationDialog = {
        icon: btn.icon as any,
        ...btn.confirmData,
        message: btn.confirmData?.message ?? btn.confirmMessage,
      };
      const confirmed = await firstValueFrom(this.notify.confirm(par).afterClosed());
      if (!confirmed) return;
    }

    let data = btn.data ?? this.data;
    if (btn.queryMapFunction) data = await btn.queryMapFunction(data);
    if (btn.click) btn.click(data);
  }

  fileChange(btn: ActionButton, event: any, index: any) {
    const file = event.target.files[0] as File;
    const extension = file?.name?.split('.')?.pop() ?? 'png';
    const canTruncate = btn.labelLength && file?.name?.length > btn.labelLength;
    const fileName = canTruncate ? file?.name?.slice(0, 15) : file?.name;

    this.files[index] = { event, file, fileName, extension };
    if (btn.onFileChange) btn.onFileChange(this.files[index]);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  trackByFn(index: number, button: any): any {
    return button.id || index;
  }

  shouldShowButton(button: any): boolean {
    if (button.hideFunction && button.hideFunction(this.data)) {
      return false;
    }
    if (button.showFunction && !button.showFunction(this.data)) {
      return false;
    }
    if (button.hide || button.visible === false) {
      return false;
    }
    return true;
  }

  getButtonHolderClass(button: any, index: number): string {
    return `${button.outerClass ?? this.buttonHolderClass} ${this.animation} --order-${index + 1}`;
  }

  getButtonClass(button: any, isMenu: boolean): string {
    let baseClass =
      button.class ??
      (button.type?.includes('fab') && !this.isDisabled(button) ? this.fabClass : 'b');

    if (isMenu) baseClass += ' border-none w-full ';

    return baseClass;
  }

  handleButtonClick(event: Event, button: any, inputFile: any, index: number): void {
    event.preventDefault();
    event.stopPropagation();

    if (button.isFileSelector || button.allowedExtensions?.length) {
      inputFile.click();
    }

    this.action(button);
  }
}
