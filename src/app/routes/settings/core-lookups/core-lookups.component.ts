import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter } from '@shared/components/data-grid/data-grid.interfaces';

import { CORE_LOOKUPS } from './core-lookups';
import { CoreLookupModule } from './core-lookup.interface';
import { coreLookupColumns, coreLookupTableBtns, coreLookupUpsertBtn } from './core-lookup.form';

/**
 * The list for any one of the `remis_core_schema` lookup tables. Which one comes
 * from the route: every generated route carries its slug in `data.lookup`.
 */
@Component({
  selector: 'app-core-lookups',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class CoreLookupsComponent extends BaseComponent {
  lookup: CoreLookupModule = CORE_LOOKUPS[this.route.snapshot.data['lookup']];

  override title = this.lookup.pluralLabel;
  override subtitle = this.lookup.subtitle;
  override actionButtons: ActionButton[] = [coreLookupUpsertBtn(this, this.lookup)];

  gridParameter: GridParameter = {
    title: this.lookup.pluralLabel,
    icon: this.lookup.icon,
    keyColumns: coreLookupColumns(this.lookup),
    isPageable: true,
    actionButtons: coreLookupTableBtns(this, this.lookup),
    reloadActions$: [this.lookup.changed$],
    fetchParameter: { query: this.lookup.gql.allPageable },
  };
}
