import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PlantFormItem } from './plant-form-item.interface';
import { GET_PLANT_FORM_ITEM_BY_UID } from './plant-form-item.graphql';
import { plantFormItemUpsertBtn, plantFormItem$ } from './plant-form-item.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';

@Component({
  selector: 'app-plant-form-item.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="plantFormItem"
      />
      <contents-view class="block grow" [contents]="contents" />
    </div>
  `,
})
export class PlantFormItemComponent extends BaseComponent implements OnInit {
  override title = 'Plant Form Item';
  override subtitle = 'Plant Form Item Management';

  plantFormItem: PlantFormItem | undefined;
  override contents: ContentParameter[] = [];
  override actionButtons: ActionButton[] = [plantFormItemUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PLANT_FORM_ITEM_BY_UID,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.route.snapshot?.paramMap?.get('plantFormItemUid') },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(plantFormItem$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.plantFormItem = await this.fs.fetch(this.fetchParameter);

    this.contents = [
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.plantFormItem,
        fetchParameter: this.fetchParameter,
      },
    ];
  }
}
