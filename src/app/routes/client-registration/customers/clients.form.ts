import { BehaviorSubject, Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import {
  VALIDATOR_REQUIRED,
  VALIDATOR_TANZINIA_PHONE,
  VALIDATOR_FAX,
  VALIDATOR_NIN,
  VALIDATOR_EMAIL,
} from '@shared/components/generic-form/form-constants';
import {
  FieldConfig,
  FieldType,
  FormStepper,
} from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import {
  SAVE_CLIENT,
  DELETE_CLIENT,
  APPROVE_CLIENT_REGISTRATION,
  REVIEW_CLIENT_REGISTRATION,
  CLIENT_REGISTRATION_APPROVAL_HISTORY,
  VERIFY_CLIENT_TIN,
  TERMINATE_CLIENT,
} from './clients.graphql';
import {
  ApprovalStatus,
  Client,
  ClientRegistrationApprovalDtoInput,
  ClientRegistrationStage,
  ClientStatus,
  ClientStreamType,
  TinVerificationStatus,
} from './clients.interface';
import { ALL_PLANT } from 'app/routes/plants/plants/plant.graphql';
import { GET_ALL_REGIONS } from 'app/routes/settings/regions/region.graphql';
import { GET_DISTRICTS_BY_REGION } from 'app/routes/settings/regions/district/district.graphql';
import { GET_WARDS_BY_DISTICT } from 'app/routes/settings/regions/ward/ward.graphql';
import { GET_SUB_WARD_BY_WARD } from 'app/routes/settings/regions/subward/subward.graphql';
import { IdentificationType } from '../customers-categories/customers-categories.interface';
import { ALL_CUSTOMER_CATEGORIES } from '../customers-categories/customers-categories.graphql';
import { ALL_GAS_INSTALLATIONS } from './gas-installation/gas-installation.graphql';
import { GET_ALL_PIPELINE_SEGMENTS } from '@routes/pipeline-management/segments/segment.graphql';

// Listener for all Client actions
export const client$ = new Subject<Client | any>();

// HOUSEHOLD category UID for conditional visibility
const HOUSEHOLD_CATEGORY_UID = '2583021c-feb1-4457-afaf-3dbb93dc2584';

// Date range validator for contract dates
const createDateRangeValidator = () => {
  return (control: any) => {
    if (!control.value) {
      return null; // Skip if empty
    }

    // Get the form to access contractStartDate
    const form = control.parent;
    if (!form) {
      return null;
    }

    const startDate = form.get('contractStartDate')?.value;
    if (!startDate) {
      return null; // Skip if start date is not set
    }

    const start = new Date(startDate);
    const end = new Date(control.value);

    return start >= end
      ? { dateRange: { message: 'Contract start date must be before end date' } }
      : null;
  };
};

// Validator to ensure contract start date is not in the past
const createMinDateValidator = (minDate: Date) => {
  return (control: any) => {
    if (!control.value) {
      return null; // Skip if empty
    }

    const date = new Date(control.value);
    const today = new Date(minDate);
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < today
      ? { minDate: { message: 'Contract start date cannot be in the past' } }
      : null;
  };
};

const VALIDATOR_CONTRACT_END_DATE = {
  name: 'dateRange',
  validator: createDateRangeValidator(),
  message: 'Contract end date must be after contract start date',
};

const VALIDATOR_CONTRACT_START_DATE = {
  name: 'minDate',
  validator: createMinDateValidator(new Date()),
  message: 'Contract start date cannot be in the past',
};

// Validator to ensure minimum daily quantity is not greater than maximum
const createMaxValueValidator = (fieldToCompare: string, fieldLabel: string) => {
  return (control: any) => {
    if (!control.value && control.value !== 0) {
      return null; // Skip if empty
    }

    const form = control.parent;
    if (!form) {
      return null;
    }

    const maxValue = form.get(fieldToCompare)?.value;
    if (!maxValue && maxValue !== 0) {
      return null; // Skip if comparison field is not set
    }

    const currentValue = Number(control.value);
    const maxVal = Number(maxValue);

    return currentValue > maxVal
      ? {
          maxValue: {
            message: `This value cannot be greater than ${fieldLabel}`,
            max: maxVal,
            actual: currentValue,
          },
        }
      : null;
  };
};

const VALIDATOR_MIN_DAILY_QTY = {
  name: 'maxValue',
  validator: createMaxValueValidator('maximumDailyQuantityMmscfd', 'Max Daily Quantity'),
  message: 'Min Daily Quantity cannot be greater than Max Daily Quantity',
};

const VALIDATOR_PRODUCTION_CAPACITY = {
  name: 'maxValue',
  validator: createMaxValueValidator('maximumDailyQuantityMmscfd', 'Max Daily Quantity'),
  message: 'Production Capacity (MDQ) cannot be greater than Max Daily Quantity',
};

export const getClientFormFields = (initialData?: any): FieldConfig[] => {
  const regionUid$ = new BehaviorSubject<string | null>(initialData?.regionUid ?? null);
  const districtUid$ = new BehaviorSubject<string | null>(initialData?.districtUid ?? null);
  const wardUid$ = new BehaviorSubject<string | null>(initialData?.wardUid ?? null);

  const fields: FieldConfig[] = [
    {
      key: 'uid',
      type: FieldType.input,
      visible: false,
    },
    // --- Basic Info ---
    {
      key: 'clientStreamType',
      label: 'Stream Type',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      options: Object.values(ClientStreamType).map((type) => ({
        label: type === 'UP' ? 'Upstream Customer' : 'Downstream Customer',
        value: type,
      })),
      class: 'col-span-1',
    },
    {
      key: 'identificationType',
      label: 'Identification Type',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      options: Object.values(IdentificationType).map((type) => ({
        label: type.replace(/_/g, ' '),
        value: type,
      })),
      class: 'col-span-1',
    },
    {
      key: 'logoUrl',
      label: 'Logo URL',
      type: FieldType.input,
      validations: [],
      class: 'col-span-full',
    },
    // --- Contact Person ---
    {
      key: 'contactPersonName',
      label: 'Contact Person Name',
      type: FieldType.input,
      validations: [],
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.BUSINESS_REGISTRATION,
        },
      ],
    },
    {
      key: 'contactPersonEmail',
      label: 'Contact Person Email',
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.BUSINESS_REGISTRATION,
        },
      ],
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'contactPersonPhone',
      label: 'Contact Person Phone',
      hint: 'Enter Tanzania phone number (e.g., +255654321234, 255654321234, or 0654321234)',
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.BUSINESS_REGISTRATION,
        },
      ],
      type: FieldType.input,
      validations: [VALIDATOR_TANZINIA_PHONE],
    },
    // --- User Info ---
    {
      key: 'firstName',
      label: 'First Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.NATIONAL_ID,
        },
      ],
    },
    {
      key: 'organizationName',
      label: 'Company Name / Institution Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.BUSINESS_REGISTRATION,
        },
      ],
    },

    {
      key: 'middleName',
      label: 'Middle Name',
      type: FieldType.input,
      validations: [],
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.NATIONAL_ID,
        },
      ],
    },
    {
      key: 'lastName',
      label: 'Last Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.NATIONAL_ID,
        },
      ],
    },
    {
      key: 'email',
      type: FieldType.input,
      hint: 'Enter a valid email address (e.g., user@example.com)',
      validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
    },
    {
      key: 'phone',
      type: FieldType.input,
      hint: 'Enter Tanzania phone number (e.g., +255654321234, 255654321234, or 0654321234)',
      validations: [VALIDATOR_TANZINIA_PHONE],
    },
    {
      key: 'fax',
      type: FieldType.input,
      hint: 'Enter Tanzania fax number (e.g., +255654321234, 255654321234, or 0654321234)',
      validations: [VALIDATOR_FAX],
    },
    // --- IDs ---
    {
      key: 'idNumber',
      label: 'ID Number',
      hint: 'Enter 20-digit NIN (National Identification Number)',
      type: FieldType.input,
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.NATIONAL_ID,
        },
      ],
      validations: [VALIDATOR_NIN],
    },

    {
      key: 'categoryUids',
      label: 'Customer Categories',
      type: FieldType.select,
      multiple: true,
      validations: initialData?.uid ? [] : [VALIDATOR_REQUIRED], // Only required on creation, not on edit
      optionsVariables: {
        fetchParameter: { query: ALL_CUSTOMER_CATEGORIES },
        labelKey: 'name',
        valueKey: 'uid',
      },
      class: 'col-span-1',
      onChange: (value: any, form: any) => {
        // Trigger form re-evaluation when category changes
        form?.updateValueAndValidity();
      },
    },

    {
      key: 'installedAreas',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      label: 'Zones of Operation',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-3 gap-4',
      showWhen: [
        {
          key: 'categoryUids',
          checker: (categoryUids: any) => {
            // Show only if HOUSEHOLD category is selected
            if (!categoryUids) return false;
            if (typeof categoryUids === 'string') {
              return categoryUids === HOUSEHOLD_CATEGORY_UID;
            }
            if (Array.isArray(categoryUids)) {
              return categoryUids.includes(HOUSEHOLD_CATEGORY_UID);
            }
            return false;
          },
        },
      ],
      fields: [
        {
          key: 'gasInstallationUid',
          label: 'Zone',
          type: FieldType.select,
          validations: [VALIDATOR_REQUIRED],
          optionsVariables: {
            fetchParameter: { query: ALL_GAS_INSTALLATIONS },
            labelKey: 'name',
            valueKey: 'uid',
          },
        },
        {
          key: 'activeConnections',
          label: 'Active Connections',
          type: FieldType.input,
          inputType: 'number',
          value: 0,
          min: 1,
          validations: [VALIDATOR_REQUIRED],
        },

        {
          key: 'notActiveConnections',
          label: 'Not Active Connections',
          type: FieldType.input,
          inputType: 'number',
          value: 0,
          min: 1,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'notes',
          label: 'Notes',
          type: FieldType.textarea,
          validations: [],
        },
      ],
    },

    {
      key: 'tin',
      label: 'TIN',
      type: FieldType.input,
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.BUSINESS_REGISTRATION,
        },
      ],
      validations: [],
    },

    // --- Contract ---
    {
      key: 'contractStartDate',
      label: 'Contract Start Date',
      type: FieldType.date,
      validations: [VALIDATOR_CONTRACT_START_DATE],
    },
    {
      key: 'contractEndDate',
      label: 'Contract End Date',
      type: FieldType.date,
      validations: [VALIDATOR_CONTRACT_END_DATE],
    },
    // --- Location ---
    {
      key: 'blockNumber',
      label: 'Block Number',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'postalAddress',
      label: 'Postal Address',
      type: FieldType.input,
      validations: [],
    },
    // --- Capacity ---
    {
      key: 'minimumDailyQuantityMmscfd',
      label: 'Min Daily Quantity (Mmscfd)',
      type: FieldType.number,
      validations: [VALIDATOR_MIN_DAILY_QTY],
    },
    {
      key: 'maximumDailyQuantityMmscfd',
      label: 'Max Daily Quantity (Mmscfd)',
      type: FieldType.number,
      validations: [],
    },
    {
      key: 'productionCapacityMmscfd',
      label: 'Production Capacity (Mmscfd)',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
      showWhen: [{ key: 'clientStreamType' }],
      setWhen: [
        {
          when: [{ key: 'clientStreamType', value: ClientStreamType.DOWN }],
          field: { label: 'Maximum Daily Quantity (MDQ)' } as any,
        },
        {
          when: [{ key: 'clientStreamType', value: ClientStreamType.UP }],
          field: { label: 'Production Capacity (Mmscfd)' } as any,
        },
      ],
    },
    // --- Plant ---
    {
      key: 'plantUid',
      label: 'Plant',
      type: FieldType.select,
      validations: [],
      optionsVariables: {
        fetchParameter: { query: ALL_PLANT },
        labelKey: 'name',
        valueKey: 'uid',
      },
      showWhen: [
        {
          key: 'clientStreamType',
          value: ClientStreamType.UP,
        },
      ],
    },
    // --- Pipeline Segment ---
    {
      key: 'pipelineSegmentUid',
      label: 'Segment',
      type: FieldType.select,
      validations: [],
      optionsVariables: {
        fetchParameter: { query: GET_ALL_PIPELINE_SEGMENTS },
        labelKey: 'segmentId',
        valueKey: 'uid',
      },
      showWhen: [
        {
          key: 'clientStreamType',
          value: ClientStreamType.DOWN,
        },
      ],
    },

    // --- Sub Ward via cascade ---
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
      onChange: (value: string, form: any) => {
        regionUid$.next(value ?? null);
        districtUid$.next(null);
        wardUid$.next(null);
        form?.get('districtUid')?.reset();
        form?.get('wardUid')?.reset();
        form?.get('subWardUid')?.reset();
      },
    },
    {
      key: 'districtUid',
      label: 'District',
      type: FieldType.select,
      ignoreOnSubmit: true,
      validations: [],
      showWhen: [{ key: 'regionUid', checker: (v) => !!v }],
      optionsVariables: {
        fetchParameter: { query: GET_DISTRICTS_BY_REGION, variables: { uid: regionUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
      onChange: (value: string, form: any) => {
        districtUid$.next(value ?? null);
        wardUid$.next(null);
        form?.get('wardUid')?.reset();
        form?.get('subWardUid')?.reset();
      },
    },
    {
      key: 'wardUid',
      label: 'Ward',
      type: FieldType.select,
      ignoreOnSubmit: true,
      validations: [],
      showWhen: [{ key: 'districtUid', checker: (v) => !!v }],
      optionsVariables: {
        fetchParameter: { query: GET_WARDS_BY_DISTICT, variables: { districtUid: districtUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
      onChange: (value: string, form: any) => {
        wardUid$.next(value ?? null);
        form?.get('subWardUid')?.reset();
      },
    },
    {
      key: 'subWardUid',
      label: 'Sub Ward',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      showWhen: [{ key: 'wardUid', checker: (v) => !!v }],
      optionsVariables: {
        fetchParameter: { query: GET_SUB_WARD_BY_WARD, variables: { uid: wardUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
  ];

  return fields;
};

export function getClientFormSteppers(): FormStepper[] {
  return [
    {
      name: 'Customer Information',
      icon: 's-users',
      keys: [
        'clientStreamType',
        'identificationType',
        'firstName',
        'middleName',
        'lastName',
        'organizationName',
        'productionCapacityMmscfd',
        'categoryUids',
        'idNumber',
        'tin',
        'email',
        'phone',
        'fax',
        'installedAreas',
      ],
    },
    {
      name: 'Contact Information',
      icon: 's-profile',
      keys: ['contactPersonName', 'contactPersonEmail', 'contactPersonPhone'],
      showWhen: [
        {
          key: 'identificationType',
          value: IdentificationType.BUSINESS_REGISTRATION,
        },
      ],
    },
    // {
    //   name: 'Contract & Capacity',
    //   icon: 'file',
    //   keys: [
    //     'contractStartDate',
    //     'contractEndDate',
    //     'minimumDailyQuantityMmscfd',
    //     'maximumDailyQuantityMmscfd',
    //     'productionCapacityMmscfd',
    //   ],
    // },
    {
      name: 'Location',
      icon: 'zone',
      keys: [
        'plantUid',
        'pipelineSegmentUid',
        'blockNumber',
        'postalAddress',
        'regionUid',
        'districtUid',
        'wardUid',
        'subWardUid',
      ],
    },
  ];
}

export function clientUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: Client) => {
      const close$ = new Subject<void>();

      // Transform nested objects to flat properties for the form
      const transformedData = { ...data } as any;

      // Transform categories array to categoryUids array
      if (data?.categories && Array.isArray(data.categories)) {
        transformedData.categoryUids = data.categories
          .map((cat: any) => cat.uid)
          .filter((uid: any) => uid);
      }

      // Transform location hierarchy
      if (data?.subWard) {
        transformedData.subWardUid = data.subWard.uid;
        transformedData.regionUid = data.subWard.ward?.district?.region?.uid ?? null;
        transformedData.districtUid = data.subWard.ward?.district?.uid ?? null;
        transformedData.wardUid = data.subWard.ward?.uid ?? null;
      }

      // Transform plant reference
      if (data?.plant && !transformedData.plantUid) {
        transformedData.plantUid = data.plant.uid;
      }

      // Transform pipeline segment reference
      if (data?.pipelineSegment && !transformedData.pipelineSegmentUid) {
        transformedData.pipelineSegmentUid = data.pipelineSegment.uid;
      }

      // Combine fullName for organizationName during editing
      if (data && transformedData.identificationType === IdentificationType.BUSINESS_REGISTRATION) {
        const nameParts = [
          (data as any)?.firstName,
          (data as any)?.middleName,
          (data as any)?.lastName,
        ]
          .filter((part: any) => part && part.trim())
          .join(' ');
        if (nameParts) {
          transformedData.organizationName = nameParts;
        } else if ((data as any)?.contactPersonName) {
          // Fallback to contactPersonName if available
          transformedData.organizationName = (data as any).contactPersonName;
        }
      }

      // clientStreamType should already be in transformedData from spread

      const formParameter: FormParameters = {
        model: transformedData,
        title: 'Customer',
        fields: getClientFormFields(transformedData),
        closeAction$: close$,
        linearSteppers: false,
        formSteppers: getClientFormSteppers(),
        showFooter: true,
        showStepperCancel: false,
        onSubmit: async (value: any) => {
          try {
            delete value.attachmentDtoList;
            // Keep categoryUids during editing, only delete if not provided
            if (!value.categoryUids || value.categoryUids.length === 0) {
              delete value.categoryUids;
            }
            // If organizationName has a value, use it as firstName
            if (value.organizationName) {
              value.firstName = value.organizationName;
              delete value.organizationName;
            }
            // Clean up installedAreas: remove entries with all null values
            if (value.installedAreas?.length > 0) {
              value.installedAreas = value.installedAreas.filter(
                (area: any) => !Object.values(area).every((v) => v === null),
              );
            }
            await comp.fs.fetch({
              notify: true,
              variables: { input: value },
              mutation: SAVE_CLIENT,
              successFn: (res) => {
                client$.next(res?.data);
                close$.next();
              },
            });
          } catch (error) {
            console.error('Client submission error:', error);
            throw error;
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '80%', '80vh', { maxWidth: '800px' });
    },
    permissions: ['ROLE_CREATE_CLIENT', 'ROLE_UPDATE_CLIENT'],
    ...getUpsertBtnProps('Customer'),
    hideFunction: (data?: Client) => !!data && data?.approvalStatus === ApprovalStatus.APPROVED,
  };
}

export function clientViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Customer',
    permissions: ['ROLE_VIEW_CLIENT'],
    click: (data: Client) => navigateRelativeTo(comp, 'clients', data?.uid),
  };
}

export function clientDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_DELETE_CLIENT'],
    ...getDeleteBtnProps('Client', 'name'),
    click: async (data: Client) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_CLIENT,
        finalFn: (res) => client$.next(res?.data),
      });
    },
  };
}

