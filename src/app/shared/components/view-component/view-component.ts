import { SimpleChanges, inject, OnInit } from '@angular/core';
import { Component, Input, OnChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContentParameter, ViewParameter } from './view-interface';
import { GridParameter } from '../data-grid/data-grid.interfaces';
import { DetailsParameter } from '../details/details.interface';
import { BaseComponent } from '../base-componet/base-component';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { ToggleButton, ToggleButtonsComponent } from '../toggle-buttons/toggle-buttons.component';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { CommonModule } from '@angular/common';
import { MergeObjectsPipe } from '../../pipes/merge-objects.pipe';
import { NoContentComponent } from '../no-content/no-content.component';
import { DataGridComponent } from '../data-grid/data-grid.component';
import { DetailsComponent } from '../details/details.component';
import { BgIconMarkComponent } from '../details/bg-icon-mark/bg-icon-mark.component';
import { copyObjectValues } from '@core/helpers';
import { settings$ } from '@core/settings/settings.store';

const innerTable: Partial<GridParameter> = {
  toolbarClass: 'pb-1',
  gridClass: 'toolbar-border-bottom',
  headerClass: 'detail-heading',
  appearance: 'plain',
  keysNotChangedByOptions: ['icon'],
  showTitle: true,
  showSearchInput: false,
};

const table: Partial<GridParameter> = {
  appearance: 'plain',
  gridClass: 'full-grid',
  noContentClass: 'size-full flex items-center justify-center p-5 slim(false)',
};

const details: Partial<DetailsParameter> = {
  titleClass: 'detail-heading',
};

@Component({
  selector: 'view-component',
  templateUrl: `view-component.html`,
  imports: [
    PageHeaderComponent,
    MergeClassesPipe,
    CommonModule,
    MergeObjectsPipe,
    ToggleButtonsComponent,
    NoContentComponent,
    DataGridComponent,
    DetailsComponent,
    BgIconMarkComponent,
  ],
})
export class ViewComponent extends BaseComponent implements OnChanges, OnInit {
  @Input() icon = '';
  @Input() override title = 'Content';
  @Input() override subtitle = '';
  @Input() override animation = settings$.value.animations?.pages;
  @Input() showContentInTabs: boolean | undefined;
  @Input() noContentLabel = 'Loading Content';

  @Input() value: any;
  @Input() model: any;

  @Input() override isLoading = false;

  @Input() override actionButtons: ActionButton[] = [];
  @Input() override toggleButtons: ToggleButton[] = [];
  @Input() override contents: ContentParameter[] = [];

  @Input() viewParameter!: ViewParameter;

  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<ViewComponent>, { optional: true });

  override slugTree: string[] | undefined = this.getLocValue('slugTree') ?? [];

  tableParameter = innerTable;
  detailsParameter = details;

  ngOnChanges(changes: SimpleChanges) {
    this.setParameters();
    console.log(this.viewParameter);
  }

  ngOnInit(): void {
    this.setParameters();
  }

  setParameters() {
    if (!this.viewParameter) return;
    copyObjectValues(this, this.viewParameter ?? this.dialogData);
    if (this.viewParameter.appearance == 'outer') this.tableParameter = table;
  }

  onContentChange(slug: string, level: number) {
    if (!this.slugTree) this.slugTree = [];
    if (this.slugTree[level] === slug) return; //avoid loops

    this.slugTree[level] = slug;
    this.setLocInfo('slugTree', this.slugTree);
    this.handleWhenActive(slug);
    //
    const content = this.findContentBySlug(this.contents, slug);
    if (content?.onActive) content.onActive(content, this.viewParameter);
  }

  handleWhenActive(slug: string) {
    const removeMods = (cc: ContentParameter[]) => {
      for (const c of cc) if ((c.mods = {}) && c.children?.length) removeMods(c.children);
    };

    removeMods(this.contents);
    const content: ContentParameter = this.findContentBySlug(this.contents, slug) as any;
    if (!content || !content?.whenActive) return;

    for (const [s, mods] of Object.entries(content.whenActive)) {
      const affected: ContentParameter = this.findContentBySlug(this.contents, s) as any;
      if (affected) affected.mods = { ...mods, animation: 'no-animation' }; // remove animation for the affected
    }
  }

  // Helper: find content by slug recursively
  findContentBySlug(contents: ContentParameter[], slug: string): ContentParameter | undefined {
    for (const content of contents) {
      if (content.slug === slug) return content;
      if (content.children?.length) {
        const found = this.findContentBySlug(content.children, slug);
        if (found) return found;
      }
    }
    return undefined;
  }
}
