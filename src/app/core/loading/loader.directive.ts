import { Directive, Input, ElementRef, Renderer2, OnChanges } from '@angular/core';

@Directive({
  selector: '[loading]',
  standalone: true,
})
export class LoadingDirective implements OnChanges {
  @Input() loading = false;
  @Input() overlay = true;
  @Input() hideContent = false;

  private spinnerEl!: HTMLElement;
  private overlayEl!: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    this.createSpinner();
    this.createOverlay();
  }

  ngOnChanges() {
    this.update();
  }

  private createSpinner() {
    this.spinnerEl = this.renderer.createElement('div');
    this.renderer.addClass(this.spinnerEl, 'app-loader-spinner');
    this.renderer.addClass(this.spinnerEl, 'app-dots');
    this.renderer.addClass(this.spinnerEl, 'app-dots--sm');
    this.renderer.setAttribute(this.spinnerEl, 'aria-hidden', 'true');
    for (let i = 0; i < 3; i++) {
      this.renderer.appendChild(this.spinnerEl, this.renderer.createElement('span'));
    }
    this.renderer.appendChild(this.el.nativeElement, this.spinnerEl);
  }

  private createOverlay() {
    this.overlayEl = this.renderer.createElement('div');
    this.renderer.addClass(this.overlayEl, 'app-loader-overlay');
    this.renderer.appendChild(this.el.nativeElement, this.overlayEl);
  }

  private update() {
    const host = this.el.nativeElement;

    // Host must be relative for overlay
    this.renderer.setStyle(host, 'position', 'relative');

    if (this.loading) {
      this.renderer.addClass(host, 'app-loading');
      if (this.hideContent) this.renderer.addClass(host, 'app-loading-hide-content');
      if (this.overlay) this.renderer.addClass(host, 'app-loading-overlay');
    } else {
      this.renderer.removeClass(host, 'app-loading');
      this.renderer.removeClass(host, 'app-loading-hide-content');
      this.renderer.removeClass(host, 'app-loading-overlay');
    }
  }
}
