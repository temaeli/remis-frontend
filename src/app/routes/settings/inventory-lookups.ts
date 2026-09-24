import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  defineLookup,
  EntityLinkConfig,
  EntityLinkField,
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

/** What an inventory item is linked to. Each link shows on the other record's page too. */
const ALL_ENTRIES = gql`
  query allEntries {
    allEntries {
      id
      name
    }
  }
`;

const ALL_EXITS = gql`
  query allExits {
    allExits {
      id
      name
    }
  }
`;

/**
 * The people and organisation registers. They have no lookup screen here — they
 * are party records, not inventory configuration — but a move-in link names
 * both, so its form has to offer them.
 */
const ALL_PEOPLE = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

/** The person who handed the items over, or took them back. */
const personField = (label: string): EntityLinkField => ({
  arg: 'personUid',
  rowField: 'person',
  rowGqlFields: 'id\nname',
  column: { field: 'person', header: label, valueFn: (row: any) => row?.person?.name },
  field: {
    label,
    type: FieldType.select,
    optionsVariables: {
      labelKey: 'name',
      valueKey: 'id',
      fetchParameter: { query: ALL_PEOPLE },
    },
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
});

/** How many were moved, on either leg. Both CHECK it is above zero. */
const quantityField: EntityLinkField = {
  arg: 'quantity',
  rowField: 'quantity',
  column: 'quantity as Quantity',
  field: {
    label: 'Quantity',
    hint: 'Greater than zero, up to six decimal places',
    type: FieldType.decimal,
    decimals: 6,
    min: 0,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
};

/** What the move was recorded under. */
const referenceField = (hint: string): EntityLinkField => ({
  arg: 'referenceNumber',
  rowField: 'referenceNumber',
  column: 'referenceNumber as Reference',
  field: {
    label: 'Reference Number',
    hint,
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
});

const ALL_BUSINESS_NAMES = gql`
  query allBusinessNames {
    allBusinessNames {
      id
      name
    }
  }
`;

/**
 * What a move-in link carries beyond the two sides. All five are NOT NULL in
 * `inventories_entries`, so the form asks for all five; the reference columns
 * are `character varying(100)` and the quantity CHECKs above zero, both of
 * which the backend enforces.
 */
export const MOVE_IN_FIELDS: EntityLinkField[] = [
  personField('Received By'),
  {
    arg: 'businessNameUid',
    rowField: 'businessName',
    rowGqlFields: 'id\nname',
    column: 'businessName.name as Organisation',
    field: {
      label: 'Organisation',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: ALL_BUSINESS_NAMES },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  },
  referenceField('What the hand-over was recorded under, up to 100 characters'),
  {
    arg: 'agreementReferenceNumber',
    rowField: 'agreementReferenceNumber',
    column: 'agreementReferenceNumber as Agreement Reference',
    field: {
      label: 'Agreement Reference Number',
      hint: "The agreement it was made under, by that agreement's own reference",
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  },
  quantityField,
];

/**
 * What a move-out link carries. The DBA gave `inventories_exits` the same
 * shape, less the organisation: who handed the items back, under what
 * reference, and how many.
 */
export const MOVE_OUT_FIELDS: EntityLinkField[] = [
  personField('Handed Back By'),
  referenceField('What the hand-back was recorded under, up to 100 characters'),
  quantityField,
];

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
  // Move-ins and move-outs: the items a tenant received, and handed back.
  // The move-in also records who received them and under what paperwork.
  {
    entity: 'InventoryEntry',
    byOwnerQuery: 'inventoryEntriesByInventory',
    ownerArg: 'inventoryUid',
    targetArg: 'entryUid',
    field: 'entry',
    label: 'Move-in',
    pluralLabel: 'Move-ins',
    icon: 'login',
    permission: 'INVENTORY_ENTRY',
    optionsQuery: ALL_ENTRIES,
    extraFields: MOVE_IN_FIELDS,
  },
  {
    entity: 'InventoryExit',
    byOwnerQuery: 'inventoryExitsByInventory',
    ownerArg: 'inventoryUid',
    targetArg: 'exitUid',
    field: 'exit',
    label: 'Move-out',
    pluralLabel: 'Move-outs',
    icon: 'logout',
    permission: 'INVENTORY_EXIT',
    optionsQuery: ALL_EXITS,
    extraFields: MOVE_OUT_FIELDS,
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
