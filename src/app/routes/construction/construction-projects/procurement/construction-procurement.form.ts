import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { defineEntityCrud, EntityCrudContext } from '@shared/crud';
import { ConstructionProcurement } from '../construction-projects.interface';
import {
  ALL_CONSTRUCTION_PROJECTS,
  SAVE_CONSTRUCTION_PROCUREMENT,
  DELETE_CONSTRUCTION_PROCUREMENT,
} from '../construction-projects.graphql';

export function getConstructionProcurementFormFields(ctx?: EntityCrudContext): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'projectUid',
      label: 'Project',
      type: FieldType.select,
      visible: !ctx?.fixedProjectUid,
      validations: ctx?.fixedProjectUid ? [] : [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: { query: ALL_CONSTRUCTION_PROJECTS },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    {
      key: 'materialName',
      label: 'Material Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'supplier', label: 'Supplier', type: FieldType.input, validations: [] },
    {
      key: 'deliveryStatus',
      label: 'Delivery Status',
      type: FieldType.input,
      // hint: 'e.g. Delivered, On shipment progress, On shelf',
      validations: [],
    },
    {
      key: 'contractSigningPercent',
      label: 'Contract Signing (%)',
      type: FieldType.number,
      min: 0,
      max: 100,
      validations: [],
    },
    {
      key: 'orderPlacementPercent',
      label: 'Order Placement (%)',
      type: FieldType.number,
      min: 0,
      max: 100,
      validations: [],
    },
    {
      key: 'fabricationSupplyPercent',
      label: 'Fabrication / Supply (%)',
      type: FieldType.number,
      min: 0,
      max: 100,
      validations: [],
    },
    {
      key: 'shipmentPercent',
      label: 'Shipment (%)',
      type: FieldType.number,
      min: 0,
      max: 100,
      validations: [],
    },
    {
      key: 'deliveryPercent',
      label: 'Delivery (%)',
      type: FieldType.number,
      min: 0,
      max: 100,
      validations: [],
    },
    { key: 'orderIndex', label: 'Order Index', type: FieldType.number, min: 0, validations: [] },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

export const constructionProcurementCrud = defineEntityCrud<ConstructionProcurement>({
  name: 'Procurement',
  fields: (_data?: ConstructionProcurement, ctx?: EntityCrudContext) =>
    getConstructionProcurementFormFields(ctx),
  modalWidth: '60%',
  mutations: {
    create: SAVE_CONSTRUCTION_PROCUREMENT,
    update: SAVE_CONSTRUCTION_PROCUREMENT,
    delete: DELETE_CONSTRUCTION_PROCUREMENT,
  },
  modelMapper: (data?: ConstructionProcurement) =>
    data ? { ...data, projectUid: data.project?.uid } : undefined,
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CONSTRUCTION_PROCUREMENT', 'ROLE_UPDATE_CONSTRUCTION_PROCUREMENT'],
    delete: ['ROLE_DELETE_CONSTRUCTION_PROCUREMENT'],
  },
});
