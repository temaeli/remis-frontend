import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { processReport$ } from '../common-plant-reports/comon-plant-report';
import {
  GET_CONDENSATE_STORAGE_TANK_BY_UID,
  GET_CONDENSATE_STORAGE_TANK_ITEMS,
} from './condensate-storage-tank.graphql';
import {
  condensateStorageTank$,
  condensateStorageTankProcessBtn,
} from './condensate-storage-tank.form';
import { CondensateStorageTank } from './condensate-storage-tank.interface';

@Component({
  selector: 'app-condensate-storage-tank',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="condensateStorageTank"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class CondensateStorageTankComponent extends BaseComponent implements OnInit {
  override title = 'Condensate Storage Tank';
  override subtitle = 'Condensate Storage Tank Management';
  goBack$ = processReport$;

  condensateStorageTank: CondensateStorageTank | undefined;
  condensateStorageTankUid: string = this.route.snapshot?.paramMap?.get('condensateStorageTankUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_CONDENSATE_STORAGE_TANK_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.condensateStorageTankUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(condensateStorageTank$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [condensateStorageTankProcessBtn(this)];
  }

  async setContents() {
    this.condensateStorageTank = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.condensateStorageTank,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', 'tankA', 'tankB', 'uoM'],
            canExportData: true,
            reloadActions$: [condensateStorageTank$],
            fetchParameter: {
              query: GET_CONDENSATE_STORAGE_TANK_ITEMS,
              variables: { formUid: this.condensateStorageTankUid },
            },
          },
        ],
      },
    ]);
  }
}
