import { Component, Input, OnInit, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  GridParameter,
  GridKeyColumn,
  GridOption,
} from '@shared/components/data-grid/data-grid.interfaces';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { StorageService } from '@shared/services/storage.service';
import { GET_MY_REPORTS } from './my-reports.graphql';
import { isAwaiting, isCreatedByMe, nextActionChip, currentStageLabel } from './my-reports.helpers';

const AWAITING = 'Awaiting My Action';
const CREATED = 'Created by Me';

// Reusable personal inbox over the backend `getMyReports` op. The Pipeline and
// EWURA modules each mount it with their own `section` + `detailSlug` (the
// sibling detail route) + `reload$` (the module's report reload subject).
//
// getMyReports already returns the union of (reports I created) and (reports
// whose current-stage role I hold). We fetch that whole set once and split it
// into two tabs CLIENT-SIDE so the tab counts stay accurate (they would lie if
// computed per server page). Per-user volume is bounded, so a single large page
// is cheap.
@Component({
  selector: 'my-reports-inbox',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      @if (showHeader) {
        <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="headerActionButtons" />
      }
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class MyReportsInbox extends BaseComponent implements OnInit {
  @Input() section!: string;
  @Input() detailSlug!: string;
  @Input() reload$?: Observable<any>;
  // Module-specific row actions (Submit/Approve/Reject/Regenerate/Export/Edit/
  // Delete). Each is self-gated by its own showFunction/permission, so the same
  // grid serves approvers and authors. View is added by the inbox itself (it
  // owns the correct sibling-route navigation) and rendered first in the kebab.
  @Input() actionButtons: ActionButton[] = [];
  // Page-header buttons (e.g. Create), shown only on standalone mounts where the
  // inbox owns its header. Kept separate from row actionButtons.
  @Input() headerActionButtons: ActionButton[] = [];

  @Input() override title = 'My Reports';
  @Input() override subtitle = 'Reports awaiting your action and reports you created';
  // Suppress the internal page-header when embedded as a tab (the host page
  // already renders one). Standalone mounts keep it.
  @Input() showHeader = true;

  private store = inject(StorageService);
  private myUid = this.store.get<string>('userUid');

  private awaiting: any[] = [];
  private mine: any[] = [];
  private selectedTab: string = AWAITING;

  gridData = new BehaviorSubject<any[]>([]);
  private awaitingBadge$ = new BehaviorSubject<number>(0);

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'template.name', header: 'Template' },
    { field: 'stage', header: 'Stage', valueFn: (row: any) => currentStageLabel(row) },
    {
      field: 'nextAction',
      header: 'Next action',
      valueFn: (row: any) => nextActionChip(row, this.myUid)?.label ?? '',
      valueClassMapper: (row: any) => nextActionChip(row, this.myUid)?.class ?? '',
    },
    { field: 'status', header: 'Approval Status' },
    { field: 'startDate', header: 'Period', type: 'date' },
    'actions',
  ];

  gridOptions: GridOption[] = [
    {
      title: AWAITING,
      label: AWAITING,
      badge: this.awaitingBadge$,
      noContentLabel: 'You\'re all caught up 🎉',
      callback: () => this.showTab(AWAITING),
    },
    {
      title: CREATED,
      label: CREATED,
      noContentLabel: 'You haven’t created any reports yet.',
      callback: () => this.showTab(CREATED),
    },
  ];

  gridParameter: GridParameter = {
    title: 'My Reports',
    icon: 'inbox',
    keyColumns: this.keyColumns,
    gridData: this.gridData,
    gridOptions: this.gridOptions,
    keysNotChangedByOptions: ['keyColumns', 'gridData'],
    noContentLabel: 'You\'re all caught up 🎉',
    viewDetailsClicks: 1,
    rowClickActions: [{ callback: (data: any) => this.openDetail(data) }],
  };

  ngOnInit(): void {
    // Built here (not at field init) because @Input()s aren't bound in the
    // constructor. Parent ngOnInit runs before the child data-grid's, so the
    // grid picks these up on first render.
    const viewBtn: ActionButton = {
      icon: 'view',
      label: 'View',
      toolTip: 'Open report',
      click: (data: any) => this.openDetail(data),
    };
    this.gridParameter.actionButtons = [{ ...MORE_BTN, buttons: [viewBtn, ...this.actionButtons] }];

    this.load();
    if (this.reload$) this.subs.add(this.reload$.subscribe(() => this.load()));
  }

  private async load(): Promise<void> {
    const res = await this.fs.fetch({
      query: GET_MY_REPORTS,
      variables: {
        filter: { section: this.section, active: true },
        pageableParam: { page: 0, size: 500 },
      },
    });

    const rows: any[] = res?.content ?? [];
    this.awaiting = rows.filter((r) => isAwaiting(r, this.myUid));
    this.mine = rows.filter((r) => isCreatedByMe(r, this.myUid));
    this.awaitingBadge$.next(this.awaiting.length);
    this.showTab(this.selectedTab);
  }

  private showTab(tab: string): void {
    this.selectedTab = tab;
    this.gridData.next(tab === CREATED ? this.mine : this.awaiting);
  }

  private openDetail(data: any): void {
    // Inbox is section-scoped, so the detail route is unambiguous. Hop out of
    // the `my-reports` segment (..) onto the sibling detail route, where the
    // Approve/Reject/Submit actions live.
    this.router.navigate(['..', this.detailSlug, data?.uid], { relativeTo: this.route });
  }
}
