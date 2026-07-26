import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { GET_ALL_CONDENSATE_SALES_PAGEABLE } from './condensate-sale.graphql';
import { condensateSaleUpsertBtn } from './condensate-sale.form';
import { condensateSaleTableBtns, condensateSale$ } from './condensate-sale.form';
import { CondensateSale } from './condensate-sale.interface';
import { getDisplayDate, getDisplayDateTime } from '@core/helpers';
import { Row } from 'jspdf-autotable';

@Component({
  selector: 'app-condensate-sales',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class CondensateSalesComponent extends BaseComponent {
  override title = 'Condensate Sales Management';
  override subtitle = 'Condensate Sales List';
  override actionButtons: ActionButton[] = [condensateSaleUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'sno as S/No',
    'plant',
    'createdBy.fullName as Created By',
    'customerName',
    'customerLicenseNumber',
    'offloadingDate',
    {
      field: 'createdAt',
      header: 'Approval Status',
      type: 'html',
      valueFn: (r: CondensateSale) => {
        const date = r?.approvedAt ?? r?.rejectedAt ?? r.submittedAt;
        if (!date) return '--';
        const type = `${r?.approvedAt ? 'APPROVED' : r?.rejectedAt ? 'REJECTED' : r?.submittedAt ? 'SUBMITTED' : undefined}`;
        const name = (r as any)[type?.toLowerCase() + 'By']?.fullName;
        return ` ${type}  ${name ? `<br> by ${name}` : ''} <div class="text-sm opacity-60">${getDisplayDateTime(date)}</div>`;
      },
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: condensateSaleTableBtns(this),
    reloadActions$: [condensateSale$],
    fetchParameter: { query: GET_ALL_CONDENSATE_SALES_PAGEABLE },
  };
}
