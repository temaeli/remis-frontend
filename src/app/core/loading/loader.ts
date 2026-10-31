import { ChangeDetectionStrategy, Component } from '@angular/core';

// Dots styles live in src/styles/custom/_app-loader.scss (.app-dots).
@Component({
  selector: 'app-loading-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading-overlay" role="status" aria-label="Loading">
      <div class="app-dots"><span></span><span></span><span></span></div>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--color-white-faded);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        border-radius: var(--border-radius);
      }
    `,
  ],
})
export class LoadingOverlayComponent {}
