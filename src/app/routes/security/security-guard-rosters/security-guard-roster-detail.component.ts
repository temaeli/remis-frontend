import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_GUARD_ROSTER } from './security-guard-roster.graphql';
import { securityGuardRosterUpsertBtn, securityGuardRoster$ } from './security-guard-roster.form';
import { approvalHistoryContent, SECURITY_SUBJECT } from '../shared/security-approval-history';

@Component({
  selector: 'security-guard-roster-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="roster"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityGuardRosterDetailComponent extends BaseComponent implements OnInit {
  override title = 'Guard Roster';
  override subtitle = 'Guard Roster Details';

  roster: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [securityGuardRosterUpsertBtn(this)];

  private rosterUid = this.route.snapshot?.paramMap?.get('securityGuardRosterUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_GUARD_ROSTER,
    successFn: (res) => (this.title = res?.data?.referenceNumber ?? this.title),
    variables: { uid: this.rosterUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityGuardRoster$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.roster = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.roster);

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
        name: 'Entries',
        label: 'Entries',
        icon: 'event',
        theme: 'simple',
        keyColumns: ['index', 'guardName', 'dutyDate', 'shift'],
        gridData: this.roster?.entries ?? [],
      },
      approvalHistoryContent(SECURITY_SUBJECT.GUARD_ROSTER, this.rosterUid),
    ];

    this.cdr.detectChanges();
  }
}
