import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

import { OpinionRegistration } from './opinion-registration.interface';
import { GET_OPINION_REGISTRATION_BY_UID } from './opinion-registration.graphql';
import {
  opinionRegistrationUpsertBtn,
  opinionRegistration$,
  opinionRegistrationProcessBtn,
} from './opinion-registration.form';
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
  selector: 'app-opinion-registration.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="opinionRegistration"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class OpinionRegistrationComponent extends BaseComponent implements OnInit {
  override title = 'Opinion Registration';
  override subtitle = 'Opinion Registration Management';
  goBack$ = processRegistration$;

  opinionRegistration: OpinionRegistration | undefined;
  override contents = signal<ContentParameter[]>([]);
  editable = false;

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_OPINION_REGISTRATION_BY_UID,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.route.snapshot?.paramMap?.get('opinionRegistrationUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setActions();

    this.subs.add(opinionRegistration$.subscribe(() => this.setContents()));
    this.subs.add(attachment$.subscribe(() => this.setContents()));
  }

  setActions() {
    this.actionButtons = [opinionRegistrationUpsertBtn(this), opinionRegistrationProcessBtn(this)];

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

    this.opinionRegistration = { ...temp, attachments };

    this.editable = this.opinionRegistration?.stage === ComplianceRegistrationStage.OFFICER;

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.opinionRegistration,
        fetchParameter: this.fetchParameter,

        fieldsProperties: {
          attachments: { listItemButtons: this.editable ? [deleteAttachmentBtn(this)] : [] },
        },
      },
    ]);
  }
}
