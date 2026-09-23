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
 * One reading read against another — `readings_readings`.
 *
 * A meter is read against its last reading: the consumption is the difference
 * between the two. The chain is a table rather than a `previous_id` column
 * because the same reading can be the starting point of more than one
 * calculation.
 *
 * Shown from both ends of the same reading's page: what it was read from, and
 * what has been read against it.
 */

/** Notifies both panels that a link was made or removed. */
export const readingLink$ = new Subject<unknown>();

/**
 * A reading has no name of its own worth showing — it is a figure and a date —
 * so both sides are listed by what was read, when, and on which connection.
 */
const readingFields = `
  uid
  parent {
    id
    assignedNumber
    readings
    readAt
    connection {
      id
      name
    }
  }
  child {
    id
    assignedNumber
    readings
    readAt
    connection {
      id
      name
    }
  }
`;

const READINGS_BY_PARENT = gql`
  query readingsByParent($parentUid: String) {
    readingsByParent(parentUid: $parentUid) {
      ${readingFields}
    }
  }
`;

const READINGS_BY_CHILD = gql`
  query readingsByChild($childUid: String) {
    readingsByChild(childUid: $childUid) {
      ${readingFields}
    }
  }
`;

const LINK_READING = gql`
  mutation linkReading($parentUid: String, $childUid: String) {
    linkReading(parentUid: $parentUid, childUid: $childUid) {
      ${responseGqlFields(readingFields)}
    }
  }
`;

const UNLINK_READING = gql`
  mutation unlinkReading($uid: String) {
    unlinkReading(uid: $uid) {
      ${responseGqlFields(readingFields)}
    }
  }
`;

const ALL_READINGS = gql`
  query allReadings {
    allReadings {
      id
      assignedNumber
      readings
      readAt
      connection {
        id
        name
      }
    }
  }
`;

const VIEW_PERMISSIONS = ['ROLE_VIEW_ALL_READING_LINK', 'ROLE_VIEW_READING_LINK'];
const WRITE_PERMISSIONS = ['ROLE_CREATE_READING_LINK', 'ROLE_UPDATE_READING_LINK'];
const DELETE_PERMISSIONS = ['ROLE_DELETE_READING_LINK'];

/** What was read and when, which is how one reading is told from another. */
const readingLabel = (reading: any): string => {
  if (!reading) return '';
  const on = reading.connection?.name;
  const at = reading.readAt ? ` on ${String(reading.readAt).slice(0, 16).replace('T', ' ')}` : '';
  return `${on ? on + ' — ' : ''}${reading.readings ?? ''}${at}`.trim();
};

/**
 * One button for both ends.
 *
 * On "Read From" the bill on the page is the child and the other bill is the
 * parent; on "Read Against" it is the other way round. Whichever end the panel
 * is on comes from the page and is never asked for.
 */
function linkBtn(
  comp: BaseComponent,
  fixed: { parentUid?: string; childUid?: string },
): ActionButton {
  const choosingChild = !!fixed.parentUid;
  return {
    icon: 'add',
    label: choosingChild ? 'Read Another Against This' : 'Read This From Another',
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: choosingChild ? 'Read Against This Reading' : 'Read From Another Reading',
        fields: [
          {
            key: choosingChild ? 'childUid' : 'parentUid',
            label: choosingChild ? 'Reading To Read Against This' : 'Reading This Is Read From',
            type: FieldType.select,
            optionsVariables: {
              valueKey: 'id',
              fetchParameter: { query: ALL_READINGS },
              mapFunction: (option: any) => ({
                ...option,
                label: readingLabel(option),
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
      message: `Stop reading <b class='text-danger'>${readingLabel(
        row?.child,
      )}</b> against <b class='text-danger'>${readingLabel(row?.parent)}</b>?`,
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

/** The readings read against this one, and the readings it was read from. */
export const readingLinkPanels = (comp: BaseComponent, readingUid?: string): ContentParameter[] => [
  {
    type: 'table',
    name: 'Read Against This',
    label: 'Read Against This',
    icon: 'shutter_speed',
    permissions: VIEW_PERMISSIONS,
    keyColumns: [
      'index',
      { field: 'child', header: 'Reading', valueFn: (row: any) => readingLabel(row?.child) },
      'actions',
    ],
    headerButtons: [linkBtn(comp, { parentUid: readingUid })],
    actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp)] }],
    reloadActions$: [readingLink$],
    fetchParameter: { query: READINGS_BY_PARENT, variables: { parentUid: readingUid } },
  },
  {
    type: 'table',
    name: 'Read From',
    label: 'Read From',
    icon: 'shutter_speed',
    permissions: VIEW_PERMISSIONS,
    keyColumns: [
      'index',
      { field: 'parent', header: 'Reading', valueFn: (row: any) => readingLabel(row?.parent) },
      'actions',
    ],
    headerButtons: [linkBtn(comp, { childUid: readingUid })],
    actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp)] }],
    reloadActions$: [readingLink$],
    fetchParameter: { query: READINGS_BY_CHILD, variables: { childUid: readingUid } },
  },
];
