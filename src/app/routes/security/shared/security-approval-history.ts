// Shared workflow timeline (approvalHistory) helpers for the Security module.
// `approvalHistory(subjectType, subjectUid)` returns the lifecycle timeline for
// any workflow-bearing subject and is rendered as a read-only table tab on the
// entity detail views.

import { gql } from 'apollo-angular';
import { ContentParameter } from '@shared/components/view-component/view-interface';

/** subjectType values accepted by `approvalHistory`. */
export const SECURITY_SUBJECT = {
  INCIDENT: 'SECURITY_INCIDENT',
  INVESTIGATION: 'SECURITY_INVESTIGATION',
  FORM_SUBMISSION: 'SECURITY_FORM_SUBMISSION',
  GUARD_ROSTER: 'SECURITY_GUARD_ROSTER',
  GATE_PASS: 'SECURITY_GATE_PASS',
  INTELLIGENCE: 'SECURITY_INTELLIGENCE',
  VETTING: 'SECURITY_VETTING',
} as const;

export const APPROVAL_HISTORY = gql`
  query approvalHistory($subjectType: String, $subjectUid: String) {
    approvalHistory(subjectType: $subjectType, subjectUid: $subjectUid) {
      uid
      stage
      action
      comments
      actedAt
      actorUser {
        firstName
        lastName
        fullName
      }
    }
  }
`;

/**
 * Builds the "Approval History" timeline tab for a detail view. Returns
 * undefined-safe content that lists each workflow action with its actor.
 */
export function approvalHistoryContent(
  subjectType: string,
  subjectUid?: string | null,
): ContentParameter {
  return {
    type: 'table',
    name: 'Approval History',
    label: 'Approval History',
    icon: 'history',
    keyColumns: [
      {
        field: 'stage',
        valueFn: (row) => row?.stage?.replace(/_/g, ' ') || row?.stage,
      },
      'action',
      'comments',
      'actorName',
      'actedAt',
    ],
    isPageable: false,
    mapFunction: (row: any) => ({
      ...row,
      actorName:
        row?.actorUser?.fullName ??
        [row?.actorUser?.firstName, row?.actorUser?.lastName].filter(Boolean).join(' '),
    }),
    fetchParameter: {
      query: APPROVAL_HISTORY,
      variables: { subjectType, subjectUid },
    },
  };
}
