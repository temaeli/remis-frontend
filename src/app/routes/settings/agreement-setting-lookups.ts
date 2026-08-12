import { defineLookup, entityLinkPanels, LookupModule } from '@shared/lookup';

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

export const SUB_SUBCLAUSE = defineLookup({
  slug: 'sub-subclauses',
  entity: 'SubSubclause',
  entityPlural: 'SubSubclauses',
  permission: 'SUB_SUBCLAUSE',
  label: 'Sub-subclause',
  pluralLabel: 'Sub-subclauses',
  subtitle: 'The deepest level of the clause hierarchy',
  icon: 'notes',
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
  icon: 'article',
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
  icon: 'menu_book',
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
          icon: 'article',
          permission: 'SECTION_CLAUSE',
          optionsQuery: CLAUSE.gql.all,
        },
      ],
      record?.id,
    ),
});

/**
 * Ordered as the hierarchy reads rather than alphabetically, so the menu leads
 * with the level a reader starts from.
 */
export const AGREEMENT_SETTING_LOOKUPS: LookupModule[] = [
  SECTION,
  CLAUSE,
  SUB_CLAUSE,
  SUB_SUBCLAUSE,
  AGREEMENT_SECTION,
];
