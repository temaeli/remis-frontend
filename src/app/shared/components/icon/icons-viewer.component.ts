import { Component, OnInit, Input, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { IconsService, SvgIcon } from './icons.service';
import { ViewService } from '@shared/services/view.service';
import { MatIconModule } from '@angular/material/icon';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { DetailsHeaderComponent } from '../details/details-header/details-header.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-icons-viewer',
  template: `
    <details-header
      cdkDrag
      cdkDragHandle
      cdkDragRootElement=".cdk-overlay-pane"
      [title]="title"
      class="border-b border-b-gray-200 cursor-drag"
    />

    <mat-dialog-content>
      <!-- Filter -->
      <div class="mt-4 position-relative fields-no-margin thin-fields flex justify-center">
        <mat-form-field class="mx-auto border  border-gray-200 custom-fill width-320">
          <input
            (keyup)="filterIcons()"
            [(ngModel)]="searchKey"
            autocomplete="off"
            matInput
            placeholder="Search"
          />

          @if (searchKey) {
            <button (click)="onSearchClear()" class="cursor-pointer" mat-icon-button matSuffix>
              <mat-icon svgIcon="cancel" />
            </button>
          }
        </mat-form-field>
      </div>

      <!-- end of Filter -->

      <div class="flex flex-wrap justify-center mx-auto mt-2 relative" style="max-width:1280px">
        @for (icon of listData; track $index) {
          <div class="w-[150px] p-3">
            <div class="rounded-lg border border-gray-100 p-3">
              <div class="flex justify-center">
                <mat-icon [svgIcon]="icon.name" />
              </div>
              <div class="mt-2 text-muted text-center">{{ icon.name }}</div>
            </div>
          </div>
        }
      </div>
    </mat-dialog-content>

    <div draggable="true" class="inline-block absolute bottom-0 right-0 m-3">
      <input hidden #fileInput type="file" (change)="onFileChange($event)" accept=".svg" />
      <button
        (click)="fileInput.click()"
        class="px-2 {{ 'move-right' }} my-1"
        style="--order:3"
        color="primary"
        mat-fab
      >
        <mat-icon color="white" class="text-white" svgIcon="add" />
      </button>
    </div>
  `,
  imports: [
    MatIconModule,
    FormsModule,
    MatDialogModule,
    DetailsHeaderComponent,
    MatFormFieldModule,
    MatInputModule,
    DragDropModule,
  ],
})
export class IconsViewerComponent implements OnInit {
  //customerIcons
  title = 'Custom Icons';
  listData: SvgIcon[] = [];
  allListData: SvgIcon[] = [];
  searchKey = '';

  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<IconsViewerComponent>, { optional: true });
  iconsService = inject(IconsService);

  ngOnInit() {
    this.allListData = this.iconsService.svgIcons.sort((a, b) => a.name.localeCompare(b.name));
    this.listData = this.allListData;
  }

  filterIcons() {
    const filter = (x: any) =>
      x.filter((i: any) => i.name.includes(this.searchKey.trim().toLowerCase()));
    if (this.searchKey != '') this.listData = filter(this.allListData);
    else this.listData = this.allListData;
  }

  onFileChange(ev: any) {
    const reader = new FileReader();
    const file = ev.target.files[0];

    // reader.addEventListener(
    //   'load',
    //   () => {
    //     let fileContents = <string>reader.result;
    //     let fileName = file.name
    //       .replace(' ', '')
    //       .replace('.svg', '')
    //       .replace(/[()#$.!~`]/g, '');

    //     let icon: SvgIcon = {
    //       name: fileName,
    //       tag: fileContents,
    //     };

    //     this.view.openDialogModal({
    //       component: SaveIconComponent,
    //       width: '70%',
    //       maxHeight: 'auto',
    //       data: icon,
    //     });
    //   },
    //   false,
    // );

    if (file) reader.readAsText(file);
  }

  onSearchClear() {
    this.searchKey = '';
    this.filterIcons();
  }

  closeDialog(e: any): void {
    this.dialogRef?.close();
  }
}
