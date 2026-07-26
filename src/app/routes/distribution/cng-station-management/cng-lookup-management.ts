import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { GridParameter, GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { CNG_LOOKUPS_BY_TYPE } from '../cng/cng-lookup.graphql';
import { CngLookupType } from '../cng/cng-station.interface';
import {
  cngEquipmentType$,
  cngEquipmentTypeTableBtns,
  cngEquipmentTypeUpsertBtn,
  cngCapacityUnit$,
  cngCapacityUnitTableBtns,
  cngCapacityUnitUpsertBtn,
} from '../cng/cng-lookup.form';

@Component({
  selector: 'cng-lookup-management',
  standalone: true,
  imports: [DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="equipmentTypeGridParameter" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="capacityUnitGridParameter" />
    </div>
  `,
})
export class CngLookupManagementComponent extends BaseComponent {
  override title = 'CNG Equipment Type & Units';
  override subtitle = 'Manage equipment types and capacity units used on CNG station equipment';

  keyColumns: GridKeyColumn[] = ['index', 'name', 'symbol', 'description', 'actions'];

  equipmentTypeGridParameter: GridParameter = {
    title: 'Equipment Types',
    icon: 'build',
    keyColumns: this.keyColumns,
    actionButtons: cngEquipmentTypeTableBtns(this),
    headerButtons: [cngEquipmentTypeUpsertBtn(this)],
    reloadActions$: [cngEquipmentType$],
    fetchParameter: {
      query: CNG_LOOKUPS_BY_TYPE,
      variables: { lookupType: CngLookupType.EQUIPMENT_TYPE },
    },
  };

  capacityUnitGridParameter: GridParameter = {
    title: 'Capacity Units',
    icon: 'straighten',
    keyColumns: this.keyColumns,
    actionButtons: cngCapacityUnitTableBtns(this),
    headerButtons: [cngCapacityUnitUpsertBtn(this)],
    reloadActions$: [cngCapacityUnit$],
    fetchParameter: {
      query: CNG_LOOKUPS_BY_TYPE,
      variables: { lookupType: CngLookupType.CAPACITY_UNIT },
    },
  };
}
