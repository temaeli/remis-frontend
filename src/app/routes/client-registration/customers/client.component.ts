import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { Client } from './clients.interface';
import { FIND_CLIENT } from './clients.graphql';
import { clientUpsertBtn, client$ } from './clients.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { approvalHistoryContent, CUSTOMER_SUBJECT } from './customer-approval-history';
import { CLIENT_INSTALLED_AREAS_BY_CLIENT } from './client-installed-area/client-installed-area.graphql';
import {
  clientInstalledArea$,
  clientInstalledAreaTableBtns,
  clientInstalledAreaUpsertBtn,
} from './client-installed-area/client-installed-area.form';

@Component({
  selector: 'app-client-detail',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="client"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class ClientComponent extends BaseComponent implements OnInit {
  override title = 'Client';
  override subtitle = 'Client Details';

  client: Client | undefined;
  clientUid: string | null = this.route.snapshot?.paramMap?.get('clientUid');

  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [clientUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_CLIENT,
    successFn: (res) => (this.title = res?.data?.user?.fullName || res?.data?.code),
    variables: { uid: this.clientUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(client$.subscribe(() => this.setContents()));
    this.subs.add(clientInstalledArea$.subscribe(() => this.setContents()));
  }

  async setContents() {
    if (!this.clientUid) return;
    const clientUid = this.clientUid;
    this.client = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        name: 'Details',
        label: 'Details',
        showUndefined: true,
        entity: this.client,
        fetchParameter: this.fetchParameter,
      },
      {
        type: 'table',
        name: 'InstalledAreas',
        label: 'Zones of Operation',
        icon: 'zone',
        permissions: ['ROLE_VIEW_ALL_CLIENT_INSTALLED_AREA', 'ROLE_VIEW_CLIENT_INSTALLED_AREA'],
        keyColumns: [
          'index',
          { field: 'gasInstallation.name', header: 'Zone' },
          'activeConnections',
          'notActiveConnections',
          'notes',
          'actions',
        ],
        actionButtons: clientInstalledAreaTableBtns(this, clientUid),
        reloadActions$: [clientInstalledArea$],
        fetchParameter: {
          query: CLIENT_INSTALLED_AREAS_BY_CLIENT,
          variables: { clientUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [clientInstalledAreaUpsertBtn(this, clientUid)],
      },
      approvalHistoryContent(CUSTOMER_SUBJECT.CLIENT, clientUid),
    ];

    this.cdr.detectChanges();
  }
}
