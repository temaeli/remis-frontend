import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlobAnimator } from '@shared';

@Component({
  selector: 'app-auth-footer',
  imports: [],
  templateUrl: './auth-footer.html',
  styleUrl: './auth-footer.scss',
})
export class AuthFooter implements OnInit {
  router = inject(Router);

  currentYear = new Date().getFullYear();

  apps = [
    { name: 'App Store', description: 'Download on the', href: '#appstore', icon: 'play_store' },
    { name: 'Google Play', description: 'Get it on', href: '#googleplay', icon: 'app_store' },
  ];

  ngOnInit() {
    this.animateBlob();
  }

  animateBlob() {
    const path = document.querySelector('.blob-path') as SVGPathElement;
    const blobStopper = document.querySelector('.blob-stopper') as HTMLElement;
    if (!path) return;

    const blobAnimator = new BlobAnimator(path);
    blobAnimator.start();

    blobStopper?.addEventListener('mouseenter', () => blobAnimator.stop());
    blobStopper?.addEventListener('mouseleave', () => blobAnimator.start());
  }
}
