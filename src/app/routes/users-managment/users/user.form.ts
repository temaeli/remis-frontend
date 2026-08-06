import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRED,
  VALIDATOR_TANZINIA_PHONE,
} from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { Validators } from '@angular/forms';
import {
  ACTIVATE_USER,
  ASSIGN_ROLES_TO_USER,
  CHANGE_PASSWORD,
  CREATE_USER,
  RESET_USER_PWD,
  UNLOCK_USER,
} from './user.graphql';
import { LIST_ALL_ROLES } from '../roles/role.graphql';
import { UserAccount } from './user.interface';
import {
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import { getDisplayName } from '@core/helpers/view.helpers';
import { ALL_DESIGNATIONS } from '@routes/settings/designations/designations.graphql';

// Listener for all User actions
export const user$ = new Subject<UserAccount | any>();

export const getUserFormFields = (comp: BaseComponent): FieldConfig[] => [
  {
    key: 'uid',
    type: FieldType.input,
    visible: false,
  },
  {
    key: 'firstName',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'middleName',
    type: FieldType.input,
    validations: [],
  },
  {
    key: 'lastName',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED],
  },
  {
    key: 'nationalId',
    type: FieldType.input,
    inputType: 'number',
    validations: [],
  },
  {
    key: 'email',
    type: FieldType.input,
    validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
    class: 'col-span-full',
  },
  {
    key: 'phoneNumber',
    type: FieldType.input,
    validations: [VALIDATOR_TANZINIA_PHONE],
    class: 'col-span-full',
  },

  {
    key: 'roleUidList',
    label: 'Roles',
    type: FieldType.multiple_select,
    class: 'col-span-full',
    validations: [],
    optionsVariables: {
      fetchParameter: { query: LIST_ALL_ROLES, variables: { active: true } },
      mapFunction: (option: any) => ({
        ...option,
        label: getDisplayName(option.name),
        value: option.uid,
      }),
    },
  },
  {
    key: 'isStaff',
    type: FieldType.checkbox,
    value: true,
    visible: false,
    validations: [],
  },
  {
    key: 'designationUid',
    type: FieldType.select,
    // Pinned to uid: Designation lives in uaa and has one, and the backend
    // resolves this field with findByUid. mapOptions now defaults to `id`.
    optionsVariables: { valueKey: 'uid', fetchParameter: { query: ALL_DESIGNATIONS } },
    class: 'col-span-full',
    showWhen: [{ key: 'isStaff' }],
    validations: [],
  },
];

export function userUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: UserAccount) => {
      const formParameter: FormParameters = {
        // The form still submits the flat names UserDto expects, but the record
        // carries them on bioData, under different names. Seed them across, or an
        // edit opens blank and saves the blanks back over the person record.
        model: {
          ...data,
          firstName: data?.bioData?.firstName,
          middleName: data?.bioData?.secondName,
          lastName: data?.bioData?.thirdName,
          nationalId: data?.bioData?.nin,
          phoneNumber:
            data?.bioData?.mobileNumber != null ? String(data.bioData.mobileNumber) : undefined,
        },
        title: 'User',
        fields: getUserFormFields(comp),
        closeAction$: user$,

        onSubmit: async (value: any) => {
          const userDto = {
            ...value,
            phoneNumber: value.phoneNumber ? String(value.phoneNumber) : undefined,
            nationalId: value.nationalId ? String(value.nationalId) : undefined,
          };

          await comp.fs.fetch({
            notify: true,
            variables: { userDto },
            mutation: CREATE_USER,
            successFn: (res) => user$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    ...getUpsertBtnProps('User'),
    permissions: [],
  };
}

export function userViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View User',
    click: (data: UserAccount) => navigateRelativeTo(comp, 'users', data?.uid),
    permissions: ['ROLE_VIEW_USER'],
  };
}

export function userActivateBtn(comp: BaseComponent): ActionButton {
  return {
    label: 'Activate / Deactivate',
    iconMapper: (data: UserAccount) => (data?.active ? 'toggle_off' : 'toggle_on'),
    labelMapper: (data: UserAccount) => (data?.active ? 'Deactivate User' : 'Activate User'),
    confirmDataMapper: (data: UserAccount) => ({
      title: data?.active ? 'Deactivate User' : 'Activate User',
      message: `Are you sure you want to ${data?.active ? 'deactivate' : 'activate'} <b>${data?.bioData?.firstName ?? ''} ${data?.bioData?.thirdName ?? ''}</b>?`,
      confirmText: data?.active ? 'Deactivate' : 'Activate',
      confirmButtonColor: data?.active ? 'red' : 'primary',
    }),
    click: async (data: UserAccount) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: ACTIVATE_USER,
        successFn: (res) => user$.next(res?.data),
      });
    },
    permissions: ['ROLE_UPDATE_USER', 'ROLE_CREATE_USER'],
  };
}

