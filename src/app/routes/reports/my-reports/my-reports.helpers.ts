import { ProcessStatus, deriveStatus } from '@shared/crud';
import {
  canActOnCurrentStage,
  reportStageLabel,
} from 'app/routes/settings/report-template/report-actor.form';

// A report is "mine" when I created it.
export function isCreatedByMe(row: any, myUid?: string): boolean {
  return !!myUid && row?.createdBy?.uid === myUid;
}

// A report is awaiting MY action when either:
//  - it is SUBMITTED and I can act on its current stage (approver queue), or
//  - it is a DRAFT / ROLLED_BACK report I created and must (re)submit.
// The backend remains the authoritative check; canActOnCurrentStage is a
// role-permission-overlap approximation (see report-actor.form).
export function isAwaiting(row: any, myUid?: string): boolean {
  const status = deriveStatus(row);
  if (status === ProcessStatus.SUBMITTED) return canActOnCurrentStage(row);
  if (status === ProcessStatus.DRAFT || status === ProcessStatus.ROLLED_BACK) {
    return isCreatedByMe(row, myUid);
  }
  return false;
}

export interface ActionChip {
  label: string;
  class: string;
}

const PILL = 'px-2 py-0.5 rounded-full text-xs font-medium ';

// The "Next action" guidance chip shown per awaiting row.
export function nextActionChip(row: any, myUid?: string): ActionChip | null {
  const status = deriveStatus(row);
  if (status === ProcessStatus.SUBMITTED && canActOnCurrentStage(row)) {
    return { label: 'Decision', class: PILL + 'bg-blue-100 text-blue-700' };
  }
  if (status === ProcessStatus.ROLLED_BACK && isCreatedByMe(row, myUid)) {
    return { label: 'Fix & resubmit', class: PILL + 'bg-amber-100 text-amber-700' };
  }
  if (status === ProcessStatus.DRAFT && isCreatedByMe(row, myUid)) {
    return { label: 'Submit', class: PILL + 'bg-gray-100 text-gray-600' };
  }
  return null;
}

// "Role · Stage" label for the current pending stage, e.g. "Pipeline Manager · Approve".
export function currentStageLabel(row: any): string {
  const assignedTo = row?.currentStage?.assignedTo;
  if (!assignedTo) return '';
  const role = assignedTo?.role?.name?.replace(/_/g, ' ') ?? '';
  const action = reportStageLabel(assignedTo?.action);
  return [role, action].filter(Boolean).join(' · ');
}
