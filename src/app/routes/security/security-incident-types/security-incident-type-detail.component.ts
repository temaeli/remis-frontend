import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FIND_SECURITY_INCIDENT_TYPE } from './security-incident-type.graphql';
import {
  securityIncidentTypeUpsertBtn,
  securityIncidentTypeDeleteBtn,
  securityIncidentType$,
} from './security-incident-type.form';

@Component({
  selector: 'security-incident-type-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="securityIncidentType"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SecurityIncidentTypeDetailComponent extends BaseComponent implements OnInit {
  override title = 'Security Incident Type';
  override subtitle = 'Security Incident Type Details';

  securityIncidentType: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    securityIncidentTypeUpsertBtn(this),
    securityIncidentTypeDeleteBtn(this),
  ];

  private securityIncidentTypeUid = this.route.snapshot?.paramMap?.get('securityIncidentTypeUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SECURITY_INCIDENT_TYPE,
    successFn: (res) => (this.title = res?.data?.name ?? this.title),
    variables: { uid: this.securityIncidentTypeUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(securityIncidentType$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.securityIncidentType = await this.fs.fetch(this.fetchParameter);
    const viewSecurityIncidentType = formatEntityDates(this.securityIncidentType);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        showUndefined: true,
        entity: viewSecurityIncidentType,
        fetchParameter: this.fetchParameter,
      },
    ];

    this.cdr.detectChanges();
  }
}
