import { gql } from '@apollo/client/core';

import {
  defineLookup,
  EntityLinkConfig,
  entityLinkPanels,
  lookupChildGqlFields,
  lookupChildPanel,
  lookupRefGqlFields,
  LookupModule,
} from '@shared/lookup';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

/**
 * The agreement text catalogues — `modules.setting.agreement` on the backend, and
 * so a settings group here, alongside general, reference, billing and project.
 *
 * Kept apart from the agreement register, which holds the agreements themselves
 * and the taxonomy that classifies them: these are the reusable text an agreement
 * is written from. Nothing joins them to an agreement yet — the hierarchy runs
 * section to clause to sub-clause to sub-subclause entirely on its own, and the
 * table that would attach it to an agreement has not been sent.
 *
 * Each level is joined to the next by its own two-column table with a link/unlink
 * pair rather than by a parent column, so a clause can sit under several sections
 * and be reused across agreements. That makes each of them a panel on the parent's
 * detail page rather than a select on its form.
 */

/**
 * A select over the level a wording belongs to.
 *
 * The wording tables key on a parent column rather than a join table — unlike
 * the levels themselves, which are joined to each other — so this is a field on
 * the form rather than a panel on the parent.
 */
const parentSelect = (key: string, label: string, query: unknown) => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query },
  },
  validations: [VALIDATOR_REQUIRED],
  class: 'col-span-full',
});

/**
 * A named section of agreement text. Distinct from {@link SECTION}, which heads
 * the clause hierarchy: this one stands alone and is joined to nothing.
 */
export const AGREEMENT_SECTION = defineLookup({
  slug: 'agreement-sections',
  entity: 'AgreementSection',
  entityPlural: 'AgreementSections',
  permission: 'AGREEMENT_SECTION',
  label: 'Agreement Section',
  pluralLabel: 'Agreement Sections',
  subtitle: 'Named sections of agreement text',
  icon: 'description',
});

/**
 * The two panels that place one record under another of its own kind --
 * `sections_sections`, `clauses_clauses`, `sub_clauses_sub_clauses`,
 * `sub_subclauses_sub_subclauses`. One table read from each end: the record on
 * screen is the parent in the first panel and the child in the second. This is
 * the order a printed agreement is laid out in.
 */
const ownKindLinks = (
  entity: string,
  label: string,
  pluralLabel: string,
  icon: string,
  permission: string,
  optionsQuery: unknown,
): EntityLinkConfig[] => {
  const camel = `${entity.charAt(0).toLowerCase()}${entity.slice(1)}`;
  return [
    {
      entity,
      byOwnerQuery: `${camel}sByParent`,
      ownerArg: 'parentUid',
      targetArg: 'childUid',
      field: 'child',
      label: `Child ${label}`,
      pluralLabel: `Child ${pluralLabel}`,
      icon,
      permission,
      optionsQuery,
    },
    {
      entity,
      byOwnerQuery: `${camel}sByChild`,
      ownerArg: 'childUid',
      targetArg: 'parentUid',
      field: 'parent',
      label: `Parent ${label}`,
      pluralLabel: `Parent ${pluralLabel}`,
      icon,
      permission,
      optionsQuery,
    },
  ];
};

export const SUB_SUBCLAUSE = defineLookup({
  slug: 'sub-subclauses',
  entity: 'SubSubclause',
  entityPlural: 'SubSubclauses',
  permission: 'SUB_SUBCLAUSE',
  label: 'Sub-subclause',
  pluralLabel: 'Sub-subclauses',
  subtitle: 'The deepest level of the clause hierarchy',
  icon: 'notes',
  extraContents: (comp, record) => [
    lookupChildPanel(
      comp,
      () => SUB_SUBCLAUSE_VALUE,
      SUB_SUBCLAUSE_VALUES_BY_SUB_SUBCLAUSE,
      { subSubclauseUid: record?.id },
      { presetModel: { subSubclauseUid: record?.id } },
    ),
    ...entityLinkPanels(
      comp,
      ownKindLinks(
        'SubSubclauseConnection',
        'Sub-subclause',
        'Sub-subclauses',
        'notes',
        'SUB_SUBCLAUSE_CONNECTION',
        SUB_SUBCLAUSE.gql.all,
      ),
      record?.id,
    ),
  ],
});

