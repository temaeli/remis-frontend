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

/**
 * One bill read against another — `readings_readings`.
 *
 * Both ends are bill headers, not readings: the table is named after readings
 * but its two foreign keys point at `bill_headers`, and the constraints are
 * what the database enforces. A metered bill is read against the one before
 * it, which is what a parent and a child of this shape says.
 *
 * Shown from both ends of the same bill's page: what it was read from, and what
 * has been read against it.
 */

/** Notifies both panels that a link was made or removed. */
export const readingLink$ = new Subject<unknown>();

const billFields = `
  uid
  parent {
    id
    assignedNumber
    name
  }
  child {
    id
    assignedNumber
    name
  }
`;

const READINGS_BY_PARENT = gql`
  query readingsByParent($parentUid: String) {
    readingsByParent(parentUid: $parentUid) {
      ${billFields}
    }
  }
`;

const READINGS_BY_CHILD = gql`
  query readingsByChild($childUid: String) {
    readingsByChild(childUid: $childUid) {
      ${billFields}
    }
  }
`;

const LINK_READING = gql`
  mutation linkReading($parentUid: String, $childUid: String) {
    linkReading(parentUid: $parentUid, childUid: $childUid) {
      ${responseGqlFields(billFields)}
    }
  }
`;

const UNLINK_READING = gql`
  mutation unlinkReading($uid: String) {
    unlinkReading(uid: $uid) {
      ${responseGqlFields(billFields)}
    }
  }
`;

const ALL_BILL_HEADERS = gql`
  query allBillHeaders {
    allBillHeaders {
      id
      assignedNumber
      name
    }
  }
`;

const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_READING_LINK', 'ROLE_VIEW_READING_LINK'];
const WRITE_PERMISSIONS = ['ROLE_CREATE_READING_LINK', 'ROLE_UPDATE_READING_LINK'];
const DELETE_PERMISSIONS = ['ROLE_DELETE_READING_LINK'];

/** The bill's number, falling back to its name when it has none. */
const billLabel = (bill: any): string => bill?.assignedNumber ?? bill?.name ?? '';

/**
 * One button for both ends.
 *
 * On "Read From" the bill on the page is the child and the other bill is the
 * parent; on "Read Against" it is the other way round. Whichever end the panel
 * is on comes from the page and is never asked for.
 */
function linkBtn(comp: BaseComponent, fixed: { parentUid?: string; childUid?: string }): ActionButton {
  const choosingChild = !!fixed.parentUid;
  return {
    icon: 'add',
    label: choosingChild ? 'Read Another Bill Against This' : 'Read This From Another Bill',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: choosingChild ? 'Read Against This Bill' : 'Read From Another Bill',
        fields: [
          {
            key: choosingChild ? 'childUid' : 'parentUid',
            label: choosingChild ? 'Bill To Read Against This' : 'Bill This Is Read From',
            type: FieldType.select,
            optionsVariables: {
              valueKey: 'id',
              fetchParameter: { query: ALL_BILL_HEADERS },
              mapFunction: (option: any) => ({
                ...option,
                label: billLabel(option),
                value: option.id,
              }),
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...fixed, ...value },
            mutation: LINK_READING,
            successFn: (res) => {
              readingLink$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: WRITE_PERMISSIONS,
  };
}

function unlinkBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'block',
    label: 'Remove',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'Remove Reading Link',
      confirmText: 'REMOVE',
      confirmButtonColor: 'red',
      message: `Stop reading <b class='text-danger'>${billLabel(
        row?.child,
      )}</b> against <b class='text-danger'>${billLabel(row?.parent)}</b>?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: UNLINK_READING,
        successFn: (res) => readingLink$.next(res?.data),
      });
    },
    permissions: DELETE_PERMISSIONS,
  };
}

/** The bills read against this one, and the bills this one was read from. */
export const readingLinkPanels = (
  comp: BaseComponent,
  billHeaderUid?: string,
): ContentParameter[] => [
  {
    type: 'table',
    name: 'Read Against This',
    label: 'Read Against This',
    icon: 'meter',
    permissions: VIEW_PERMISSIONS,
    keyColumns: [
      'index',
      { field: 'child', header: 'Bill', valueFn: (row: any) => billLabel(row?.child) },
      { field: 'childName', header: 'Name', valueFn: (row: any) => row?.child?.name },
      'actions',
    ],
    headerButtons: [linkBtn(comp, { parentUid: billHeaderUid })],
    actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp)] }],
    reloadActions$: [readingLink$],
    fetchParameter: { query: READINGS_BY_PARENT, variables: { parentUid: billHeaderUid } },
  },
  {
    type: 'table',
    name: 'Read From',
    label: 'Read From',
    icon: 'meter',
    permissions: VIEW_PERMISSIONS,
    keyColumns: [
      'index',
      { field: 'parent', header: 'Bill', valueFn: (row: any) => billLabel(row?.parent) },
      { field: 'parentName', header: 'Name', valueFn: (row: any) => row?.parent?.name },
      'actions',
    ],
    headerButtons: [linkBtn(comp, { childUid: billHeaderUid })],
    actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp)] }],
    reloadActions$: [readingLink$],
    fetchParameter: { query: READINGS_BY_CHILD, variables: { childUid: billHeaderUid } },
  },
];
