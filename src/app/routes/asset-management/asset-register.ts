import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters, ShowWhen } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  FieldConfig,
  FieldType,
  FormStepper,
  Option,
} from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { descriptionField, lookupChildGqlFields, LookupModule, nameField } from '@shared/lookup';
import {
  coordinateFields,
  landRegistrationToModel,
  locationCascadeFields,
  ownerFields,
  parcelFields,
  tenureFields,
} from './land-registration';

/**
 * Register Asset: one stepped form that saves the asset, its land registration
 * when it is land, and how it was acquired, in one go through `registerAsset`.
 *
 *   Asset → Location → Parcel → Tenure → Owners → Acquisition
 *
 * The four land steps appear only once a subcategory under a land type is
 * picked, so anything else goes straight from Asset to Acquisition.
 *
 * A hidden step's fields would still be required, so each land field is also
 * given a show-condition on `forLand`. The form clears a hidden field's
 * validators, which is what lets a non-land asset be submitted. `forLand` is a
 * hidden control the subcategory picker sets.
 *
 * The land registration and the acquisition take their name and description
 * from the asset, so they are typed once.
 */

/** Every subcategory with its category and type, so the picker can show the path. */
const REGISTER_ASSET_SUBCATEGORIES = gql`
  query registerAssetSubcategories {
    allAssetSubcategories {
      id
      name
      assetCategory {
        id
        name
        assetType {
          id
          name
          forLand
        }
      }
    }
  }
`;

export const REGISTER_ASSET = gql`
  mutation registerAsset($input: AssetRegistrationDtoInput) {
    registerAsset(input: $input) {
      ${responseGqlFields(lookupChildGqlFields)}
    }
  }
`;

interface SubcategoryRow {
  id: string;
  name: string;
  assetCategory?: { name?: string; assetType?: { name?: string; forLand?: boolean } };
}

const ASSET_KEYS = ['assetSubcategoryUid', 'name', 'description', 'forDevelopment', 'forSelling'];

/**
 * What the asset is meant for — the two flags the assets table requires. Here
 * rather than in asset-lookups, which imports this file, so both forms share it.
 */
export function intendedUseFields(): FieldConfig[] {
  return [
    {
      key: 'forDevelopment',
      label: 'Intended for development',
      type: FieldType.toggle,
      class: 'col-span-full md:col-span-1',
    },
    {
      key: 'forSelling',
      label: 'Intended for sale',
      type: FieldType.toggle,
      class: 'col-span-full md:col-span-1',
    },
  ];
}
const ACQUISITION_KEYS = [
  'acquisitionName',
  'acquisitionDescription',
  'acquisitionValue',
  'acquisitionDate',
];

/** The land registration's own name and description, typed on the Location step. */
const LAND_NAME_KEYS = ['landName', 'landDescription'];

/** Shown only for land. Steps read the control's value; fields use the checker. */
const LAND_STEP: ShowWhen[] = [{ key: 'forLand', value: true }];
const IS_LAND: ShowWhen = {
  key: 'forLand',
  checker: (v: unknown) => v === true,
  combination: 'and',
};

/** The field, hidden unless the asset is land — and unless its own condition holds too. */
const landOnly = (field: FieldConfig): FieldConfig => ({
  ...field,
  showWhen: [
    IS_LAND,
    ...(field.showWhen ?? []).map((when) => ({ ...when, combination: 'and' as const })),
  ],
});

const acquisitionFields = (): FieldConfig[] => [
  {
    key: 'acquisitionName',
    label: 'Acquisition Name',
    hint: 'Needed when an acquisition value and date are given',
    type: FieldType.input,
    class: 'col-span-full',
  },
  {
    key: 'acquisitionDescription',
    label: 'Acquisition Description',
    hint: 'Needed when an acquisition value and date are given',
    type: FieldType.textarea,
    rows: 2,
    class: 'col-span-full',
  },
  {
    key: 'acquisitionValue',
    label: 'Acquisition Value',
    hint: 'Optional — leave both blank if not known yet',
    type: FieldType.decimal,
    class: 'col-span-full md:col-span-1',
  },
  {
    key: 'acquisitionDate',
    label: 'Acquisition Date',
    type: FieldType.dateTime,
    class: 'col-span-full md:col-span-1',
  },
];

export function registerAssetBtn(comp: BaseComponent, lookup: LookupModule): ActionButton {
  return {
    icon: 'add',
    label: 'Register Asset',
    class: 'btn-add-primary',
    click: () => openRegisterForm(comp, lookup),
    permissions: ['ROLE_CREATE_ASSET'],
  };
}

