import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { formatEntityDates } from '@shared/components/details/util/format-entity-dates';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import {
  GET_INSPECTION_TYPE_BY_UID,
  GET_INSPECTION_CHECKLISTS_BY_INSPECTION_TYPE,
} from './inspection-type.graphql';
import {
  inspectionTypeUpsertBtn,
  inspectionTypeDeleteBtn,
  inspectionType$,
} from './inspection-type.form';
import {
  inspectionChecklistTableBtns,
  inspectionChecklistUpsertBtn,
  inspectionChecklist$,
} from './checklist.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'inspection-type-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="inspectionType"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class InspectionTypeDetailComponent extends BaseComponent implements OnInit {
  override title = 'Inspection Type';
  override subtitle = 'Inspection Type Details';

  inspectionType: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    inspectionTypeUpsertBtn(this),
    inspectionTypeDeleteBtn(this),
  ];

  private inspectionTypeUid = this.route.snapshot?.paramMap?.get('inspectionTypeUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_INSPECTION_TYPE_BY_UID,
    variables: { uid: this.inspectionTypeUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(inspectionType$.subscribe(() => this.setContents()));
    this.subs.add(inspectionChecklist$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.inspectionType = await this.fs.fetch(this.fetchParameter);
    this.title = this.inspectionType?.name ?? this.title;
    const viewType = formatEntityDates(this.inspectionType);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'reference',
          entity: viewType,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
          ],
          specifications: [{ key: 'description', label: 'Description' }],
        }),
      },
      {
        type: 'table',
        name: 'Checklists',
        label: 'Checklists',
        icon: 'checklist',
        permissions: ['ROLE_VIEW_INSPECTION_CHECKLIST'],
        keyColumns: [
          'index',
          'question',
          'groupName',
          'mandatory',
          'description',
          'actions',
        ],
        actionButtons: inspectionChecklistTableBtns(this, this.inspectionTypeUid ?? ''),
        reloadActions$: [inspectionChecklist$],
        fetchParameter: {
          query: GET_INSPECTION_CHECKLISTS_BY_INSPECTION_TYPE,
          variables: { inspectionTypeUid: this.inspectionTypeUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [inspectionChecklistUpsertBtn(this, this.inspectionTypeUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
