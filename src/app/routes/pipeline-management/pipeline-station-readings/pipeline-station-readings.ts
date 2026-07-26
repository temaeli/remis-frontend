import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { DEFAULT_TABLE_OPTIONS } from '@shared/components/data-grid/data-grid.constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { processStatusFromTimestamps } from '@shared/crud';
import { GET_ALL_PIPELINE_STATION_READINGS } from './pipeline-station-reading.graphql';
import {
  pipelineStationReadingUpsertBtn,
  pipelineStationReadingTableBtns,
  pipelineStationReading$,
} from './pipeline-station-reading.form';

const fmt = (n: unknown, dp: number): string => {
  if (n === null || n === undefined || n === '' || Number.isNaN(+(n as any))) return '-';
  return (+(n as any)).toFixed(dp);
};

const renderPointChips = (
  items: Array<{ name?: string; temperature?: number; pressure?: number }> | undefined,
): string => {
  if (!items?.length) return '--';
  return items
    .slice()
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    .map(
      (i) =>
        `<div class="text-sm leading-tight"><span class="opacity-70">${i.name ?? '-'}:</span> ${fmt(i.temperature, 1)} / ${fmt(i.pressure, 2)}</div>`,
    )
    .join('');
};

@Component({
  selector: 'pipeline-station-readings',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PipelineStationReadings extends BaseComponent {
  override title = 'Station Readings';
  override subtitle = 'Manage Pipeline Station Readings';
  override actionButtons: ActionButton[] = [pipelineStationReadingUpsertBtn(this)];

  keyColumns: GridKeyColumn[] = [
    'index',
    { field: 'station.name', header: 'Station' },
    { field: 'readingTime', type: 'date' },
    {
      field: 'suctionReadings',
      header: 'Suctions (°C / bar)',
      type: 'html',
      valueFn: (row: any) =>
        renderPointChips(
          (row?.suctionReadings ?? []).map((r: any) => ({
            name: r?.suctionPoint?.name,
            temperature: r?.temperature,
            pressure: r?.pressure,
          })),
        ),
    },
    {
      field: 'dischargeReadings',
      header: 'Discharges (°C / bar)',
      type: 'html',
      valueFn: (row: any) =>
        renderPointChips(
          (row?.dischargeReadings ?? []).map((r: any) => ({
            name: r?.dischargePoint?.name,
            temperature: r?.temperature,
            pressure: r?.pressure,
          })),
        ),
    },
    {
      field: 'status',
      header: 'Approval Status',
      valueFn: (row: any) => processStatusFromTimestamps(row) ?? '',
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Station Readings',
    icon: 'dashboard',
    keyColumns: this.keyColumns,
    actionButtons: pipelineStationReadingTableBtns(this),
    reloadActions$: [pipelineStationReading$],
    fetchParameter: { query: GET_ALL_PIPELINE_STATION_READINGS },
    gridOptions: DEFAULT_TABLE_OPTIONS,
    viewDetailsClicks: 1,
    rowClickActions: [
      {
        callback: (data: any) => navigateRelativeTo(this, 'pipeline-station-readings', data.uid),
      },
    ],
  };
}
