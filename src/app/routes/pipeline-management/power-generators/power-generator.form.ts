import { formatDate } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  FieldConfig,
  FieldType,
  FormStepper,
} from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { enumToObjectArray } from '@core/helpers';
import { workingStationLookupProvider } from '../working-stations/working-station.provider';
import {
  CREATE_POWER_GENERATOR,
  DELETE_POWER_GENERATOR,
  UPDATE_POWER_GENERATOR,
} from './power-generator.graphql';
import {
  FuelType,
  GeneratorOperatingStatus,
  PhaseType,
  PowerGenerator,
} from './power-generator.interface';

export function getPowerGeneratorFormFields(): FieldConfig[] {
  // Maintenance date ordering: next service must be strictly after last service.
  // Shared closure (functions survive the form's deep-clone by reference) holds
  // the current last-service date so the next-service picker can disable any date
  // on/before it. Fresh per form open because this factory is invoked per-open.
  let lastServiceStr: string | null = null;
  const toDateStr = (d: any) => (d ? formatDate(d, 'yyyy-MM-dd', 'en-GB') : null);

  return [
    { key: 'uid', type: FieldType.input, visible: false },
    // --- Identification ---
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'serialNumber',
      label: 'Serial Number',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'model', label: 'Model', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    {
      key: 'workStationUid',
      label: 'Working Station',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: lookupOptions(workingStationLookupProvider),
    },
    // --- Capacity & Ratings ---
    {
      key: 'capacityKva',
      label: 'Capacity (kVA)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'capacityKw',
      label: 'Capacity (kW)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'voltage',
      label: 'Voltage (V)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'frequencyHz', label: 'Frequency (Hz)', type: FieldType.decimal, validations: [] },
    {
      key: 'phaseType',
      label: 'Phase Type',
      type: FieldType.select,
      options: enumToObjectArray(PhaseType),
      validations: [VALIDATOR_REQUIRED],
    },
    { key: 'powerFactor', label: 'Power Factor', type: FieldType.decimal, validations: [] },
    // --- Fuel ---
    {
      key: 'fuelType',
      label: 'Fuel Type',
      type: FieldType.select,
      options: enumToObjectArray(FuelType),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'fuelTankCapacityLiters',
      label: 'Fuel Tank Capacity (L)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'minimumVolume',
      label: 'Minimum Volume (L)',
      type: FieldType.decimal,
      hint: 'Must be less than fuel tank capacity',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'fuelConsumptionPerHour',
      label: 'Fuel Consumption (L/hr)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    // --- Engine ---
    {
      key: 'engineNumber',
      label: 'Engine Number',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'engineModel',
      label: 'Engine Model',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'engineManufacturer',
      label: 'Engine Manufacturer',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    // --- Operational ---
    {
      key: 'installationDate',
      label: 'Installation Date',
      type: FieldType.date,
      validations: [],
      maxDate: new Date(),
    },
    {
      key: 'commissioningDate',
      label: 'Commissioning Date',
      type: FieldType.date,
      validations: [],
      maxDate: new Date(),
    },
    { key: 'operatingHours', label: 'Operating Hours', type: FieldType.decimal, validations: [] },
    {
      key: 'status',
      label: 'Generator Status',
      type: FieldType.select,
      options: enumToObjectArray(GeneratorOperatingStatus),
      validations: [],
    },
    {
      key: 'conditionStatus',
      label: 'Condition Status',
      type: FieldType.input,
      validations: [],
    },
    // --- Maintenance ---
    {
      key: 'lastServiceDate',
      label: 'Last Service Date',
      type: FieldType.date,
      validations: [],
      maxDate: new Date(),
      onChange: (value: any, form?: any) => {
        lastServiceStr = toDateStr(value);
        // clear an already-chosen next-service date that is no longer after last
        const next = toDateStr(form?.get('nextServiceDate')?.value);
        if (lastServiceStr && next && next <= lastServiceStr) {
          form?.get('nextServiceDate')?.reset();
        }
      },
    },
    {
      key: 'nextServiceDate',
      label: 'Next Service Date',
      type: FieldType.date,
      validations: [],
      hint: 'Must be after the last service date',
      // disable any date on/before the last service date (strictly greater)
      dateFilter: (d: Date | null) => !lastServiceStr || (!!d && toDateStr(d)! > lastServiceStr),
    },
    {
      key: 'maintenanceIntervalHours',
      label: 'Maintenance Interval (hrs)',
      type: FieldType.decimal,
      validations: [],
    },
  ];
}

export function getPowerGeneratorFormSteppers(): FormStepper[] {
  return [
    {
      name: 'Identification',
      icon: 's-profile',
      keys: ['code', 'name', 'serialNumber', 'manufacturer', 'model', 'workStationUid'],
    },
    {
      name: 'Capacity & Ratings',
      icon: 'dashboard',
      keys: ['capacityKva', 'capacityKw', 'voltage', 'frequencyHz', 'phaseType', 'powerFactor'],
    },
    {
      name: 'Fuel',
      icon: 'natural_gas',
      keys: ['fuelType', 'fuelTankCapacityLiters', 'minimumVolume', 'fuelConsumptionPerHour'],
    },
    {
      name: 'Engine',
      icon: 'cards',
      keys: ['engineNumber', 'engineModel', 'engineManufacturer'],
    },
    {
      name: 'Operational',
      icon: 'check_circle',
      keys: [
        'installationDate',
        'commissioningDate',
        'operatingHours',
        'status',
        'conditionStatus',
      ],
    },
    {
      name: 'Maintenance',
      icon: 'history',
      keys: ['lastServiceDate', 'nextServiceDate', 'maintenanceIntervalHours'],
    },
  ];
}

const powerGeneratorCrud = defineEntityCrud<PowerGenerator>({
  name: 'Standby Generator',
  routeSlug: 'standby-generators',
  fields: getPowerGeneratorFormFields,
  formSteppers: getPowerGeneratorFormSteppers(),
  linearSteppers: false,
  modalWidth: '70%',
  modalHeight: '75vh',
  modalDialogProps: { maxWidth: '800px' },
  mutations: {
    create: CREATE_POWER_GENERATOR,
    update: UPDATE_POWER_GENERATOR,
    delete: DELETE_POWER_GENERATOR,
  },
  permissions: {
    manage: ['ROLE_MANAGE_POWER_GENERATOR'],
    delete: ['ROLE_DELETE_POWER_GENERATOR'],
  },
  modelMapper: (data) => {
    const model: any = { ...(data ?? {}) };
    if (model.workStation && !model.workStationUid) {
      model.workStationUid = model.workStation.uid;
    }
    return model;
  },
});

export const powerGenerator$ = powerGeneratorCrud.reload$;

export const powerGeneratorUpsertBtn = (comp: BaseComponent): ActionButton =>
  powerGeneratorCrud.upsertBtn(crudHostFromBase(comp));

export const powerGeneratorDeleteBtn = (comp: BaseComponent): ActionButton =>
  powerGeneratorCrud.deleteBtn(crudHostFromBase(comp));

export const powerGeneratorTableBtns = (comp: BaseComponent): ActionButton[] =>
  powerGeneratorCrud.tableBtns(crudHostFromBase(comp));

export const powerGeneratorViewBtn = (comp: BaseComponent): ActionButton | undefined => {
  const btn = powerGeneratorCrud.viewBtn(crudHostFromBase(comp));
  return btn ? { ...btn, label: 'View Generator' } : undefined;
};
