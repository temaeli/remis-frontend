import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  getAssignedNominationsGridParameter,
  getPlantNominationCounts,
} from './assigned-gas-nominations.form';
import { NominationReportService } from '../nominations/nomination-report.service';

const STATUS_TABS = [
  { label: 'Assigned Plant Nominations', value: '' },
  // { label: 'Sent to Plant Superintendent', value: 'SENT_TO_PLANT_SUPERINTENDENT' },
  // { label: 'Sent to Plant Manager', value: 'SENT_TO_PLANT_MANAGER' },
  // { label: 'Rejected', value: 'REJECTED' },
  // { label: 'Completed', value: 'COMPLETED' },
  // { label: 'Sent to Upstreamer', value: 'SENT_TO_UPSTREAMER' },
  // { label: 'Upstreamer Confirmed', value: 'CONFIRMED_BY_UPSTREAMER' },
];

@Component({
  selector: 'app-gas-nomination-assigned',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataGridComponent, PageHeaderComponent, MatTabGroup, MatTab],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <mat-tab-group
        class="grow flex flex-col"
        dynamicHeight
        (selectedIndexChange)="selectedTabIndex.set($event)"
      >
        @for (tab of statusTabs; track tab.value; let i = $index) {
          <mat-tab [label]="tab.label">
            @if (isTabActive(i)) {
              <data-grid
                class="mt-3 flex flex-col"
                theme="simple"
                [gridParameter]="getGridParameter(tab.value)"
              />
            }
          </mat-tab>
        }
      </mat-tab-group>
    </div>
  `,
})
export class Assigned extends BaseComponent implements OnInit {
  override title = 'Gas Nominations';
  override subtitle = 'Assigned Nominations';
  statusTabs = STATUS_TABS;
  selectedTabIndex = signal(0);
  private gridParametersCache = new Map();
  private nominationReportService = inject(NominationReportService);

  async ngOnInit(): Promise<void> {
    await this.loadNominationCounts();
  }

  async loadNominationCounts() {
    const nominationCounts = await getPlantNominationCounts(this);
    if (nominationCounts) {
      const subtitle = `Assigned Nominations • Waiting on Me: ${nominationCounts.waitingOnMe || 0} • Total: ${nominationCounts.total || 0}`;
      this.subtitle = subtitle;
      this.cdr.detectChanges();
    }
  }

  getGridParameter(status: string | undefined) {
    if (!this.gridParametersCache.has(status)) {
      this.gridParametersCache.set(
        status,
        getAssignedNominationsGridParameter(this, status, this.nominationReportService),
      );
    }
    return this.gridParametersCache.get(status);
  }

  isTabActive(index: number): boolean {
    return this.selectedTabIndex() === index;
  }
}
