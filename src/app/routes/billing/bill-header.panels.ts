import { BaseComponent } from '@shared/components/base-componet/base-component';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';

import {
  BILLS_OF_BILL_HEADER,
  REUSES_OF_BILL_HEADER,
  STATUSES_OF_BILL_HEADER,
} from './bill-header.graphql';
import { BILL_VIEW_PERMISSIONS, billViewBtnFrom } from './bill.form';
import { PAYMENTS_OF_BILL_HEADER } from './payment.graphql';
import { PAYMENT_VIEW_PERMISSIONS, paymentViewBtnFrom } from './payment.form';

/**
 * Everything that hangs off a bill header, as tabs on the header's screen.
 *
 * Eighteen tables carry a `bill_headers_id`. Fourteen of them are the GePG
 * conversation and are read as four flows by `gepgFlowPanels`; one is the
 * organisations link, which `entityLinkPanels` already builds. These are the
 * remaining four — the bills raised under the header, what has been paid
 * against it, where it has got to, and the control numbers recorded as reused —
 * so that opening a header shows every record that names it.
 *
 * Read-only, all four. A bill is written by the raise screen, a payment by a
 * GePG callback, a status by the flow that advanced it; none of them is
 * something to add from here.
 */

/** The bills raised under this header. Mirrors the columns of the bills list. */
const BILL_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Bill Id',
  'name',
  'tinData.assignedNumber as TIN',
  'currency.name as Currency',
  { field: 'generatedAt', header: 'Generated' },
  { field: 'expiredAt', header: 'Expires' },
  'actions',
];

/**
 * Payments reported against this header.
 *
 * GePG reports a payment against `payment_headers.bill_headers_id`, so the
 * header is where they actually belong — the bill screen shows the same list by
 * resolving its header first.
 */
const PAYMENT_COLUMNS: GridKeyColumn[] = [
  'index',
  'customerControlNumber as Control Number',
  'grpBillId as Group Bill Id',
  'entryCount as Transactions',
  { field: 'createdAt', header: 'Received' },
  'actions',
];

/**
 * Where the header has got to.
 *
 * Two columns and no more: `name` and `description` on these rows are generated
 * from the header and the status to satisfy a UNIQUE constraint, so showing
 * them would repeat the status back in longer words.
 */
const STATUS_COLUMNS: GridKeyColumn[] = [
  'index',
  { field: 'createdAt', header: 'When' },
  'status as Status',
];

const REUSE_COLUMNS: GridKeyColumn[] = [
  'index',
  'controlNumber as Control Number',
  'assignedCode as Assigned Code',
  'reason',
  { field: 'createdAt', header: 'Recorded' },
];

/**
 * The four tabs for one bill header.
 *
 * @param comp          the screen they are rendered on — the row actions
 *                      navigate from it
 * @param billHeaderUid the header being looked at
 */
export function billHeaderRecordPanels(
  comp: BaseComponent,
  billHeaderUid?: string,
): ContentParameter[] {
  return [
    {
      type: 'table',
      name: 'Bills',
      label: 'Bills',
      icon: 'bill',
      permissions: BILL_VIEW_PERMISSIONS,
      keyColumns: BILL_COLUMNS,
      actionButtons: [billViewBtnFrom(comp)],
      noContentLabel: 'No bill has been raised under this header yet',
      fetchParameter: { query: BILLS_OF_BILL_HEADER, variables: { billHeaderUid } },
    },
    {
      type: 'table',
      name: 'Payments',
      label: 'Payments',
      icon: 'coins',
      permissions: PAYMENT_VIEW_PERMISSIONS,
      keyColumns: PAYMENT_COLUMNS,
      actionButtons: [paymentViewBtnFrom(comp)],
      noContentLabel: 'Nothing has been paid against this header yet',
      fetchParameter: { query: PAYMENTS_OF_BILL_HEADER, variables: { billHeaderUid } },
    },
    {
      type: 'table',
      name: 'Status History',
      label: 'Status History',
      icon: 'history',
      keyColumns: STATUS_COLUMNS,
      noContentLabel: 'This header has not been through the GePG flow yet',
      fetchParameter: { query: STATUSES_OF_BILL_HEADER, variables: { billHeaderUid } },
    },
    {
      type: 'table',
      name: 'Re-use Records',
      label: 'Re-use Records',
      icon: 'refresh',
      permissions: ['ROLE_VIEW_ALL_REUSE', 'ROLE_VIEW_REUSE'],
      keyColumns: REUSE_COLUMNS,
      noContentLabel: 'No control number of this header has been recorded as reused',
      fetchParameter: { query: REUSES_OF_BILL_HEADER, variables: { billHeaderUid } },
    },
  ];
}
