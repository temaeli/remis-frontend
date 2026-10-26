import { ChangeDetectionStrategy, Component } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridKeyColumn, GridParameter } from '@shared/components/data-grid/data-grid.interfaces';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

import { ATTACHMENT_TYPE_OPTIONS } from '../attachment-lookups';
import { BIO_DATA_TYPE_OPTIONS } from '../party-types';

const rowFields = `
  uid
  bioDataType
  attachmentType
`;

const ALL_PAIRS = gql`
  query allBioDataTypeAttachmentTypes {
    allBioDataTypeAttachmentTypes {
      ${rowFields}
    }
  }
`;

const LINK_PAIR = gql`
  mutation linkBioDataTypeAttachmentType($bioDataType: String, $attachmentType: String) {
    linkBioDataTypeAttachmentType(bioDataType: $bioDataType, attachmentType: $attachmentType) {
      ${responseGqlFields(rowFields)}
    }
  }
`;

const UNLINK_PAIR = gql`
  mutation unlinkBioDataTypeAttachmentType($uid: String) {
    unlinkBioDataTypeAttachmentType(uid: $uid) {
      ${responseGqlFields(rowFields)}
    }
  }
`;

const PERMISSION = 'BIO_DATA_TYPE_ATTACHMENT_TYPE';

interface PartyDocumentRow {
  uid?: string;
  bioDataType?: string;
  attachmentType?: string;
}

/**
 * The documents each kind of party is expected to hold
 * (`bio_data_types_attachment_types`). Both sides are fixed lists, so a row is
 * just a pair: added from two selects, removed outright. Adding a pair already
 * listed changes nothing.
 */
@Component({
  selector: 'app-party-documents',
  imports: [DataGridComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class PartyDocuments extends BaseComponent {
  override title = 'Party Documents';
  override subtitle = 'The documents each type of person or organisation is expected to hold';

  private changed$ = new Subject<unknown>();

  override actionButtons: ActionButton[] = [this.addBtn()];

  keyColumns: GridKeyColumn[] = [
    'index',
    {
      field: 'bioDataType',
      header: 'Party Type',
      valueFn: (row) => getDisplayName(row?.bioDataType),
    },
    {
      field: 'attachmentType',
      header: 'Document Type',
      valueFn: (row) => getDisplayName(row?.attachmentType),
    },
    'actions',
  ];

  gridParameter: GridParameter = {
    title: 'Party Documents',
    icon: 'description',
    keyColumns: this.keyColumns,
    isPageable: false,
    reloadActions$: [this.changed$],
    fetchParameter: { query: ALL_PAIRS },
    actionButtons: [{ ...MORE_BTN, buttons: [this.removeBtn()] }],
  };

  addBtn(): ActionButton {
    return {
      icon: 'add',
      label: 'Add Document',
      class: 'btn-add-primary',
      permissions: [`ROLE_CREATE_${PERMISSION}`, `ROLE_UPDATE_${PERMISSION}`],
      click: () => {
        const close$ = new Subject<void>();
        const formParameter: FormParameters = {
          title: 'Add Party Document',
          model: {},
          fields: [
            {
              key: 'bioDataType',
              label: 'Party Type',
              type: FieldType.select,
              options: BIO_DATA_TYPE_OPTIONS,
              validations: [VALIDATOR_REQUIRED],
              class: 'col-span-full',
            },
            {
              key: 'attachmentType',
              label: 'Document Type',
              type: FieldType.select,
              options: ATTACHMENT_TYPE_OPTIONS,
              validations: [VALIDATOR_REQUIRED],
              class: 'col-span-full',
            },
          ],
          closeAction$: close$,
          onSubmit: async (value: PartyDocumentRow) => {
            await this.fs.fetch({
              mutation: LINK_PAIR,
              notify: true,
              variables: { bioDataType: value?.bioDataType, attachmentType: value?.attachmentType },
              successFn: (res) => {
                this.changed$.next(res?.data);
                close$.next();
              },
            });
          },
        };
        this.vs?.openModal(FormComponent, formParameter, '40%');
      },
    };
  }

  removeBtn(): ActionButton {
    return {
      icon: 'block',
      label: 'Remove',
      class: 'text-danger',
      permissions: [`ROLE_DELETE_${PERMISSION}`],
      confirmDataMapper: (row: PartyDocumentRow) => ({
        title: 'REMOVE',
        confirmText: 'REMOVE',
        confirmButtonColor: 'red',
        message: `Stop expecting <b class='text-danger'>${getDisplayName(row?.attachmentType ?? '')}</b> from ${getDisplayName(row?.bioDataType ?? '')}?`,
      }),
      click: async (row: PartyDocumentRow) => {
        await this.fs.fetch({
          mutation: UNLINK_PAIR,
          notify: true,
          loadingOn: 'content',
          variables: { uid: row?.uid },
          successFn: (res) => this.changed$.next(res?.data),
        });
      },
    };
  }
}
