import { Component } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { PlantReportContents } from '../common-plant-reports/comon-plant-report';
import {
  GET_ALL_CONDENSATE_PARAMETER_PAGEABLE,
  GET_MY_CONDENSATE_PARAMETER_PAGEABLE,
} from './condensate-parameter.graphql';
import {
  condensateParameter$,
  condensateParameterTableBtns,
  condensateParameterUpsertBtn,
  CondensateParameterCols,
} from './condensate-parameter.form';

@Component({
  selector: 'app-condensate-parameters',
  imports: [PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3 ">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <contents-view class="grow flex flex-col content" [contents]="contents" />
    </div>
  `,
})
export class CondensateParametersComponent extends BaseComponent {
  override title = 'Condensate Parameter Management';
  override subtitle = 'Condensate Parameter List';
  override actionButtons: ActionButton[] = [condensateParameterUpsertBtn(this)];

  cp: Partial<ContentParameter> = {
    keyColumns: CondensateParameterCols,
    actionButtons: condensateParameterTableBtns(this),
    reloadActions$: [condensateParameter$],
  };

  contents: ContentParameter[] = [
    {
      ...PlantReportContents['MY'],
      // permissions: ['ROLE_VIEW_CONDENSATE_PARAMETER'],
      fetchParameter: { query: GET_MY_CONDENSATE_PARAMETER_PAGEABLE },
    },
    {
      ...PlantReportContents['ALL'],
      // permissions: ['ROLE_VIEW_ALL_CONDENSATE_PARAMETER'],
      fetchParameter: { query: GET_ALL_CONDENSATE_PARAMETER_PAGEABLE, variables: { active: true } },
    },
  ].map((c) => ({ ...c, ...this.cp }));
}
