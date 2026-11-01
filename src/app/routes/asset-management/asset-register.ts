import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
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
import { lookupChildGqlFields, LookupModule } from '@shared/lookup';
import {
  coordinateFields,
  landRegistrationToModel,
  locationCascadeFields,
  ownerFields,
  parcelFields,
  tenureFields,
} from './land-registration';

/**
 * Register Asset: an asset, its land registration when it is land, and how it
 * was acquired, saved in one go by `registerAsset`.
 *
 * Two dialogs rather than one form with a land-only step. The first asks what
 * is being registered, its name and description. A non-land asset is saved
 * right there, with its acquisition if one is given. A land asset goes on to the
 * second, which is the land registration's own steps plus the acquisition.
 *
 * One form could not do it: a hidden step's required fields still hold the form
 * invalid, so a non-land asset could never be submitted.
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

const ACQUISITION_KEYS = ['acquisitionValue', 'acquisitionDate'];

const acquisitionFields = (): FieldConfig[] => [
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
    click: () => openClassifyStep(comp, lookup),
    permissions: ['ROLE_CREATE_ASSET'],
  };
}

/** First dialog: what it is, what it is called, and — when not land — how it was acquired. */
async function openClassifyStep(comp: BaseComponent, lookup: LookupModule): Promise<void> {
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

  const isOther = (v: unknown) => !!v && !landIds.has(v as string);
  const close$ = new Subject<void>();

  const formParameter: FormParameters = {
    title: 'Register Asset',
    model: {},
    closeAction$: close$,
    fields: [
      {
        key: 'assetSubcategoryUid',
        label: 'What are you registering?',
        hint: 'Type to search. Land continues to the parcel details.',
        type: FieldType.select,
        options,
        searchKeys: ['label'],
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
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
      // For land these are asked on the last land step instead.
      ...acquisitionFields().map((f) => ({
        ...f,
        showWhen: [{ key: 'assetSubcategoryUid', checker: isOther }],
      })),
    ],
    onSubmit: async (value: Record<string, unknown>) => {
      const asset = {
        name: value['name'],
        description: value['description'],
        assetSubcategoryUid: value['assetSubcategoryUid'],
      };

      if (landIds.has(value['assetSubcategoryUid'] as string)) {
        close$.next();
        openLandSteps(comp, lookup, asset);
        return;
      }

      await register(comp, lookup, { ...asset, ...pick(value, ACQUISITION_KEYS) }, close$);
    },
  };

  comp.vs?.openModal(FormComponent, formParameter, '40%');
}

/** Second dialog, land only: where it is, the parcel, the tenure, its owners and its acquisition. */
function openLandSteps(
  comp: BaseComponent,
  lookup: LookupModule,
  asset: Record<string, unknown>,
): void {
  // Clears the location cascade, which outlives any one form.
  const model = landRegistrationToModel(undefined);
  const close$ = new Subject<void>();

  const steps: FormStepper[] = [
    {
      name: 'Location',
      icon: 'location_on',
      keys: [
        'regionUid',
        'districtUid',
        'councilUid',
        'wardUid',
        'streetUid',
        'latitude',
        'longitude',
      ],
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
    },
    {
      name: 'Tenure',
      icon: 'gavel',
      keys: ['tenureType', 'permittedUse', 'leaseStartDate', 'leaseEndDate', 'leaseTermYears'],
    },
    {
      name: 'Owners',
      icon: 'users',
      keys: ['owners'],
      optional: true,
      submitLabel: 'Register Asset',
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
    title: `Register Asset — ${asset['name'] ?? ''}`,
    model: { owners: model['owners'] },
    closeAction$: close$,
    fields: [
      ...locationCascadeFields(),
      ...coordinateFields(),
      ...parcelFields(),
      ...tenureFields(),
      ownerFields(),
      ...acquisitionFields(),
    ],
    formSteppers: steps,
    stepperAppearance: 'fill',
    onSubmit: async (value: Record<string, unknown>) => {
      const acquisition = pick(value, ACQUISITION_KEYS);
      const land = { ...value };
      ACQUISITION_KEYS.forEach((key) => delete land[key]);

      await register(comp, lookup, { ...asset, ...acquisition, land }, close$);
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