export const SUB_CLAUSE = defineLookup({
  slug: 'sub-clauses',
  entity: 'SubClause',
  entityPlural: 'SubClauses',
  permission: 'SUB_CLAUSE',
  label: 'Sub-clause',
  pluralLabel: 'Sub-clauses',
  subtitle: 'What a clause is broken into',
  icon: 'subject',
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      [
        {
          entity: 'SubClauseSubSubclause',
          byOwnerQuery: 'subClauseSubSubclausesBySubClause',
          ownerArg: 'subClauseUid',
          targetArg: 'subSubclauseUid',
          field: 'subSubclause',
          label: 'Sub-subclause',
          pluralLabel: 'Sub-subclauses',
          icon: 'notes',
          permission: 'SUB_CLAUSE_SUB_SUBCLAUSE',
          optionsQuery: SUB_SUBCLAUSE.gql.all,
        },
      ],
      record?.id,
    ).concat(
      lookupChildPanel(
        comp,
        () => SUB_CLAUSE_VALUE,
        SUB_CLAUSE_VALUES_BY_SUB_CLAUSE,
        { subClauseUid: record?.id },
        { presetModel: { subClauseUid: record?.id } },
      ),
      entityLinkPanels(
        comp,
        ownKindLinks(
          'SubClauseConnection',
          'Sub-clause',
          'Sub-clauses',
          'notes',
          'SUB_CLAUSE_CONNECTION',
          SUB_CLAUSE.gql.all,
        ),
        record?.id,
      ),
    ),
});

export const CLAUSE = defineLookup({
  slug: 'clauses',
  entity: 'Clause',
  entityPlural: 'Clauses',
  permission: 'CLAUSE',
  label: 'Clause',
  pluralLabel: 'Clauses',
  subtitle: 'What a section is broken into',
  icon: 'notes',
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      [
        {
          entity: 'ClauseSubClause',
          byOwnerQuery: 'clauseSubClausesByClause',
          ownerArg: 'clauseUid',
          targetArg: 'subClauseUid',
          field: 'subClause',
          label: 'Sub-clause',
          pluralLabel: 'Sub-clauses',
          icon: 'subject',
          permission: 'CLAUSE_SUB_CLAUSE',
          optionsQuery: SUB_CLAUSE.gql.all,
        },
      ],
      record?.id,
    ).concat(
      lookupChildPanel(
        comp,
        () => CLAUSE_VALUE,
        CLAUSE_VALUES_BY_CLAUSE,
        { clauseUid: record?.id },
        { presetModel: { clauseUid: record?.id } },
      ),
      entityLinkPanels(
        comp,
        ownKindLinks(
          'ClauseConnection',
          'Clause',
          'Clauses',
          'notes',
          'CLAUSE_CONNECTION',
          CLAUSE.gql.all,
        ),
        record?.id,
      ),
    ),
});

export const SECTION = defineLookup({
  slug: 'sections',
  entity: 'Section',
  entityPlural: 'Sections',
  permission: 'SECTION',
  label: 'Section',
  pluralLabel: 'Sections',
  subtitle: 'The head of the clause hierarchy',
  icon: 'folder',
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      [
        {
          entity: 'SectionClause',
          byOwnerQuery: 'sectionClausesBySection',
          ownerArg: 'sectionUid',
          targetArg: 'clauseUid',
          field: 'clause',
          label: 'Clause',
          pluralLabel: 'Clauses',
          icon: 'notes',
          permission: 'SECTION_CLAUSE',
          optionsQuery: CLAUSE.gql.all,
        },
      ],
      record?.id,
    ).concat(
      lookupChildPanel(
        comp,
        () => SECTION_VALUE,
        SECTION_VALUES_BY_SECTION,
        { sectionUid: record?.id },
        { presetModel: { sectionUid: record?.id } },
      ),
      entityLinkPanels(
        comp,
        ownKindLinks(
          'SectionConnection',
          'Section',
          'Sections',
          'folder',
          'SECTION_CONNECTION',
          SECTION.gql.all,
        ),
        record?.id,
      ),
    ),
});

/**
 * The wording each level is given when it is used.
 *
 * A level is the heading; a value is what is said under it. One level may carry
 * any number of them, which is why each is a table of its own rather than a
 * column: the same clause is reused across agreements and each use may word it
 * differently.
 *
 * Read from the level's own page as well as from a screen of their own, since
 * that is where someone reading a clause expects to find its wording.
 */
/** Every agreement, for choosing the ones a wording is used in. */
const ALL_AGREEMENTS_FOR_WORDING = gql`
  query allAgreements {
    allAgreements {
      id
      name
    }
  }
`;

/**
 * The agreements one wording is used in, read from the wording's side --
 * `agreements_sections_values` and its three siblings. Wording that is the same
 * in every agreement shows them all here.
 */
const wordingAgreements = (
  entity: string,
  field: string,
  permission: string,
): EntityLinkConfig[] => [
  {
    entity,
    byOwnerQuery: `${entity.charAt(0).toLowerCase()}${entity.slice(1)}sBy${field.charAt(0).toUpperCase()}${field.slice(1)}`,
    ownerArg: `${field}Uid`,
    targetArg: 'agreementUid',
    field: 'agreement',
    label: 'Agreement',
    pluralLabel: 'Agreements',
    icon: 'list',
    permission,
    optionsQuery: ALL_AGREEMENTS_FOR_WORDING,
  },
];

