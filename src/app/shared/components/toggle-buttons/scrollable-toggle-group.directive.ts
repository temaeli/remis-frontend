// scrollable-toggle-group.directive.ts
import { Directive, AfterViewInit, OnDestroy, inject, ElementRef, Renderer2 } from '@angular/core';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { Subject, fromEvent, takeUntil, debounceTime } from 'rxjs';
import { SVG_ICONS } from '../icon/tag-icons.constants';
import { nodeFromString } from '../view-component/view.helpers';

@Directive({
  selector: '[scrollableToggleGroup]',
})
export class ScrollableToggleGroupDirective implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private toggleGroup = inject(MatButtonToggleGroup);

  private wrapper!: HTMLElement;
  private scrollContainer!: HTMLElement;
  private leftButton!: HTMLElement;
  private rightButton!: HTMLElement;

  ngAfterViewInit() {
    this.setupScrollableStructure();
    this.updateButtonStates();

    // Listen to scroll events
    fromEvent(this.scrollContainer, 'scroll')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateButtonStates());

    // Listen to window resize
    fromEvent(window, 'resize')
      .pipe(debounceTime(150), takeUntil(this.destroy$))
      .subscribe(() => this.updateButtonStates());

    // Observe content changes (for dynamic buttons)
    const observer = new ResizeObserver(() => this.updateButtonStates());
    observer.observe(this.scrollContainer);

    // Listen to toggle selection changes
    this.toggleGroup.change.pipe(takeUntil(this.destroy$)).subscribe(() => {
      requestAnimationFrame(() => this.scrollSelectedIntoView());
    });

    this.destroy$.subscribe(() => observer.disconnect());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollableStructure() {
    const host = this.el.nativeElement;

    // Create wrapper
    this.wrapper = this.renderer.createElement('div');
    this.renderer.addClass(this.wrapper, 'toggle-scroll-wrapper');

    // Create scroll container
    this.scrollContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.scrollContainer, 'toggle-scroll-container');

    // Move all children to scroll container
    const children = Array.from(host.children);
    children.forEach((child) => this.renderer.appendChild(this.scrollContainer, child));

    // Create left button
    this.leftButton = this.createScrollButton('left');

    // Create right button
    this.rightButton = this.createScrollButton('right');

    // Assemble structure - buttons are siblings, not overlapping
    this.renderer.appendChild(this.wrapper, this.leftButton);
    this.renderer.appendChild(this.wrapper, this.scrollContainer);
    this.renderer.appendChild(this.wrapper, this.rightButton);
    this.renderer.appendChild(host, this.wrapper);

    // Add scroll button click handlers
    this.leftButton.addEventListener('click', () => this.scroll('left'));
    this.rightButton.addEventListener('click', () => this.scroll('right'));
  }

  private createScrollButton(dir: 'left' | 'right'): HTMLElement {
    const button = this.renderer.createElement('button');
    this.renderer.addClass(button, 'toggle-scroll-button');
    this.renderer.addClass(button, 'border-none');
    this.renderer.addClass(button, 'p-0');
    this.renderer.addClass(button, `toggle-scroll-button-${dir}`);
    this.renderer.setAttribute(button, 'type', 'button');
    this.renderer.setAttribute(button, 'aria-label', `Scroll ${dir}`);

    const leftSvg = nodeFromString(SVG_ICONS.find((i) => i.name === 'caret_left')?.tag ?? '');
    const rightSvg = nodeFromString(SVG_ICONS.find((i) => i.name === 'caret_right')?.tag ?? '');

    // Create icon
    const icon = this.renderer.createElement('mat-icon');
    this.renderer.addClass(icon, 'mat-icon');
    this.renderer.addClass(icon, 'notranslate');
    this.renderer.setAttribute(icon, 'role', 'img');
    this.renderer.setAttribute(icon, 'aria-hidden', 'true');

    this.renderer.appendChild(icon, dir === 'left' ? leftSvg : rightSvg);
    this.renderer.appendChild(button, icon);

    return button;
  }

  private scroll(direction: 'left' | 'right') {
    const scrollAmount = this.calculateScrollAmount(direction);
    this.scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  private calculateScrollAmount(direction: 'left' | 'right'): number {
    const toggleButtons = Array.from(
      this.scrollContainer.querySelectorAll('.mat-button-toggle'),
    ) as HTMLElement[];

    if (toggleButtons.length === 0) return 200; // Fallback

    const containerRect = this.scrollContainer.getBoundingClientRect();
    const scrollLeft = this.scrollContainer.scrollLeft;

    if (direction === 'left') {
      // Find the first toggle that's partially or fully hidden to the left
      for (let i = toggleButtons.length - 1; i >= 0; i--) {
        const toggleRect = toggleButtons[i].getBoundingClientRect();
        const toggleLeftRelativeToScroll = toggleButtons[i].offsetLeft;

        if (toggleLeftRelativeToScroll < scrollLeft) {
          // Scroll to show this toggle fully
          return -(scrollLeft - toggleLeftRelativeToScroll);
        }
      }
      return -200; // Fallback
    } else {
      // Find the first toggle that's partially or fully hidden to the right
      for (let i = 0; i < toggleButtons.length; i++) {
        const toggleRect = toggleButtons[i].getBoundingClientRect();
        const toggleRightRelativeToContainer = toggleRect.right - containerRect.left;

        if (toggleRightRelativeToContainer > containerRect.width) {
          // Scroll to show this toggle fully
          const toggleLeftRelativeToScroll = toggleButtons[i].offsetLeft;
          const targetScroll = toggleLeftRelativeToScroll - containerRect.width + toggleRect.width;
          return targetScroll - scrollLeft;
        }
      }
      return 200; // Fallback
    }
  }

  private scrollSelectedIntoView() {
    const selected = this.scrollContainer.querySelector(
      '.mat-button-toggle-checked',
    ) as HTMLElement;

    if (!selected) return;

    const containerRect = this.scrollContainer.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();

    const isFullyVisible =
      selectedRect.left >= containerRect.left && selectedRect.right <= containerRect.right;

    if (!isFullyVisible) {
      // Scroll the selected toggle into view with some padding
      const scrollLeft = this.scrollContainer.scrollLeft;
      const selectedLeft = selected.offsetLeft;
      const selectedWidth = selected.offsetWidth;
      const containerWidth = this.scrollContainer.clientWidth;

      // Center the selected toggle if possible
      const targetScroll = selectedLeft - containerWidth / 2 + selectedWidth / 2;

      this.scrollContainer.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }

  private updateButtonStates() {
    const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;

    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    const needsScroll = scrollWidth > clientWidth;

    // Update left button
    if (needsScroll && canScrollLeft) {
      this.renderer.removeClass(this.leftButton, 'toggle-scroll-button-disabled');
      this.renderer.setAttribute(this.leftButton, 'tabindex', '0');
    } else {
      this.renderer.addClass(this.leftButton, 'toggle-scroll-button-disabled');
      this.renderer.setAttribute(this.leftButton, 'tabindex', '-1');
    }

    // Update right button
    if (needsScroll && canScrollRight) {
      this.renderer.removeClass(this.rightButton, 'toggle-scroll-button-disabled');
      this.renderer.setAttribute(this.rightButton, 'tabindex', '0');
    } else {
      this.renderer.addClass(this.rightButton, 'toggle-scroll-button-disabled');
      this.renderer.setAttribute(this.rightButton, 'tabindex', '-1');
    }

    // Show/hide buttons based on need
    if (needsScroll) {
      this.renderer.setStyle(this.leftButton, 'display', 'flex');
      this.renderer.setStyle(this.rightButton, 'display', 'flex');
    } else {
      this.renderer.setStyle(this.leftButton, 'display', 'none');
      this.renderer.setStyle(this.rightButton, 'display', 'none');
    }
  }
}
