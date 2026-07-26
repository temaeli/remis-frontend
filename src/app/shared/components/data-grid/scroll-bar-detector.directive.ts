import { NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { Directive, ElementRef, EventEmitter, inject } from '@angular/core';

@Directive({
  selector: '[scrollbarDetector]',
})
export class ScrollbarDetectorDirective implements OnInit, OnDestroy {
  @Output() scrollbarChange = new EventEmitter<{ vertical: boolean; horizontal: boolean }>();

  el = inject(ElementRef);
  ngZone = inject(NgZone);

  private resizeObserver!: ResizeObserver;
  private lastState = { vertical: false, horizontal: false };

  ngOnInit() {
    const element = this.el.nativeElement as HTMLElement;

    // Run observer outside Angular for performance
    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.checkScrollbars(element));
      this.resizeObserver.observe(element);
    });

    // Initial check
    this.checkScrollbars(element);
  }

  private checkScrollbars(el: HTMLElement) {
    const vertical = el.scrollHeight > el.clientHeight;
    const horizontal = el.scrollWidth > el.clientWidth;

    if (vertical !== this.lastState.vertical || horizontal !== this.lastState.horizontal) {
      this.lastState = { vertical, horizontal };
      // Re-enter Angular zone and emit event
      this.ngZone.run(() => this.scrollbarChange.emit(this.lastState));
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}
