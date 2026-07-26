import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { wasteGroupLookupProvider } from '../waste-groups/waste-group.provider';
import {
  CREATE_OR_UPDATE_WASTE_CATEGORY,
  DELETE_WASTE_CATEGORY,
} from './waste-category.graphql';
import { WasteCategory } from './waste-category.interface';

export function getWasteCategoryFormFields(data?: any): FieldConfig[] {
  const groupLocked = !!data?.wasteGroupUid;
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'wasteGroupUid',
      label: 'Waste Group',
      type: FieldType.select,
      visible: !groupLocked,
      validations: [VALIDATOR_REQUIRED],
      ...(groupLocked ? {} : { optionsVariables: lookupOptions(wasteGroupLookupProvider) }),
    },
    { key: 'code', label: 'Code', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'name', label: 'Name', type: FieldType.input, validations: [VALIDATOR_REQUIRED] },
    { key: 'isRecyclable', label: 'Recyclable', type: FieldType.checkbox, validations: [] },
    {
      key: 'description',
      label: 'Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

const wasteCategoryCrud = defineEntityCrud<WasteCategory>({
  name: 'Waste Category',
  routeSlug: 'waste-categories',
  fields: (data) => getWasteCategoryFormFields(data),
  modalWidth: '50%',
  mutations: {
    create: CREATE_OR_UPDATE_WASTE_CATEGORY,
    update: CREATE_OR_UPDATE_WASTE_CATEGORY,
    delete: DELETE_WASTE_CATEGORY,
  },
  permissions: {
    manage: ['ROLE_MANAGE_WASTE_CATEGORY'],
    delete: ['ROLE_DELETE_WASTE_CATEGORY'],
    view: ['ROLE_VIEW_WASTE_CATEGORY'],
  },
  modelMapper: (data: any) => ({
    ...(data ?? {}),
    isRecyclable: data?.isRecyclable ?? data?.recyclable ?? false,
    wasteGroupUid: data?.wasteGroupUid ?? data?.wasteGroup?.uid,
  }),
  upsertVariables: (value: any) => ({
    input: {
      uid: value?.uid,
      code: value?.code,
      name: value?.name,
      description: value?.description,
      isRecyclable: !!value?.isRecyclable,
      wasteGroupUid: value?.wasteGroupUid,
    },
  }),
});

export const wasteCategory$ = wasteCategoryCrud.reload$;

export const wasteCategoryUpsertBtn = (comp: BaseComponent): ActionButton =>
  wasteCategoryCrud.upsertBtn(crudHostFromBase(comp));

export const wasteCategoryDeleteBtn = (comp: BaseComponent): ActionButton =>
  wasteCategoryCrud.deleteBtn(crudHostFromBase(comp));

export const wasteCategoryTableBtns = (comp: BaseComponent): ActionButton[] =>
  wasteCategoryCrud.tableBtns(crudHostFromBase(comp));

/**
 * Waste-category upsert button bound to a specific waste group. Seeds + hides
 * the group field so categories are created under the group being viewed.
 */
export const wasteCategoryUpsertBtnForGroup = (
  comp: BaseComponent,
  wasteGroupUid: string,
): ActionButton => {
  const base = wasteCategoryCrud.upsertBtn(crudHostFromBase(comp));
  const originalClick = base.click as (data?: any) => void;
  return {
    ...base,
    click: (data?: any) => originalClick?.({ ...(data ?? {}), wasteGroupUid }),
  };
};

export const wasteCategoryTableBtnsForGroup = (
  comp: BaseComponent,
  wasteGroupUid: string,
): ActionButton[] => [
  {
    ...MORE_BTN,
    buttons: [wasteCategoryUpsertBtnForGroup(comp, wasteGroupUid), wasteCategoryDeleteBtn(comp)],
  },
];
