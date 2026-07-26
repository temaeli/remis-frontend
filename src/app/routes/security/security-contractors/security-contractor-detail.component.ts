import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_CONTRACTOR } from './security-contractor.graphql';
import {
  securityContractorUpsertBtn,
  securityContractorDeleteBtn,
  securityContractor$,
} from './security-contractor.form';

@Component({
  selector: 'security-contractor-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="securityContractor"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityContractorDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Contractor';
  override subtitle = 'Security Contractor Details';

  securityContractor: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityContractorUpsertBtn(this),
    securityContractorDeleteBtn(this),
  ];

  private securityContractorUid = this.route.snapshot?.paramMap?.get('securityContractorUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_CONTRACTOR,
    successFn: (res) => (this.title = res?.data?.name ?? this.title),
    variables: { uid: this.securityContractorUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityContractor$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.securityContractor = await this.fs.fetch(this.fetchParameter);
    const viewSecurityContractor = formatEntityDates(this.securityContractor);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewSecurityContractor,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
