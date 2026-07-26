/**
 * Single source of truth for the pipeline-management workflow state machine.
 * Replaces the per-entity duplicates: IncidentStatus, ProcessStatus@reading,
 * ProcessStatusEnum@report. Predicates are pure so they can be used directly
 * inside ActionButton showFunction / disabledFunction.
 */

export enum ProcessStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ROLLED_BACK = 'ROLLED_BACK',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export type StatusBearing = { status?: ProcessStatus | string | null } | null | undefined;

export function isStatus(row: StatusBearing, ...statuses: ProcessStatus[]): boolean {
  if (!row) return false;
  return statuses.includes(row.status as ProcessStatus);
}

export const canSubmit = (row: StatusBearing) =>
  isStatus(row, ProcessStatus.DRAFT, ProcessStatus.ROLLED_BACK);

export const canApprove = (row: StatusBearing) => isStatus(row, ProcessStatus.SUBMITTED);

export const canReject = (row: StatusBearing) => isStatus(row, ProcessStatus.SUBMITTED);

// "edit" includes the create case (no status yet), DRAFT rows, and ROLLED_BACK
// rows (reject-rewind returns the row to a pre-submitted, editable state).
export const canEdit = (row: StatusBearing) =>
  !row?.status || isStatus(row, ProcessStatus.DRAFT, ProcessStatus.ROLLED_BACK);

export const canDelete = (row: StatusBearing) =>
  isStatus(row, ProcessStatus.DRAFT, ProcessStatus.ROLLED_BACK);

export const canRegenerate = (row: StatusBearing) =>
  isStatus(row, ProcessStatus.DRAFT, ProcessStatus.ROLLED_BACK);

export const canExport = (row: StatusBearing) => isStatus(row, ProcessStatus.COMPLETED);

export const canView = (row: StatusBearing) =>
  isStatus(row, ProcessStatus.APPROVED, ProcessStatus.COMPLETED);

export const canCancel = (row: StatusBearing) =>
  isStatus(row, ProcessStatus.DRAFT, ProcessStatus.SUBMITTED);

/**
 * Derive ProcessStatus from `submittedAt` / `approvedAt` timestamps for entities
 * (PowerGeneratorRefuel, PowerGeneratorOperation) where the backend does not
 * expose a `status` field. `approvedAt` set → APPROVED, `submittedAt` set →
 * SUBMITTED, otherwise DRAFT (assuming the row exists, i.e. has a uid).
 */
/**
 * Resolve a row's ProcessStatus from whichever signal the backend exposes:
 * an explicit `status` field (Incident, Report, Pipeline) takes precedence;
 * otherwise we derive from the approval/reject/submit timestamps.
 */
export function deriveStatus(row: any): ProcessStatus | undefined {
  return (row?.status as ProcessStatus) ?? processStatusFromTimestamps(row);
}

export function processStatusFromTimestamps(row: any): ProcessStatus | undefined {
  if (!row?.uid) return undefined;
  if (row.approvedAt) return ProcessStatus.APPROVED;
  if (row.rejectedAt) return ProcessStatus.REJECTED;
  if (row.submittedAt) return ProcessStatus.SUBMITTED;
  return ProcessStatus.DRAFT;
}
