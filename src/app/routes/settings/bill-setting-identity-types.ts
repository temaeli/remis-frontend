import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { getDisplayName } from '@core/helpers/view.helpers';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

import { PRIORITY_OPTIONS, priorityLabel } from '../project-management/priorities';

/**
 * The identification types a bill header setting takes, each with a priority —
 * `bill_headers_settings_identity_types`.
 *
 * A type is linked to a setting once; linking it again changes its priority.
 */

/** Tells the panel a link changed. */
export const billSettingIdentityType$ = new Subject<unknown>();

const linkGqlFields = `
  id
  uid
  priority
  identityTypeIdentificationType {
    id
    identificationType
    identityType {
      id
      name
    }
  }
`;

export const IDENTITY_TYPES_OF_BILL_SETTING = gql`
  query identityTypesByBillHeadersSetting($billHeadersSettingUid: String) {
    identityTypesByBillHeadersSetting(billHeadersSettingUid: $billHeadersSettingUid) {
      ${linkGqlFields}
    }
  }
`;

const ALL_IDENTIFICATION_TYPES_FOR_LINK = gql`
  query allIdentityTypeIdentificationTypes {
    allIdentityTypeIdentificationTypes {
      id
      description
    }
  }
`;

export const LINK_BILL_SETTING_IDENTITY_TYPE = gql`
  mutation linkBillHeadersSettingIdentityType(
    $billHeadersSettingUid: String
    $identityTypeIdentificationTypeUid: String
    $priority: Priority
  ) {
    linkBillHeadersSettingIdentityType(
      billHeadersSettingUid: $billHeadersSettingUid
      identityTypeIdentificationTypeUid: $identityTypeIdentificationTypeUid
      priority: $priority
    ) {
      ${responseGqlFields(linkGqlFields)}
    }
  }
`;

export const SET_BILL_SETTING_IDENTITY_TYPE_PRIORITY = gql`
  mutation setBillHeadersSettingIdentityTypePriority($uid: String, $priority: Priority) {
    setBillHeadersSettingIdentityTypePriority(uid: $uid, priority: $priority) {
      ${responseGqlFields(linkGqlFields)}
    }
  }
`;

export const REMOVE_BILL_SETTING_IDENTITY_TYPE = gql`
  mutation removeBillHeadersSettingIdentityType($uid: String) {
    removeBillHeadersSettingIdentityType(uid: $uid) {
      ${responseGqlFields(linkGqlFields)}
    }
  }
`;

const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_BILL_HEADERS_SETTING', 'ROLE_VIEW_BILL_HEADERS_SETTING'];
const WRITE_PERMISSIONS = ['ROLE_CREATE_BILL_HEADERS_SETTING', 'ROLE_UPDATE_BILL_HEADERS_SETTING'];

const typeName = (row: any): string => {
  const link = row?.identityTypeIdentificationType;
  return link?.identityType?.name ?? (getDisplayName(link?.identificationType) as string) ?? 'this type';
};

interface LinkFormValue {
  identityTypeIdentificationTypeUid: string;
  priority: string;
}

/** Links an identification type to the setting with a priority. */
function linkBtn(comp: BaseComponent, billHeadersSettingUid?: string): ActionButton {
  return {
    icon: 'add',
    label: 'Link Identity Type',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: 'Link Identity Type',
        fields: [
          {
            key: 'identityTypeIdentificationTypeUid',
            label: 'Identity Type',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'description',
              valueKey: 'id',
              fetchParameter: { query: ALL_IDENTIFICATION_TYPES_FOR_LINK },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          {
            key: 'priority',
            label: 'Priority',
            type: FieldType.select,
            options: PRIORITY_OPTIONS,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: LinkFormValue) => {
          await comp.fs.fetch({
            notify: true,
            mutation: LINK_BILL_SETTING_IDENTITY_TYPE,
            variables: {
              billHeadersSettingUid,
              identityTypeIdentificationTypeUid: value.identityTypeIdentificationTypeUid,
              priority: value.priority,
            },
            successFn: (res: any) => {
              billSettingIdentityType$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: WRITE_PERMISSIONS,
  };
}

/** Changes a linked type's priority. */
function priorityBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'flag',
    label: 'Change Priority',
    click: (row: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { priority: row?.priority },
        title: `Priority of ${typeName(row)}`,
        fields: [
          {
            key: 'priority',
            label: 'Priority',
            type: FieldType.select,
            options: PRIORITY_OPTIONS,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: { priority: string }) => {
          await comp.fs.fetch({
            notify: true,
            mutation: SET_BILL_SETTING_IDENTITY_TYPE_PRIORITY,
            variables: { uid: row?.uid, priority: value.priority },
            successFn: (res: any) => {
              billSettingIdentityType$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: WRITE_PERMISSIONS,
  };
}

/** Unlinks a type from the setting. */
function removeBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'block',
    label: 'Remove',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Remove Identity Type',
      confirmText: 'REMOVE',
      confirmButtonColor: 'red',
      message: `Stop taking <b class='text-danger'>${typeName(row)}</b> on this setting?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        mutation: REMOVE_BILL_SETTING_IDENTITY_TYPE,
        variables: { uid: row?.uid },
        successFn: (res: any) => billSettingIdentityType$.next(res?.data),
      });
    },
    permissions: WRITE_PERMISSIONS,
  };
}

/** The identification types one setting takes, for its detail page. */
export const billSettingIdentityTypesPanel = (
  comp: BaseComponent,
  billHeadersSettingUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Identity Types',
  label: 'Identity Types',
  icon: 'badge',
  permissions: VIEW_PERMISSIONS,
  keyColumns: [
    'index',
    'identityTypeIdentificationType.identityType.name as Identity Type',
    {
      field: 'identityTypeIdentificationType.identificationType',
      header: 'Identification',
      valueFn: (row: any) =>
        getDisplayName(row?.identityTypeIdentificationType?.identificationType),
    },
    { field: 'priority', header: 'Priority', valueFn: (row: any) => priorityLabel(row?.priority) },
    'actions',
  ],
  headerButtons: [linkBtn(comp, billHeadersSettingUid)],
  actionButtons: [{ ...MORE_BTN, buttons: [priorityBtn(comp), removeBtn(comp)] }],
  reloadActions$: [billSettingIdentityType$],
  fetchParameter: { query: IDENTITY_TYPES_OF_BILL_SETTING, variables: { billHeadersSettingUid } },
});
