import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { manpowerCategoryLookupProvider } from '../manpower-categories/manpower-category.provider';
import { workingStationLookupProvider } from '@routes/pipeline-management/working-stations/working-station.provider';
import {
  CREATE_OR_UPDATE_WORKSTATION_MANHOUR,
  DELETE_WORKSTATION_MANHOUR,
} from './workstation-manhour.graphql';
import { WorkStationManHour } from './workstation-manhour.interface';

export function getWorkStationManHourFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'manpowerCategoryUid',
      label: 'Manpower Category',
      type: FieldType.select,
      optionsVariables: lookupOptions(manpowerCategoryLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'workingStationUid',
      label: 'Working Station',
      type: FieldType.select,
      optionsVariables: lookupOptions(workingStationLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'manHours',
      label: 'Man Hours',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const workStationManHourCrud = defineEntityCrud<WorkStationManHour>({
  name: 'WorkStation Man Hour',
  routeSlug: 'workstation-manhours',
  fields: getWorkStationManHourFormFields(),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_WORKSTATION_MANHOUR,
    update: CREATE_OR_UPDATE_WORKSTATION_MANHOUR,
    delete: DELETE_WORKSTATION_MANHOUR,
  },
  permissions: {
    manage: ['ROLE_MANAGE_WORKSTATION_MANHOUR'],
    delete: ['ROLE_DELETE_WORKSTATION_MANHOUR'],
    view: ['ROLE_VIEW_WORKSTATION_MANHOUR'],
  },
  modelMapper: (data: any) => ({
    ...data,
    manpowerCategoryUid: data?.manpowerCategoryUid ?? data?.category?.uid,
    workingStationUid: data?.workingStationUid ?? data?.station?.uid,
  }),
});

export const workStationManHour$ = workStationManHourCrud.reload$;

export const workStationManHourUpsertBtn = (comp: BaseComponent): ActionButton =>
  workStationManHourCrud.upsertBtn(crudHostFromBase(comp));

export const workStationManHourDeleteBtn = (comp: BaseComponent): ActionButton =>
  workStationManHourCrud.deleteBtn(crudHostFromBase(comp));

export const workStationManHourTableBtns = (comp: BaseComponent): ActionButton[] =>
  workStationManHourCrud.tableBtns(crudHostFromBase(comp));
