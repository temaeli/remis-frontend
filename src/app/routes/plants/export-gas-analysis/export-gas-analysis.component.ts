import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import {
  processReport$,
  sortByOrderLast,
  unitOfMeasureColumn,
} from '../common-plant-reports/comon-plant-report';
import {
  GET_EXPORT_GAS_ANALYSIS_BY_UID,
  GET_EXPORT_GAS_ANALYSIS_ITEMS,
} from './export-gas-analysis.graphql';
import {
  exportGasAnalysis$,
  exportGasAnalysis_Order_Last,
  exportGasAnalysisProcessBtn,
} from './export-gas-analysis.form';
import { ExportGasAnalysis, ExportGasAnalysisItem } from './export-gas-analysis.interface';

@Component({
  selector: 'app-export-gas-analysis',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="exportGasAnalysis"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class ExportGasAnalysisComponent extends BaseComponent implements OnInit {
  override title = 'Export Gas Analysis';
  override subtitle = 'Export Gas Analysis Management';
  goBack$ = processReport$;

  exportGasAnalysis: ExportGasAnalysis | undefined;
  exportGasAnalysisUid: string = this.route.snapshot?.paramMap?.get('exportGasAnalysisUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_EXPORT_GAS_ANALYSIS_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.exportGasAnalysisUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(exportGasAnalysis$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [exportGasAnalysisProcessBtn(this)];
  }

  async setContents() {
    this.exportGasAnalysis = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.exportGasAnalysis,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', 'measure', unitOfMeasureColumn],
            canExportData: true,
            pageSize: 20,
            reloadActions$: [exportGasAnalysis$],
            fetchParameter: {
              query: GET_EXPORT_GAS_ANALYSIS_ITEMS,
              variables: { formUid: this.exportGasAnalysisUid },
              resMapFn: (items: ExportGasAnalysisItem[]) =>
                sortByOrderLast(items ?? [], exportGasAnalysis_Order_Last, (i) => i?.item?.name ?? ''),
            },
          },
        ],
      },
    ]);
  }
}
