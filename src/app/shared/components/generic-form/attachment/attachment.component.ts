import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isObservable, lastValueFrom } from 'rxjs';
import { FieldConfig } from '../field.interface';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ViewService } from '@shared/services/view.service';
import { FetchService } from '@shared/fetch/fetch.service';
import { AttachmentParameter } from '@shared/components/view-attachment/view-attachment.component';
import { ViewAttachmentComponent } from '@shared/components/view-attachment/view-attachment.component';
import { DELETE_ATTACHMENT, READ_ATTACHMENT, UPLOAD_ATTACHMENT } from './attachment.graphql';
import { isValue } from '@core/helpers';
import { BaseAttachment, MimeExtensionMap } from './attachment.interface';

@Component({
  selector: 'app-attachment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    IconComponent,
    MergeClassesPipe,
    MatButtonModule,
    MatFormFieldModule,
  ],
  template: `
    <div
      class="flex w-full items-center rounded-[15px]
       {{ field.attachment?.data ? '' : 'border border-gray-300' }}"
    >
      @if (field.attachment?.data) {
        <button
          mat-icon-button
          color="default"
          (click)="viewAttachment()"
          class="bg-gradient-faded me-2"
          style="width: 54px; height: 54px;"
          title="View uploaded file"
          type="button"
        >
          <mat-icon svgIcon="view" />
        </button>
        <button
          mat-icon-button
          color="warn"
          (click)="removeAttachment()"
          class="me-2"
          style="width: 54px; height: 54px;"
          title="Remove attachment"
          type="button"
        >
          <mat-icon>close</mat-icon>
        </button>
      }
      <button
        matButton=""
        (click)="inputFile.click()"
        [class.bg-gradient-faded]="field.attachment?.data"
        style="width: 100%; min-height: 54px;"
        title="Upload file"
        type="button"
      >
        <app-icon
          [icon]="field.icon ?? 'attachment_paper'"
          class="me-3"
          iconClass="{{ 'opacity-60' | mergeClasses: field.iconClass }}"
        />
        @if (fileName) {
          {{ fileName }}
        } @else {
          {{ field.attachment?.attachmentTitle ?? field.label }}
        }
      </button>
      <input
        hidden
        #inputFile
        (change)="onFileSelected($event)"
        [accept]="field.acceptType"
        type="file"
      />
    </div>
    @if (field.hint) {
      <mat-hint class="text-sm relative left-4">
        <small>{{ field.hint }}</small>
      </mat-hint>
    }
  `,
  styles: [],
})
export class AttachmentComponent implements OnInit {
  private vs = inject(ViewService);
  private fs = inject(FetchService);
  private cdr = inject(ChangeDetectorRef);

  @Output() attachedValue = new EventEmitter();

  field!: FieldConfig;
  group!: FormGroup;
  fileName?: string;

  async ngOnInit(): Promise<void> {
    const filePath =
      this.field.attachment?.filePath ?? this.group.get(this.field.key)?.value?.filePath;
    if (isValue(filePath) && typeof filePath === 'string') {
      const res = await this.fs.fetch({
        query: READ_ATTACHMENT,
        variables: { filePath },
        list: false,
      });
      if (res) {
        this.field.attachment = {
          ...this.field.attachment,
          data: res.dataBinary ?? res.data,
          mediaType: res.mediaType,
          fileName: res.attachmentTitle ?? (res.filePath as string)?.split('/').pop(),
        };
        this.cdr.markForCheck();
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const name = file.name;
    this.fileName = name.length > 58 ? name.slice(0, 58) + '...' : name;

    const mediaType: string = file.type.split('/')[1]?.toLowerCase() ?? 'pdf';

    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      if (!this.field.key) return;

      const dataBinary = fileReader.result?.toString()?.replace(`data:${file.type};base64,`, '');

      const attachment: BaseAttachment = {
        attachmentTitle: this.fileName,
        mediaType: MimeExtensionMap[file.type] ?? '.pdf',
        ...(this.field.attachment ?? {}),
        dataBinary,
        data: dataBinary,
      };

      delete attachment.extension;

      // Show preview button immediately
      this.field.attachment = { ...attachment };
      this.cdr.markForCheck();

      // Upload to server unless caller opts out (e.g. endpoint-specific
      // mutations that carry dataBinary themselves on form submit)
      if (!this.field.skipAutoUpload) {
        const saved = await this.fs.fetch({
          mutation: UPLOAD_ATTACHMENT,
          variables: {
            attachmentDto: {
              dataBinary,
              mediaType,
              attachmentTitle: this.fileName,
              sourceName: this.field.attachment?.sourceName,
              sourceId: this.field.attachment?.sourceId,
            },
          },
          notify: true,
        });

        if (saved) {
          this.field.attachment = {
            ...this.field.attachment,
            id: saved.id,
            filePath: saved.filePath,
            fullPath: saved.fullPath,
          };
          this.cdr.markForCheck();
        }
      }

      const value = this.field.asFile
        ? file
        : this.field.base64only
          ? attachment.dataBinary
          : { ...this.field.attachment };

      this.group.controls[this.field.key].setValue(value);
      this.attachedValue.emit({ attachment: this.field.attachment, field: this.field });
    };

    fileReader.readAsDataURL(file);
  }

  async removeAttachment(): Promise<void> {
    const id = this.field.attachment?.id;
    if (id) {
      await this.fs.fetch({
        mutation: DELETE_ATTACHMENT,
        variables: { id },
        notify: true,
      });
    }
    this.field.attachment = undefined;
    this.fileName = undefined;
    if (this.field.key) this.group.controls[this.field.key].setValue(null);
    this.cdr.markForCheck();
  }

  async viewAttachment(): Promise<void> {
    if (isObservable(this.field?.attachment?.data)) {
      this.field.attachment.data = await lastValueFrom(this.field.attachment.data as any);
    }
    this.vs.openDialog({
      component: ViewAttachmentComponent,
      width: '90%',
      maxWidth: '920px',
      minHeight: '640px',
      data: {
        attachment: this.field.attachment,
        title: this.field.attachment?.attachmentTitle ?? this.field.label,
      } as AttachmentParameter,
    });
  }
}
