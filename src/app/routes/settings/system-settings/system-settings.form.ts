import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import {
  SAVE_SYSTEM_SETTING,
  DELETE_SYSTEM_SETTING,
  CLEAR_DASHBOARD_CACHES,
} from './system-settings.graphql';
import { SystemSetting } from './system-settings.interface';

// Listener for all System Setting actions
export const systemSetting$ = new Subject<SystemSetting | any>();

export const getSystemSettingFormFields = (): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'settingKey',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
    disabled: true,
  },
  {
    key: 'settingValue',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'category',
    type: FieldType.input,
    validations: [],
    disabled: true,
  },
  {
    key: 'defaultValue',
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'valueType',
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'description',
    type: FieldType.textarea,
    validations: [],
    class: 'col-span-full',
  },
];

export function systemSettingUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: SystemSetting) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'System Setting',
        fields: getSystemSettingFormFields(),
        closeAction$: systemSetting$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: SAVE_SYSTEM_SETTING,
            successFn: (res) => systemSetting$.next(res?.data),
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: [],
    ...getUpsertBtnProps('System Setting'),
  };
}

export function systemSettingViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View System Setting',
    click: (data: SystemSetting) => navigateRelativeTo(comp, 'system-settings', data?.uid),
    permissions: [],
  };
}

export function systemSettingDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data: SystemSetting) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: DELETE_SYSTEM_SETTING,
        finalFn: (res) => systemSetting$.next(res?.data),
      });
    },
    ...getDeleteBtnProps('System Setting', 'settingKey'),
    permissions: [],
  };
}

export function systemClearCachesBtn(comp: BaseComponent): ActionButton {
  return {
    click: async () => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        mutation: CLEAR_DASHBOARD_CACHES,
        finalFn: () => systemSetting$.next(null),
      });
    },
    icon: 'refresh',
    label: 'Clear Caches',
    confirmDataMapper: () => ({
      title: 'CLEAR CACHES',
      confirmButtonColor: 'primary',
      confirmText: 'CLEAR',
      message: 'Are you sure you want to clear all dashboard caches? This action cannot be undone.',
    }),
    permissions: [],
  };
}

export function systemSettingTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        systemSettingViewBtn(comp),
        systemSettingUpsertBtn(comp),
        systemSettingDeleteBtn(comp),
      ],
    },
  ];
}
