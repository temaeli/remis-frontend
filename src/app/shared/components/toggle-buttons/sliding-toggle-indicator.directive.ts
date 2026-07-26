import {
  Directive,
  AfterViewInit,
  OnDestroy,
  inject,
  ElementRef,
  Renderer2,
  NgZone,
} from '@angular/core';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { delayedExecution } from '@core/helpers/view.helpers';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[slidingToggleIndicator]',
})
export class SlidingToggleIndicatorDirective implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private toggleGroup = inject(MatButtonToggleGroup);
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);

  private pending = false;
  private scrollContainer!: HTMLElement;

  ngAfterViewInit() {
    this.renderer.addClass(this.el.nativeElement, 'custom-toggle-group');

    // Get reference to scroll container
    this.scrollContainer = this.el.nativeElement.querySelector(
      '.toggle-scroll-container',
    ) as HTMLElement;

    this.toggleGroup.change.pipe(takeUntil(this.destroy$)).subscribe((x) => this.scheduleOnce());

    // Initial update
    delayedExecution(() => this.scheduleOnce(), 400);
  }

  private scheduleOnce() {
    if (this.pending) return;

    this.pending = true;

    this.ngZone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        requestAnimationFrame(() => [this.updateIndicator(), (this.pending = false)]);
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateIndicator() {
    const active = this.el.nativeElement.querySelector('.mat-button-toggle-checked') as HTMLElement;
    if (!active) return;

    const host =
      this.scrollContainer || this.el.nativeElement.querySelector('.toggle-scroll-container');
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const scrollLeft = host.scrollLeft || 0;

    // Calculate position: viewport position + scroll offset
    const x = activeRect.left - hostRect.left + scrollLeft;
    const width = activeRect.width;

    host.style.setProperty('--indicator-x', `${x}px`);
    host.style.setProperty('--indicator-width', `${width}px`);
  }
}
