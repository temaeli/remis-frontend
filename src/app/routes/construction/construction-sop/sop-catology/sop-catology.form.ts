import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { SopCatalogEntry } from '../construction-sop.interface';
import { SAVE_SOP_CATALOG_ENTRY, DELETE_SOP_CATALOG_ENTRY } from './sop-catology.graphql';

export function getSopCatalogEntryFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'version', label: 'Version (e.g. 1.0, Rev B)', type: FieldType.input, validations: [] },
    { key: 'attachmentUrl', label: 'Attachment URL', type: FieldType.input, validations: [] },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'purpose',
      label: 'Purpose',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'scope',
      label: 'Scope',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'responsibilities',
      label: 'Responsibilities',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'procedureSteps',
      label: 'Procedure Steps',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'referenceDocuments',
      label: 'Reference Documents / Standards',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'tools',
      label: 'Tools / Equipment / Materials',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    {
      key: 'versionChangeNote',
      label: 'Version Change Note (optional — recorded when version changes)',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

const sopCatalogEntryCrud = defineEntityCrud<SopCatalogEntry>({
  name: 'SOP Catalogue Entry',
  routeSlug: 'sop-catology',
  fields: getSopCatalogEntryFormFields(),
  modalWidth: '65%',
  mutations: {
    create: SAVE_SOP_CATALOG_ENTRY,
    update: SAVE_SOP_CATALOG_ENTRY,
    delete: DELETE_SOP_CATALOG_ENTRY,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SOP_CATALOG', 'ROLE_UPDATE_SOP_CATALOG'],
    delete: ['ROLE_DELETE_SOP_CATALOG'],
    view: ['ROLE_VIEW_ALL_SOP_CATALOG', 'ROLE_VIEW_SOP_CATALOG'],
  },
});

export const sopCatalogEntry$ = sopCatalogEntryCrud.reload$;

export const sopCatalogEntryUpsertBtn = (comp: BaseComponent): ActionButton =>
  sopCatalogEntryCrud.upsertBtn(crudHostFromBase(comp));

export const sopCatalogEntryDeleteBtn = (comp: BaseComponent): ActionButton =>
  sopCatalogEntryCrud.deleteBtn(crudHostFromBase(comp));

export const sopCatalogEntryTableBtns = (comp: BaseComponent): ActionButton[] => [
  ...sopCatalogEntryCrud.tableBtns(crudHostFromBase(comp)),
];
