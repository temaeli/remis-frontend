// Shared approval history helpers for the Gas Sales Agreement module.
// Returns the lifecycle timeline for GSA workflow
// and is rendered as a read-only table tab on the GSA addendum detail views.

import { gql } from 'apollo-angular';
import { ContentParameter } from '@shared/components/view-component/view-interface';

/** Subject type for GSA approval history */
export const GSA_SUBJECT = {
  GAS_SALES_AGREEMENT: 'GAS_SALES_AGREEMENT',
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
 * Builds the "Approval History" timeline tab for a GSA detail view. Returns
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
