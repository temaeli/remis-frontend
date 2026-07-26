import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_ACCESS_EVENT } from './security-access-event.graphql';
import { securityAccessEventUpsertBtn, securityAccessEvent$ } from './security-access-event.form';
import { attachmentsContent } from '../shared/security-attachments';
import { SECURITY_ACCESS_EVENT_ATTACHMENTS } from '../shared/security-attachments.graphql';

@Component({
  selector: 'security-access-event-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="accessEvent"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityAccessEventDetailComponent extends BaseComponent implements OnInit {
  override title = 'Access Control Event';
  override subtitle = 'Access Control Event Details';

  accessEvent: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [securityAccessEventUpsertBtn(this)];

  private accessEventUid = this.route.snapshot?.paramMap?.get('securityAccessEventUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_ACCESS_EVENT,
    successFn: (res) => (this.title = res?.data?.personName ?? this.title),
    variables: { uid: this.accessEventUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityAccessEvent$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.accessEvent = await this.fs.fetch(this.fetchParameter);
    const viewAccessEvent = formatEntityDates(this.accessEvent, {
      extraDateTimeKeys: ['eventTime'],
    });

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewAccessEvent,
        fetchParameter: this.fetchParameter,
      },
      attachmentsContent(
        this,
        SECURITY_ACCESS_EVENT_ATTACHMENTS,
        { accessEventUid: this.accessEventUid },
        ['ROLE_VIEW_ALL_SECURITY_ACCESS_EVENT', 'ROLE_VIEW_SECURITY_ACCESS_EVENT'],
      ),
    ];

    this.cdr.detectChanges();
  }
}
