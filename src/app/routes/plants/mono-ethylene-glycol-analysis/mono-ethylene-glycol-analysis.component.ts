import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { processReport$, unitOfMeasureColumn } from '../common-plant-reports/comon-plant-report';
import {
  GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_BY_UID,
  GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_ITEMS,
} from './mono-ethylene-glycol-analysis.graphql';
import {
  monoEthyleneGlycolAnalysis$,
  monoEthyleneGlycolAnalysisProcessBtn,
} from './mono-ethylene-glycol-analysis.form';
import { MonoEthyleneGlycolAnalysis } from './mono-ethylene-glycol-analysis.interface';

@Component({
  selector: 'app-mono-ethylene-glycol-analysis',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="monoEthyleneGlycolAnalysis"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class MonoEthyleneGlycolAnalysisComponent extends BaseComponent implements OnInit {
  override title = 'Mono Ethylene Glycol Analysis';
  override subtitle = 'Mono Ethylene Glycol Analysis Management';
  goBack$ = processReport$;

  monoEthyleneGlycolAnalysis: MonoEthyleneGlycolAnalysis | undefined;
  monoEthyleneGlycolAnalysisUid: string = this.route.snapshot?.paramMap?.get('monoEthyleneGlycolAnalysisUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.monoEthyleneGlycolAnalysisUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(monoEthyleneGlycolAnalysis$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [monoEthyleneGlycolAnalysisProcessBtn(this)];
  }

  async setContents() {
    this.monoEthyleneGlycolAnalysis = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.monoEthyleneGlycolAnalysis,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', unitOfMeasureColumn, 'concentration', 'ph'],
            canExportData: true,
            reloadActions$: [monoEthyleneGlycolAnalysis$],
            fetchParameter: {
              query: GET_MONO_ETHYLENE_GLYCOL_ANALYSIS_ITEMS,
              variables: { reportUid: this.monoEthyleneGlycolAnalysisUid },
            },
          },
        ],
      },
    ]);
  }
}
