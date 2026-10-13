import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ACTIVATE_OR_DEACTIVATE_ROLE, CREATE_OR_UPDATE_ROLE } from './role.graphql';
import { Role } from './role.interface';
import {
  getDisplayName,
  getUpsertBtnProps,
  navigateRelativeTo,
} from '@shared/components/view-component/view.helpers';
import { DetailsComponent } from '@shared/components/details/details.component';
import { DetailsParameter } from '@shared/components/details/details.interface';

// Listener for all Role actions
export const role$ = new Subject<Role | any>();

export const getRoleFormFields = (comp: BaseComponent): FieldConfig[] => [
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
    key: 'description',
    type: FieldType.textarea,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
  {
    // Every role ticked here is given to anyone who registers themselves on
    // the portal. Roles for an account an administrator creates are still
    // chosen by hand, ticked or not.
    key: 'external',
    label: 'External role',
    hint: 'Given automatically to everyone who registers themselves on the portal',
    type: FieldType.checkbox,
    class: 'col-span-full',
    validations: [],
  },
];

export function roleUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: (data?: Role) => {
      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Role',
        fields: getRoleFormFields(comp),
        closeAction$: role$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { roleDto: value },
            mutation: CREATE_OR_UPDATE_ROLE,
            successFn: (res) => role$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    ...getUpsertBtnProps('Role'),
    permissions: [],
  };
}

export function roleActivateBtn(comp: BaseComponent): ActionButton {
  return {
    label: 'Activate / Deactivate',
    iconMapper: (data: Role) => (data?.active ? 'toggle_off' : 'toggle_on'),
    labelMapper: (data: Role) => (data?.active ? 'Deactivate Role' : 'Activate Role'),
    confirmDataMapper: (data: Role) => ({
      title: data?.active ? 'Deactivate Role' : 'Activate Role',
      message: `Are you sure you want to ${data?.active ? 'deactivate' : 'activate'} <b>${data?.name ?? ''}</b>?`,
      confirmText: data?.active ? 'Deactivate' : 'Activate',
      confirmButtonColor: data?.active ? 'red' : 'primary',
    }),
    click: async (data: Role) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { roleUid: data.uid },
        mutation: ACTIVATE_OR_DEACTIVATE_ROLE,
        successFn: (res) => role$.next(res?.data),
      });
    },
    permissions: ['ROLE_UPDATE_ROLE', 'ROLE_CREATE_ROLE'],
  };
}

export function roleAssignPermissionsBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 's-give',
    label: 'Assign Permissions',
    click: (data: Role) => navigateRelativeTo(comp, 'roles', data?.uid),
    permissions: ['ROLE_ASSIGN_PERMISSIONS_TO_ROLE'],
  };
}

export function roleViewPermissionsBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'list',
    label: 'View Permissions',
    click: (data: Role) => {
      const dialogData: DetailsParameter = {
        entity: data,
        showHeader: true,
        showFirstGroupHeader: false,
        visibleKeys: ['permissionList'],
        title: `${getDisplayName(data.name ?? '')} Permissions`,
      };

      comp.vs?.openModal(DetailsComponent, dialogData, '96%', 'auto', { maxWidth: '840px' });
    },
    permissions: ['ROLE_VIEW_ROLE'],
  };
}

export function roleTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        roleViewPermissionsBtn(comp),
        roleUpsertBtn(comp),
        roleActivateBtn(comp),
        roleAssignPermissionsBtn(comp),
      ],
    },
  ];
}
