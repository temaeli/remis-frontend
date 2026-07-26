import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { lastValueFrom, Subject, Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ViewService } from '@shared/services/view.service';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { MatDividerModule } from '@angular/material/divider';
import { DetailsHeaderComponent } from '../details/details-header/details-header.component';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { CommonModule } from '@angular/common';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { setObjectParameters } from '../details/util/util.helpers';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { ImageCropperComponent, ImageCroppedEvent, OutputFormat } from 'ngx-image-cropper';
import { ImageTransform, Dimensions } from 'ngx-image-cropper';
import { blobToFile } from '../details/util/base-64/base-64.helpers';
import { BaseAttachment } from '../generic-form/attachment/attachment.interface';

export interface ImageProperties {
  base64Image?: string;
  aspectRatio?: number;
  imageWidth?: number;
  maintainAspectRatio?: boolean;
  showTitle?: boolean;
  actionButtons?: ActionButton[];
  footerButtons?: ActionButton[];
  onChange?: (photo: BaseAttachment) => any;
  icon?: string;
  title?: string;
  showFooter?: boolean;
  footerClass?: string;
  format?: OutputFormat;
}

@Component({
  selector: 'crop-image',
  templateUrl: './crop-image.component.html',
  imports: [
    ActionButtonsComponent,
    MatDividerModule,
    DetailsHeaderComponent,
    TruncatePipe,
    MatDialogModule,
    CommonModule,
    MergeClassesPipe,
    ImageCropperComponent,
  ],
})
export class CropImageComponent implements OnInit, OnDestroy {
  private vs = inject(ViewService);
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<CropImageComponent>, { optional: true });

  icon: string | undefined;
  animation = 'move-up';
  title = 'Upload Photo';

  scale = 1;
  rotation = 0;
  canvasRotation = 0;
  showCropper = false;
  imageChangedEvent: any = '';
  containWithinAspectRatio = false;

  transform: ImageTransform = {};
  imageData: ImageCroppedEvent | undefined;
  attachment: BaseAttachment | undefined;
  subs = new Subscription();

  @Input() base64Image: string | undefined;
  @Input() photoProps: ImageProperties | undefined;
  @Input() showTitle = true;
  @Input() aspectRatio = 4 / 4;
  @Input() maintainAspectRatio = true;
  @Input() onChange?: (photo: BaseAttachment) => any;
  @Input() actionButtons: ActionButton[] = [];
  @Input() footerButtons: ActionButton[] = [];
  @Input() imageWidth = 256;
  @Input() format: OutputFormat = 'jpeg';

  @Output() onPhotoChange = new EventEmitter();

  utilityButtons: ActionButton[] = [];
  cancelSelectedPhoto$ = new Subject();
  dialogButtons: ActionButton[] = [];
  fileButton!: ActionButton;

  ngOnInit(): void {
    if (this.dialogRef && this.dialogData) this.photoProps = { ...this.dialogData };

    setObjectParameters(this, this.photoProps ?? {});

    this.setButtons();

    if (this.base64Image) {
      this.attachment = { fileName: 'Photo', extension: 'png', data: this.base64Image };
      this.imageLoaded();
    }
  }

  setButtons() {
    this.dialogButtons = [
      {
        label: 'Close',
        iconClass: 'small',
        click: () => this.closeDialog(),
      },
    ];

    this.fileButton = {
      icon: 'image',
      class: 'bg-primary px-4 text-white_',
      toolTip: 'Select another File',
      iconClassMapper: (comp) => (comp.attachment ? '' : 'me-3'),
      isFileSelector: true,
      labelMapper: (comp: this) => (comp.attachment ? '' : undefined as any),
      onFileChange: ({ event }: any) => this.fileChangeEvent(event),
      removeFile$: this.cancelSelectedPhoto$,
    };

    this.utilityButtons = [
      {
        toolTip: 'Rotate left',
        icon: 'rotate_left',
        class: `${this.animation} --order-4 text-muted `,
        click: () => this.canvasRotation-- + 1 && this.flipAfterRotate(),
      },
      {
        toolTip: 'Rotate Right',
        icon: 'rotate_right',
        class: `${this.animation} --order-4 text-muted `,
        click: () => this.canvasRotation++ + 1 && this.flipAfterRotate(),
      },
      {
        toolTip: 'Flip horizontal',
        icon: 'flip_horizontal',
        class: `${this.animation} --order-4 text-muted `,
        click: () => (this.transform = { ...this.transform, flipH: !this.transform.flipH }),
      },
      {
        toolTip: 'Flip vertical',
        icon: 'flip_vertical',
        class: `${this.animation} --order-4 text-muted `,
        click: () => (this.transform = { ...this.transform, flipV: !this.transform.flipV }),
      },
      {
        toolTip: 'Zoom Out',
        icon: 'minus',
        class: `${this.animation} --order-4 text-muted `,
        click: () => (this.transform = { ...this.transform, scale: (this.scale -= 0.1) }),
      },
      {
        toolTip: 'Zoom In',
        icon: 'add',
        class: `${this.animation} --order-4 text-muted `,
        click: () => (this.transform = { ...this.transform, scale: (this.scale += 0.1) }),
      },
      {
        toolTip: 'Reset',
        icon: 'refresh',
        class: `${this.animation} --order-4 text-muted `,
        click: () => this.resetImage(),
      },

      /// photo btns
      this.fileButton,
      {
        icon: 'cancel',
        iconClass: 'icon-small',
        toolTip: 'Remove Image',
        class: 'bg-secondary text-white_',
        showFunction: () => !!this.attachment,
        click: () => this.cancel(),
      },
      ...this.actionButtons,
    ];
  }

  async openFileSelector() {
    this.fileChangeEvent(await lastValueFrom(this.vs.openFileSelector()));
  }

  cancel() {
    this.attachment = undefined;
    this.cancelSelectedPhoto$.next(true);
    this.photoChanged();
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files[0] as File;
    const extention = file?.name?.split('.')?.pop() ?? 'png';
    this.attachment = { fileName: file.name, extension: extention, file };
    this.imageChangedEvent = event;
  }

  async imageCropped(event: ImageCroppedEvent) {
    this.imageData = event;

    if (event.blob) {
      this.attachment = {
        ...this.attachment,
        file: blobToFile(event.blob, this.attachment?.fileName ?? 'cropped-image'),
        dataUrl: URL.createObjectURL(event.blob),
      };
    }

    this.photoChanged();
  }

  photoChanged() {
    if (this.onChange) this.onChange((this.attachment as any));
    this.onPhotoChange.emit(this.attachment);
  }

  imageLoaded() {
    this.showCropper = true;
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = { ...this.transform, flipH: flippedV, flipV: flippedH };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  closeDialog(): void {
    this.dialogRef?.close();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  cropperReady(sourceImageDimensions: Dimensions) {}

  loadImageFailed() {}
}
