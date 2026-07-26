import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inquiry, InquiryStage, InquiryStatus } from './inquiry.interface';
import {
  GET_INQUIRY_BY_UID,
  GET_INQUIRY_REPLIES,
  MY_INQUIRY_ASSIGNMENT_PAGEABLE,
} from './inquiry.graphql';
import {
  inquiryUpsertBtn,
  inquiry$,
  inquiryCloseBtn,
  inquiryProcess$,
  inquirySubmitBtn,
} from './forms/inquiry.form';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { inquiryAttendBtn } from './forms/attend-inquiry.form';
import { inquiryAssignBtn } from './forms/assign-inquiry.form';
import { getDisplayDateTime } from '@core/helpers/date.helpers';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { inquiryReplyAttachmentsBtn } from './forms/inquiry-attachment.form';
import {
  attachment$,
  deleteAttachmentBtn,
  uploadAttachmentBtn,
} from '@shared/components/generic-form/attachment/attachment-upload.util';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';

@Component({
  selector: 'app-inquiry.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="inquiry"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class InquiryComponent extends BaseComponent implements OnInit {
  override title = 'Feedback / Complaint';
  override subtitle = 'Feedback / Complaint Management';

  inquiry: Inquiry | undefined;
  override contents = signal<ContentParameter[]>([]);
  goBack$ = inquiryProcess$;
  editable = false;

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_INQUIRY_BY_UID,
    successFn: (res) => (this.title = res?.data?.clientName),
    variables: { uid: this.route.snapshot?.paramMap?.get('inquiryUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setActions();

    this.subs.add(inquiry$.subscribe(() => this.setContents()));
    this.subs.add(attachment$.subscribe(() => this.setContents()));
  }

  setActions() {
    this.actionButtons = [
      inquiryUpsertBtn(this),
      inquiryCloseBtn(this),
      inquiryAssignBtn(this),
      inquiryAttendBtn(this),
      inquirySubmitBtn(this),
    ];

    if (this.editable) {
      this.actionButtons.push(uploadAttachmentBtn(this, AttachmentSourceNameEnum.OTHERS));
    }
  }

  async setContents() {
    const temp = await this.fs.fetch(this.fetchParameter);

    if (!temp) return;

    const attachments = await this.fs.fetch({
      query: LIST_ATTACHMENTS_BY_SOURCE_ID,
      variables: { sourceUid: temp?.uid },
    });

    this.inquiry = { ...temp, attachments };

    this.editable =
      this.inquiry?.status === InquiryStatus.OPEN && this.inquiry?.stage === InquiryStage.DRAFT;

    const replies = await this.fs.fetch({
      query: GET_INQUIRY_REPLIES,
      variables: { uid: this.inquiry?.uid },
    });

    const assignments = await this.fs.fetch({
      query: MY_INQUIRY_ASSIGNMENT_PAGEABLE,
      searchStates: { 'inquiry.uid': this.inquiry?.uid },
      resMapFn: (res) => res?.content || [],
    });

    this.inquiry && (this.inquiry.assignments = assignments ?? []);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.inquiry,
        hiddenKeys: ['assignments', 'replies'],
        fetchParameter: this.fetchParameter,

        fieldsProperties: {
          attachments: { listItemButtons: this.editable ? [deleteAttachmentBtn(this)] : [] },
        },

        children: [
          //
          ...((replies.length
            ? [
                {
                  type: 'table',
                  icon: 'comment',
                  label: 'Attend Details',
                  gridData: replies,
                  actionButtons: [inquiryReplyAttachmentsBtn(this)],
                  keyColumns: [
                    'sno as S/No',
                    'attendee',
                    {
                      field: 'comment',
                      header: 'Comment',
                      type: 'html',
                      valueFn: (r: any) => {
                        const comment = r?.comment || '--';
                        const createdAt = r?.createdAt ? getDisplayDateTime(r.createdAt) : '--';
                        return `
                        <div> ${comment}</div>
                        <div class="text-xs opacity-60">    ${createdAt}</div>
                     `;
                      },
                    },

                    'actions',
                  ],
                },
              ]
            : []) as ContentParameter[]),

          ...((assignments.length
            ? [
                {
                  type: 'table',
                  icon: 'user',
                  label: 'Assignments',
                  gridData: assignments,
                  keyColumns: [
                    'sno as S/No',
                    {
                      field: 'comment',
                      header: 'Details',
                      type: 'html',
                      valueFn: (r: any) => {
                        const comment = r?.comment || '--';
                        const assignedBy = r?.assignedBy?.fullName || '--';
                        const createdAt = r?.createdAt ? getDisplayDateTime(r.createdAt) : '--';
                        return `
                        <div> ${comment}</div>
                        <div class="text-xs opacity-60"> ${assignedBy} |  ${createdAt}</div>
                     `;
                      },
                    },
                  ],
                },
              ]
            : []) as ContentParameter[]),
        ],
      },
    ]);
  }
}
