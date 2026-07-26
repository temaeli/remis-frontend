import { Subject } from 'rxjs';
import { Validators } from '@angular/forms';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import { LIST_ALL_ROLES } from '../../users-managment/roles/role.graphql';
import {
  CREATE_OR_UPDATE_REPORT_ACTOR,
  DELETE_REPORT_ACTOR,
  FIND_REPORT_ACTOR,
} from './report-actor.graphql';

export const reportActor$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_MANAGE_REPORT_ACTORS'];
const DELETE_PERMS = ['ROLE_DELETE_REPORT_ACTORS'];

// Mirror of backend ReportStageEnum (PREPARE/VALIDATE/ENDORSE/APPROVE).
export enum ReportStageEnum {
  PREPARE = 'PREPARE',
  VALIDATE = 'VALIDATE',
  ENDORSE = 'ENDORSE',
  APPROVE = 'APPROVE',
}

export function reportStageLabel(value?: string | null): string {
  if (!value) return '';
  return value.charAt(0) + value.slice(1).toLowerCase();
}

// Flat permission list of the logged-in user, as written by auth.service.
// Mirrors HasPermissionDirective's robust parse (handles the legacy
// doubly-encoded value).
function readUserPermissions(): string[] {
  const raw = localStorage.getItem('perms');
  if (!raw) return [];
  try {
    let parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

// Frontend approximation of the backend's canActOnReport: the current user may
// act on a report's current stage if they hold every permission granted by the
// stage's assigned-actor role. A real actor (who is assigned that role) always
// satisfies this; a user who merely overlaps may still be rejected by the
// backend, which is the authoritative check. Returns true when the role exposes
// no permissions (cannot determine — defer to the backend).
export function canActOnCurrentStage(report: any): boolean {
  const needed: string[] = (report?.currentStage?.assignedTo?.role?.permissionList ?? [])
    .map((p: any) => p?.name)
    .filter(Boolean);
  if (!needed.length) return true;
  const mine = readUserPermissions();
  return needed.every((p) => mine.includes(p));
}

function getReportActorFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'roleUid',
      label: 'Role',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
      optionsVariables: {
        fetchParameter: { query: LIST_ALL_ROLES, variables: { active: true } },
        mapFunction: (option: any) => ({
          ...option,
          label: option.name?.replace(/_/g, ' '),
          value: option.uid,
        }),
      },
    },
    {
      key: 'action',
      label: 'Stage',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      options: Object.values(ReportStageEnum).map((s) => ({
        label: reportStageLabel(s),
        value: s,
      })),
    },
    {
      key: 'sequence',
      label: 'Sequence',
      type: FieldType.number,
      min: 1,
      validations: [
        VALIDATOR_REQUIRED,
        { name: 'min', message: 'Sequence must be 1 or greater', validator: Validators.min(1) },
      ],
    },
  ];
}

export function reportActorUpsertBtn(comp: BaseComponent, templateUid: string): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({ query: FIND_REPORT_ACTOR, variables: { uid: data.uid } })
        : null;
      const seed = fresh ?? data;
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...(seed ?? {}), roleUid: seed?.role?.uid ?? seed?.roleUid },
        title: 'Report Actor',
        fields: getReportActorFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { templateUid, input: value },
            mutation: CREATE_OR_UPDATE_REPORT_ACTOR,
            successFn: (res) => {
              reportActor$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Actor'),
  };
}

export function reportActorDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Actor'),
    permissions: DELETE_PERMS,
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_REPORT_ACTOR,
        variables: { uid: data.uid },
        successFn: () => reportActor$.next(null),
      });
    },
  };
}

export function reportActorTableBtns(comp: BaseComponent, templateUid: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [reportActorUpsertBtn(comp, templateUid), reportActorDeleteBtn(comp)],
    },
  ];
}
