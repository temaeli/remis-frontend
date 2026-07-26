import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType, FormStepper } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  CrudHost,
  buildRejectBtn,
  canSubmit,
  crudHostFromBase,
  defineEntityCrud,
  lookupOptions,
} from '@shared/crud';
import { incidentTypeLookupProvider } from '../incident-types/incident-type.provider';
import { workingStationLookupProvider } from '@routes/pipeline-management/working-stations/working-station.provider';
import {
  APPROVE_REPORTED_INCIDENT,
  DELETE_INCIDENT,
  MARK_INCIDENT_AS_REVIEWED,
  REJECT_REPORTED_INCIDENT,
  REPORT_INCIDENT,
  SUBMIT_REPORTED_INCIDENT,
  UPDATE_INCIDENT,
} from './incident.graphql';
import { Incident } from './incident.interface';
import { ProcessStatus } from '@shared/crud';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

// Maps a user's role name (SRS / seeded) → BE IncidentActorEnum stage.
// A user with any of these roles may act when the incident's currentActor.actor
// equals the mapped value. ADMIN / SUPER_ADMIN bypass and see the button at any stage.
const ROLE_TO_INCIDENT_ACTOR: Record<string, string> = {
  GASCO_STAFF: 'STAFF',
  EMPLOYEE: 'STAFF',
  SHIFT_SUPERVISOR: 'SHIFT_SUPERVISOR',
  HSE_OFFICER: 'HSE_OFFICER',
  MANAGER: 'MANAGER',
  HEAD_OF_DEPARTMENT: 'MANAGER',
  PIPELINE_MANAGER: 'MANAGER',
  PLANT_MANAGER: 'MANAGER',
  DISTRIBUTION_MANAGER: 'MANAGER',
  GENERAL_MANAGER: 'GENERAL_MANAGER',
};

function readUsername(): string | undefined {
  const raw = localStorage.getItem('username');
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'string' ? parsed : undefined;
  } catch {
    return typeof raw === 'string' ? raw : undefined;
  }
}

