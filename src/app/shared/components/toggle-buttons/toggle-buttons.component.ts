import { Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ChangeDetectorRef, Component, EventEmitter, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { ToObservablePipe } from '../../pipes/to-observable.pipe';
import { NumberCounterComponent } from '../number-counter/number-counter.component';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IsValuePipe } from '../../pipes/is-value.pipe';
import { SlidingToggleIndicatorDirective } from '@shared/components/toggle-buttons/sliding-toggle-indicator.directive';
import { ScrollableToggleGroupDirective } from './scrollable-toggle-group.directive';
import { IconComponent } from '../icon/icon.component';
import { isValue } from '@core/helpers';
import { FetchService } from '@shared/fetch/fetch.service';
import { settings$ } from '@core/settings/settings.store';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

export interface ToggleButton {
  value?: any;
  disabled?: boolean;
  icon?: string;
  toolTip?: string;
  label?: string;
  badge?: any | Observable<any>;
  hideIcon?: boolean;
  click?: () => any;
  [key: string]: any;
}

@Component({
  selector: 'toggle-buttons',
  templateUrl: './toggle-buttons.component.html',
  styleUrls: ['./toggle-buttons.component.scss'],
  imports: [
    MatButtonToggleGroup,
    MergeClassesPipe,
    MatButtonToggle,
    ToObservablePipe,
    NumberCounterComponent,
    SafeHtmlPipe,
    AsyncPipe,
    MatTooltipModule,
    IsValuePipe,
    CommonModule,
    SlidingToggleIndicatorDirective,
    ScrollableToggleGroupDirective,
    IconComponent,
    HasPermissionDirective,
  ],
})
export class ToggleButtonsComponent implements OnChanges, OnInit {
  fs = inject(FetchService);

  @Input() animation = settings$.value.animations?.pages;
  @Input() toggleButtons?: ToggleButton[];
  @Input() vertical = false;
  @Input() multiple = false;

  @Input() hideIcons = false;
  @Input() iconClass = '';
  @Input() labelClass = '';
  @Input() groupClass = '';
  @Input() buttonClass = 'px-1';
  @Input() badgeClass = '';

  @Input() valueKey = 'value';
  @Input() labelKey = 'label';

  @Input() labelMapper?: (option: ToggleButton) => string = undefined;

  @Input() initialValue: any = undefined;
  initialValue_ = undefined;
  @Output() value = new EventEmitter();

  cdr = inject(ChangeDetectorRef);

  /**
   * Referentially-stable list the template iterates. Parent views (e.g. detail
   * pages) often rebuild their `toggleButtons` array on every data reload; if we
   * re-rendered the @for each time, the scroll directive (which relocates the
   * generated toggles into a scroll container) would leave Angular re-inserting
   * views at the original anchors — crashing (insertBefore) or duplicating tabs.
   * We only swap in a new array when the buttons actually change, so unchanged
   * tab sets are a no-op for @for and the relocated DOM is never disturbed.
   */
  buttons: ToggleButton[] = [];
  private buttonsSignature = '';

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // only set this value once
    if (!isValue(this.initialValue_)) this.initialValue_ = this.initialValue;
    this.syncButtons();
    this.cdr.detectChanges();
  }

  private syncButtons(): void {
    const incoming = this.toggleButtons ?? [];
    const signature = incoming
      .map(
        (o) =>
          `${o?.[this.valueKey]}|${o?.[this.labelKey]}|${o?.icon ?? ''}|${o?.disabled ?? ''}`,
      )
      .join('~');

    if (signature !== this.buttonsSignature || this.buttons.length !== incoming.length) {
      this.buttonsSignature = signature;
      this.buttons = incoming;
    }
  }

  onValueChange(value: any) {
    this.value.emit(value);
  }
}
