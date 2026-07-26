import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PlantWaterReading } from './plant-water-reading.interface';
import { FIND_PLANT_WATER_READING } from './plant-water-reading.graphql';
import { plantWaterReadingUpsertBtn, plantWaterReading$ } from './plant-water-reading.form';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

@Component({
  selector: 'app-plant-water-reading.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="plantWaterReading"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PlantWaterReadingComponent extends BaseComponent implements OnInit {
  override title = 'Plant Water Reading';
  override subtitle = 'Plant Water Reading Management';

  plantWaterReading: PlantWaterReading | undefined;
  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [plantWaterReadingUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PLANT_WATER_READING,
    successFn: (res) => (this.subtitle = res?.data?.createdBy?.fullName),
    variables: { uid: this.route.snapshot?.paramMap?.get('plantWaterReadingUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(plantWaterReading$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.plantWaterReading = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.plantWaterReading,
        fetchParameter: this.fetchParameter,
      },
    ]);
  }
}
