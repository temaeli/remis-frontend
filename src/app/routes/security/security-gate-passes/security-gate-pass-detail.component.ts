import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_GATE_PASS } from './security-gate-pass.graphql';
import { securityGatePassUpsertBtn, securityGatePass$ } from './security-gate-pass.form';
import { approvalHistoryContent, SECURITY_SUBJECT } from '../shared/security-approval-history';
import { attachmentsContent } from '../shared/security-attachments';
import { SECURITY_GATE_PASS_ATTACHMENTS } from '../shared/security-attachments.graphql';

@Component({
  selector: 'security-gate-pass-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="gatePass"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityGatePassDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Gate Pass';
  override subtitle = 'Security Gate Pass Details';

  gatePass: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [securityGatePassUpsertBtn(this)];

  private gatePassUid = this.route.snapshot?.paramMap?.get('securityGatePassUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_GATE_PASS,
    successFn: (res) => (this.title = res?.data?.referenceNumber ?? this.title),
    variables: { uid: this.gatePassUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityGatePass$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.gatePass = await this.fs.fetch(this.fetchParameter);
    const view = formatEntityDates(this.gatePass);

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
        name: 'Items',
        label: 'Items',
        icon: 'inventory_2',
        theme: 'simple',
        keyColumns: ['index', 'materialDescription', 'quantity', 'itemRefNo', 'itemStatus'],
        gridData: this.gatePass?.items ?? [],
      },
      attachmentsContent(this, SECURITY_GATE_PASS_ATTACHMENTS, { gatePassUid: this.gatePassUid }, [
        'ROLE_VIEW_ALL_SECURITY_GATE_PASS',
        'ROLE_VIEW_SECURITY_GATE_PASS',
      ]),
      approvalHistoryContent(SECURITY_SUBJECT.GATE_PASS, this.gatePassUid),
    ];

    this.cdr.detectChanges();
  }
}
