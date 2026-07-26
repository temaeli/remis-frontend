import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { CondensateSale } from './condensate-sale.interface';
import { GET_CONDENSATE_SALE_BY_UID } from './condensate-sale.graphql';
import { condensateSaleApproval$, condensateSaleUpsertBtn } from './condensate-sale.form';
import { condensateSale$, condensateSaleRejectBtn } from './condensate-sale.form';
import { condensateSaleApproveBtn, condensateSaleSubmitBtn } from './condensate-sale.form';

@Component({
  selector: 'app-condensate-sale',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2 ">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="condensateSale"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow content" [contents]="contents()" />
    </div>
  `,
})
export class CondensateSaleComponent extends BaseComponent implements OnInit {
  override title = 'Condensate Sale';
  override subtitle = 'Condensate Sale Management';
  goBack$ = condensateSaleApproval$;

  condensateSale: CondensateSale | undefined;
  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'content',
    query: GET_CONDENSATE_SALE_BY_UID,
    successFn: (res) => (this.title = res?.data?.customerName),
    variables: { uid: this.route.snapshot?.paramMap?.get('condensateSaleUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(condensateSale$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [
      condensateSaleUpsertBtn(this),
      condensateSaleSubmitBtn(this),
      condensateSaleRejectBtn(this),
      condensateSaleApproveBtn(this),
    ];
  }

  async setContents() {
    this.condensateSale = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.condensateSale,
        fetchParameter: this.fetchParameter,
      },
    ]);
  }
}
