import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isObservable, lastValueFrom } from 'rxjs';
import { FieldConfig } from '../field.interface';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { MatButtonModule } from '@angular/material/button';
import { ViewService } from '@shared/services/view.service';
import { FetchService } from '@shared/fetch/fetch.service';
import {
  AttachmentParameter,
  ViewAttachmentComponent,
} from '@shared/components/view-attachment/view-attachment.component';
import {
  DELETE_ATTACHMENT,
  LIST_ATTACHMENTS_BY_SOURCE_ID,
  UPLOAD_ATTACHMENT,
} from '../attachment/attachment.graphql';
import { MimeExtensionMap } from '../attachment/attachment.interface';

@Component({
  selector: 'app-attachment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, CommonModule, IconComponent, MergeClassesPipe, MatButtonModule],
  template: `
    <div class="row">
      @for (attachmentType of attachmentTypes; track attachmentType) {
        <div class="d-flex p-2 items-center {{ field.attachmentsClass ?? 'col-md-6' }}">
          <button
            mat-raised-button
            color="default"
            (click)="inputFile.click()"
            [class.bg-gradient-faded]="getAttachment(attachmentType)"
            style="flex: 1; height: 46px;"
            title="Upload file"
            type="button"
          >
            <app-icon
              [icon]="field.icon ?? 'attachment_paper'"
              class="me-2"
              iconClass="{{ 'opacity-60' | mergeClasses: field.iconClass }}"
            />
            @if (getAttachment(attachmentType); as attachment) {
              {{ attachment?.fileName }}
            } @else {
              {{ attachmentType?.attachmentTitle ?? attachmentType?.title }}
            }
          </button>
          @if (getAttachment(attachmentType); as attachment) {
            <button
              mat-icon-button
              color="default"
              (click)="viewAttachment(attachment)"
              class="bg-gradient-faded ms-1"
              style="width: 46px; height: 46px; flex-shrink: 0;"
              title="View attachment"
              type="button"
            >
              <mat-icon svgIcon="view" />
            </button>
            <button
              mat-icon-button
              color="warn"
              (click)="removeAttachment(attachmentType)"
              class="ms-1"
              style="width: 46px; height: 46px; flex-shrink: 0;"
              title="Remove attachment"
              type="button"
            >
              <mat-icon>close</mat-icon>
            </button>
          }
          <input
            hidden
            #inputFile
            (change)="onFileSelected($event, attachmentType)"
            [accept]="field.acceptType"
            type="file"
          />
        </div>
      }
    </div>
  `,
  styles: [],
})
export class AttachmentListComponent implements OnInit {
  @Output() attachedValue = new EventEmitter();

  field!: FieldConfig;
  group!: FormGroup;
  attachmentTypes: any[] = [];
  attachmentListDto: any[] = [];

  private vs = inject(ViewService);
  private fs = inject(FetchService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    const types = this.field?.attachmentTypes;
    if (Array.isArray(types)) this.attachmentTypes = types;
    else if (isObservable(types)) this.attachmentTypes = await lastValueFrom(types);

    // Load existing attachments from server when editing (uid present in form)
    const sourceUid: string | undefined = this.group.get('uid')?.value;
    if (sourceUid) {
      const existing = await this.fs.fetch({
        query: LIST_ATTACHMENTS_BY_SOURCE_ID,
        variables: { sourceUid },
        list: true,
      });
      if (Array.isArray(existing) && existing.length) {
        this.attachmentListDto = existing.map((item: any) => ({
          ...item,
          attachmentTypeUid: item.sourceName,
        }));
      }
    } else {
      // Create mode: restore from form control value if set
      const formVal: any[] = this.group.get(this.field.key)?.value ?? [];
      if (Array.isArray(formVal) && formVal.length) {
        this.attachmentListDto = formVal.map((item) => ({
          ...item,
          attachmentTypeUid: item.attachmentTypeUid ?? item.sourceName,
        }));
      }
    }

    this.cdr.markForCheck();
  }

  private typeKey(attachmentType: any): string {
    return attachmentType.sourceName ?? attachmentType.uid;
  }

  getAttachment(attachmentType: any) {
    return this.attachmentListDto?.find(
      (x) => x.attachmentTypeUid === this.typeKey(attachmentType),
    );
  }

  onFileSelected(event: any, attachmentType: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
      if (!this.field.key) return;

      const dataBinary = fileReader.result?.toString()?.replace(`data:${file.type};base64,`, '');
      const mediaType = file.type.split('/')[1]?.toLowerCase() ?? 'pdf';
      const fileName = file.name.length > 58 ? file.name.slice(0, 58) + '...' : file.name;

      const key = this.typeKey(attachmentType);

      // Replace any existing entry for this type
      this.attachmentListDto = this.attachmentListDto.filter((x) => x.attachmentTypeUid !== key);
      const localAttachment = {
        attachmentTypeUid: key,
        fileName,
        data: dataBinary,
        dataBinary,
        mediaType,
        extension: MimeExtensionMap[file.type] ?? '.pdf',
      };
      this.attachmentListDto = [...this.attachmentListDto, localAttachment];
      this.field.attachmentList = this.attachmentListDto;
      this.group.controls[this.field.key].setValue([...this.attachmentListDto]);
      this.cdr.markForCheck(); // show eye + remove buttons immediately

      // Upload to server
      const sourceId: string | undefined = this.group.get('uid')?.value;
      const saved = await this.fs.fetch({
        mutation: UPLOAD_ATTACHMENT,
        variables: {
          attachmentDto: {
            dataBinary,
            mediaType,
            attachmentTitle: fileName,
            sourceName: attachmentType.sourceName ?? key,
            ...(sourceId ? { sourceId } : {}),
          },
        },
        notify: true,
      });

      if (saved) {
        this.attachmentListDto = this.attachmentListDto.map((x) =>
          x.attachmentTypeUid === key
            ? { ...x, id: saved.id, filePath: saved.filePath, fullPath: saved.fullPath }
            : x,
        );
        this.field.attachmentList = this.attachmentListDto;
        this.group.controls[this.field.key].setValue([...this.attachmentListDto]);
        this.cdr.markForCheck();
      }

      this.attachedValue.emit({ attachmentFile: this.attachmentListDto, field: this.field });
    };

    fileReader.readAsDataURL(file);
  }

  async removeAttachment(attachmentType: any): Promise<void> {
    const key = this.typeKey(attachmentType);
    const existing = this.getAttachment(attachmentType);
    if (existing?.id) {
      await this.fs.fetch({
        mutation: DELETE_ATTACHMENT,
        variables: { id: existing.id },
        notify: true,
      });
    }
    this.attachmentListDto = this.attachmentListDto.filter((x) => x.attachmentTypeUid !== key);
    this.field.attachmentList = this.attachmentListDto;
    this.group.controls[this.field.key].setValue([...this.attachmentListDto]);
    this.cdr.markForCheck();
  }

  viewAttachment(attachmentDto: any): void {
    this.vs.openDialog({
      component: ViewAttachmentComponent,
      width: '90%',
      maxWidth: '920px',
      minHeight: '640px',
      data: {
        attachment: attachmentDto,
        title: attachmentDto.attachmentTitle ?? attachmentDto.attachmentTypeUid,
      } as AttachmentParameter,
    });
  }
}