export const SECTION_VALUE = defineLookup({
  slug: 'section-values',
  entity: 'SectionValue',
  entityPlural: 'SectionValues',
  permission: 'SECTION_VALUE',
  label: 'Section Wording',
  pluralLabel: 'Section Wordings',
  subtitle: 'What is said under a section',
  icon: 'folder',
  extraGqlFields: `
  section {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('sectionUid', 'Section', SECTION.gql.all)],
  extraColumns: [{ field: 'section', valueFn: (row) => row?.section?.name }],
  toModel: (data) => ({ sectionUid: data?.section?.id }),
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      wordingAgreements('AgreementSectionValue', 'sectionValue', 'AGREEMENT_SECTION_VALUE'),
      record?.id,
    ),
});

export const CLAUSE_VALUE = defineLookup({
  slug: 'clause-values',
  entity: 'ClauseValue',
  entityPlural: 'ClauseValues',
  permission: 'CLAUSE_VALUE',
  label: 'Clause Wording',
  pluralLabel: 'Clause Wordings',
  subtitle: 'What is said under a clause',
  icon: 'notes',
  extraGqlFields: `
  clause {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('clauseUid', 'Clause', CLAUSE.gql.all)],
  extraColumns: [{ field: 'clause', valueFn: (row) => row?.clause?.name }],
  toModel: (data) => ({ clauseUid: data?.clause?.id }),
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      wordingAgreements('AgreementClauseValue', 'clauseValue', 'AGREEMENT_CLAUSE_VALUE'),
      record?.id,
    ),
});

export const SUB_CLAUSE_VALUE = defineLookup({
  slug: 'sub-clause-values',
  entity: 'SubClauseValue',
  entityPlural: 'SubClauseValues',
  permission: 'SUB_CLAUSE_VALUE',
  label: 'Sub-clause Wording',
  pluralLabel: 'Sub-clause Wordings',
  subtitle: 'What is said under a sub-clause',
  icon: 'subject',
  extraGqlFields: `
  subClause {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('subClauseUid', 'Sub-clause', SUB_CLAUSE.gql.all)],
  extraColumns: [
    { field: 'subClause', header: 'Sub-clause', valueFn: (row) => row?.subClause?.name },
  ],
  toModel: (data) => ({ subClauseUid: data?.subClause?.id }),
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      wordingAgreements('AgreementSubClauseValue', 'subClauseValue', 'AGREEMENT_SUB_CLAUSE_VALUE'),
      record?.id,
    ),
});

export const SUB_SUBCLAUSE_VALUE = defineLookup({
  slug: 'sub-subclause-values',
  entity: 'SubSubclauseValue',
  entityPlural: 'SubSubclauseValues',
  permission: 'SUB_SUBCLAUSE_VALUE',
  label: 'Sub-subclause Wording',
  pluralLabel: 'Sub-subclause Wordings',
  subtitle: 'What is said under a sub-subclause',
  icon: 'notes',
  extraGqlFields: `
  subSubclause {
    ${lookupRefGqlFields}
  }
`,
  extraFields: [parentSelect('subSubclauseUid', 'Sub-subclause', SUB_SUBCLAUSE.gql.all)],
  extraColumns: [
    {
      field: 'subSubclause',
      header: 'Sub-subclause',
      valueFn: (row) => row?.subSubclause?.name,
    },
  ],
  toModel: (data) => ({ subSubclauseUid: data?.subSubclause?.id }),
  extraContents: (comp, record) =>
    entityLinkPanels(
      comp,
      wordingAgreements(
        'AgreementSubSubclauseValue',
        'subSubclauseValue',
        'AGREEMENT_SUB_SUBCLAUSE_VALUE',
      ),
      record?.id,
    ),
});

export const SUB_SUBCLAUSE_VALUES_BY_SUB_SUBCLAUSE = gql`
  query subSubclauseValuesBySubSubclause($subSubclauseUid: String) {
    subSubclauseValuesBySubSubclause(subSubclauseUid: $subSubclauseUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const SECTION_VALUES_BY_SECTION = gql`
  query sectionValuesBySection($sectionUid: String) {
    sectionValuesBySection(sectionUid: $sectionUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const CLAUSE_VALUES_BY_CLAUSE = gql`
  query clauseValuesByClause($clauseUid: String) {
    clauseValuesByClause(clauseUid: $clauseUid) {
      ${lookupChildGqlFields}
    }
  }
`;

export const SUB_CLAUSE_VALUES_BY_SUB_CLAUSE = gql`
  query subClauseValuesBySubClause($subClauseUid: String) {
    subClauseValuesBySubClause(subClauseUid: $subClauseUid) {
      ${lookupChildGqlFields}
    }
  }
`;

/**
 * Ordered as the hierarchy reads rather than alphabetically, so the menu leads
 * with the level a reader starts from.
 */
export const AGREEMENT_SETTING_LOOKUPS: LookupModule[] = [
  SECTION,
  SECTION_VALUE,
  CLAUSE,
  CLAUSE_VALUE,
  SUB_CLAUSE,
  SUB_CLAUSE_VALUE,
  SUB_SUBCLAUSE,
  SUB_SUBCLAUSE_VALUE,
  AGREEMENT_SECTION,
];
