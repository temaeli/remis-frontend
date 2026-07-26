import { Subject } from 'rxjs';
import { gql } from 'apollo-angular';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { SearchOperationType } from '@shared/fetch/fetch.interface';
import { pageGqlFields } from '@shared/fetch/graphql.constants';
import {
  ASSIGN_STATION_TO_USER,
  GET_USER_WORKSTATIONS_BY_USER,
  RELIEVE_STATION_FROM_USER,
} from './user-workstation.graphql';

export const userWorkstation$ = new Subject<any>();

// Local staff picker query — GET_ALL_USERS_PAGEABLE in plant.graphql.ts
// only fetches uid+fullName, which is enough for the picker label but
// keeps this file self-contained.
const GET_STAFF_FOR_ASSIGN_PICKER = gql`
  query getAllUsersPageable($pageableParam: PageableParamInput, $active: Boolean) {
    getAllUsersPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields('uid fullName')}
    }
  }
`;

const STAFF_PICKER_FETCH = {
  query: GET_STAFF_FOR_ASSIGN_PICKER,
  variables: {
    active: true,
    pageableParam: {
      size: 1000,
      searchFields: [
        {
          fieldName: 'isStaff',
          fieldValue: 'true',
          searchType: SearchOperationType.Equals,
        },
      ],
    },
  },
};

export function userWorkstationAssignBtn(
  comp: BaseComponent,
  stationUid: string,
  stationName?: string,
): ActionButton {
  return {
    icon: 'user_add',
    label: 'Assign User',
    color: 'primary',
    toolTip: 'Assign a user to this workstation',
    permissions: ['ROLE_MANAGE_USER_WORKSTATION'],
    click: () => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: `Assign User to ${stationName ?? 'Workstation'}`,
        fields: [
          {
            key: 'userUid',
            label: 'Staff',
            type: FieldType.select,
            validations: [VALIDATOR_REQUIRED],
            optionsVariables: {
              fetchParameter: STAFF_PICKER_FETCH,
              labelKey: 'fullName',
              valueKey: 'uid',
            },
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const userUid = value?.userUid;
          if (!userUid) return;

          // Move-confirm: if this user currently sits at ANOTHER station,
          // warn before flipping. getUserWorkstationsByUser returns full
          // history; filter current===true client-side.
          const existing: any = await comp.fs.fetch({
            query: GET_USER_WORKSTATIONS_BY_USER,
            variables: { userUid, pageableParam: { size: 100 } },
          });
          const currentRow = ((existing?.content ?? []) as any[]).find((r) => r?.current);
          if (currentRow && currentRow?.workingStation?.uid !== stationUid) {
            const otherName =
              currentRow?.workingStation?.name ?? currentRow?.workingStation?.code ?? 'another station';
            const ok = window.confirm(
              `This user is currently assigned to "${otherName}". Move them here?`,
            );
            if (!ok) return;
          }

          await comp.fs.fetch({
            notify: true,
            mutation: ASSIGN_STATION_TO_USER,
            variables: { userUid, stationUid },
            successFn: () => {
              userWorkstation$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '40%');
    },
  };
}

export function userWorkstationRelieveBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'user_remove',
    label: 'Relieve',
    color: 'warn',
    toolTip: 'Relieve this user from their current station',
    permissions: ['ROLE_MANAGE_USER_WORKSTATION'],
    showFunction: (row: any) => !!row?.current && !!row?.user?.uid,
    click: async (row: any) => {
      const userUid = row?.user?.uid;
      const userName = row?.user?.fullName ?? 'this user';
      if (!userUid) return;
      const ok = window.confirm(`Relieve ${userName} from this workstation?`);
      if (!ok) return;
      await comp.fs.fetch({
        notify: true,
        mutation: RELIEVE_STATION_FROM_USER,
        variables: { userUid },
        successFn: () => userWorkstation$.next(null),
      });
    },
  };
}

export function userWorkstationTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [userWorkstationRelieveBtn(comp)],
    },
  ];
}
