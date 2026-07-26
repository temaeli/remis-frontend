import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { getUpstreamerDispatchesGridParameter } from './upstreamer-dispatches.form';

const DISPATCH_STATUS_TABS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Failed', value: 'FAILED' },
];

@Component({
  selector: 'app-upstreamer-dispatches',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataGridComponent, PageHeaderComponent, MatTabGroup, MatTab],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <mat-tab-group class="grow flex flex-col" dynamicHeight>
        @for (tab of dispatchStatusTabs; track tab.value) {
          <mat-tab [label]="tab.label">
            <data-grid
              class="mt-3 flex flex-col"
              theme="simple"
              [gridParameter]="getGridParameter(tab.value)"
            />
          </mat-tab>
        }
      </mat-tab-group>
    </div>
  `,
})
export class UpstreamerDispatches extends BaseComponent implements OnInit {
  override title = 'Upstreamer Dispatches';
  override subtitle = 'Assigned Dispatches';
  dispatchStatusTabs = DISPATCH_STATUS_TABS;
  private gridParametersCache = new Map();

  ngOnInit(): void {
    // Load any necessary data
  }

  getGridParameter(status: string) {
    if (!this.gridParametersCache.has(status)) {
      this.gridParametersCache.set(status, getUpstreamerDispatchesGridParameter(this, status));
    }
    return this.gridParametersCache.get(status);
  }
}
