import { AbstractControl, FormGroup } from '@angular/forms';
import { Decision } from '@routes/plants/hse-reports/hse-report.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { FieldType, Validator } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { addMonthsToDate, getMonthsBetween } from '@core/helpers';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { map, Subject } from 'rxjs';

function stripTime(date: any): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Validator: the field's own date must not be later than today - compliance records the past, not the future. */
export function notFutureDateValidator(message = 'Date cannot be in the future'): Validator {
  return {
    name: 'notFutureDate',
    message,
    validator: (control: AbstractControl) => {
      if (!control.value) return null;
      return stripTime(control.value) > stripTime(new Date())
        ? { notFutureDate: { message } }
        : null;
    },
  };
}

/** Validator: the field's own date must be strictly after the sibling `startKey` field's date. */
export function afterStartDateValidator(
  startKey: string,
  message = 'Date must be after the start date',
): Validator {
  return {
    name: 'afterStartDate',
    message,
    validator: (control: AbstractControl) => {
      if (!control.value) return null;
      const startValue = control.parent?.get(startKey)?.value;
      if (!startValue) return null;
      return stripTime(control.value) <= stripTime(startValue)
        ? { afterStartDate: { message } }
        : null;
    },
  };
}

/**
 * Field `onChange` handler that keeps a duration (in months) field in sync
 * whenever either of its paired start/end date fields changes, and
 * re-runs the sibling date's validators (e.g. afterStartDateValidator) so
 * a stale error clears/appears immediately instead of only on its own change.
 */
export function syncDurationInMonths(startKey: string, endKey: string, durationKey: string) {
  return (_value: any, form?: FormGroup) => {
    if (!form) return;
    const months = getMonthsBetween(form.get(startKey)?.value, form.get(endKey)?.value);
    if (months !== undefined) form.get(durationKey)?.setValue(months, { emitEvent: false });
    form.get(endKey)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  };
}

/**
 * Field `onChange` handler that derives the end date from the start date plus a
 * duration (in months) - the inverse of `syncDurationInMonths`, used where typing
 * the end date by hand is more error-prone than typing a whole-months duration.
 */
export function syncEndDateFromDuration(startKey: string, durationKey: string, endKey: string) {
  return (_value: any, form?: FormGroup) => {
    if (!form) return;
    const start = form.get(startKey)?.value;
    const duration = form.get(durationKey)?.value;
    if (!start || duration === null || duration === undefined || duration === '') return;
    form.get(endKey)?.setValue(addMonthsToDate(start, Number(duration)), { emitEvent: false });
  };
}

/** Days-until-expiry threshold matching the "3 months before" reminder notes. */
const EXPIRY_WARNING_DAYS = 90;

