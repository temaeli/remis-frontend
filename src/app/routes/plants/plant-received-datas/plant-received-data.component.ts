import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { PlantReceivedData } from './plant-received-data.interface';
import { FIND_PLANT_PROCESSING_DATA } from './plant-received-data.graphql';
import { plantReceivedDataUpsertBtn, plantReceivedData$ } from './plant-received-data.form';

@Component({
  selector: 'app-plant-received-data.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="plantReceivedData"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PlantReceivedDataComponent extends BaseComponent implements OnInit {
  override title = 'Plant Received Data';
  override subtitle = 'Plant Received Data Management';

  plantReceivedData: PlantReceivedData | undefined;
  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [plantReceivedDataUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PLANT_PROCESSING_DATA,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.route.snapshot?.paramMap?.get('plantReceivedDataUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(plantReceivedData$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.plantReceivedData = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.plantReceivedData,
        fieldsProperties: { client: { label: 'Customer' } },
        fieldsStrings: [
          'client as Customer',
          'receivedRawGasTemperature as Received Raw Gas Temperature (°C)',
          'receivedRawGasPressure as Received Raw Gas Pressure (Pa)',
          'receivedRawGasVolume as Received Raw Gas Volume (m³)',
        ],
        fetchParameter: this.fetchParameter,
      },
    ]);
  }
}
