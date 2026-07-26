// Shared approval history helpers for the Plant Nomination module.
// Returns the lifecycle timeline for plant nomination workflow
// and is rendered as a read-only table tab on the plant nomination detail views.

import { gql } from 'apollo-angular';
import { ContentParameter } from '@shared/components/view-component/view-interface';

/** Subject type for plant nomination approval history */
export const PLANT_NOMINATION_SUBJECT = {
  PLANT_NOMINATION: 'PLANT_NOMINATION',
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
 * Builds the "Approval History" timeline tab for a plant nomination detail view. Returns
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