export function canActOnIncident(row: any): boolean {
  if (!row) return false;
  const roles = HasPermissionDirective.readUserRoles();
  if (roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN')) return true;

  const stage = row?.currentActor?.actor;
  if (stage && roles.some((r) => ROLE_TO_INCIDENT_ACTOR[r] === stage)) return true;

  const status = row?.status;
  const editableDraft = !status || status === ProcessStatus.DRAFT || status === ProcessStatus.ROLLED_BACK;
  const atStaffStage = !stage || stage === 'STAFF';
  const me = readUsername();
  if (editableDraft && atStaffStage && me && row?.createdBy?.username === me) return true;

  return false;
}

export function getIncidentFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'incidentTypeUid',
      label: 'Incident Type',
      type: FieldType.select,
      optionsVariables: lookupOptions(incidentTypeLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'workStationUid',
      label: 'Working Station',
      type: FieldType.select,
      optionsVariables: lookupOptions(workingStationLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'reportedBy',
      label: 'Reported By',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'location',
      label: 'Location',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'timeHappened',
      label: 'Time Happened',
      type: FieldType.dateTime,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
    {
      key: 'immediateCause',
      label: 'Immediate Cause',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'detailedDescription',
      label: 'Detailed Description',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'immediateActionTaken',
      label: 'Immediate Action Taken',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'rootCause',
      label: 'Root Cause',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'proposedActionToPreventReoccurrence',
      label: 'Proposed Action to Prevent Reoccurrence',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

function getIncidentFormSteppers(): FormStepper[] {
  return [
    {
      name: 'Classification',
      icon: 'category',
      keys: ['uid', 'incidentTypeUid', 'workStationUid'],
    },
    {
      name: 'Event Details',
      icon: 'event',
      keys: ['timeHappened', 'location', 'reportedBy', 'immediateCause'],
    },
    {
      name: 'Narrative',
      icon: 'description',
      keys: [
        'detailedDescription',
        'immediateActionTaken',
        'rootCause',
        'proposedActionToPreventReoccurrence',
      ],
    },
  ];
}

const incidentCrud = defineEntityCrud<Incident>({
  name: 'Incident',
  routeSlug: 'incidents',
  fields: getIncidentFormFields(),
  formSteppers: getIncidentFormSteppers(),
  linearSteppers: false,
  modalWidth: '60%',
  mutations: {
    create: REPORT_INCIDENT,
    update: UPDATE_INCIDENT,
    delete: DELETE_INCIDENT,
  },
  permissions: {
    manage: ['ROLE_REPORT_INCIDENT', 'ROLE_UPDATE_INCIDENT'],
    delete: ['ROLE_DELETE_INCIDENT'],
    view: ['ROLE_VIEW_INCIDENT'],
  },
  statusGate: { delete: true },
  upsertShow: (row) => canActOnIncident(row),
  deleteShow: (row) => canActOnIncident(row),
  modelMapper: (data?: Incident) => ({
    ...(data ?? {}),
    incidentTypeUid: data?.incidentType?.uid,
    workStationUid: (data as any)?.workStation?.uid,
  }),
  upsertVariables: (value) => {
    const payload: any = { ...value };
    return { input: payload };
  },
});

export const incident$ = incidentCrud.reload$;

export const incidentUpsertBtn = (comp: BaseComponent): ActionButton =>
  incidentCrud.upsertBtn(crudHostFromBase(comp));

export const incidentDeleteBtn = (comp: BaseComponent): ActionButton =>
  incidentCrud.deleteBtn(crudHostFromBase(comp));

function buildSubmitBtn(host: CrudHost): ActionButton {
  return {
    icon: 'send',
    label: 'Initiate',
    color: 'primary',
    toolTip: 'Initiate Incident',
    permissions: ['ROLE_REPORT_INCIDENT', 'ROLE_UPDATE_INCIDENT'],
    showFunction: (row: any) => canSubmit(row) && row?.currentActor?.actor === 'STAFF',
    confirmDataMapper: () => ({
      title: 'Initiate Incident',
      message: 'Are you sure you want to initiate this incident report?',
      confirmText: 'Initiate',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: SUBMIT_REPORTED_INCIDENT,
        variables: { incidentUid: data.uid },
        successFn: () => incident$.next(null),
      });
    },
  };
}

const APPROVE_LABEL_BY_ACTOR: Record<string, string> = {
  SHIFT_SUPERVISOR: 'Review',
  HSE_OFFICER: 'Submit',
  MANAGER: 'Endorse',
  GENERAL_MANAGER: 'Approve',
};

function approveLabel(row: any): string {
  return APPROVE_LABEL_BY_ACTOR[row?.currentActor?.actor] ?? 'Approve';
}

// Incidents can bounce back and forth across stages; the row's PENDING
// currentActor is the reliable signal for approve/reject availability,
// not the top-level status (which flips SUBMITTED ↔ ROLLED_BACK).
function isPendingActorStage(row: any): boolean {
  return row?.currentActor?.status === 'PENDING' && row?.currentActor?.actor !== 'STAFF';
}

function buildApproveBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Approve',
    labelMapper: (row: any) => approveLabel(row),
    color: 'primary',
    toolTip: 'Approve Incident',
    toolTipMapper: (row: any) => `${approveLabel(row)} Incident`,
    permissions: ['ROLE_APPROVE_REPORTED_INCIDENT'],
    showFunction: (row: any) => isPendingActorStage(row) && canActOnIncident(row),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: {},
        title: `${approveLabel(data)} Incident: ` + (data.immediateCause ?? ''),
        fields: [
          {
            key: 'comment',
            label: 'Comment',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: APPROVE_REPORTED_INCIDENT,
            variables: { incidentUid: data.uid, comment: value?.comment },
            successFn: () => {
              incident$.next(null);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '40%');
    },
  };
}

export const incidentSubmitBtn = (comp: BaseComponent): ActionButton =>
  buildSubmitBtn(crudHostFromBase(comp));

export const incidentApproveBtn = (comp: BaseComponent): ActionButton =>
  buildApproveBtn(crudHostFromBase(comp));

export const incidentRejectBtn = (comp: BaseComponent): ActionButton =>
  buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_REPORTED_INCIDENT,
    entityLabel: 'Incident',
    permission: 'ROLE_APPROVE_REPORTED_INCIDENT',
    onSuccess: () => incident$.next(null),
    uidKey: 'incidentUid',
    statusPredicate: (row) => isPendingActorStage(row),
    extraShow: (row) => canActOnIncident(row),
  });

function buildReviewedBtn(host: CrudHost): ActionButton {
  return {
    icon: 'check_circle',
    label: 'Mark Reviewed',
    color: 'primary',
    toolTip: 'Mark Incident as Reviewed',
    permissions: ['ROLE_REVIEW_INCIDENT'],
    showFunction: (row: any) => row?.status === ProcessStatus.APPROVED && !row?.reviewedAt,
    confirmDataMapper: () => ({
      title: 'Mark Incident as Reviewed',
      message: 'Confirm this incident has been reviewed?',
      confirmText: 'Mark Reviewed',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      host.fetch({
        notify: true,
        mutation: MARK_INCIDENT_AS_REVIEWED,
        variables: { incidentUid: data.uid },
        successFn: () => incident$.next(null),
      });
    },
  };
}

export const incidentReviewedBtn = (comp: BaseComponent): ActionButton =>
  buildReviewedBtn(crudHostFromBase(comp));

export const incidentTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return incidentCrud.tableBtns(host);
};
