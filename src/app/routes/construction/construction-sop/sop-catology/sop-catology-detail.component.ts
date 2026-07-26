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
  FIND_SOP_CATALOG_ENTRY,
  SOP_CATALOG_VERSION_HISTORY,
  CONSTRUCTION_SOP_ASSIGNMENTS_FOR_SOP,
} from './sop-catology.graphql';
import {
  sopCatalogEntryUpsertBtn,
  sopCatalogEntryDeleteBtn,
  sopCatalogEntry$,
} from './sop-catology.form';
import {
  constructionSopAssignBtn,
  constructionSopAssignment$,
  constructionSopAssignmentTableBtns,
} from './construction-sop-assignment.form';
import { buildNarrative } from '../../../pipeline-management/pipeline-module.constants';

@Component({
  selector: 'sop-catology-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="sopCatalogEntry"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class SopCatologyDetailComponent extends BaseComponent implements OnInit {
  override title = 'SOP Catalogue Entry';
  override subtitle = 'SOP Catalogue Entry Details';

  sopCatalogEntry: any;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [
    sopCatalogEntryUpsertBtn(this),
    sopCatalogEntryDeleteBtn(this),
  ];

  private sopCatalogEntryUid = this.route.snapshot?.paramMap?.get('sopCatalogEntryUid');

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_SOP_CATALOG_ENTRY,
    variables: { uid: this.sopCatalogEntryUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(sopCatalogEntry$.subscribe(() => this.setContents()));
    this.subs.add(constructionSopAssignment$.subscribe(() => this.setContents()));
  }

  async setContents(): Promise<void> {
    this.sopCatalogEntry = await this.fs.fetch(this.fetchParameter);
    this.title = this.sopCatalogEntry?.name ?? this.title;
    const viewSopCatalogEntry = formatEntityDates(this.sopCatalogEntry);

    this.contents = [
      {
        type: 'details',
        name: 'Details',
        label: 'Details',
        icon: 'notes',
        fetchParameter: this.fetchParameter,
        ...buildNarrative({
          flavor: 'reference',
          entity: viewSopCatalogEntry,
          identity: [
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'version', label: 'Version' },
          ],
          specifications: [
            { key: 'description', label: 'Description' },
            { key: 'purpose', label: 'Purpose' },
            { key: 'scope', label: 'Scope' },
            { key: 'responsibilities', label: 'Responsibilities' },
            { key: 'procedureSteps', label: 'Procedure Steps' },
            { key: 'referenceDocuments', label: 'Reference Documents' },
            { key: 'tools', label: 'Tools / Equipment / Materials' },
            { key: 'attachmentUrl', label: 'Attachment URL' },
          ],
        }),
      },
      {
        type: 'table',
        name: 'VersionHistory',
        label: 'Version History',
        icon: 'history',
        keyColumns: ['index', 'version', 'changeNote', { field: 'createdAt', type: 'date' }],
        fetchParameter: {
          query: SOP_CATALOG_VERSION_HISTORY,
          variables: { sopUid: this.sopCatalogEntryUid },
        },
        theme: 'simple',
      },
      {
        type: 'table',
        name: 'Assignments',
        label: 'WBS Assignments',
        icon: 'category',
        keyColumns: ['index', 'scope', 'project', 'category', 'activity', 'actions'],
        actionButtons: constructionSopAssignmentTableBtns(this),
        reloadActions$: [constructionSopAssignment$],
        fetchParameter: {
          query: CONSTRUCTION_SOP_ASSIGNMENTS_FOR_SOP,
          variables: { sopUid: this.sopCatalogEntryUid },
        },
        hasActionsColumn: true,
        theme: 'simple',
        headerButtons: [constructionSopAssignBtn(this, this.sopCatalogEntryUid ?? '')],
      },
    ];

    this.cdr.detectChanges();
  }
}
