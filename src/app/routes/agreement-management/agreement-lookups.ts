import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { defineLookup, entityLinkPanels, lookupRefGqlFields, LookupModule } from '@shared/lookup';
// Safe in this direction only: the settings registry imports nothing back from
// here, so there is no cycle.
import { SECTION } from '@routes/settings/agreement-setting-lookups';
import { partyColumn, partyField } from '@routes/settings/party-links';
import { recordLinkPanels } from '@routes/unit-management/unit-links';

/**
 * The agreement register — `modules.agreement` on the backend.
 *
 * Kept apart from the agreement settings, which hold the reusable text an
 * agreement is written from: these are the agreements themselves and the
 * category/subcategory pair that classifies them, the same split the project and
 * asset modules already use.
 *
 * Every one is a `CoreNamedEntity` on the same five-operation API, so they are
 * declared here as configs and rendered by the shared lookup screens.
 */

/** A select over another table, all of which key on `id`. */
const parentSelect = (key: string, label: string, query: unknown): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: { labelKey: 'name', valueKey: 'id', fetchParameter: { query } },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/**
 * The people and organisation registers, which have no lookup screen here — they
 * are party records, not agreement configuration — but are what an agreement's
 * counterparty links point at.
 */
const ALL_PEOPLE = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

const ALL_BUSINESS_NAMES = gql`
  query allBusinessNames {
    allBusinessNames {
      id
      name
    }
  }
`;

//  The taxonomy that classifies the register.

export const AGREEMENT_CATEGORY = defineLookup({
  slug: 'agreement-categories',
  entity: 'AgreementCategory',
  entityPlural: 'AgreementCategories',
  permission: 'AGREEMENT_CATEGORY',
  label: 'Agreement Category',
  pluralLabel: 'Agreement Categories',
  subtitle: 'The broadest classification of an agreement',
  icon: 'folder',
});

export const AGREEMENT_SUBCATEGORY = defineLookup({
  slug: 'agreement-subcategories',
  entity: 'AgreementSubcategory',
  entityPlural: 'AgreementSubcategories',
  permission: 'AGREEMENT_SUBCATEGORY',
  label: 'Agreement Subcategory',
  pluralLabel: 'Agreement Subcategories',
  subtitle: 'The second level of the agreement classification',
  icon: 'folder_open',
  extraGqlFields: `
  agreementCategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('agreementCategoryUid', 'Category', AGREEMENT_CATEGORY.gql.all)],
  extraColumns: ['agreementCategory.name as Category'],
  toModel: (data) => ({ agreementCategoryUid: data?.agreementCategory?.id }),
});

//  The register itself.

/**
 * An agreement, classified by its subcategory and running between two dates.
 *
 * Who it is with lives in two join tables rather than on the record, so they are
 * panels: an agreement may be with people, with organisations, with both or with
 * neither — nothing in the schema requires a counterparty.
 */
export const AGREEMENT = defineLookup({
  slug: 'agreements',
  entity: 'Agreement',
  entityPlural: 'Agreements',
  permission: 'AGREEMENT',
  label: 'Agreement',
  pluralLabel: 'Agreements',
  subtitle: 'The agreements on the register, and who they are with',
  icon: 'contract',
  extraGqlFields: `
  agreementFrom
  agreementTo
  agreementSubcategory {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [
    parentSelect('agreementSubcategoryUid', 'Subcategory', AGREEMENT_SUBCATEGORY.gql.all),
    {
      key: 'agreementFrom',
      label: 'Start Date',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'agreementTo',
      // The backend rejects an end that does not fall after the start; the
      // database checks neither against the other.
      label: 'End Date',
      hint: 'Must fall after the start date',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
    },
  ],
  extraColumns: [
    'agreementSubcategory.name as Subcategory',
    { field: 'agreementFrom', header: 'From' },
    { field: 'agreementTo', header: 'To' },
  ],
  toModel: (data) => ({ agreementSubcategoryUid: data?.agreementSubcategory?.id }),
  extraContents: (comp, record) => [
    // The join read from this side — which units this agreement covers.
    ...recordLinkPanels(comp, 'Agreement', record?.id),
    ...entityLinkPanels(
      comp,
      [
        {
          entity: 'AgreementBioData',
          byOwnerQuery: 'agreementBioDataByAgreement',
          ownerArg: 'agreementUid',
          targetArg: 'bioDataUid',
          field: 'bioData',
          label: 'Person',
          pluralLabel: 'People',
          icon: 'user',
          permission: 'AGREEMENT_BIO_DATA',
          optionsQuery: ALL_PEOPLE,
          // bio_data is the party record, not a CoreNamedEntity — it carries no
          // assignedNumber, so the default selection would not resolve.
          targetGqlFields: `
  id
  name
`,
          columns: ['index', 'bioData.name as Name', partyColumn, 'actions'],
          // What the person is to the agreement (agreements_bio_data.parties).
          extraFields: [partyField()],
        },
        {
          entity: 'AgreementBusinessName',
          byOwnerQuery: 'agreementBusinessNamesByAgreement',
          ownerArg: 'agreementUid',
          targetArg: 'businessNameUid',
          field: 'businessName',
          label: 'Organisation',
          pluralLabel: 'Organisations',
          icon: 'institution',
          permission: 'AGREEMENT_BUSINESS_NAME',
          optionsQuery: ALL_BUSINESS_NAMES,
          columns: [
            'index',
            'businessName.assignedNumber as Assigned Number',
            'businessName.name as Name',
            partyColumn,
            'actions',
          ],
          // What the organisation is to the agreement.
          extraFields: [partyField()],
        },
        // agreements_sections — the join to the clause hierarchy. Not to be
        // confused with agreement_sections, the standalone catalogue that lives
        // under settings and joins to nothing; the backend calls this one
        // AgreementSectionLink for exactly that reason.
        {
          entity: 'AgreementSectionLink',
          byOwnerQuery: 'agreementSectionLinksByAgreement',
          ownerArg: 'agreementUid',
          targetArg: 'sectionUid',
          field: 'section',
          label: 'Section',
          pluralLabel: 'Sections',
          icon: 'folder',
          permission: 'AGREEMENT_SECTION_LINK',
          optionsQuery: SECTION.gql.all,
        },
      ],
      record?.id,
    ),
  ],
});

/** The operational screen, which leads the menu. */
export const AGREEMENT_LOOKUPS: LookupModule[] = [AGREEMENT];

/** The taxonomy that classifies it, grouped behind one menu and kept last. */
export const AGREEMENT_CONFIGURATION_LOOKUPS: LookupModule[] = [
  AGREEMENT_CATEGORY,
  AGREEMENT_SUBCATEGORY,
];
