import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  defineLookup,
  EntityLinkConfig,
  entityLinkPanels,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';

import { CURRENCY, SUBCATEGORY } from '@routes/settings/settings-lookups';

/**
 * Charges: an amount, in a currency, falling due on a date, applied to units.
 *
 * The database refuses a charge dated in the past on every write — deleting is a
 * write too — so once its date has passed a charge can be neither changed nor
 * deleted.
 */

const ALL_UNITS = gql`
  query allUnits {
    allUnits {
      id
      name
    }
  }
`;

const refSelect = (key: string, label: string, lookup: LookupModule): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: lookup.gql.all },
  },
  validations: [VALIDATOR_REQUIRED],
});

const CHARGE_LINKS: EntityLinkConfig[] = [
  {
    entity: 'UnitCharge',
    byOwnerQuery: 'unitChargesByCharge',
    ownerArg: 'chargeUid',
    targetArg: 'unitUid',
    field: 'unit',
    label: 'Unit',
    pluralLabel: 'Units',
    icon: 'domain',
    permission: 'UNIT_CHARGE',
    optionsQuery: ALL_UNITS,
  },
];

export const CHARGE = defineLookup({
  slug: 'charges',
  entity: 'Charge',
  entityPlural: 'Charges',
  permission: 'CHARGE',
  label: 'Charge',
  pluralLabel: 'Charges',
  subtitle: 'Amounts due on a date, and the units they apply to',
  icon: 'bill',
  extraGqlFields: `
  chargesDate
  amount
  subcategory { ${lookupRefGqlFields} }
  currency { ${lookupRefGqlFields} }
`,
  extraFields: [
    {
      key: 'chargesDate',
      label: 'Charge Date',
      hint: 'When it falls due. Now or later; a past charge cannot be changed',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    // numeric(50,4), and the table checks it is above zero.
    {
      key: 'amount',
      label: 'Amount',
      hint: 'Greater than zero, up to 4 decimal places',
      type: FieldType.decimal,
      decimals: 4,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('currencyUid', 'Currency', CURRENCY),
    refSelect('subcategoryUid', 'Subcategory', SUBCATEGORY),
  ],
  extraColumns: [
    { field: 'chargesDate', header: 'Date' },
    'amount',
    'currency.name as Currency',
    'subcategory.name as Subcategory',
  ],
  toModel: (data) => ({
    currencyUid: data?.currency?.id,
    subcategoryUid: data?.subcategory?.id,
  }),
  extraContents: (comp, record) => entityLinkPanels(comp, CHARGE_LINKS, record?.id),
});

export const CHARGE_LOOKUPS: LookupModule[] = [CHARGE];
