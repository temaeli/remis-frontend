import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  fileExtensionAttributeMap,
  FileExtension,
} from '@shared/components/generic-form/attachment/attachment.interface';

/**
 * Renders attachment file content for a "Content" tab. PDFs and images render
 * inline; every other media type falls back to a download button. Receives the
 * already-fetched base64 payload — it does not fetch anything itself, so the
 * parent detail page hits `getAttachmentByUid` exactly once and feeds both the
 * Details tab (metadata) and this tab (content) from that single response.
 */
@Component({
  selector: 'attachment-content',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="absolute inset-0 flex flex-col overflow-hidden">
      @if (kind === 'pdf') {
        <iframe class="flex-1 w-full border-0 m-2 rounded-lg bg-white" [src]="safeUrl" title="PDF preview"></iframe>
      } @else if (kind === 'image') {
        <div class="flex-1 m-2 bg-white rounded-lg overflow-auto flex items-center justify-center">
          <img [src]="safeUrl" [alt]="fileName" class="max-w-full max-h-full object-contain" />
        </div>
      } @else if (kind === 'empty') {
        <div class="flex-1 flex flex-col items-center justify-center bg-white rounded-lg m-2 gap-2 text-gray-500">
          <mat-icon>broken_image</mat-icon>
          <span>No content available</span>
        </div>
      } @else {
        <div class="flex-1 flex flex-col items-center justify-center bg-white rounded-lg m-2 gap-3 text-gray-600">
          <mat-icon class="!w-12 !h-12 !text-5xl">description</mat-icon>
          <span>Preview not available for this file type.</span>
          <button mat-raised-button color="primary" (click)="download()">
            <mat-icon>download</mat-icon> Download
          </button>
        </div>
      }

      @if (kind === 'pdf' || kind === 'image') {
        <div class="flex justify-end px-2 pb-2">
          <button mat-stroked-button color="primary" (click)="download()">
            <mat-icon>download</mat-icon> Download
          </button>
        </div>
      }
    </div>
  `,
})
export class AttachmentContentComponent implements OnChanges, OnDestroy {
  /** Raw base64 file payload (the entity's transient `attachment` field). */
  @Input() data?: string | null;
  /** Short (`pdf`) or full (`application/pdf`) media type. */
  @Input() mediaType?: string | null;
  @Input() fileName = 'attachment';

  kind: 'pdf' | 'image' | 'other' | 'empty' = 'empty';
  safeUrl?: SafeResourceUrl;
  private blobUrl?: string;
  private blob?: Blob;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.revoke();
    const raw = (this.data ?? '').trim();
    if (!raw) {
      this.kind = 'empty';
      return;
    }
    const fullMime = this.resolveFullMime(this.mediaType);
    const payload = raw.startsWith('data:') ? raw.split(',', 2)[1] ?? '' : raw;
    this.blob = this.base64ToBlob(payload, fullMime);
    this.blobUrl = URL.createObjectURL(this.blob);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);

    if (fullMime === 'application/pdf') this.kind = 'pdf';
    else if (fullMime.startsWith('image/')) this.kind = 'image';
    else this.kind = 'other';
  }

  download(): void {
    if (!this.blob) return;
    const url = this.blobUrl ?? URL.createObjectURL(this.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName || 'attachment';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  private resolveFullMime(mediaType?: string | null): string {
    if (!mediaType) return 'application/octet-stream';
    if (mediaType.includes('/')) return mediaType;
    const ext = `.${mediaType.toLowerCase()}` as FileExtension;
    return fileExtensionAttributeMap[ext] ?? 'application/octet-stream';
  }

  private base64ToBlob(rawBase64: string, mime: string): Blob {
    const binary = atob(rawBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  private revoke(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = undefined;
    }
  }

  ngOnDestroy(): void {
    this.revoke();
  }
}
