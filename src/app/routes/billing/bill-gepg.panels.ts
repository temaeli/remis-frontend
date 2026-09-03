import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';

import { GEPG_TRAIL_OF_BILL_HEADER } from './bill-gepg.graphql';

/**
 * A bill header's conversations with GePG, one tab per flow.
 *
 * Shared by the two screens a header can be looked at from: the bill, where the
 * header is nested under the bill being read, and the bill header record
 * itself. Both show the same four conversations, because both are looking at
 * the same header — GePG issues a control number against a header, not a bill.
 *
 * Four tabs rather than one per table. The fourteen tables behind these are the
 * schema's shape, not a reader's: someone looking at a header asks what
 * happened when we cancelled it, not which of three tables holds the answer.
 */

/**
 * What a trail row shows. `payload` is deliberately absent: a signed GePG body
 * is thousands of characters and would make every row unreadable — it stays on
 * the record it came from, for anyone who needs it.
 */
export const GEPG_TRAIL_COLUMNS: GridKeyColumn[] = [
  'index',
  { field: 'occurredAt', header: 'When' },
  { field: 'step', header: 'Step' },
  { field: 'reference', header: 'Reference' },
  { field: 'summary', header: 'What Happened' },
];

/** Buttons to hang on a flow's tab, keyed by flow. */
export interface GepgFlowActions {
  reuse?: ActionButton[];
}

/**
 * The four tabs for one bill header.
 *
 * @param billHeaderUid the header GePG issues numbers against
 * @param actions       buttons belonging to a particular flow, where the screen
 *                      has any — the bill screen puts the reuse action here,
 *                      since that is where someone stands when they look at
 *                      what has been reused and decide to do it again
 */
export function gepgFlowPanels(
  billHeaderUid?: string,
  actions: GepgFlowActions = {},
): ContentParameter[] {
  const tab = (
    name: string,
    icon: string,
    flow: string,
    actionButtons?: ActionButton[],
  ): ContentParameter => ({
    type: 'table',
    name,
    label: name,
    icon,
    keyColumns: GEPG_TRAIL_COLUMNS,
    actionButtons,
    noContentLabel: 'Nothing has passed between this bill and GePG here yet',
    fetchParameter: {
      query: GEPG_TRAIL_OF_BILL_HEADER,
      variables: { billHeaderUid, flow },
    },
  });

  return [
    tab('Control Number', 'numbers', 'CONTROL_NUMBER'),
    tab('Reuse', 'loop_alt', 'CONTROL_NUMBER_REUSE', actions.reuse),
    tab('Expiry Change', 'changebill', 'BILL_CHANGE'),
    tab('Cancellation', 'cancel', 'CANCELLATION'),
  ];
}
