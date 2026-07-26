import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PlantFormGroup } from './plant-form-group.interface';
import { GET_PLANT_FORM_GROUP_BY_UID } from './plant-form-group.graphql';
import { plantFormGroupUpsertBtn, plantFormGroup$ } from './plant-form-group.form';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { GET_PLANT_FORM_ITEMS_BY_GROUP } from '../plant-form-items/plant-form-item.graphql';
import { plantFormItem$, plantFormItemTableBtns } from '../plant-form-items/plant-form-item.form';
import { plantFormItemUpsertBtn } from '../plant-form-items/plant-form-item.form';
@Component({
  selector: 'app-plant-form-group.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="plantFormGroup"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PlantFormGroupComponent extends BaseComponent implements OnInit {
  override title = 'Plant Form Group';
  override subtitle = 'Plant Form Group Management';

  plantFormGroup: PlantFormGroup | undefined;
  plantFormGroupUid: string = this.route.snapshot?.paramMap?.get('plantFormGroupUid') as any;
  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [plantFormGroupUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: GET_PLANT_FORM_GROUP_BY_UID,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.plantFormGroupUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(plantFormGroup$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.plantFormGroup = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.plantFormGroup,
        fetchParameter: this.fetchParameter,

        children: [
          {
            title: 'Form Items',
            type: 'table',
            icon: 'list',
            keyColumns: ['sno as S/No', 'name', 'unitOfMeasure', 'createdAt type(date)', 'actions'],
            actionButtons: plantFormItemTableBtns(this, this.plantFormGroupUid),
            headerButtons: [plantFormItemUpsertBtn(this, this.plantFormGroupUid)],
            fetchParameter: {
              query: GET_PLANT_FORM_ITEMS_BY_GROUP,
              variables: { groupUid: this.plantFormGroupUid },
              refetchActions: [plantFormItem$],
            },
          },
        ],
      },
    ]);
  }
}
