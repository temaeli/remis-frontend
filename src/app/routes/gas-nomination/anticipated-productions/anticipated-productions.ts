import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ALL_ANTICIPATED_PRODUCTIONS_PAGEABLE } from './anticipated-production.graphql';
import {
  anticipatedProduction$,
  anticipatedProductionUpsertBtn,
  anticipatedProductionTableBtns,
} from './anticipated-production.form';

@Component({
  selector: 'app-anticipated-productions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [PageHeaderComponent, DataGridComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header
        title="Anticipated Production"
        subtitle="Plant shift supervisor forecast records"
        [actionButtons]="actionButtons"
      />
      <data-grid
        theme="simple"
        [gridParameter]="gridParameter"
      />
    </div>
  `,
})
export class AnticipatedProductions extends BaseComponent {
  override actionButtons: ActionButton[] = [anticipatedProductionUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    'plant.name as Plant',
    'productionDate as Production Date',
    'anticipatedMmscfd as Anticipated (MMscfd)',
    'anticipatedSm3PerDay as Anticipated (Sm³/day)',
    'status',
    'submittedByUser.fullName as Submitted By',
    'submittedAt as Submitted At',
    'reviewedByUser.fullName as Reviewed By',
    'reviewComments as Review Comments',
    'actions',
  ];

  gridParameter: GridParameter = {
    keyColumns: this.keyColumns,
    isPageable: true,
    reloadActions$: [anticipatedProduction$],
    fetchParameter: {
      query: ALL_ANTICIPATED_PRODUCTIONS_PAGEABLE,
    },
    actionButtons: anticipatedProductionTableBtns(this),
  };
}
