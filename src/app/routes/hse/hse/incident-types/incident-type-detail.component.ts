import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { GET_INCIDENT_TYPE_BY_UID } from './incident-type.graphql';
import { incidentTypeUpsertBtn, incidentTypeDeleteBtn, incidentType$ } from './incident-type.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'incident-type-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="incidentType"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class IncidentTypeDetailComponent extends BaseComponent implements OnInit {
  override title = 'Incident Type';
  override subtitle = 'Incident Type Details';

  incidentType: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    incidentTypeUpsertBtn(this),
    incidentTypeDeleteBtn(this),
  ];

  private incidentTypeUid = this.route.snapshot?.paramMap?.get('incidentTypeUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_INCIDENT_TYPE_BY_UID,
    variables: { uid: this.incidentTypeUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(incidentType$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.incidentType = await this.fs.fetch(this.fetchParameter);
    this.title = this.incidentType?.name ?? this.title;
    const viewIncidentType = formatEntityDates(this.incidentType);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'reference',
          entity: viewIncidentType,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
          ],
          specifications: [{ key: 'description', label: 'Description' }],
        }),
      },
    ];

    this.cdr.detectChanges();
  }
}
