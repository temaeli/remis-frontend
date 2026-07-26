import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PlantExportReading } from './plant-export-reading.interface';
import { FIND_PLANT_EXPORT_READING } from './plant-export-reading.graphql';
import { plantExportReadingUpsertBtn, plantExportReading$ } from './plant-export-reading.form';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';

@Component({
  selector: 'app-plant-export-reading.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="plantExportReading"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PlantExportReadingComponent extends BaseComponent implements OnInit {
  override title = 'Plant Export Reading';
  override subtitle = 'Plant Export Reading Management';

  plantExportReading: PlantExportReading | undefined;
  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [plantExportReadingUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PLANT_EXPORT_READING,
    successFn: (res) => (this.subtitle = res?.data?.createdBy?.fullName),
    variables: { uid: this.route.snapshot?.paramMap?.get('plantExportReadingUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(plantExportReading$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.plantExportReading = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.plantExportReading,
        fetchParameter: this.fetchParameter,
      },
    ]);
  }
}