export function reviewClientBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_REVIEW_CLIENT_REGISTRATION'],
    icon: 's-approvals',
    label: 'Review Registration',
    showFunction: (row: Client) => row?.registrationStage === ClientRegistrationStage.SUBMITTED,
    click: (data: Client) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Review Registration',
        icon: 's-approvals',
        model: { clientUid: data?.uid, approved: false, comments: '' },
        fields: [
          { key: 'clientUid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Endorse Registration',
            type: FieldType.select,
            options: [
              { label: 'Endorse', value: true },
              { label: 'Reject', value: false },
            ],
            class: 'col-span-full',
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: ClientRegistrationApprovalDtoInput) => {
          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: REVIEW_CLIENT_REGISTRATION,
            successFn: (res) => {
              client$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function approveClientBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_APPROVE_CLIENT_REGISTRATION'],
    icon: 's-approvals',
    label: 'Approve / Reject',
    showFunction: (row: Client) => row?.registrationStage === ClientRegistrationStage.REVIEWED,
    click: (data: Client) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Approve / Reject Registration',
        icon: 's-approvals',
        model: { clientUid: data?.uid, approved: false, comments: '' },
        fields: [
          { key: 'clientUid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Approve Registration',
            type: FieldType.select,
            options: [
              { label: 'Approve', value: true },
              { label: 'Reject', value: false },
            ],
            class: 'col-span-full',
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: ClientRegistrationApprovalDtoInput) => {
          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: APPROVE_CLIENT_REGISTRATION,
            successFn: (res) => {
              client$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function verifyClientTinBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_APPROVE_CLIENT_REGISTRATION', 'ROLE_VIEW_ALL_CLIENT'],
    icon: 'verified',
    label: 'Verify TIN',
    showFunction: (row: Client) => !!row?.tin,
    click: (data: Client) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: `Verify TIN - ${data?.tin}`,
        icon: 'verified',
        model: { clientUid: data?.uid, outcome: null },
        fields: [
          { key: 'clientUid', type: FieldType.input, visible: false },
          {
            key: 'outcome',
            label: 'Outcome',
            type: FieldType.select,
            hint: 'Leave blank to request automatic verification via TRA (GovESB)',
            options: [
              { label: 'Request Automatic Verification', value: null },
              { label: 'Verified (manual)', value: TinVerificationStatus.VERIFIED },
              { label: 'Mismatch (manual)', value: TinVerificationStatus.MISMATCH },
              { label: 'Not Found (manual)', value: TinVerificationStatus.NOT_FOUND },
            ],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { clientUid: value.clientUid, outcome: value.outcome || null },
            mutation: VERIFY_CLIENT_TIN,
            successFn: () => {
              client$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function terminateClientBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_TERMINATE_CLIENT'],
    icon: 'cancelled',
    label: 'Terminate Customer',
    showFunction: (row: Client) => row?.clientStatus !== ClientStatus.TERMINATED,
    click: (data: Client) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: `Terminate Customer - ${data?.code ?? data?.contactPersonName ?? ''}`,
        icon: 'cancelled',
        model: { uid: data?.uid, reason: '' },
        fields: [
          { key: 'uid', type: FieldType.input, visible: false },
          {
            key: 'reason',
            label: 'Termination Reason',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { uid: value.uid, reason: value.reason },
            mutation: TERMINATE_CLIENT,
            successFn: (res) => {
              client$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function viewApprovalHistoryBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_APPROVE_CLIENT_REGISTRATION', 'ROLE_REVIEW_CLIENT_REGISTRATION'],
    icon: 'clock',
    label: 'Approval History',
    click: (data: Client) => {
      const formParameter: FormParameters = {
        title: 'Approval History',
        icon: 'clock',
        showFooter: false,
        fields: [
          {
            key: 'history',
            type: FieldType.table,
            label: '',
            tableParameter: {
              keyColumns: ['approvalStatus', 'approvalComments', 'approvedAt', 'approvedById'],
              isPageable: false,
              fetchParameter: {
                query: CLIENT_REGISTRATION_APPROVAL_HISTORY,
                variables: { clientUid: data?.uid },
              },
            },
          },
        ],
        onSubmit: async () => {},
      };
      comp.vs?.openModal(FormComponent, formParameter, '65%', '65vh');
    },
  };
}

export function clientTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        clientViewBtn(comp),
        clientUpsertBtn(comp),
        reviewClientBtn(comp),
        approveClientBtn(comp),
        verifyClientTinBtn(comp),
        terminateClientBtn(comp),
        // clientDeleteBtn(comp),
      ],
    },
  ];
}
