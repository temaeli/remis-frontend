import { gql } from '@apollo/client/core';

import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldType, Option } from '@shared/components/generic-form/field.interface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { defineLookup, entityLinkPanels, EntityLinkConfig, Lookup } from '@shared/lookup';

/**
 * Documents — `remis_core_schema.attachments` and its six link tables.
 *
 * **Not the attachments screen you already know.** `AttachmentController` serves
 * `uaa.attachments`: it uploads bytes and stores them, keys on a bigint, and
 * carries `attachmentTitle` and `filePath`. This one is the DBA's table — a uuid
 * key, an `assignedCode`/`name`/`url` triple and a type enum — and it records a
 * document that already has a location rather than putting one there. Both exist
 * on the backend, so everything here is spelled `CoreAttachment` and the two never
 * share a permission.
 *
 * The six link tables say what a document hangs off: an asset, a person, an
 * organisation, a case, a task or a unit. They are six panels rather than one
 * because they are six permissions — filing against a person and filing against an
 * asset are separately grantable — and they appear on the owning record's detail
 * page, which is where someone looking at an asset expects its papers.
 *
 * The enum lives here rather than in `workflow-lookups.ts`, where the backend
 * keeps it. The workflow module needs it for the documents a step demands, and the
 * documents themselves need it; declaring it there and importing it here while
 * that file imports the panels below would be a cycle.
 */

/** `remis_core_schema.attachment_types`. Labels must match the database exactly. */
export enum AttachmentType {
  DOCUMENT = 'DOCUMENT',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  REPORT = 'REPORT',
  CERTIFICATE = 'CERTIFICATE',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER',
  TITLE_DEED = 'TITLE_DEED',
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  MARRIAGE_CERTIFICATE = 'MARRIAGE_CERTIFICATE',
  DEATH_CERTIFICATE = 'DEATH_CERTIFICATE',
  EDUCATIONAL_CERTIFICATE = 'EDUCATIONAL_CERTIFICATE',
  MEDICAL_CERTIFICATE = 'MEDICAL_CERTIFICATE',
}

export const ATTACHMENT_TYPE_OPTIONS: Option[] = Object.values(AttachmentType).map((value) => ({
  value,
  label: getDisplayName(value) as string,
}));

/** Rendered as words rather than the SCREAMING_CASE label. */
const typeColumn: GridKeyColumn = {
  field: 'attachmentType',
  header: 'Type',
  valueFn: (row) => getDisplayName(row?.['attachmentType']),
};

//  The document itself.

/**
 * A document on the register.
 *
 * Three of its four columns are UNIQUE, which is a catalogue's shape rather than a
 * document store's, and `name` is the one that bites: two people uploading
 * `scan.pdf` would collide on the second. Leaving the name blank is therefore the
 * ordinary path — the backend builds one from the type and the assigned code, both
 * unique by construction. The hint says so on the control.
 *
 * There is no description control because the table has no such column; it spends
 * that slot on `url`.
 */
export const CORE_ATTACHMENT = defineLookup({
  slug: 'documents',
  entity: 'CoreAttachment',
  entityPlural: 'CoreAttachments',
  permission: 'CORE_ATTACHMENT',
  label: 'Document',
  pluralLabel: 'Documents',
  subtitle: 'The papers held against assets, people, organisations, cases, tasks and units',
  icon: 'file',
  // No description column on this table, so the default triple would fail the
  // whole query rather than omitting one field.
  descriptiveGqlFields: `
  assignedNumber
  name
`,
  baseFields: [
    { key: 'id', type: FieldType.input, visible: false },
    {
      key: 'attachmentType',
      label: 'Document Type',
      type: FieldType.select,
      options: ATTACHMENT_TYPE_OPTIONS,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'url',
      label: 'Location',
      hint: 'Where the file sits. Unique — the same file cannot be recorded twice',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'name',
      label: 'Name',
      hint: 'Unique across every document in the system. Leave blank to name it after the type and code',
      type: FieldType.input,
      class: 'col-span-full',
    },
    {
      key: 'assignedCode',
      label: 'Assigned Code',
      type: FieldType.input,
      hint: 'Leave blank to generate automatically',
      class: 'col-span-full',
    },
  ],
  baseColumns: ['index', 'assignedNumber as Code', 'name'],
  extraGqlFields: `
  url
  attachmentType
`,
  extraColumns: [typeColumn, { field: 'url', header: 'Location' }],
  toModel: (data?: Lookup) => ({ assignedCode: data?.assignedNumber }),
});

//  What a document hangs off.

/** Fills the select on every link form. Only what a label and a value need. */
const ALL_CORE_ATTACHMENTS = gql`
  query allCoreAttachments {
    allCoreAttachments {
      id
      name
    }
  }
`;

/**
 * The six link tables, keyed by the thing a document hangs off.
 *
 * Each is one row of the same shape: the backend named the read
 * `coreAttachmentsBy<Owner>` and the mutations `link`/`unlink CoreAttachment<Owner>`,
 * so only the owner's own argument and label differ.
 */
export type AttachmentOwner = 'asset' | 'bioData' | 'businessName' | 'process' | 'task' | 'unit';

const linkConfig = (
  entitySuffix: string,
  byOwnerQuery: string,
  ownerArg: string,
): EntityLinkConfig => ({
  entity: `CoreAttachment${entitySuffix}`,
  byOwnerQuery,
  ownerArg,
  targetArg: 'attachmentUid',
  field: 'attachment',
  label: 'Document',
  pluralLabel: 'Documents',
  icon: 'file',
  permission: `CORE_ATTACHMENT_${entitySuffix
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase()}`,
  optionsQuery: ALL_CORE_ATTACHMENTS,
  // The far side is a CoreAttachment, which carries no description — the panel's
  // default selection would ask for one and fail the query.
  targetGqlFields: `
    id
    assignedNumber
    name
    attachmentType
  `,
  columns: [
    'index',
    'attachment.assignedNumber as Code',
    'attachment.name as Name',
    {
      field: 'attachment.attachmentType',
      header: 'Type',
      valueFn: (row) => getDisplayName(row?.['attachment']?.attachmentType),
    },
    'actions',
  ],
});

const ATTACHMENT_LINKS: Record<AttachmentOwner, EntityLinkConfig> = {
  asset: linkConfig('Asset', 'coreAttachmentsByAsset', 'assetUid'),
  bioData: linkConfig('BioData', 'coreAttachmentsByBioData', 'bioDataUid'),
  businessName: linkConfig('BusinessName', 'coreAttachmentsByBusinessName', 'businessNameUid'),
  process: linkConfig('Process', 'coreAttachmentsByProcess', 'processUid'),
  task: linkConfig('Task', 'coreAttachmentsByTask', 'taskUid'),
  unit: linkConfig('Unit', 'coreAttachmentsByUnit', 'unitUid'),
};

/**
 * The documents panel for one owner's detail page.
 *
 * Returns nothing until the record has an id — a create has no record to hang
 * papers off, and the panel would read every document in the system.
 */
export const coreAttachmentPanels = (
  comp: BaseComponent,
  owner: AttachmentOwner,
  ownerUid?: string,
): ContentParameter[] =>
  ownerUid ? entityLinkPanels(comp, [ATTACHMENT_LINKS[owner]], ownerUid) : [];
