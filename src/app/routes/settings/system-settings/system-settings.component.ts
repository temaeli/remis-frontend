import { Component } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ALL_SYSTEM_SETTINGS } from './system-settings.graphql';
import {
  systemSettingUpsertBtn,
  systemClearCachesBtn,
  systemSettingTableBtns,
  systemSetting$,
} from './system-settings.form';

@Component({
  selector: 'app-system-settings',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class SystemSettingsComponent extends BaseComponent {
  override title = 'System Settings';
  override subtitle = 'System Settings Management';
  override actionButtons: ActionButton[] = [
    systemSettingUpsertBtn(this),
    systemClearCachesBtn(this),
  ];

  keyColumns: GridKeyColumn[] = [
    'index',
    'settingKey',
    'settingValue',
    'category',
    'valueType',
    'description',
    'actions',
  ];

  gridParameter: GridParameter = {
    title: this.route.snapshot.data['name'],
    icon: this.route.snapshot.data['icon'],
    keyColumns: this.keyColumns,
    actionButtons: systemSettingTableBtns(this),
    reloadActions$: [systemSetting$],
    fetchParameter: { query: ALL_SYSTEM_SETTINGS },
  };
}
