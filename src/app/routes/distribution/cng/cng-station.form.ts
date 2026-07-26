import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED, VALIDATOR_TANZINIA_PHONE } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import {
  SAVE_CNG_STATION,
  DELETE_CNG_STATION,
} from './cng-station.graphql';
import { CNG_LOOKUPS_BY_TYPE } from './cng-lookup.graphql';
import { CngLookupType, CngStation } from './cng-station.interface';
import { GET_ALL_REGIONS } from '@routes/settings/regions/region.graphql';

export function getCngStationFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [], hint: 'Auto-generated if blank' },
    {
      key: 'stationType',
      label: 'Station Type',
      type: FieldType.select,
      validations: [],
      options: [
        { label: 'Mother Station', value: 'MOTHER' },
        { label: 'Daughter Station', value: 'DAUGHTER' },
        { label: 'Filling Station', value: 'FILLING' },
      ],
    },
    {
            key: 'region',
            label: 'Region',
            type: FieldType.select,
            validations: [],
            optionsVariables: { fetchParameter: { query: GET_ALL_REGIONS },valueKey:'name' },
          },
    { key: 'location', label: 'Location', type: FieldType.input, validations: [] },
    { key: 'contact', label: 'Station Phone Number', type: FieldType.input, validations: [VALIDATOR_TANZINIA_PHONE] },
    // {
    //   key: 'description',
    //   label: 'Description',
    //   class: 'col-span-full',
    //   type: FieldType.textarea,
    //   validations: [],
    // },
    {
      key: 'equipments',
      label: 'Equipment',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      labelClass: 'p-0 pb-3',
      fieldsClass: 'grid grid-cols-2 gap-4',
      canAddFormGroup: true,
      fields: [
        {
          key: 'equipmentTypeUid',
          label: 'Type',
          type: FieldType.select,
          validations: [VALIDATOR_REQUIRED],
          optionsVariables: {
            fetchParameter: {
              query: CNG_LOOKUPS_BY_TYPE,
              variables: { lookupType: CngLookupType.EQUIPMENT_TYPE },
            },
            labelKey: 'name',
            valueKey: 'uid',
          },
        },
        { key: 'name', label: 'Name / Tag', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
        { key: 'capacity', label: 'Capacity', type: FieldType.decimal, validations: [], min: 0 },
        {
          key: 'capacityUnitUid',
          label: 'Capacity Unit',
          type: FieldType.select,
          validations: [],
          optionsVariables: {
            fetchParameter: {
              query: CNG_LOOKUPS_BY_TYPE,
              variables: { lookupType: CngLookupType.CAPACITY_UNIT },
            },
            labelKey: 'symbol',
            valueKey: 'uid',
          },
        },
      ],
    },
  ];
}

const cngStationCrud = defineEntityCrud<CngStation>({
  name: 'CNG Station',
  routeSlug: 'cng-stations',
  fields: getCngStationFormFields(),
  modalWidth: '60%',
  mutations: {
    create: SAVE_CNG_STATION,
    update: SAVE_CNG_STATION,
    delete: DELETE_CNG_STATION,
  },
  // Flatten the equipmentType/capacityUnit CngLookup objects into the *Uid
  // fields the equipment form selects bind to.
  modelMapper: (data) => ({
    ...(data as any),
    equipments: (data as any)?.equipments?.map((eq: any) => ({
      equipmentTypeUid: eq.equipmentType?.uid,
      name: eq.name,
      capacity: eq.capacity,
      capacityUnitUid: eq.capacityUnit?.uid,
    })),
  }),
  upsertVariables: (value) => ({ dto: value }),
  permissions: {
    manage: ['ROLE_CREATE_CNG_STATION', 'ROLE_UPDATE_CNG_STATION'],
    delete: ['ROLE_DELETE_CNG_STATION'],
  },
});

export const cngStation$ = cngStationCrud.reload$;

export const cngStationUpsertBtn = (comp: BaseComponent): ActionButton =>
  cngStationCrud.upsertBtn(crudHostFromBase(comp));

export const cngStationDeleteBtn = (comp: BaseComponent): ActionButton =>
  cngStationCrud.deleteBtn(crudHostFromBase(comp));

export const cngStationTableBtns = (comp: BaseComponent): ActionButton[] => [
  ...cngStationCrud.tableBtns(crudHostFromBase(comp)),
];
