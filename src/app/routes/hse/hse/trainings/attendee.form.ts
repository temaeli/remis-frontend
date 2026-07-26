import { Subject } from 'rxjs';
import { gql } from 'apollo-angular';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { SearchOperationType } from '@shared/fetch/fetch.interface';
import { pageGqlFields } from '@shared/fetch/graphql.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import {
  CREATE_OR_UPDATE_HSE_TRAINING_ATTENDEE,
  DELETE_HSE_TRAINING_ATTENDEE,
  GET_HSE_TRAINING_ATTENDEE_BY_UID,
} from './training.graphql';
import { HseTrainingAttendeeDtoInput } from './training.interface';

export const hseTrainingAttendee$ = new Subject<any>();

enum AttendeeType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

const STAFF_ORG = 'GASCO';

// Local User query — needs designation.title + email for auto-fill,
// which the shared GET_ALL_USERS_PAGEABLE (uid + fullName only) omits.
const GET_INTERNAL_STAFF_PICKER = gql`
  query getAllUsersPageable($pageableParam: PageableParamInput, $active: Boolean) {
    getAllUsersPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(`
        uid
        fullName
        firstName
        middleName
        lastName
        email
        phoneNumber
        designation { title }
      `)}
    }
  }
`;

const STAFF_PICKER_FETCH = {
  query: GET_INTERNAL_STAFF_PICKER,
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

function buildStaffName(user: any): string {
  if (!user) return '';
  const composed = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return composed || user.fullName || user.username || '';
}

export function getAttendeeFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'attendeeType',
      label: 'Attendee Type',
      type: FieldType.select,
      class: 'col-span-full',
      ignoreOnSubmit: true,
      validations: [VALIDATOR_REQUIRED],
      options: [
        { label: 'Internal Staff', value: AttendeeType.INTERNAL },
        { label: 'External', value: AttendeeType.EXTERNAL },
      ] as any,
    },
    {
      key: 'staffUid',
      label: 'Staff',
      type: FieldType.select,
      showWhen: [{ key: 'attendeeType', checker: (v: any) => v === AttendeeType.INTERNAL }],
      validations: [VALIDATOR_REQUIRED],
      optionsVariables: {
        fetchParameter: STAFF_PICKER_FETCH,
        labelKey: 'fullName',
        valueKey: 'uid',
      },
      onChange: (_value: any, form: any, _field: any, user?: any) => {
        if (!user) return;
        form?.get('name')?.setValue(buildStaffName(user));
        form?.get('contact')?.setValue(user.email ?? user.phoneNumber ?? '');
        form?.get('designation')?.setValue(user.designation?.title ?? '');
        form?.get('organization')?.setValue(STAFF_ORG);
        // section left blank — no field on User entity
      },
    },
    {
      key: 'name',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'contact',
      label: 'Contact',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'designation',
      label: 'Designation',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'section',
      label: 'Section',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'organization',
      label: 'Organization',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

export function hseTrainingAttendeeUpsertBtn(
  comp: BaseComponent,
  trainingUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_HSE_TRAINING_ATTENDEE_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const seed = fresh ?? data;
      const seedStaffUid = seed?.staff?.uid ?? seed?.staffUid;
      const model = {
        ...seed,
        staffUid: seedStaffUid,
        attendeeType: seedStaffUid ? AttendeeType.INTERNAL : AttendeeType.EXTERNAL,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model,
        title: 'Training Attendee',
        fields: getAttendeeFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          // attendeeType is `ignoreOnSubmit: true` and is stripped from `value`
          // before this callback runs — cannot gate on it. Any truthy staffUid
          // means the user picked Internal Staff (staffUid is only visible +
          // fillable in that branch), so send it whenever present.
          const payload: HseTrainingAttendeeDtoInput = {
            uid: value.uid,
            name: value.name,
            contact: value.contact,
            designation: value.designation,
            section: value.section,
            organization: value.organization,
          };
          if (value.staffUid) payload.staffUid = value.staffUid;
          await comp.fs.fetch({
            notify: true,
            variables: { trainingUid, input: payload },
            mutation: CREATE_OR_UPDATE_HSE_TRAINING_ATTENDEE,
            successFn: (res) => {
              hseTrainingAttendee$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: ['ROLE_SCHEDULE_HSE_TRAINING'],
    ...getUpsertBtnProps('Attendee'),
  };
}

export function hseTrainingAttendeeDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Attendee'),
    permissions: ['ROLE_DELETE_HSE_TRAINING'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_HSE_TRAINING_ATTENDEE,
        variables: { uid: data.uid },
        successFn: () => hseTrainingAttendee$.next(null),
      });
    },
  };
}

export function hseTrainingAttendeeTableBtns(
  comp: BaseComponent,
  trainingUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        hseTrainingAttendeeUpsertBtn(comp, trainingUid),
        hseTrainingAttendeeDeleteBtn(comp),
      ],
    },
  ];
}
