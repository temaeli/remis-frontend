import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BlobAnimator } from '@shared/utils';

@Component({
  selector: 'app-logo',
  styleUrl: './logo.scss',
  template: `
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 175.28 158.57"
      class="flame-animation"
      style="max-width: 400px; height:auto; margin:auto"
    >
      <path
        class="cls-1 flame"
        d="M91.45,0s-.04,0-.03.01c.69,1.31,7.44,15.14-1.87,35.88-8.37,18.64-22.77,23.36-24.01,43.47-1.17,18.96,15.68,48.42,47.87,31.88.91-.47,1.03-1.73.21-2.33-5-3.69-18.37-15.66-15.55-36.75C102.5,38.96,107.81,16.43,91.45,0Z"
      />
      <path
        class="cls-2 base"
        d="M106.26,25.49s3.48,15.89,1.24,29.54c-2.02,12.35-8.32,28.43,2.82,41.92,1.01,1.22,3,.7,3.2-.88.14-1.05.23-2.21.23-3.39,0-4.22,2.25-25.9,5.92-26.98s12.91,7.2,15.39,16.88c2.48,9.68,1.74,40.22-31.03,45.19s-46.36-28.54-45.95-45.37c0-.16-.2-.21-.27-.07-.82,1.49-3.05,6.42-2.61,15.15.58,11.5,11.37,37.74,41.27,39.97s48.75-18.9,50.26-41.71c1.49-22.59-7.2-32.03-20.36-46.18-13.03-14.01-14.86-19.02-16.58-26.1-.03-.13-.14-.22-.27-.23h0c-1.48-.12-2.84.82-3.26,2.25h0Z"
      />

      <!-- 🔥 EMBERS (yellow sparks) — absolutely static group but circles move with keyframes -->
      <g class="embers-container">
        <!-- ember1 near flame top left -->
        <circle class="ember ember1" cx="79" cy="44" r="2.8" fill="#fdba14" opacity="0.9" />
        <!-- ember2 center right -->
        <circle class="ember ember2" cx="118" cy="58" r="2.2" fill="#fdb714" />
        <!-- ember3 rising above middle -->
        <circle class="ember ember3" cx="97" cy="29" r="1.9" fill="#ffc245" />
        <!-- ember4 near green tip -->
        <circle class="ember ember4" cx="110" cy="80" r="2.4" fill="#fdba14" />
        <!-- ember5 left side -->
        <circle class="ember ember5" cx="65" cy="65" r="2.1" fill="#fdb415" />
        <!-- ember6 a bit higher -->
        <circle class="ember ember6" cx="88" cy="18" r="2.0" fill="#fdcc5a" />
      </g>

      <!-- original static group (unchanged, fully static) -->
      <g>
        <path
          class="cls-2"
          d="M170.69,107.17h1.49c1.71,0,3.1,1.39,3.1,3.1v45.19c0,1.71-1.39,3.1-3.1,3.1h-1.49c-1.71,0-3.1-1.39-3.1-3.1v-45.19c0-1.71,1.39-3.1,3.1-3.1Z"
        />
        <path class="cls-2" d="M42.95,111.48l-1.96.18c-5.9.56-11.6,2.44-16.66,5.52h18.62v-5.71Z" />
        <path class="cls-2" d="M37.75,154.59l6.2.5v-3.97h-17.63c3.52,1.96,7.42,3.15,11.43,3.47Z" />
        <path
          class="cls-2"
          d="M160.82,107.17h-.62c-2.09,0-3.79,1.7-3.79,3.79v.68h-4.39c-.75,0-1.41.46-1.66,1.16-3.05,8.65-20.2,32.13-49.25,32.6-28.24.46-43.34-18.05-45.41-20.77-.16-.21-.41-.33-.68-.33H1.74c-.96,0-1.74.78-1.74,1.74v2.73c0,.96.78,1.74,1.74,1.74h53.72s1.73.99,1.89,3.56c.17,2.57-1.24,3.56-1.24,3.56H8.57c-.75,0-1.37.61-1.37,1.37v3.06c0,.75.61,1.37,1.37,1.37h40.8c.69,0,3.52-.35,3.52,3.66,0,.03,0,.05,0,.08-.03,1.74-1.5,3.1-3.24,3.14l-3.83.09v4.7h110.6v-.31c0,2.09,1.7,3.79,3.79,3.79h.62c2.09,0,3.79-1.7,3.79-3.79v-43.82c0-2.09-1.7-3.79-3.79-3.79Z"
        />
        <rect
          class="cls-2 base-2"
          x="44.94"
          y="110.77"
          width="3.48"
          height="6.42"
          rx=".86"
          ry=".86"
        />
      </g>
    </svg>
  `,

  host: { class: 'flex items-center justify-center' },
  imports: [CommonModule],
})
export class Logo implements OnInit {
  ngOnInit() {
    // this.animateBlob();
  }

  animateBlob() {
    const path = document.querySelector('.base-2') as SVGPathElement;
    const blobStopper = document.querySelector('.blob-stopper') as HTMLElement;
    if (!path) return;

    const blobAnimator = new BlobAnimator(path);
    blobAnimator.start();

    blobStopper?.addEventListener('mouseenter', () => blobAnimator.stop());
    blobStopper?.addEventListener('mouseleave', () => blobAnimator.start());
  }
}
