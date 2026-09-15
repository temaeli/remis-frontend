import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  defineLookup,
  EntityLinkConfig,
  entityLinkPanels,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';

import { SUBCATEGORY } from './settings-lookups';

/**
 * Inventory: stock items (`inventories`), the units they are counted in
 * (`unit_of_measures`), and which assets hold them (`inventories_assets`).
 *
 * Both tables carry a subcategory. The unit select lists every unit rather than
 * only the chosen subcategory's: the form has no select that follows another.
 */

/** Declared here rather than imported from the asset registry, which imports this file's links. */
const ALL_ASSETS = gql`
  query allAssets {
    allAssets {
      id
      name
    }
  }
`;

const refSelect = (key: string, label: string, lookup: () => LookupModule): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: lookup().gql.all },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

export const UNIT_OF_MEASURE = defineLookup({
  slug: 'unit-of-measures',
  entity: 'UnitOfMeasure',
  entityPlural: 'UnitOfMeasures',
  permission: 'UNIT_OF_MEASURE',
  label: 'Unit of Measure',
  pluralLabel: 'Units of Measure',
  subtitle: 'What stock is counted in: pieces, kilograms, litres',
  icon: 'straighten',
  extraGqlFields: `
  subcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [refSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY)],
  extraColumns: [{ field: 'subcategory', valueFn: (row) => row?.subcategory?.name }],
  toModel: (data) => ({ subcategoryUid: data?.subcategory?.id }),
  extraContents: (comp, record) => [
    lookupChildPanel(comp, () => INVENTORY, INVENTORIES_BY_UNIT_OF_MEASURE, {
      unitOfMeasureUid: record?.id,
    }),
  ],
});

/** Which assets an inventory is held for. The same link shows on the asset's page. */
const INVENTORY_LINKS: EntityLinkConfig[] = [
  {
    entity: 'InventoryAsset',
    byOwnerQuery: 'inventoryAssetsByInventory',
    ownerArg: 'inventoryUid',
    targetArg: 'assetUid',
    field: 'asset',
    label: 'Asset',
    pluralLabel: 'Assets',
    icon: 'shop',
    permission: 'INVENTORY_ASSET',
    optionsQuery: ALL_ASSETS,
  },
];

export const INVENTORY = defineLookup({
  slug: 'inventories',
  entity: 'Inventory',
  entityPlural: 'Inventories',
  permission: 'INVENTORY',
  label: 'Inventory',
  pluralLabel: 'Inventories',
  subtitle: 'Stock items, how much of each there is, and in what unit',
  icon: 'store',
  extraGqlFields: `
  quantities
  subcategory {
    ${lookupRefGqlFields}
  }
  unitOfMeasure {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    refSelect('subcategoryUid', 'Subcategory', () => SUBCATEGORY),
    {
      key: 'quantities',
      label: 'Quantity',
      hint: '0 or more, up to 4 decimal places',
      type: FieldType.decimal,
      decimals: 4,
      validations: [VALIDATOR_REQUIRED],
    },
    refSelect('unitOfMeasureUid', 'Unit of Measure', () => UNIT_OF_MEASURE),
  ],
  extraColumns: [
    { field: 'subcategory', valueFn: (row) => row?.subcategory?.name },
    { field: 'quantities', header: 'Quantity' },
    { field: 'unitOfMeasure', header: 'Unit', valueFn: (row) => row?.unitOfMeasure?.name },
  ],
  toModel: (data) => ({
    subcategoryUid: data?.subcategory?.id,
    unitOfMeasureUid: data?.unitOfMeasure?.id,
  }),
  extraContents: (comp, record) => entityLinkPanels(comp, INVENTORY_LINKS, record?.id),
});

export const INVENTORIES_BY_UNIT_OF_MEASURE = gql`
  query inventoriesByUnitOfMeasure($unitOfMeasureUid: String) {
    inventoriesByUnitOfMeasure(unitOfMeasureUid: $unitOfMeasureUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const INVENTORY_LOOKUPS: LookupModule[] = [UNIT_OF_MEASURE, INVENTORY];
