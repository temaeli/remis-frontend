import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import {
  VALIDATOR_REQUIRED,
  VALIDATOR_TANZINIA_PHONE,
} from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { CLOSE_INQUIRY, SAVE_OR_UPDATE_INQUIRY, SUBMIT_INQUIRY } from '../inquiry.graphql';
import {
  Inquiry,
  InquiryAssignment,
  InquiryDestination,
  InquiryStage,
  InquiryStatus,
} from '../inquiry.interface';
import { InquiryNature } from '../inquiry.interface';
import { InquiryCategory } from '../inquiry.interface';
import { InquiryPriority } from '../inquiry.interface';
import { InquiryType } from '../inquiry.interface';
import { enumToObjectArray } from '@core/helpers';
import { GET_DISTRICTS_BY_REGION } from 'app/routes/settings/regions/district/district.graphql';
import { GET_ALL_REGIONS } from 'app/routes/settings/regions/region.graphql';
import { GET_SUB_WARD_BY_WARD } from 'app/routes/settings/regions/subward/subward.graphql';
import { GET_WARDS_BY_DISTICT } from 'app/routes/settings/regions/ward/ward.graphql';
import { obs, obs$ } from '@shared/components/generic-form/field-helpers';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';

//Listener for all Inquiry actions
export const inquiry$ = new Subject<Inquiry | any>();
export const inquiryProcess$ = new Subject<Inquiry | any>();

export const inquiryFormParameter = async (
  comp: BaseComponent,
  inquiry?: Inquiry,
): Promise<FormParameters> => {
  const anonymous = comp.router.url.includes('anonymous');

  let attachments = [];

  if (inquiry?.uid) {
    attachments = await comp.fs.fetch({
      query: LIST_ATTACHMENTS_BY_SOURCE_ID,
      variables: { sourceUid: inquiry?.uid },
    });

    attachments = attachments.map((a: any) => ({
      data: a,
      attachmentTitle: a.attachmentTitle,
    }));
  }

  return {
    model: { ...inquiry, attachments },
    title: 'FeedBack / Complaint',
    closeAction$: inquiry$,

    onSubmit: async (value: any) => {
      value.attachments = value.attachments
        .filter((a: any) => !!a.data?.dataBinary)
        .map((a: any) => ({
          ...a.data,
          attachmentTitle: a.attachmentTitle,
          sourceName: AttachmentSourceNameEnum.OTHERS,
        }));

      await comp.fs.fetch({
        notify: true,
        variables: { inquiryDto: value },
        mutation: SAVE_OR_UPDATE_INQUIRY,
        successFn: (res) => inquiry$.next(res?.data),
      });
    },

    fields: [
      { key: 'uid', type: FieldType.input, visible: false },
      {
        key: 'clientName',
        label: 'Customer Name',
        type: FieldType.input,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'type',
        type: FieldType.select,
        validations: [],
        options: enumToObjectArray(InquiryType),
      },
      {
        key: 'inquiryCategory',
        label: 'Inquiry Source',
        type: FieldType.select,
        validations: [],
        options: enumToObjectArray(InquiryCategory),
      },
      {
        key: 'destination',
        type: FieldType.select,
        validations: [],
        options: enumToObjectArray(InquiryDestination),
      },
      {
        key: 'nature',
        type: FieldType.select,
        validations: [],
        options: enumToObjectArray(InquiryNature),
      },
      {
        key: 'otherNature',
        showWhen: [{ key: 'nature', value: InquiryNature.OTHER }],
        type: FieldType.input,
        validations: [],
      },
      {
        key: 'phone',
        type: FieldType.input,
        validations: [VALIDATOR_TANZINIA_PHONE],
      },
      {
        key: 'priority',
        type: FieldType.select,
        validations: [],
        options: enumToObjectArray(InquiryPriority),
      },
      /////////////
      {
        key: 'regionUid',
        label: 'Region',
        type: FieldType.select,
        ignoreOnSubmit: true,
        validations: [],
        visible: !anonymous,
        optionsVariables: { fetchParameter: { query: GET_ALL_REGIONS } },
      },
      {
        key: 'districtUid',
        label: 'District',
        ignoreOnSubmit: true,
        type: FieldType.select,
        validations: [],
        visible: !anonymous,
        showWhen: [{ key: 'regionUid' }],
        optionsVariables: {
          fetchParameter: { query: GET_DISTRICTS_BY_REGION, variables: { uid: obs$('regionUid') } },
        },
      },
      {
        key: 'wardUid',
        label: 'Ward',
        ignoreOnSubmit: true,
        type: FieldType.select,
        validations: [],
        visible: !anonymous,
        showWhen: [{ key: 'districtUid' }],
        optionsVariables: {
          fetchParameter: {
            query: GET_WARDS_BY_DISTICT,
            variables: { districtUid: obs$('districtUid') },
          },
        },
      },
      {
        key: 'subWardUid',
        label: 'Street',
        type: FieldType.select,
        ignoreOnSubmit: false,
        validations: [],
        visible: !anonymous,
        showWhen: [{ key: 'wardUid' }],
        optionsVariables: {
          fetchParameter: { query: GET_SUB_WARD_BY_WARD, variables: { uid: obs$('wardUid') } },
        },
      },
      ///////////////
      {
        key: 'description',
        type: FieldType.textarea,
        validations: [],
        class: 'col-span-full',
      },

      {
        key: 'attachments',
        label: 'Inquiry Attachments (optional)',
        type: FieldType.formGroupArray,
        showGroupLabel: false,
        expandable: false,
        validations: [],
        class: 'col-span-full mb-3',
        fields: [
          {
            key: 'data',
            label: 'Attachment File',
            type: FieldType.attachment,
            skipAutoUpload: true,
            attachment: { sourceName: AttachmentSourceNameEnum.OTHERS },
            validations: [],
            class: 'col-span-full',
          },
          {
            key: 'attachmentTitle',
            type: FieldType.input,
            value: obs('data', (data) => data?.attachmentTitle ?? ''),
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
            showWhen: [{ key: 'data' }],
          },
        ],
      },
    ],
  };
};

