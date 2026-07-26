import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  ALL_PLANT_PROCESSING_DATA_PAGEABLE,
  SAVE_PLANT_PROCESSING_DATA,
} from './plant-received-data.graphql';
import { PlantReceivedData } from './plant-received-data.interface';
import { CLIENT_BY_STREAM_TYPE_PAGEABLE } from '@routes/client-registration/customers/clients.graphql';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { ClientStreamType } from '@routes/client-registration/customers/clients.interface';

//Listener for all PlantReceivedData actions
export const plantReceivedData$ = new Subject<PlantReceivedData | any>();

export const getPlantReceivedDataFormFields = (comp: BaseComponent): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  // {
  //   key: 'plantUid',
  //   type: FieldType.select,
  //   validations: [VALIDATOR_REQUIRED],
  //   optionsVariables: { fetchParameter: { query: ALL_PLANT } },
  // },
  {
    key: 'clientUid',
    label: 'Customer',
    type: FieldType.select,
    validations: [VALIDATOR_REQUIRED],
    optionsVariables: {
      fetchParameter: {
        query: CLIENT_BY_STREAM_TYPE_PAGEABLE,
        variables: { clientStreamType: ClientStreamType.UP, active: true },
      },
      mapFunction: (d: any) => ({ ...d, label: d?.user?.fullName ?? d?.contactPersonName }),
    },
  },

  // Received Raw Gas Volume → display unit as m³ (cubic meters)
  // Received Raw Gas Pressure → display unit as Pa / kPa / bar
  // (selectable or fixed based on system standard)
  // Received Raw Gas Temperature → display unit as °C (Celsius) or K (Kelvin)

  {
    key: 'receivedRawGasPressure',
    label: 'Received Raw Gas Pressure (bar)',
    type: FieldType.decimal,
    validations: [],
  },
  {
    key: 'receivedRawGasTemperature',
    label: 'Received Raw Gas Temperature (°C)',
    type: FieldType.decimal,
    validations: [],
  },
  {
    key: 'receivedRawGasVolume',
    label: 'Received Raw Gas Volume (m³)',
    type: FieldType.decimal,
    validations: [],
  },
];

export function plantReceivedDataUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: PlantReceivedData) => {
      const formParameter: FormParameters = {
        model: { ...data, clientUid: data?.client?.uid },
        title: 'Plant Received Data',
        fields: getPlantReceivedDataFormFields(comp),
        closeAction$: plantReceivedData$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: SAVE_PLANT_PROCESSING_DATA,
            successFn: (res) => plantReceivedData$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { maxWidth: '680px' });
    },
    permissions: ['ROLE_CREATE_PLANT_RECEIVED_DATA ', 'ROLE_UPDATE_PLANT_RECEIVED_DATA'],
    ...getUpsertBtnProps('Plant Received Data'),
  };
}

export function plantReceivedDataViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Plant Received Data',
    click: (data: PlantReceivedData) => navigateRelativeTo(comp, 'plant-received-datas', data?.uid),
    permissions: ['ROLE_VIEW_PLANT_RECEIVED_DATA', 'ROLE_VIEW_ALL_PLANT_RECEIVED_DATA'],
  };
}

// export function plantReceivedDataDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: PlantReceivedData) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: undefined,
//         finalFn: (res) => plantReceivedData$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Plant Received Data', 'name'),
//     permissions: ['ROLE_DELETE_PLANT_RECEIVED_DATA'],
//   };
// }

export function plantReceivedDataTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        plantReceivedDataViewBtn(comp),
        plantReceivedDataUpsertBtn(comp),
        // plantReceivedDataDeleteBtn(comp),
      ],
    },
  ];
}

export function plantReceivedDataContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'Received Data',
    title: 'Received Data',
    slug: 'received-data',
    icon: 'import',
    actionButtons: plantReceivedDataTableBtns(comp),
    headerButtons: [plantReceivedDataUpsertBtn(comp)],
    permissions: ['ROLE_VIEW_ALL_PLANT_RECEIVED_DATA', 'ROLE_VIEW_PLANT_RECEIVED_DATA'],

    keyColumns: [
      'index',
      'availableCapacity',
      'client',
      'flaredGas',
      'ownUseGas',
      'plant',
      'producedGas',
      'actions',
    ],

    fetchParameter: {
      query: ALL_PLANT_PROCESSING_DATA_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
