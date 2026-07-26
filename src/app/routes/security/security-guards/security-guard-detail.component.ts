import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_GUARD } from './security-guard.graphql';
import {
  securityGuardUpsertBtn,
  securityGuardDeleteBtn,
  securityGuard$,
} from './security-guard.form';

@Component({
  selector: 'security-guard-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="securityGuard"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityGuardDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Guard';
  override subtitle = 'Security Guard Details';

  securityGuard: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityGuardUpsertBtn(this),
    securityGuardDeleteBtn(this),
  ];

  private securityGuardUid = this.route.snapshot?.paramMap?.get('securityGuardUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_GUARD,
    successFn: (res) => (this.title = res?.data?.fullName ?? this.title),
    variables: { uid: this.securityGuardUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityGuard$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.securityGuard = await this.fs.fetch(this.fetchParameter);
    const viewSecurityGuard = formatEntityDates(this.securityGuard);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewSecurityGuard,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
