import { map } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { stationOptions, userOptions } from '../shared/security-lookups';
import { SecurityActionPriority, SecurityActionStatus } from '../shared/security.enums';
import {
  SAVE_SECURITY_ACTION_ITEM,
  DELETE_SECURITY_ACTION_ITEM,
} from './security-action-item.graphql';
import { SecurityActionItem } from './security-action-item.interface';

export function getSecurityActionItemFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'observationReported',
      label: 'Observation Reported',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'specificLocation', label: 'Specific Location', type: FieldType.input, validations: [] },
    {
      key: 'stationUid',
      label: 'Station',
      type: FieldType.select,
      optionsVariables: stationOptions(),
      validations: [],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: FieldType.select,
      options: enumToObjectArray(SecurityActionPriority),
      validations: [],
    },
    {
      key: 'controlMeasures',
      label: 'Control Measures',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
    { key: 'responsibleName', label: 'Responsible Name', type: FieldType.input, validations: [] },
    {
      key: 'responsibleUserUid',
      label: 'Responsible User',
      type: FieldType.select,
      optionsVariables: userOptions(),
      validations: [],
    },
    { key: 'initiationDate', label: 'Initiation Date', type: FieldType.date, validations: [] },
    { key: 'closedDate', label: 'Closed Date', type: FieldType.date, validations: [] },
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
      options: enumToObjectArray(SecurityActionStatus),
      validations: [],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      type: FieldType.textarea,
      class: 'col-span-full',
      validations: [],
    },
  ];
}

const securityActionItemCrud = defineEntityCrud<SecurityActionItem>({
  name: 'Security Action Item',
  routeSlug: 'security-action-items',
  fields: getSecurityActionItemFormFields(),
  modalWidth: '60%',
  modelMapper: (data?: SecurityActionItem) => ({
    ...(data ?? {}),
    stationUid: data?.station?.uid,
    responsibleUserUid: data?.responsibleUser?.uid,
  }),
  mutations: {
    create: SAVE_SECURITY_ACTION_ITEM,
    update: SAVE_SECURITY_ACTION_ITEM,
    delete: DELETE_SECURITY_ACTION_ITEM,
  },
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_SECURITY_ACTION_ITEM', 'ROLE_UPDATE_SECURITY_ACTION_ITEM'],
    delete: ['ROLE_DELETE_SECURITY_ACTION_ITEM'],
  },
});

export const securityActionItem$ = securityActionItemCrud.reload$;

export const securityActionItemUpsertBtn = (comp: BaseComponent): ActionButton =>
  securityActionItemCrud.upsertBtn(crudHostFromBase(comp));

export const securityActionItemDeleteBtn = (comp: BaseComponent): ActionButton =>
  securityActionItemCrud.deleteBtn(crudHostFromBase(comp));

export const securityActionItemTableBtns = (comp: BaseComponent): ActionButton[] =>
  securityActionItemCrud.tableBtns(crudHostFromBase(comp));

/** Source types an action item can be raised against. */
export const SECURITY_ACTION_SOURCE = {
  INVESTIGATION: 'INVESTIGATION',
  INCIDENT: 'INCIDENT',
} as const;

/**
 * Build a CRUD surface for action items scoped to a single source record
 * (e.g. an investigation). New/edited items inherit the given
 * `sourceType` + `sourceUid`, and the list is filtered to that source.
 */
export function securityActionItemSourceCrud(sourceType: string, sourceUid?: string) {
  return defineEntityCrud<SecurityActionItem>({
    name: 'Action Item',
    routeSlug: 'security-action-items',
    fields: getSecurityActionItemFormFields(),
    modalWidth: '60%',
    modelMapper: (data?: SecurityActionItem) => ({
      ...(data ?? {}),
      stationUid: data?.station?.uid,
      responsibleUserUid: data?.responsibleUser?.uid,
      sourceType: data?.sourceType ?? sourceType,
      sourceUid: data?.sourceUid ?? sourceUid,
    }),
    mutations: {
      create: SAVE_SECURITY_ACTION_ITEM,
      update: SAVE_SECURITY_ACTION_ITEM,
      delete: DELETE_SECURITY_ACTION_ITEM,
    },
    upsertVariables: (value) => ({ dto: { ...value, sourceType, sourceUid } }),
    permissions: {
      manage: ['ROLE_CREATE_SECURITY_ACTION_ITEM', 'ROLE_UPDATE_SECURITY_ACTION_ITEM'],
      delete: ['ROLE_DELETE_SECURITY_ACTION_ITEM'],
    },
  });
}

/**
 * Convenience wrapper that wires a source-scoped action item CRUD to a host
 * component, returning the shared reload subject plus the create button and
 * row action buttons for embedding in a parent detail tab.
 */
export function securityActionItemSourceButtons(
  comp: BaseComponent,
  sourceType: string,
  sourceUid?: string,
) {
  const crud = securityActionItemSourceCrud(sourceType, sourceUid);
  const host = crudHostFromBase(comp);
  return {
    reload$: crud.reload$.pipe(map(() => true)),
    upsertBtn: crud.upsertBtn(host),
    tableBtns: crud.tableBtns(host),
  };
}
