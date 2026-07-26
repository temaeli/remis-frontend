import { SimpleChanges, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Component, Input, OnChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ContentParameter } from '../view-interface';
import { BaseComponent } from '../../base-componet/base-component';
import { ActionButton } from '../../action-buttons/action-buttons.inteface';
import { ToggleButtonsComponent } from '../../toggle-buttons/toggle-buttons.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { CommonModule } from '@angular/common';
import { MergeObjectsPipe } from '../../../pipes/merge-objects.pipe';
import { NoContentComponent } from '../../no-content/no-content.component';
import { DataGridComponent } from '../../data-grid/data-grid.component';
import { DetailsComponent } from '../../details/details.component';
import { BgIconMarkComponent } from '../../details/bg-icon-mark/bg-icon-mark.component';
import { DetailsHeaderComponent } from '@shared/components/details/details-header/details-header.component';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { slugify } from '@core/helpers';
import { settings$ } from '@core/settings/settings.store';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { setObjectParameters } from '../../details/util/util.helpers';

@Component({
  selector: 'contents-view',
  templateUrl: `contents-view.component.html`,
  imports: [
    MergeClassesPipe,
    CommonModule,
    MergeObjectsPipe,
    ToggleButtonsComponent,
    NoContentComponent,
    DataGridComponent,
    DetailsComponent,
    BgIconMarkComponent,
    DetailsHeaderComponent,
    MatDialogModule,
    ActionButtonsComponent,
    HasPermissionDirective,
    SafeHtmlPipe,
  ],
})
export class ContentsViewComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() icon = '';
  @Input() override title = 'Content';
  @Input() override animation = settings$.value.animations?.pages;
  @Input() showContentInTabs: boolean | undefined;
  @Input() noContentLabel = 'No Data';

  @Input() loading = false;
  @Input() contents: ContentParameter[] | undefined = [];

  permittedContents: ContentParameter[] = [];

  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<ContentsViewComponent>, { optional: true });

  dialogButtons: ActionButton[] = [
    {
      label: 'Close',
      iconClass: 'small',
      click: () => this.dialogRef?.close(),
    },
  ];

  override slugTree: string[] | undefined = this.getLocValue('slugTree') ?? [];

  ngOnChanges(changes: SimpleChanges) {
    this.setParameters();
  }

  ngOnInit(): void {
    if (this.dialogData) setObjectParameters(this, this.dialogData);
    this.setParameters();
  }

  setParameters() {
    if (!this.contents) return;

    this.contents = this.contents.map((c) => {
      const slug = c.slug ?? slugify(c.name ?? '' + c.label + '');
      return { ...c, slug };
    });

    this.permittedContents = this.filterPermittedContents(this.contents);
  }

  onContentChange(slug: string, level: number) {
    if (!this.slugTree) this.slugTree = [];
    if (this.slugTree[level] === slug) return; //avoid loops

    this.slugTree[level] = slug;
    this.setLocInfo('slugTree', this.slugTree);
    this.handleWhenActive(slug);
    //
    const content = this.findContentBySlug(this.contents, slug);
    if (content?.onActive) content.onActive(content, this);
  }

  handleWhenActive(slug: string) {
    const removeMods = (cc: ContentParameter[]) => {
      for (const c of cc) if ((c.mods = {}) && c.children?.length) removeMods(c.children);
    };

    if (!this.contents) return;

    removeMods(this.contents);
    const content: ContentParameter = this.findContentBySlug(this.contents, slug) as any;
    if (!content || !content?.whenActive) return;

    for (const [s, mods] of Object.entries(content.whenActive)) {
      const affected: ContentParameter = this.findContentBySlug(this.contents, s) as any;
      if (affected) affected.mods = { ...mods, animation: 'no-animation' }; // remove animation for the affected
    }
  }

  // Helper: find content by slug recursively
  findContentBySlug(contents: ContentParameter[] = [], slug: string): ContentParameter | undefined {
    for (const content of contents) {
      if (content.slug === slug) return content;
      if (content.children?.length) {
        const found = this.findContentBySlug(content.children, slug);
        if (found) return found;
      }
    }
    return undefined;
  }

  private filterPermittedContents(contents: ContentParameter[] = []): ContentParameter[] {
    return contents
      .filter((content) => HasPermissionDirective.hasPermission(content.permissions ?? []))
      .map((content) => ({
        ...content,
        slug: content.slug ?? slugify(`${content.name ?? ''} ${content.label ?? ''}`),
        children: this.filterPermittedContents(content.children ?? []),
      }));
  }
}
