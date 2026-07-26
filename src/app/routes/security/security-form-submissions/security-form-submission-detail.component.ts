import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_FORM_SUBMISSION, GET_SECURITY_FORM_FIELDS } from './security-form-submission.graphql';
import {
  securityFormSubmissionUpsertBtn,
  securityFormSubmission$,
} from './security-form-submission.form';
import { approvalHistoryContent, SECURITY_SUBJECT } from '../shared/security-approval-history';
import { attachmentsContent } from '../shared/security-attachments';
import { SECURITY_FORM_SUBMISSION_ATTACHMENTS } from '../shared/security-attachments.graphql';
import { securityPdfBtn } from '../shared/security-pdf';
import { SECURITY_FORM_SUBMISSION_PDF } from '../shared/security-pdf.graphql';

@Component({
  selector: 'security-form-submission-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="submission"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityFormSubmissionDetailComponent extends BaseComponent implements OnInit {
  override title = 'Form Submission';
  override subtitle = 'Form Submission Details';

  submission: any;
  formFields: any[] = [];
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityFormSubmissionUpsertBtn(this),
    securityPdfBtn(this, {
      query: SECURITY_FORM_SUBMISSION_PDF,
      variablesFn: (row) => ({ submissionUid: row?.uid ?? this.submissionUid }),
      fileNameFn: (row) => `security-form-submission-${row?.referenceNumber ?? row?.uid ?? ''}`,
      permissions: [
        'ROLE_VIEW_ALL_SECURITY_FORM_SUBMISSION',
        'ROLE_VIEW_SECURITY_FORM_SUBMISSION',
      ],
    }),
  ];

  submissionUid = this.route.snapshot?.paramMap?.get('securityFormSubmissionUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_FORM_SUBMISSION,
    successFn: (res) => (this.title = res?.data?.referenceNumber ?? this.title),
    variables: { uid: this.submissionUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityFormSubmission$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.submission = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.submission);

    // Fetch form field definitions
    if (this.submission?.form?.uid) {
      try {
        const fieldsRes = await this.fs.fetch({
          query: GET_SECURITY_FORM_FIELDS,
          variables: { formUid: this.submission.form.uid },
          loadingOn: 'no-content',
        });
        console.log('Form fields response:', fieldsRes);
        // Handle different response structures
        this.formFields = fieldsRes?.securityFormFields ?? fieldsRes?.data ?? fieldsRes ?? [];
        console.log('Extracted form fields:', this.formFields);
      } catch (error) {
        console.warn('Failed to fetch form fields:', error);
        this.formFields = [];
      }
    }

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: view,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'FormFields',
        label: 'Form Fields Definition',
        icon: 'assignment',
        theme: 'simple',
        keyColumns: ['fieldKey', 'label', 'fieldType', 'required', 'orderIndex'],
        gridData: this.formFields,
      },
      {
        type: 'table',
        name: 'Values',
        label: 'Submitted Values',
        icon: 'list_alt',
        theme: 'simple',
        keyColumns: ['fieldKey', 'valueText', 'valueNumber', 'valueDate', 'valueBoolean'],
        gridData: this.submission?.values ?? [],
      },
      attachmentsContent(
        this,
        SECURITY_FORM_SUBMISSION_ATTACHMENTS,
        { submissionUid: this.submissionUid },
        ['ROLE_VIEW_ALL_SECURITY_FORM_SUBMISSION', 'ROLE_VIEW_SECURITY_FORM_SUBMISSION'],
      ),
      approvalHistoryContent(SECURITY_SUBJECT.FORM_SUBMISSION, this.submissionUid),
    ];

    this.cdr.detectChanges();
  }
}