function daysUntil(row: any, dateFieldKey: string): number | null {
  const raw = row?.[dateFieldKey];
  if (!raw) return null;
  return Math.ceil((new Date(raw).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/**
 * A read-only "days until expiry" grid column, keyed off the given date field.
 * Frontend-only stopgap for the "3 months before expiry" reminder notes - the
 * actual email reminder needs a backend scheduled job, tracked separately.
 */
export function expiryStatusColumn(dateFieldKey: string, header = 'Expiry'): GridKeyColumn {
  return {
    field: dateFieldKey,
    header,
    valueFn: (row) => {
      const days = daysUntil(row, dateFieldKey);
      if (days === null) return '-';
      if (days < 0) return `Expired ${Math.abs(days)}d ago`;
      return `${days}d left`;
    },
    valueClassMapper: (row) => {
      const days = daysUntil(row, dateFieldKey);
      if (days === null) return '';
      if (days < 0) return 'text-danger';
      if (days <= EXPIRY_WARNING_DAYS) return 'text-warning';
      return 'text-success';
    },
  };
}

export enum ComplianceRegistrationStage {
  APPROVED = 'APPROVED',
  CM = 'CM',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  HOD = 'HOD',
  OFFICER = 'OFFICER',
}

export enum Currency {
  AED = 'AED',
  AUD = 'AUD',
  CAD = 'CAD',
  CHF = 'CHF',
  CNY = 'CNY',
  EUR = 'EUR',
  GBP = 'GBP',
  GHS = 'GHS',
  INR = 'INR',
  JPY = 'JPY',
  KES = 'KES',
  NGN = 'NGN',
  NOK = 'NOK',
  OTHER = 'OTHER',
  SEK = 'SEK',
  TZS = 'TZS',
  UGX = 'UGX',
  USD = 'USD',
  ZAR = 'ZAR',
}

const CompStage = ComplianceRegistrationStage;

export enum CompList {
  MY = 'MY',
  ALL = 'ALL',

  APPROVED = 'APPROVED',
  CM = 'CM',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  HOD = 'HOD',
  OFFICER = 'OFFICER',
}

export const processRegistration$ = new Subject<any>();

export const commonProcessRegistrationFp: Partial<FetchParameter> = {
  notify: true,
  loadingOn: 'content',
  successFn: (res) => processRegistration$.next(res?.data),
};

//OFFICER - HOD - GENERAL_MANAGER
export const CompListContents: Partial<Record<CompList, ContentParameter>> = {
  [CompList.OFFICER]: {
    type: 'table',
    slug: 'officer',
    label: 'Officer',
    title: 'Officer',
    icon: 'user',
  },

  [CompList.HOD]: {
    type: 'table',
    slug: 'legal-manager',
    label: 'Head of Legal Unit',
    title: 'Head of Legal Unit',
    icon: 'user_down',
  },

  [CompList.GENERAL_MANAGER]: {
    type: 'table',
    slug: 'general-manager',
    label: 'General Manager',
    title: 'General Manager',
    icon: 'user_settings',
  },

  [CompList.MY]: {
    type: 'table',
    slug: 'my-reports',
    label: 'My  ',
    title: 'My  ',
    icon: 'user',
  },

  [CompList.ALL]: {
    type: 'table',
    slug: 'all-reports',
    label: 'All ',
    title: 'All  ',
    icon: 'user_group',
  },
};

const badgedContentsSlugs = ['officer', 'legal-manager', 'general-manager'];

export function mapComplianceListContent(
  base: BaseComponent,
  content_: ContentParameter,
): ContentParameter {
  const fp: Partial<FetchParameter> = { loadingOn: 'content' };
  const content = { ...content_, fetchParameter: { ...fp, ...content_.fetchParameter } };

  //add badge for officer, hod and gm contents
  if (content.slug && badgedContentsSlugs.includes(content.slug)) {
    // content.fetchParameter.cacheTTL = 60 * 1000;

    content.badge = base.fs
      .fetch$(content.fetchParameter)
      .pipe(map((res: any) => res?.totalElements || 0));
  }

  return content;
}

export const StageDecisionMap: Partial<Record<CompList, Partial<Record<Decision, string>>>> = {
  [CompStage.HOD]: {
    [Decision.APPROVE]: 'Validated, Adopt for Compliance',
    [Decision.ROLLBACK]: 'Send back to Officer',
  },
  [CompStage.GENERAL_MANAGER]: {
    [Decision.APPROVE]: 'Approve',
    [Decision.ROLLBACK]: 'Send Back',
  },
};

/**
 * Maps each registration stage to the permission(s) that let a user process a
 * record currently sitting at that stage. A stage with no entry (e.g. `CM`,
 * which none of the registration types currently route through) means no one
 * may process a record at that stage - fail closed, not fail open.
 */
export type StagePermissions = Partial<Record<ComplianceRegistrationStage, string | string[]>>;

function flattenStagePermissions(stagePermissions: StagePermissions): string[] {
  return Object.values(stagePermissions).flatMap((p) => (Array.isArray(p) ? p : p ? [p] : []));
}

function hasStagePermission(
  stage: ComplianceRegistrationStage | undefined,
  stagePermissions: StagePermissions,
): boolean {
  const perms = stage ? stagePermissions[stage] : undefined;
  return !!perms && HasPermissionDirective.hasPermission(Array.isArray(perms) ? perms : [perms]);
}

export function proccessRegistrationBtn(
  comp: BaseComponent,
  onSubmit: (value: any) => any,
  stagePermissions: StagePermissions,
): ActionButton {
  return {
    icon: 'send',
    permissions: flattenStagePermissions(stagePermissions),
    labelMapper: (d: any) => (d?.stage === CompStage.OFFICER ? 'Submit' : 'Proccess'),
    showFunction: (d: any) =>
      !!d?.uid && d?.stage !== CompStage.APPROVED && hasStagePermission(d?.stage, stagePermissions),

    click: async (data: any) => {
      if (data?.stage === CompStage.OFFICER) {
        //directly submit without approval
        const msg = `Are you sure you want to submit this`;
        const value = { uid: data.uid, decision: Decision.APPROVE, comment: 'Submitted' };
        const c = await comp.notify.confirm_('Confirm', msg);
        if (c.isConfirmed) onSubmit(value);
        return;
      }

      const fp: FormParameters = {
        onSubmit,
        title: 'Approval',
        closeAction$: processRegistration$,
        model: { uid: data.uid },

        fields: [
          { key: 'uid', type: FieldType.input, visible: false },
          {
            key: 'decision',
            type: FieldType.select,
            options: Object.values(Decision).map((v) => ({
              label: StageDecisionMap[data?.stage as CompList]?.[v as Decision] ?? v,
              value: v,
            })),
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          {
            key: 'comment',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
      };

      comp.vs?.openModal(FormComponent, fp, '96%');
    },
  };
}
