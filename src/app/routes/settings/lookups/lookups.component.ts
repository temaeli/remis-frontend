import { Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter } from '@shared/components/data-grid/data-grid.interfaces';

import { LOOKUPS } from './lookups';
import { LookupModule } from './lookup.interface';
import { lookupColumns, lookupTableBtns, lookupUpsertBtn } from './lookup.form';

/**
 * The list for any one of the settings lookup tables. Which one comes from the
 * route: every generated route carries its slug in `data.lookup`.
 */
@Component({
  selector: 'app-lookups',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class LookupsComponent extends BaseComponent {
  lookup: LookupModule = LOOKUPS[this.route.snapshot.data['lookup']];

  override title = this.lookup.pluralLabel;
  override subtitle = this.lookup.subtitle;
  override actionButtons: ActionButton[] = [lookupUpsertBtn(this, this.lookup)];

  gridParameter: GridParameter = {
    title: this.lookup.pluralLabel,
    icon: this.lookup.icon,
    keyColumns: lookupColumns(this.lookup),
    isPageable: true,
    actionButtons: lookupTableBtns(this, this.lookup),
    reloadActions$: [this.lookup.changed$],
    fetchParameter: { query: this.lookup.gql.allPageable },
  };
}
