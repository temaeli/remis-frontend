import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

import { InsuranceRegistration } from './insurance-registration.interface';
import { GET_INSURANCE_REGISTRATION_BY_UID } from './insurance-registration.graphql';
import {
  insuranceRegistrationUpsertBtn,
  insuranceRegistration$,
  insuranceRegistrationProcessBtn,
} from './insurance-registration.form';
import {
  ComplianceRegistrationStage,
  processRegistration$,
} from '../compliance-common/compliance-common';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import {
  attachment$,
  deleteAttachmentBtn,
  uploadAttachmentBtn,
} from '@shared/components/generic-form/attachment/attachment-upload.util';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';

@Component({
  selector: 'app-insurance-registration.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="insuranceRegistration"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class InsuranceRegistrationComponent extends BaseComponent implements OnInit {
  override title = 'Insurance Registration';
  override subtitle = 'Insurance Registration Management';
  goBack$ = processRegistration$;

  insuranceRegistration: InsuranceRegistration | undefined;
  override contents = signal<ContentParameter[]>([]);
  editable = false;

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_INSURANCE_REGISTRATION_BY_UID,
    successFn: (res) => (this.title = res?.data?.nameOfAsset),
    variables: { uid: this.route.snapshot?.paramMap?.get('insuranceRegistrationUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setActions();

    this.subs.add(insuranceRegistration$.subscribe(() => this.setContents()));
    this.subs.add(attachment$.subscribe(() => this.setContents()));
  }

  setActions() {
    this.actionButtons = [
      insuranceRegistrationUpsertBtn(this),
      insuranceRegistrationProcessBtn(this),
    ];

    if (this.editable) {
      this.actionButtons.push(uploadAttachmentBtn(this, AttachmentSourceNameEnum.OTHERS));
    }
  }

  async setContents() {
    let temp = await this.fs.fetch(this.fetchParameter);
    if (!temp?.uid) return;

    let attachments = await this.fs.fetch({
      query: LIST_ATTACHMENTS_BY_SOURCE_ID,
      variables: { sourceUid: temp?.uid },
    });

    this.insuranceRegistration = { ...temp, attachments };

    this.editable = this.insuranceRegistration?.stage === ComplianceRegistrationStage.OFFICER;

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.insuranceRegistration,
        fetchParameter: this.fetchParameter,

        fieldsProperties: {
          attachments: { listItemButtons: this.editable ? [deleteAttachmentBtn(this)] : [] },
        },
      },
    ]);
  }
}
