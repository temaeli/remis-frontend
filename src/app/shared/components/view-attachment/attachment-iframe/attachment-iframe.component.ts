import { AfterViewInit, Component, OnDestroy, OnInit, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'attachment-iframe',
  templateUrl: './attachment-iframe.component.html',
  styleUrls: ['./attachment-iframe.component.scss'],
  imports: [NgxExtendedPdfViewerModule],
})
export class AttachmentIframeComponent implements OnInit, AfterViewInit {
  router = inject(Router);

  uid: string | undefined = this.router.url.split('/').pop();
  base64 = undefined;
  colorValue = '#ffffff';

  ngAfterViewInit(): void {
    window.parent.postMessage({ uid: this.uid }, '*');
  }

  ngOnInit() {
    if (typeof this.uid !== 'string') return;

    window.addEventListener('message', ({ data }) => {
      if (data?.[(this.uid as any)]) this.base64 = data?.[(this.uid as any)];
      if (data?.colorValue) this.colorValue = data?.colorValue;
    });
  }
}
