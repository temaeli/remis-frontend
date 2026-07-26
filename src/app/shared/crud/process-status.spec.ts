import { describe, it, expect } from 'vitest';
import {
  ProcessStatus,
  canApprove,
  canDelete,
  canEdit,
  canRegenerate,
  canReject,
  canSubmit,
  deriveStatus,
  processStatusFromTimestamps,
} from './process-status';

describe('processStatusFromTimestamps', () => {
  it('returns REJECTED when rejectedAt is set, even if submittedAt is also set', () => {
    const row = {
      uid: 'r-1',
      submittedAt: '2026-05-21T10:00:00Z',
      rejectedAt: '2026-05-22T08:00:00Z',
    };
    expect(processStatusFromTimestamps(row)).toBe(ProcessStatus.REJECTED);
  });

  it('returns undefined when row has no uid (creation case)', () => {
    expect(processStatusFromTimestamps({})).toBeUndefined();
    expect(processStatusFromTimestamps(null)).toBeUndefined();
    expect(processStatusFromTimestamps(undefined)).toBeUndefined();
  });

  it('returns DRAFT for a row with uid but no lifecycle timestamps', () => {
    expect(processStatusFromTimestamps({ uid: 'r-1' })).toBe(ProcessStatus.DRAFT);
  });

  it('returns SUBMITTED when only submittedAt is set', () => {
    const row = { uid: 'r-1', submittedAt: '2026-05-21T10:00:00Z' };
    expect(processStatusFromTimestamps(row)).toBe(ProcessStatus.SUBMITTED);
  });

  it('returns APPROVED when approvedAt is set', () => {
    const row = {
      uid: 'r-1',
      submittedAt: '2026-05-21T10:00:00Z',
      approvedAt: '2026-05-21T12:00:00Z',
    };
    expect(processStatusFromTimestamps(row)).toBe(ProcessStatus.APPROVED);
  });
});

describe('deriveStatus', () => {
  it('prefers row.status when present (status-bearing entities like Incident)', () => {
    const row = {
      uid: 'r-1',
      status: ProcessStatus.APPROVED,
      submittedAt: '2026-05-21T10:00:00Z',
      // No approvedAt — would derive SUBMITTED from timestamps if we fell back.
    };
    expect(deriveStatus(row)).toBe(ProcessStatus.APPROVED);
  });

  it('falls back to processStatusFromTimestamps when row has no status field', () => {
    const row = { uid: 'r-1', submittedAt: '2026-05-21T10:00:00Z' };
    expect(deriveStatus(row)).toBe(ProcessStatus.SUBMITTED);
  });

  it('falls back through rejectedAt path when no status field', () => {
    const row = {
      uid: 'r-1',
      submittedAt: '2026-05-21T10:00:00Z',
      rejectedAt: '2026-05-22T08:00:00Z',
    };
    expect(deriveStatus(row)).toBe(ProcessStatus.REJECTED);
  });
});

describe('ROLLED_BACK rewind semantics', () => {
  const rolledBack = { uid: 'r-1', status: ProcessStatus.ROLLED_BACK };

  it('canSubmit accepts ROLLED_BACK (preparer can resubmit after reject-rewind)', () => {
    expect(canSubmit(rolledBack)).toBe(true);
  });

  it('canEdit accepts ROLLED_BACK (preparer can fix the rewound row)', () => {
    expect(canEdit(rolledBack)).toBe(true);
  });

  it('canDelete accepts ROLLED_BACK (preparer can discard the rewound draft)', () => {
    expect(canDelete(rolledBack)).toBe(true);
  });

  it('canRegenerate accepts ROLLED_BACK (content can be rebuilt after rewind)', () => {
    expect(canRegenerate(rolledBack)).toBe(true);
  });

  it('canApprove REJECTS ROLLED_BACK (rewound row must be resubmitted first)', () => {
    expect(canApprove(rolledBack)).toBe(false);
  });

  it('canReject REJECTS ROLLED_BACK (rewind only fires from SUBMITTED, not from another rewind)', () => {
    expect(canReject(rolledBack)).toBe(false);
  });
});
