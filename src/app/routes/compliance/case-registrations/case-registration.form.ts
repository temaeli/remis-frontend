import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  PROCESS_CASE_REGISTRATION,
  SAVE_OR_UPDATE_CASE_REGISTRATION,
} from './case-registration.graphql';
import { CaseRegistration } from './case-registration.interface';
import { CaseNature } from './case-registration.interface';
import { enumToObjectArray } from '@core/helpers';
import {
  ALL_DESIGNATIONS,
  USERS_BY_DESIGNATION_PAGEABLE,
} from '@routes/settings/designations/designations.graphql';
import {
  LIST_USERS_PAGEABLE,
  LIST_USERS_PAGEABLE_,
} from '@routes/users-managment/users/user.graphql';
import { ALL_DEPARTMENTS } from '@routes/settings/departments/department.graphql';
import { AttachmentSourceNameEnum } from '@shared/components/generic-form/attachment/attachment.interface';
import { LIST_ATTACHMENTS_BY_SOURCE_ID } from '@shared/components/generic-form/attachment/attachment.graphql';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { GET_DISTRICTS_BY_REGION } from '@routes/settings/regions/district/district.graphql';
import { GET_ALL_REGIONS } from '@routes/settings/regions/region.graphql';
import { GET_SUB_WARD_BY_WARD } from '@routes/settings/regions/subward/subward.graphql';
import { GET_WARDS_BY_DISTICT } from '@routes/settings/regions/ward/ward.graphql';
import { obs } from '@shared/components/generic-form/field-helpers';
import {
  commonProcessRegistrationFp,
  ComplianceRegistrationStage,
  Currency,
  proccessRegistrationBtn,
} from '../compliance-common/compliance-common';
import { MeetingRegistration } from '../meeting-registrations/meeting-registration.interface';

//Listener for all CaseRegistration actions
export const caseRegistration$ = new Subject<CaseRegistration | any>();

// "Legal staff only" restriction on the Case responsible-officer picker: filter to
// users holding this designation. Falls back to showing all active users if the
// designation hasn't been created in Settings > Designations yet.
const LEGAL_OFFICER_DESIGNATION_TITLE = 'Legal Officer';

export const getCaseRegistrationFormFields = (
  comp: BaseComponent,
  legalOfficerDesignationUid?: string,
): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  {
    key: 'name',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    key: 'natureOfCase',
    type: FieldType.select,
    validations: [VALIDATOR_REQUIRED],
    options: enumToObjectArray(CaseNature),
  },
  {
    key: 'otherNature',
    label: 'Other Nature of Case',
    showWhen: [{ key: 'natureOfCase', value: CaseNature.OTHER }],
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'responsibleInstitution',
    type: FieldType.input,
  },
  {
    key: 'responsibleDepartmentUid',
    type: FieldType.select,
    validations: [],
    optionsVariables: { fetchParameter: { query: ALL_DEPARTMENTS } },
  },
  {
    key: 'responsibleOfficerUid',
    label: 'Responsible Officer (Legal staff)',
    type: FieldType.select,
    validations: [],
    optionsVariables: {
      mapFunction: (d: any) => ({ label: `${d.firstName} ${d.lastName}`, value: d.uid }),

      fetchParameter: legalOfficerDesignationUid
        ? {
            queryFieldsKeys: ['firstName', 'lastName', 'uid'],
            query: USERS_BY_DESIGNATION_PAGEABLE,
            pageableParam: { page: 0, size: 10000 },
            variables: { active: true, designationUid: legalOfficerDesignationUid },
            searchStates: {},
          }
        : {
            queryFieldsKeys: ['firstName', 'lastName', 'uid'],
            query: LIST_USERS_PAGEABLE_,
            pageableParam: { page: 0, size: 10000 },
            variables: { active: true },
            searchStates: {},
          },
    },
  },
  {
    key: 'year',
    type: FieldType.number,
    validations: [],
  },
  {
    key: 'amount',
    type: FieldType.decimal,
    validations: [],
  },
  {
    key: 'currency',
    type: FieldType.select,
    validations: [],
    options: enumToObjectArray(Currency),
  },
  {
    key: 'otherCurrency',
    label: 'Other Currency',
    showWhen: [{ key: 'currency', value: Currency.OTHER }],
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'dateOfSchedules',
    type: FieldType.date,
    validations: [],
  },
  {
    key: 'decision',
    type: FieldType.input,
    validations: [],
  },

  {
    key: 'regionUid',
    label: 'Region',
    type: FieldType.select,
    ignoreOnSubmit: true,
    validations: [],
    optionsVariables: {
      fetchParameter: { query: GET_ALL_REGIONS },
      labelKey: 'name',
      valueKey: 'uid',
    },
  },
  {
    key: 'districtUid',
    label: 'District',
    ignoreOnSubmit: true,
    type: FieldType.select,
    validations: [],
    showWhen: [{ key: 'regionUid', checker: (v) => !!v }],
    optionsVariables: obs('regionUid', (x) => ({
      fetchParameter: { query: GET_DISTRICTS_BY_REGION, defaultRes: [], variables: { uid: x } },
    })),
  },
  {
    key: 'wardUid',
    label: 'Ward',
    ignoreOnSubmit: true,
    type: FieldType.select,
    validations: [],
    showWhen: [{ key: 'districtUid', checker: (v) => !!v }],
    optionsVariables: obs('districtUid', (x) => ({
      fetchParameter: {
        query: GET_WARDS_BY_DISTICT,
        defaultRes: [],
        variables: { districtUid: x },
      },
    })),
  },

  {
    key: 'placeUid', // subward
    type: FieldType.select,
    ignoreOnSubmit: false,
    validations: [],
    showWhen: [{ key: 'wardUid', checker: (v) => !!v }],
    optionsVariables: obs('wardUid', (x) => ({
      fetchParameter: { query: GET_SUB_WARD_BY_WARD, defaultRes: [], variables: { uid: x } },
    })),
  },

  {
    key: 'attachments',
    label: 'Case Attachments (optional)',
    type: FieldType.formGroupArray,
    showGroupLabel: false,
    expandable: false,
    validations: [],
    class: 'col-span-full',
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
];