export function userUnlockBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'lock_open',
    label: 'Unlock User',
    hideFunction: (data: UserAccount) => !!data?.accountNonLocked,
    confirmDataMapper: (data: UserAccount) => ({
      title: 'Unlock User',
      message: `Are you sure you want to unlock <b>${data?.bioData?.firstName ?? ''} ${data?.bioData?.thirdName ?? ''}</b>?`,
      confirmText: 'Unlock',
      confirmButtonColor: 'primary',
    }),
    click: async (data: UserAccount) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: UNLOCK_USER,
        successFn: (res) => user$.next(res?.data),
      });
    },
    permissions: ['ROLE_UPDATE_USER', 'ROLE_CREATE_USER'],
  };
}

export function userResetPasswordBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'password_reset',
    label: 'Reset Password',
    confirmDataMapper: (data: UserAccount) => ({
      title: 'Reset Password',
      message: `Are you sure you want to reset the password for <b>${data?.bioData?.firstName ?? ''} ${data?.bioData?.thirdName ?? ''}</b>?`,
      confirmText: 'Reset',
      confirmButtonColor: 'red',
    }),
    click: async (data: UserAccount) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: data.uid },
        mutation: RESET_USER_PWD,
        successFn: (res) => user$.next(res?.data),
      });
    },
    permissions: ['ROLE_UPDATE_USER', 'ROLE_CREATE_USER'],
  };
}

export function userChangePasswordBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'password',
    label: 'Change Password',
    click: (data: UserAccount) => {
      const formParameter: FormParameters = {
        title: 'Change Password',
        fieldsClass: 'grid grid-cols-1 gap-4',
        closeAction$: user$,
        fields: [
          {
            key: 'previousPassword',
            label: 'Current Password',
            type: FieldType.input,
            inputType: 'password',
            class: 'col-span-full pt-1',
            placeholder: 'Enter current password',
            validations: [VALIDATOR_REQUIRED],
          },
          {
            key: 'newPassword',
            label: 'New Password',
            type: FieldType.input,
            inputType: 'password',
            class: 'col-span-full pt-1',
            placeholder: 'Enter new password',
            hint: 'At least 8 characters with uppercase, lowercase, number and special character',
            validations: [
              VALIDATOR_REQUIRED,
              {
                name: 'minlength',
                validator: Validators.minLength(8),
                message: 'Password must be at least 8 characters',
              },
              {
                name: 'pattern',
                validator: Validators.pattern(
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                ),
                message: 'Password must contain uppercase, lowercase, number and special character',
              },
            ],
            onChange: (value, form) => {
              form?.get('confirmPassword')?.updateValueAndValidity();
            },
          },
          {
            key: 'confirmPassword',
            label: 'Confirm New Password',
            type: FieldType.input,
            inputType: 'password',
            class: 'col-span-full',
            placeholder: 'Re-enter new password',
            validations: [
              VALIDATOR_REQUIRED,
              {
                name: 'passwordMatch',
                validator: (control: any) => {
                  const newPassword = control.parent?.get('newPassword')?.value;
                  return newPassword === control.value ? null : { passwordMatch: true };
                },
                message: 'Passwords do not match',
              },
            ],
          },
        ],
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: {
              uid: data.uid,
              changePasswordDto: {
                previousPassword: value.previousPassword,
                newPassword: value.newPassword,
                confirmPassword: value.confirmPassword,
              },
            },
            mutation: CHANGE_PASSWORD,
            successFn: (res) => user$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_UPDATE_USER', 'ROLE_CREATE_USER'],
  };
}

export function userAssignRolesBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'icon_roles',
    label: 'Assign Roles',
    click: (data: UserAccount) => {
      const selectedRoleIds =
        (data?.rolesList?.map((ur) => ur.role?.id).filter(Boolean) as (string | number)[]) || [];

      const formParameter: FormParameters = {
        title: 'Assign Roles',
        closeAction$: user$,
        model: {
          roleUuid: selectedRoleIds,
        },
        fields: [
          {
            key: 'roleUuid',
            label: 'Roles',
            type: FieldType.multiple_select,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
            optionsVariables: {
              fetchParameter: { query: LIST_ALL_ROLES, variables: { active: true } },
              mapFunction: (option: any) => ({
                ...option,
                label: option.name?.replace(/_/g, ' '),
                value: option.id,
              }),
            },
          },
        ],
        onSubmit: async (value: any) => {
          if (!data?.uid) return;

          const roleIds: number[] = Array.isArray(value?.roleUuid) ? value.roleUuid : [];
          if (roleIds.length === 0) return;

          await comp.fs.fetch({
            notify: true,
            variables: {
              uid: data.uid,
              userRoleListDto: {
                rolesList: roleIds.map((id: number) => ({ id })),
              },
            },
            mutation: ASSIGN_ROLES_TO_USER,
            successFn: (res) => user$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%');
    },
    permissions: ['ROLE_UPDATE_USER', 'ROLE_CREATE_USER'],
  };
}

export function userTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        userViewBtn(comp),
        userUpsertBtn(comp),
        userActivateBtn(comp),
        userUnlockBtn(comp),
        userResetPasswordBtn(comp),
        userAssignRolesBtn(comp),
      ],
    },
  ];
}
