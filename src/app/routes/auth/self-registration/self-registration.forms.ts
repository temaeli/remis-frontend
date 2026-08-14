import { BehaviorSubject } from 'rxjs';
import {
  VALIDATOR_REQUIRED,
  VALIDATOR_EMAIL,
  VALIDATOR_TANZINIA_PHONE,
} from '@shared/components/generic-form/form-constants';
import {
  FieldConfig,
  FieldType,
  FormStepper,
} from '@shared/components/generic-form/field.interface';
import { CustomerCategory, Ward, District, SubWard, Region } from './self-registration.interfaces';

/**
 * Build the multi-step self-registration form fields
 */
export function getSelfRegistrationFormSteps(
  categories: CustomerCategory[] = [],
  regions: Region[] = [],
  getDistrictsByRegion: (regionUid: string) => Promise<District[]> = async () => [],
  getWardsByDistrict: (districtUid: string) => Promise<Ward[]> = async () => [],
  getSubWardsByWard: (wardUid: string) => Promise<SubWard[]> = async () => [],
): FormStepper[] {
  const regionUid$ = new BehaviorSubject<string | null>(null);
  const districtUid$ = new BehaviorSubject<string | null>(null);
  const wardUid$ = new BehaviorSubject<string | null>(null);
  const clientStreamType$ = new BehaviorSubject<string>('DOWN');
  const selectedCategories$ = new BehaviorSubject<string[]>([]);

  const steps: FormStepper[] = [
    {
      name: 'Account Details',
      fields: [
        {
          key: 'email',
          label: 'Email Address',
          type: FieldType.input,
          placeholder: 'customer@example.com',
          validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: FieldType.input,
          placeholder: '07XXXXXXXX',
          validations: [VALIDATOR_REQUIRED, VALIDATOR_TANZINIA_PHONE],
          hint: 'Tanzania format: 07XXXXXXXX',
        },
      ],
    },
    {
      name: 'Personal Information',
      fields: [
        {
          key: 'firstName',
          label: 'First Name / Entity Name',
          type: FieldType.input,
          validations: [VALIDATOR_REQUIRED],
          hint: 'Full name or registered entity name',
        },
        {
          key: 'lastName',
          label: 'Last Name',
          type: FieldType.input,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'clientStreamType',
          label: 'Client Type',
          type: FieldType.select,
          options: [
            { value: 'DOWN', label: 'Downstream' },
            // UP is internal-only and not available to public
          ],
          validations: [VALIDATOR_REQUIRED],
          value: 'DOWN',
          onChange: (value: any) => {
            clientStreamType$.next(value);
          },
        },
        {
          key: 'categoryUids',
          label: 'Customer Category',
          type: FieldType.multiple_select,
          options: categories.map((c) => ({ value: c.uid, label: c.name })),
          validations: [VALIDATOR_REQUIRED],
          hint: 'Select at least one category (CNG, Household, Institution, Industry, Power Plant)',
          onChange: (value: any) => {
            selectedCategories$.next(value);
          },
        },
        {
          key: 'tin',
          label: 'TIN (Tax Identification Number)',
          type: FieldType.input,
          placeholder: 'e.g., 123456789',
          validations: [], // Conditional: required for CNG, Institution, Industry, Power Plant
          hint: 'Required for commercial categories',
        },
        {
          key: 'identificationType',
          label: 'Identification Type',
          type: FieldType.select,
          options: [
            { value: 'NATIONAL_ID', label: 'National ID' },
            { value: 'PASSPORT', label: 'Passport' },
            { value: 'DRIVING_LICENSE', label: 'Driving License' },
          ],
          validations: [],
        },
        {
          key: 'idNumber',
          label: 'ID Number',
          type: FieldType.input,
          placeholder: 'e.g., 19900101-00001-00001-01',
          validations: [],
        },
      ],
    },
    {
      name: 'Service Location',
      fields: [
        {
          key: 'regionUid',
          label: 'Region',
          type: FieldType.select,
          options: regions.map((r: Region) => ({ value: r.uid, label: r.name })),
          validations: [VALIDATOR_REQUIRED],
          onChange: async (value: any) => {
            regionUid$.next(value);
            // Load districts for selected region
            const districts = await getDistrictsByRegion(value);
            const districtSelect = steps[2].fields?.find(
              (f: FieldConfig) => f.key === 'districtUid',
            );
            if (districtSelect) {
              districtSelect.options = districts.map((d: District) => ({
                value: d.uid,
                label: d.name,
              }));
            }
            // Reset dependent cascades
            districtUid$.next(null);
            wardUid$.next(null);
            selectedCategories$.next([]);
          },
        },
        {
          key: 'districtUid',
          label: 'District',
          type: FieldType.select,
          options: [],
          validations: [VALIDATOR_REQUIRED],
          showWhen: [{ key: 'regionUid', checker: (v: any) => !!v }],
          onChange: async (value: any) => {
            districtUid$.next(value);
            // Load wards for selected district
            const wards = await getWardsByDistrict(value);
            const wardSelect = steps[2].fields?.find((f: FieldConfig) => f.key === 'wardUid');
            if (wardSelect) {
              wardSelect.options = wards.map((w: Ward) => ({ value: w.uid, label: w.name }));
            }
            // Reset dependent cascades
            wardUid$.next(null);
            selectedCategories$.next([]);
          },
        },
        {
          key: 'wardUid',
          label: 'Ward',
          type: FieldType.select,
          options: [],
          validations: [VALIDATOR_REQUIRED],
          showWhen: [{ key: 'districtUid', checker: (v: any) => !!v }],
          onChange: async (value: any) => {
            wardUid$.next(value);
            // Load sub-wards for selected ward
            const subWards = await getSubWardsByWard(value);
            const subWardSelect = steps[2].fields?.find((f: FieldConfig) => f.key === 'subWardUid');
            if (subWardSelect) {
              subWardSelect.options = subWards.map((sw: SubWard) => ({
                value: sw.uid,
                label: sw.name,
              }));
            }
            selectedCategories$.next([]);
          },
        },
        {
          key: 'subWardUid',
          label: 'Sub-Ward / Street / Village',
          type: FieldType.select,
          options: [],
          validations: [VALIDATOR_REQUIRED],
          showWhen: [{ key: 'wardUid', checker: (v: any) => !!v }],
        },
        {
          key: 'blockNumber',
          label: 'Block Number / House Number',
          type: FieldType.input,
          placeholder: 'e.g., 12',
          validations: [],
        },
        {
          key: 'postalAddress',
          label: 'Postal Address',
          type: FieldType.textarea,
          placeholder: 'e.g., P.O. Box 1234, Dar es Salaam',
          validations: [],
        },
      ],
    },
    {
      name: 'Verification & Consent',
      fields: [
        {
          key: 'consent',
          label: 'I agree to the terms and conditions',
          type: FieldType.checkbox,
          validations: [VALIDATOR_REQUIRED],
          hint: 'You must accept the consent terms to register',
        },
      ],
    },
  ];

  return steps;
}

/**
 * Password setup form fields (Step 4)
 */
export const PASSWORD_SETUP_FIELDS: FieldConfig[] = [
  {
    key: 'password',
    label: 'Password',
    type: FieldType.input,
    inputType: 'password',
    placeholder: 'Enter your password',
    validations: [VALIDATOR_REQUIRED],
    hint: 'Minimum 8 characters with uppercase, lowercase, number and special character',
  },
  {
    key: 'confirmPassword',
    label: 'Confirm Password',
    type: FieldType.input,
    inputType: 'password',
    placeholder: 'Confirm your password',
    validations: [VALIDATOR_REQUIRED],
  },
];

/**
 * OTP Verification form fields (Step 2)
 */
export const OTP_VERIFICATION_FIELDS: FieldConfig[] = [
  {
    key: 'code',
    label: '6-Digit Code',
    type: FieldType.input,
    inputType: 'text',
    placeholder: '000000',
    validations: [VALIDATOR_REQUIRED],
    hint: 'Enter the code sent to your email and phone',
  },
];
