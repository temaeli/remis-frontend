import { BehaviorSubject, Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { DELETE_PLANT, GET_ALL_USERS_PAGEABLE, SAVE_PLANT } from './plant.graphql';
import { GET_ALL_REGIONS } from '../../settings/regions/region.graphql';
import { GET_DISTRICTS_BY_REGION } from '../../settings/regions/district/district.graphql';
import { GET_WARDS_BY_DISTICT } from '../../settings/regions/ward/ward.graphql';
import { GET_SUB_WARD_BY_WARD } from '../../settings/regions/subward/subward.graphql';
import { Plant } from './plant.interface';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { region$ } from '@routes/settings/regions/region.form';
import { LIST_USERS_PAGEABLE_ } from '@routes/users-managment/users/user.graphql';

//Listener for all Plant actions
export const plant$ = new Subject<Plant | any>();

// BehaviorSubjects used as observable variables so SelectComponent's
// listenToValues mechanism re-fetches automatically when parent changes.
const regionUid$ = new BehaviorSubject<string | null>(null);
const districtUid$ = new BehaviorSubject<string | null>(null);
const wardUid$ = new BehaviorSubject<string | null>(null);

export const getPlantFormFields = (comp: BaseComponent): FieldConfig[] => {
  const fields: FieldConfig[] = [
    {
      key: 'uid',
      type: FieldType.input,
      visible: false,
    },
    {
      key: 'name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
    },
    {
      key: 'code',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'blockNumber',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'dailyProductionCapacityMmscfd',
      label: 'Number of Trains (MMScfd)',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'maximumCapacityMmscfd',
      label: 'Capacity Installed (MMScfd)',
      type: FieldType.number,
      validations: [],
    },
    {
      key: 'postalAddress',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'physicalAddress',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'regionUid',
      label: 'Region',
      type: FieldType.select,
      ignoreOnSubmit: true,
      validations: [],
      optionsVariables: {
        fetchParameter: { query: GET_ALL_REGIONS },
        labelKey: 'name',
        valueKey: 'uid',
      },
      onChange: (value: string, form: any) => {
        regionUid$.next(value ?? null);
      },
    },
    {
      key: 'districtUid',
      label: 'District',
      ignoreOnSubmit: true,
      type: FieldType.select,
      validations: [],
      showWhen: [{ key: 'regionUid', checker: (v) => !!v }],
      optionsVariables: {
        fetchParameter: { query: GET_DISTRICTS_BY_REGION, variables: { uid: regionUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
      onChange: (value: string, form: any) => {
        districtUid$.next(value ?? null);
      },
    },
    {
      key: 'wardUid',
      label: 'Ward',
      ignoreOnSubmit: true,
      type: FieldType.select,
      validations: [],
      showWhen: [{ key: 'districtUid', checker: (v) => !!v }],
      optionsVariables: {
        fetchParameter: { query: GET_WARDS_BY_DISTICT, variables: { districtUid: districtUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
      onChange: (value: string, form: any) => {
        wardUid$.next(value ?? null);
      },
    },
    {
      key: 'subWardUid',
      type: FieldType.select,
      ignoreOnSubmit: false,
      validations: [],
      showWhen: [{ key: 'wardUid', checker: (v) => !!v }],
      optionsVariables: {
        fetchParameter: { query: GET_SUB_WARD_BY_WARD, variables: { uid: wardUid$ } },
        labelKey: 'name',
        valueKey: 'uid',
      },
    },
    {
      key: 'supervisorUserUid',
      label: 'Select Supervisor',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: {
        mapFunction: (d: any) => ({ label: `${d.firstName} ${d.lastName}`, value: d.uid }),

        fetchParameter: {
          queryFieldsKeys: ['firstName', 'lastName', 'uid'],
          query: LIST_USERS_PAGEABLE_,
          pageableParam: { page: 0, size: 10000 },
          variables: { active: true },
          searchStates: {},
        },
      },
    },
  ];
  return fields;
};

export function plantUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: Plant) => {
      const subWardUid = data?.subWard?.uid;
      const wardUid = data?.subWard?.ward?.uid;
      const districtUid = data?.subWard?.ward?.district?.uid;
      const regionUid = data?.subWard?.ward?.district?.region?.uid;

      if (regionUid) regionUid$.next(regionUid);
      if (districtUid) districtUid$.next(districtUid);
      if (wardUid) wardUid$.next(wardUid);

      const formParameter: FormParameters = {
        model: {
          ...data,
          supervisorUserUid: data?.supervisorUser?.uid,
          subWardUid,
          wardUid,
          districtUid,
          regionUid,
        },
        title: 'Plant',
        fields: getPlantFormFields(comp),
        closeAction$: plant$,

        onSubmit: async (value: any) => {
          console.log(value);
          await comp.fs.fetch({
            notify: true,
            variables: { input: value },
            mutation: SAVE_PLANT,
            successFn: (res) => plant$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('Plant'),
  };
}

export function plantViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Plant',
    click: (data: Plant) => navigateRelativeTo(comp, 'plants', data?.uid),
    permissions: [],
  };
}

export function plantDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: Plant) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        query: DELETE_PLANT,
        successFn: (res) => plant$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('Plant', 'name'),
    permissions: [],
  };
}

export function plantTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [plantViewBtn(comp), plantUpsertBtn(comp), plantDeleteBtn(comp)],
    },
  ];
}
