import { Component } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { PlantReportContents } from '../common-plant-reports/comon-plant-report';
import { GET_ALL_WATER_DATA_PAGEABLE, GET_MY_WATER_DATA_PAGEABLE } from './water-data.graphql';
import {
  waterData$,
  waterDataTableBtns,
  waterDataUpsertBtn,
  WaterDataCols,
} from './water-data.form';
import { WaterDataType, WaterDataTypeBySlug, WaterDataTypeLabels } from './water-data.interface';

/**
 * Shared list page for all three Water Data types (Dew Point, Hydrocarbon,
 * Water Content) - each is mounted at its own route in plants.routes.ts, and
 * this component reads the current route's own path segment to know which
 * WaterDataType it's scoped to.
 */
@Component({
  selector: 'app-water-data-list',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class WaterDataListComponent extends BaseComponent {
  slug: string = this.route.snapshot.routeConfig?.path ?? this.route.snapshot.url?.[0]?.path ?? '';
  waterDataType: WaterDataType = WaterDataTypeBySlug[this.slug];
  typeLabel = WaterDataTypeLabels[this.waterDataType];

  override title = `${this.typeLabel} Water Data Management`;
  override subtitle = `${this.typeLabel} Water Data List`;
  override actionButtons: ActionButton[] = [waterDataUpsertBtn(this, this.waterDataType)];

  cp: Partial<ContentParameter> = {
    keyColumns: WaterDataCols,
    actionButtons: waterDataTableBtns(this, this.waterDataType),
    reloadActions$: [waterData$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents['MY'],
      permissions: ['ROLE_VIEW_HYDROCARBON_AND_WATER_CONTENT'],
      fetchParameter: {
        query: GET_MY_WATER_DATA_PAGEABLE,
        variables: { type: this.waterDataType },
      },
    },
    {
      ...PlantReportContents['ALL'],
      permissions: ['ROLE_VIEW_ALL_HYDROCARBON_AND_WATER_CONTENT'],
      fetchParameter: {
        query: GET_ALL_WATER_DATA_PAGEABLE,
        variables: { active: true, type: this.waterDataType },
      },
    },
  ].map((c) => ({ ...c, ...this.cp }));
}
