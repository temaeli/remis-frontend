import { gql } from '@apollo/client/core';

import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, lookupRefGqlFields, LookupModule } from '@shared/lookup';

import { SUBCATEGORY } from './settings-lookups';

/**
 * Customers: the people the business sells or lets to.
 *
 * Not name-and-description shaped — the table carries a code and two addresses,
 * and the person is the name — so the descriptive block is replaced. Each person
 * can be a customer once, and each postal and physical address is unique across
 * all customers.
 */

const ALL_BIO_DATA = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

export const CUSTOMER = defineLookup({
  slug: 'customers',
  entity: 'Customer',
  entityPlural: 'Customers',
  permission: 'CUSTOMER',
  label: 'Customer',
  pluralLabel: 'Customers',
  subtitle: 'People the business sells or lets to, and where to reach them',
  icon: 'user',
  nameKey: 'assignedNumber',
  descriptiveGqlFields: `
  assignedNumber
  postalAddress
  physicalAddress
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'bioDataUid',
      label: 'Person',
      hint: 'Someone already on the register. A person can be a customer once',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: ALL_BIO_DATA },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'assignedNumber',
      label: 'Customer Code',
      hint: 'Generated when left blank',
      type: FieldType.input,
    },
    {
      key: 'postalAddress',
      label: 'Postal Address',
      hint: 'Such as P.O. Box 123, Dodoma. No two customers can share one',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'physicalAddress',
      label: 'Physical Address',
      type: FieldType.textarea,
      rows: 2,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  baseColumns: [
    'index',
    { field: 'assignedNumber', header: 'Code' },
    { field: 'bioData', header: 'Person', valueFn: (row) => row?.bioData?.name },
    { field: 'postalAddress', header: 'Postal Address' },
    { field: 'physicalAddress', header: 'Physical Address' },
  ],
  extraGqlFields: `
  bioData { id name }
  subcategory { ${lookupRefGqlFields} }
`,
  extraFields: [
    {
      key: 'subcategoryUid',
      label: 'Subcategory',
      type: FieldType.select,
      optionsVariables: {
        labelKey: 'name',
        valueKey: 'id',
        fetchParameter: { query: SUBCATEGORY.gql.all },
      },
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
  ],
  extraColumns: [
    { field: 'subcategory', header: 'Subcategory', valueFn: (row) => row?.subcategory?.name },
  ],
  toModel: (data) => ({ bioDataUid: data?.bioData?.id, subcategoryUid: data?.subcategory?.id }),
});

export const CUSTOMER_LOOKUPS: LookupModule[] = [CUSTOMER];
