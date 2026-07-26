import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_ATTACHMENT_BY_UID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { AttachmentContentComponent } from './attachment-content.component';

/**
 * Generic attachment viewer page. Fetches `getAttachmentByUid` once and renders
 * a Details tab (metadata) plus a Content tab (inline PDF/image, download
 * fallback). Shared by every module that uploads attachments (incidents, HSE
 * meetings, inspection plans) — the backend endpoint is uid-scoped, so a single
 * route at `hse/attachments/:attachmentUid` serves them all.
 */
@Component({
  selector: 'attachment-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header [title]="title" [subtitle]="subtitle" [data]="attachment" />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class AttachmentDetailComponent extends BaseComponent implements OnInit {
  override title = 'Attachment';
  override subtitle = 'Attachment Details';

  attachment: any;
  override contents: ContentParameter[] = [];

  private attachmentUid = this.route.snapshot?.paramMap?.get('attachmentUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_ATTACHMENT_BY_UID,
    successFn: (res) => (this.title = res?.data?.attachmentTitle ?? this.title),
    variables: { attachmentUid: this.attachmentUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
  }

  async setContents(): Promise<void> {
    this.attachment = await this.fs.fetch(this.fetchParameter);

    // Keep the heavy base64 payload out of the Details key/value grid.
    const { attachment: _content, ...meta } = this.attachment ?? {};
    const viewMeta = formatEntityDates(meta);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewMeta,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'component',
        name: 'Content',
        label: 'Content',
        icon: 'description',
        componentType: AttachmentContentComponent,
        componentInputs: {
          data: this.attachment?.attachment,
          mediaType: this.attachment?.mediaType,
          fileName: this.attachment?.attachmentTitle ?? `attachment-${this.attachmentUid ?? 'file'}`,
        },
      },
    ];

    this.cdr.detectChanges();
  }
}