async function openRegisterForm(comp: BaseComponent, lookup: LookupModule): Promise<void> {
  const rows: SubcategoryRow[] =
    (await comp.fs.fetch({ query: REGISTER_ASSET_SUBCATEGORIES, loadingOn: 'content' })) ?? [];

  const landIds = new Set(rows.filter((r) => r.assetCategory?.assetType?.forLand).map((r) => r.id));
  // "Land › Residential › Plot", sorted so each type's entries sit together.
  const options: Option[] = rows
    .map((r) => ({
      value: r.id,
      label: [r.assetCategory?.assetType?.name, r.assetCategory?.name, r.name]
        .filter(Boolean)
        .join(' › '),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Clears the location cascade, which outlives any one form.
  const landModel = landRegistrationToModel(undefined);
  const close$ = new Subject<void>();

  const steps: FormStepper[] = [
    { name: 'Asset', icon: 'home_work', keys: [...ASSET_KEYS, 'forLand'] },
    {
      name: 'Location',
      icon: 'location_on',
      keys: [
        ...LAND_NAME_KEYS,
        'regionUid',
        'districtUid',
        'councilUid',
        'wardUid',
        'streetUid',
        'latitude',
        'longitude',
      ],
      showWhen: LAND_STEP,
    },
    {
      name: 'Parcel',
      icon: 'straighten',
      keys: [
        'parcelNumber',
        'titleNumber',
        'plotNumber',
        'blockNumber',
        'surveyPlanNumber',
        'grossArea',
        'netArea',
      ],
      showWhen: LAND_STEP,
    },
    {
      name: 'Tenure',
      icon: 'gavel',
      keys: ['tenureType', 'permittedUse', 'leaseStartDate', 'leaseEndDate', 'leaseTermYears'],
      showWhen: LAND_STEP,
    },
    {
      name: 'Owners',
      icon: 'users',
      keys: ['owners'],
      optional: true,
      showWhen: LAND_STEP,
    },
    {
      name: 'Acquisition',
      icon: 'shopping_cart',
      keys: ACQUISITION_KEYS,
      optional: true,
      submitLabel: 'Register Asset',
    },
  ];

  const formParameter: FormParameters = {
    title: 'Register Asset',
    model: { owners: landModel['owners'] },
    closeAction$: close$,
    fields: [
      {
        key: 'assetSubcategoryUid',
        label: 'What are you registering?',
        hint: 'Type to search. Land adds location, parcel, tenure and owner steps.',
        type: FieldType.select,
        options,
        searchKeys: ['label'],
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
        onChange: (value: unknown, form?: any) =>
          form?.get('forLand')?.setValue(landIds.has(value as string)),
      },
      {
        key: 'name',
        label: 'Name',
        type: FieldType.input,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
      {
        key: 'description',
        label: 'Description',
        type: FieldType.textarea,
        rows: 3,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
      ...intendedUseFields(),
      // Set by the picker above; drives which steps show. Never sent.
      { key: 'forLand', type: FieldType.toggle, visible: false, ignoreOnSubmit: true },
      landOnly(nameField('landName', 'Land Registration Name')),
      landOnly(descriptionField('landDescription', 'Land Registration Description')),
      ...locationCascadeFields().map(landOnly),
      ...coordinateFields().map(landOnly),
      ...parcelFields().map(landOnly),
      ...tenureFields().map(landOnly),
      landOnly(ownerFields()),
      ...acquisitionFields(),
    ],
    formSteppers: steps,
    stepperAppearance: 'fill',
    onSubmit: async (value: Record<string, unknown>) => {
      const isLand = landIds.has(value['assetSubcategoryUid'] as string);
      const input: Record<string, unknown> = {
        ...pick(value, ASSET_KEYS),
        ...pick(value, ACQUISITION_KEYS),
      };
      if (isLand) {
        // Whatever is left after the asset and acquisition keys is the parcel,
        // named and described by its own two fields.
        const land = { ...value };
        [...ASSET_KEYS, ...ACQUISITION_KEYS, ...LAND_NAME_KEYS].forEach((key) => delete land[key]);
        land['name'] = value['landName'];
        land['description'] = value['landDescription'];
        input['land'] = land;
      }
      await register(comp, lookup, input, close$);
    },
  };

  comp.vs?.openModal(FormComponent, formParameter, '90%', '90vh', { maxWidth: '1200px' });
}

/** Saves everything, then opens the new asset's page. */
async function register(
  comp: BaseComponent,
  lookup: LookupModule,
  input: Record<string, unknown>,
  close$: Subject<void>,
): Promise<void> {
  await comp.fs.fetch({
    notify: true,
    mutation: REGISTER_ASSET,
    variables: { input },
    successFn: (res) => {
      lookup.changed$.next(res?.data);
      close$.next();
      if (res?.data?.id) navigateRelativeTo(comp, lookup.slug, res.data.id);
    },
  });
}

/** The given keys of `value` that hold something — blanks are left out. */
function pick(value: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(
    keys
      .filter((key) => value[key] !== undefined && value[key] !== null && value[key] !== '')
      .map((key) => [key, value[key]]),
  );
}
