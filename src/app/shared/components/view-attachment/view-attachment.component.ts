import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
} from '@angular/core';
import { OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isObservable, Observable, Subscription, tap } from 'rxjs';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { setObjectParameters } from '../details/util/util.helpers';
import { DetailsHeaderComponent } from '../details/details-header/details-header.component';
import { NoContentComponent } from '../no-content/no-content.component';
import { downloadBlob } from '../details/util/base-64/base-64.helpers';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SettingsService } from '@core/settings/settings.service';
import { ViewService } from '@shared/services/view.service';
import { FetchService } from '@shared/fetch/fetch.service';
import { READ_ATTACHMENT } from '../generic-form/attachment/attachment.graphql';
import { generateUniqueId, truncate } from '@core/helpers';
import { BaseAttachment, MimeExtensionMap } from '../generic-form/attachment/attachment.interface';

export interface AttachmentParameter {
  attachment?: BaseAttachment | Observable<BaseAttachment>;
  title?: string;
  showTitle?: boolean;
  actionButtons?: ActionButton[];
  edit?: boolean;
  showCloseBtn?: boolean;
}

@Component({
  selector: 'view-attachment',
  templateUrl: './view-attachment.component.html',
  styleUrls: ['./view-attachment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DetailsHeaderComponent, NoContentComponent, NgxExtendedPdfViewerModule],
})
export class ViewAttachmentComponent implements OnInit, OnChanges, OnDestroy {
  st = inject(SettingsService);
  vs = inject(ViewService);
  fs = inject(FetchService);
  cdr = inject(ChangeDetectorRef);

  dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<ViewAttachmentComponent>, { optional: true });
  elementRef = inject(ElementRef);

  @Input() attachment?: BaseAttachment | Observable<BaseAttachment> = undefined;
  @Input() title: any = undefined;
  @Input() showTitle = true;
  @Input() showCloseBtn = true;
  @Input() actionButtons: ActionButton[] = [];
  @Input() edit = false;
  @Input() attachmentParameter: AttachmentParameter = {};

  componentUid = generateUniqueId();
  attachmentSub?: Subscription;
  baseAttachment?: BaseAttachment;

  subs = new Subscription();
  attachmentButtons: ActionButton[] = [];
  base64: string | undefined = undefined;
  colorValue = '#ffffff';

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
  }

  ngOnInit() {
    setObjectParameters(this, { ...this.attachmentParameter, ...this.dialogData });
    this.loadData();
    this.setButtons();
  }

  loadData() {
    if (isObservable(this.attachment) && !this.attachmentSub) {
      this.attachmentSub = this.attachment.subscribe((x) => this.setAttachment(x));
    } else this.setAttachment((this.attachment as BaseAttachment));
  }

  async setAttachment(attachment: BaseAttachment) {
    this.baseAttachment = attachment ?? {};

    if (attachment) {
      this.baseAttachment.extension = attachment.extension ?? '.pdf';
      this.baseAttachment.data = attachment.data;
    }

    if (!attachment?.data && attachment?.filePath) {
      this.baseAttachment = {
        ...attachment,
        ...(await this.getFileByPath(attachment.filePath)),
      };
    }

    if (!this.baseAttachment) return;

    if (!['.pdf'].includes((this.baseAttachment.extension as any))) return this.downloadFile();
    if (!this.title) this.title = this.baseAttachment?.fileName;

    this.base64 = this.baseAttachment.data;
    this.cdr.markForCheck();

    this.messageToChild();
    this.sendBase64(this.base64);
  }

  async getFileByPath(path: string): Promise<Partial<BaseAttachment>> {
    const res = await this.fs.fetch({
      query: READ_ATTACHMENT,
      variables: { filePath: path },
      list: false,
    });
    if (!res) return {};
    return {
      data: res.dataBinary ?? res.data,
      mediaType: res.mediaType,
      extension:
        MimeExtensionMap[
          `${res.mediaType?.includes('/') ? res.mediaType : `application/${res.mediaType}`}`
        ] ??
        this.baseAttachment?.extension ??
        'pdf',
      fileName: res.attachmentTitle ?? path.split('/').pop(),
    };
  }

  setButtons() {
    this.attachmentButtons = [
      {
        icon: 'attachment',
        label: 'Change File',
        class: 'bg-primary px-4 text-white',
        isFileSelector: true,
        labelClass: 'ps-1',
        allowedExtensions: ['.pdf'],
        showFunction: () => this.edit && !!Object.keys(this.dialogRef ?? {})?.length,
        onFileChange: ({ event }) => this.fileChangeEvent(event),
      },
      ...this.actionButtons,
      {
        icon: 'cancel',
        iconClass: 'icon-small',
        click: () => this.closeDialog(),
        showFunction: () => !!Object.keys(this.dialogRef ?? {})?.length,
      },
    ];
  }

  messageToChild() {
    window.addEventListener('message', (message) => {
      if (message.data.uid !== this.componentUid) return;
      this.sendBase64(this.base64);
    });

    const postMsg = () => {
      const colorValue = this.getColorValue();
      const id = '#myIframe';
      const iframe = this.elementRef?.nativeElement?.querySelector(id) as HTMLIFrameElement;
      iframe?.contentWindow?.postMessage({ colorValue });
    };

    this.subs.add(this.st.settings$.pipe(tap((settings) => postMsg())).subscribe());
  }

  fileChangeEvent(event: any) {
    const file = event.target.files[0];
    const fileReader: FileReader = new FileReader();

    fileReader.onloadend = (x) => {
      const data = fileReader?.result?.toString()?.replace(`data:${file.type};base64,`, '');
      const fileName = file.name.length > 80 ? truncate(file.name, 80) : file.name;
      const attachment = { ...this.attachment, data, fileName, dataBinary: data };
      this.attachmentParameter = { ...this.attachmentParameter, attachment };
      this.loadData();
    };

    fileReader.readAsDataURL(file);
  }

  getColorValue() {
    const docStyle = getComputedStyle(this.st.htmlElement);
    const colorValue = docStyle.getPropertyValue('--color-white');
    return (this.colorValue = colorValue);
  }

  sendBase64(base64: string | undefined) {
    if (this.baseAttachment?.extension !== 'pdf' || !base64) return;

    const colorValue = this.getColorValue();
    const iframe = this.elementRef?.nativeElement?.querySelector('#myIframe') as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage({ [this.componentUid]: base64, colorValue });
  }

  downloadFile() {
    if (!this.baseAttachment?.blob) return;

    downloadBlob(this.baseAttachment.blob, this.baseAttachment.fileName ?? 'download');
    return this.closeDialog();
  }

  closeDialog() {
    this.dialogRef?.close();
  }

  ngOnDestroy(): void {
    this.attachmentSub?.unsubscribe();
    this.subs?.unsubscribe();
  }
}