export function inquiryUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: Inquiry) => {
      const formParameter: FormParameters = await inquiryFormParameter(comp, data);
      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '780px' });
    },
    showFunction: (d?: Inquiry) =>
      !d || (d?.status === InquiryStatus.OPEN && d?.stage === InquiryStage.DRAFT),
    permissions: ['ROLE_CREATE_INQUIRY', 'ROLE_UPDATE_INQUIRY'],
    ...getUpsertBtnProps('Feedback / Complaint'),
  };
}

export function inquiryViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Feedback / Complaint',
    click: (d: any) => navigateRelativeTo(comp, 'inquiries', d?.inquiry?.uid ?? d?.uid),
    permissions: ['ROLE_VIEW_INQUIRY'],
  };
}

export function inquirySubmitBtn(comp: BaseComponent): ActionButton {
  return {
    label: 'Submit Inquiry',
    icon: 'submit',
    class: 'submit-button',
    showFunction: (d?: Inquiry) =>
      d?.status === InquiryStatus.OPEN && d?.stage === InquiryStage.DRAFT,

    click: async (data?: Inquiry) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'submit-button',
        variables: { uid: data?.uid },
        query: SUBMIT_INQUIRY,
        successFn: (res) => inquiryProcess$.next(res?.data),
      });
    },
    permissions: ['ROLE_CREATE_INQUIRY', 'ROLE_UPDATE_INQUIRY'],
  };
}

// export function inquiryDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: Inquiry) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         finalFn: (res) => inquiry$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Feedback / Complaint'),
//     permissions: ['ROLE_DELETE_INQUIRY'],
//   };
// }

export function inquiryCloseBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Inquiry) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        query: CLOSE_INQUIRY,
        finalFn: (res) => inquiry$.next(res?.data),
      });
    },
    showFunction: (d?: Inquiry) => !!d?.status && [InquiryStatus.ATTENDED].includes(d?.status),
    icon: 'double_tick',
    label: 'Close Feedback / Complaint',
    confirmMessage: 'Are you sure you want to close this feedback / complaint?',
    permissions: ['ROLE_CLOSE_INQUIRY'],
  };
}

export function inquiryTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [inquiryViewBtn(comp), inquiryUpsertBtn(comp)],
    },
  ];
}