export function caseRegistrationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: CaseRegistration) => {
      const designations: any[] = await comp.fs.fetch({
        query: ALL_DESIGNATIONS,
        loadingOn: 'no-content',
      });
      const legalOfficerDesignationUid = designations?.find((d) =>
        d?.title?.toLowerCase().includes(LEGAL_OFFICER_DESIGNATION_TITLE.toLowerCase()),
      )?.uid;

      let attachments = [];

      if (data?.uid) {
        attachments = await comp.fs.fetch({
          query: LIST_ATTACHMENTS_BY_SOURCE_ID,
          variables: { sourceUid: data?.uid },
        });

        attachments = attachments.map((a: any) => ({
          data: a,
          attachmentTitle: a.attachmentTitle,
        }));
      }

      const formParameter: FormParameters = {
        model: { ...data, responsibleDepartmentUid: data?.responsibleUnit?.uid, attachments },
        title: 'Case Registration',
        fields: getCaseRegistrationFormFields(comp, legalOfficerDesignationUid),
        closeAction$: caseRegistration$,

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
            loadingOn: 'submit-button',
            variables: { caseRegistrationDto: value },
            mutation: SAVE_OR_UPDATE_CASE_REGISTRATION,
            successFn: (res) => caseRegistration$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { width: '740px' });
    },
    permissions: ['ROLE_CREATE_CASE_REGISTRATION', 'ROLE_UPDATE_CASE_REGISTRATION'],
    showFunction: (d: CaseRegistration) => !d || d?.stage === ComplianceRegistrationStage.OFFICER,
    ...getUpsertBtnProps('Case Registration'),
  };
}

export function caseRegistrationProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...commonProcessRegistrationFp,
      variables: { processingDto: value },
      mutation: PROCESS_CASE_REGISTRATION,
    });
  };

  return proccessRegistrationBtn(comp, onSubmit, {
    [ComplianceRegistrationStage.OFFICER]: 'ROLE_PROCESS_CASE_REGISTRATION_AS_OFFICER',
    [ComplianceRegistrationStage.HOD]: 'ROLE_PROCESS_CASE_REGISTRATION_AS_HOD',
    [ComplianceRegistrationStage.GENERAL_MANAGER]: 'ROLE_PROCESS_CASE_REGISTRATION_AS_GM',
  });
}

export function caseRegistrationViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Case Registration',
    click: (data: CaseRegistration) => navigateRelativeTo(comp, 'case-registrations', data?.uid),
    permissions: ['ROLE_VIEW_CASE_REGISTRATION'],
  };
}

// export function caseRegistrationDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: CaseRegistration) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         successFn: (res) => caseRegistration$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Case Registration', 'name'),
//     permissions: ['ROLE_DELETE_CASE_REGISTRATION'],
//   };
// }

export function caseRegistrationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        caseRegistrationViewBtn(comp),
        caseRegistrationUpsertBtn(comp),
        // caseRegistrationDeleteBtn(comp),
      ],
    },
  ];
}
