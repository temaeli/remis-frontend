import {
  Injectable,
  Renderer2,
  RendererFactory2,
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { LoadingOverlayComponent } from './loader';

@Injectable({
  providedIn: 'root',
})
export class loadingService {
  private renderer: Renderer2;
  private overlayMap = new Map<Element, ComponentRef<LoadingOverlayComponent>>();
  private pendingOverlays = new Map<string, any>();

  constructor(
    private rendererFactory: RendererFactory2,
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  show(
    className: string | undefined,
    options: { maxRetries?: number; retryDelay?: number } = {},
  ): void {
    if (!className) return;
    const { maxRetries = 10, retryDelay = 100 } = options;

    this.attemptShowLoading(className, 0, maxRetries, retryDelay);
  }

  private attemptShowLoading(
    className: string,
    attempt: number,
    maxRetries: number,
    retryDelay: number,
  ): void {
    const element = document.querySelector(`.${className}`);

    if (element) {
      // Clear any pending retry
      this.clearPendingOverlay(className);

      // Don't add if already exists
      if (this.overlayMap.has(element)) {
        return;
      }

      // Create the overlay component
      const componentRef = createComponent(LoadingOverlayComponent, {
        environmentInjector: this.injector,
      });

      // Attach to application
      this.appRef.attachView(componentRef.hostView);

      // Get the DOM element
      const overlayElement = componentRef.location.nativeElement;

      // Set position relative on target element if needed
      const currentPosition = window.getComputedStyle(element).position;
      if (currentPosition === 'static') {
        this.renderer.setStyle(element, 'position', 'relative');
      }

      // Append overlay to target element
      this.renderer.appendChild(element, overlayElement);

      // Store reference
      this.overlayMap.set(element, componentRef);
    } else if (attempt < maxRetries) {
      // Element not found, retry after delay
      const timeoutId = setTimeout(() => {
        this.attemptShowLoading(className, attempt + 1, maxRetries, retryDelay);
      }, retryDelay);

      this.pendingOverlays.set(className, timeoutId);
    } else {
      console.warn(`Element with class "${className}" not found after ${maxRetries} attempts`);
      this.clearPendingOverlay(className);
    }
  }

  hide(className: string | undefined): void {
    if (!className) return;
    // Clear any pending retry first
    this.clearPendingOverlay(className);

    const element = document.querySelector(`.${className}`);

    if (!element) {
      // Try to find and remove overlay from any element that might have it
      this.overlayMap.forEach((componentRef, el) => {
        if (el.classList.contains(className)) this.removeOverlay(el, componentRef);
      });
      return;
    }

    const componentRef = this.overlayMap.get(element);
    if (componentRef) this.removeOverlay(element, componentRef);
  }

  hideAll(): void {
    // Clear all pending overlays
    this.pendingOverlays.forEach((timeoutId) => clearTimeout(timeoutId));
    this.pendingOverlays.clear();

    // Remove all existing overlays
    this.overlayMap.forEach((componentRef, element) => this.removeOverlay(element, componentRef));
  }

  private removeOverlay(
    element: Element,
    componentRef: ComponentRef<LoadingOverlayComponent>,
  ): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
    this.overlayMap.delete(element);
  }

  private clearPendingOverlay(className: string): void {
    const timeoutId = this.pendingOverlays.get(className);

    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pendingOverlays.delete(className);
    }
  }
}
