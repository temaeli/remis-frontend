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
import { GET_FUEL_FLARED_GAS_BY_UID, GET_FUEL_FLARED_GAS_ITEMS } from './fuel-flared-gas.graphql';
import { fuelFlaredGas$, fuelFlaredGas_Order_Last, fuelFlaredGasProcessBtn } from './fuel-flared-gas.form';
import { FuelFlaredGas, FuelFlaredGasItem } from './fuel-flared-gas.interface';

@Component({
  selector: 'app-fuel-flared-gas',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="fuelFlaredGas"
        [goBack$]="goBack$"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class FuelFlaredGasComponent extends BaseComponent implements OnInit {
  override title = 'Fuel and Flared Gas';
  override subtitle = 'Fuel and Flared Gas Management';
  goBack$ = processReport$;

  fuelFlaredGas: FuelFlaredGas | undefined;
  fuelFlaredGasUid: string = this.route.snapshot?.paramMap?.get('fuelFlaredGasUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_FUEL_FLARED_GAS_BY_UID,
    successFn: (res: any) => (this.title = res?.data?.name),
    variables: { uid: this.fuelFlaredGasUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.setButtons();
    this.subs.add(fuelFlaredGas$.subscribe(() => this.setContents()));
  }

  setButtons() {
    this.actionButtons = [fuelFlaredGasProcessBtn(this)];
  }

  async setContents() {
    this.fuelFlaredGas = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.fuelFlaredGas,
        fetchParameter: this.fetchParameter,
        contentContainerClass: 'xl:grid-cols-[1fr_2fr]',
        children: [
          {
            type: 'table',
            title: this.title,
            icon: 'list',
            keyColumns: ['sno as S/No', 'item', 'measure', unitOfMeasureColumn],
            canExportData: true,
            reloadActions$: [fuelFlaredGas$],
            fetchParameter: {
              query: GET_FUEL_FLARED_GAS_ITEMS,
              variables: { formUid: this.fuelFlaredGasUid },
              resMapFn: (items: FuelFlaredGasItem[]) =>
                sortByOrderLast(items ?? [], fuelFlaredGas_Order_Last, (i) => i?.item?.name ?? ''),
            },
          },
        ],
      },
    ]);
  }
}
