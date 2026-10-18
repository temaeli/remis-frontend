import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/* ------------------------------------------------------------------ *
 * Locking a unit — `units_locks`.
 *
 * A lock runs from the start given (now, if left empty) for the length of the
 * chosen Unit Lock Duration (`units_locks_seconds`). A unit holds one active
 * lock at a time, and a lock is released only once it has run out — the
 * backend says so before the database's trigger would. A lock that has run out
 * is released by itself when the unit is locked again.
 * ------------------------------------------------------------------ */

/** Notifies the panel that a lock was taken or released. */
const unitLock$ = new Subject<unknown>();

const unitLockGqlFields = `
  uid
  locked
  lockedFrom
  lockedTo
`;

const UNIT_LOCKS = gql`
  query unitLocksByUnit($unitUid: String) {
    unitLocksByUnit(unitUid: $unitUid) {
      ${unitLockGqlFields}
    }
  }
`;

const LOCK_DURATIONS = gql`
  query allUnitLockDurations {
    allUnitLockDurations {
      id
      name
      seconds
    }
  }
`;

const LOCK_UNIT = gql`
  mutation lockUnit($unitUid: String, $unitLockDurationUid: String, $lockedFrom: LocalDateTime) {
    lockUnit(unitUid: $unitUid, unitLockDurationUid: $unitLockDurationUid, lockedFrom: $lockedFrom) {
      ${responseGqlFields(unitLockGqlFields)}
    }
  }
`;

const UNLOCK_UNIT = gql`
  mutation unlockUnit($uid: String) {
    unlockUnit(uid: $uid) {
      ${responseGqlFields(unitLockGqlFields)}
    }
  }
`;

const PERMISSION = 'UNIT_LOCK';

/** The form's date-time as the backend's LocalDateTime takes it, in local time. */
const toLocalDateTime = (value?: string | Date): string | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const pad = (part: number) => `${part}`.padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

function lockUnitBtn(comp: BaseComponent, unitUid: string | undefined): ActionButton {
  return {
    icon: 'lock',
    label: 'Lock Unit',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: 'Lock Unit',
        fields: [
          {
            key: 'unitLockDurationUid',
            label: 'Lock Duration',
            hint: 'How long the lock lasts. Set up under Reference Data, Unit Lock Durations',
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: LOCK_DURATIONS },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          {
            key: 'lockedFrom',
            label: 'Locked From',
            hint: 'Leave empty to lock from now',
            type: FieldType.dateTime,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: { unitLockDurationUid?: string; lockedFrom?: string | Date }) => {
          await comp.fs.fetch({
            notify: true,
            variables: {
              unitUid,
              unitLockDurationUid: value?.unitLockDurationUid,
              lockedFrom: toLocalDateTime(value?.lockedFrom),
            },
            mutation: LOCK_UNIT,
            successFn: (res) => {
              unitLock$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: [`ROLE_CREATE_${PERMISSION}`, `ROLE_UPDATE_${PERMISSION}`],
  };
}

function unlockUnitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'lock_open',
    label: 'Unlock',
    class: 'text-danger',
    confirmDataMapper: () => ({
      title: 'Unlock Unit',
      confirmText: 'UNLOCK',
      confirmButtonColor: 'red',
      message: 'Release this lock? A lock can only be released once it has run out.',
    }),
    click: async (row: { uid?: string }) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: UNLOCK_UNIT,
        successFn: (res) => unitLock$.next(res?.data),
      });
    },
    permissions: [`ROLE_UPDATE_${PERMISSION}`, `ROLE_DELETE_${PERMISSION}`],
  };
}

/** A unit's locks, newest first, for its detail page. */
export const unitLocksPanel = (comp: BaseComponent, unitUid?: string): ContentParameter => ({
  type: 'table',
  name: 'Locks',
  label: 'Locks',
  icon: 'lock',
  permissions: [`ROLE_VIEW_ALL_${PERMISSION}`, `ROLE_VIEW_${PERMISSION}`],
  keyColumns: [
    'index',
    { field: 'locked', header: 'Locked' },
    { field: 'lockedFrom', header: 'From' },
    { field: 'lockedTo', header: 'Until' },
    'actions',
  ],
  headerButtons: [lockUnitBtn(comp, unitUid)],
  actionButtons: [{ ...MORE_BTN, buttons: [unlockUnitBtn(comp)] }],
  reloadActions$: [unitLock$],
  fetchParameter: { query: UNIT_LOCKS, variables: { unitUid } },
});
