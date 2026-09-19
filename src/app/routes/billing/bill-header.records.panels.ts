import { DocumentNode } from '@apollo/client/core';

import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';

import {
  ACKNOWLEDGEMENTS_OF_BILL_HEADER,
  CANCELLATION_REASONS_OF_BILL_HEADER,
  CANCELLATION_REQUESTS_OF_BILL_HEADER,
  CANCELLATION_RESPONSES_OF_BILL_HEADER,
  CANCELLATION_RESPONSE_PAYLOADS_OF_BILL_HEADER,
  CHANGE_REQUESTS_OF_BILL_HEADER,
  CHANGE_REQUEST_PAYLOADS_OF_BILL_HEADER,
  CONTROL_NUMBERS_OF_BILL_HEADER,
  CONTROL_NUMBER_REQUESTS_OF_BILL_HEADER,
  EXPIRY_DATES_OF_BILL_HEADER,
  EXPIRY_EXTENSIONS_OF_BILL_HEADER,
  FINAL_RESPONSES_OF_BILL_HEADER,
  REUSE_REASONS_OF_BILL_HEADER,
  REUSE_REQUESTS_OF_BILL_HEADER,
} from './bill-header.records.graphql';

/**
 * A tab per GePG table the header owns — thirteen of them.
 *
 * The four flow tabs next door answer what happened, in order, across the
 * tables of one operation. These answer the other question: what does the row
 * itself say. A cancellation response has a status, a status code and a
 * description that the trail flattens into one line of summary, and someone
 * checking why GePG refused a cancellation needs all three.
 *
 * Read-only, every one. Each row is written by a flow or by a callback, so
 * there is nothing here to add or correct by hand.
 *
 * Grouped in flow order — submission, reuse, expiry change, cancellation — so
 * the tab strip reads in the order a bill's life runs, matching the flow tabs
 * beside it.
 */

/**
 * A signed GePG body is thousands of characters and would make a row
 * unreadable. Shown as the first line's worth so a reader can tell one from
 * another; the whole body is on the record.
 */
const payloadColumn = (header = 'Payload'): GridKeyColumn => ({
  field: 'payload',
  header,
  maxWidth: '320px',
  class: 'truncate',
  valueFn: (row) => {
    const body: string = row?.payload ?? '';
    return body.length > 120 ? `${body.slice(0, 120)}…` : body;
  },
});

/** Who asked for something and when, on the tables that record it. */
const REQUESTED_COLUMNS: GridKeyColumn[] = [
  { field: 'requestedAt', header: 'Requested' },
  { field: 'requestedBy', header: 'Requested By', valueFn: (row) => row?.requestedBy?.name },
];

const CONTROL_NUMBER_REQUEST_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'name',
  ...REQUESTED_COLUMNS,
  payloadColumn('Sent'),
];

const ACKNOWLEDGEMENT_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedCode as Code',
  { field: 'name', header: 'Operation' },
  { field: 'createdAt', header: 'Received' },
  payloadColumn('Body'),
];

const FINAL_RESPONSE_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'name',
  { field: 'gepgCode', header: 'GePG Code' },
  { field: 'respondedAt', header: 'Answered' },
  payloadColumn('Body'),
];

const CONTROL_NUMBER_COLUMNS: GridKeyColumn[] = [
  'index',
  'controlNumber as Control Number',
  'billId as Bill Id',
  'resultStatus as Status',
  'resultStatusCode as Code',
  'resultStatusDescription as Description',
  { field: 'createdAt', header: 'Issued' },
];

const REUSE_REASON_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'reason',
  { field: 'reuse', header: 'Control Number', valueFn: (row) => row?.reuse?.controlNumber },
  ...REQUESTED_COLUMNS,
];

const REUSE_REQUEST_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'name',
  { field: 'reuseReason', header: 'Reason', valueFn: (row) => row?.reuseReason?.reason },
  ...REQUESTED_COLUMNS,
  payloadColumn('Sent'),
];

const CHANGE_REQUEST_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'updateReason as Reason',
  { field: 'latestExpiryDate', header: 'New Expiry' },
  ...REQUESTED_COLUMNS,
];

const CHANGE_REQUEST_PAYLOAD_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedCode as Code',
  'name',
  {
    field: 'changeRequest',
    header: 'Request',
    valueFn: (row) => row?.changeRequest?.assignedNumber,
  },
  { field: 'createdAt', header: 'Sent' },
  payloadColumn('Body'),
];

const EXPIRY_EXTENSION_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'name',
  { field: 'createdAt', header: 'Answered' },
  payloadColumn('Body'),
];

// The date itself, not a body: billexprdt keeps one row per accepted change, so
// reading down this column is the sequence of dates the bill has held.
const EXPIRY_DATE_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  { field: 'expiryDate', header: 'Expires' },
  { field: 'createdAt', header: 'Filed' },
];

const CANCELLATION_REASON_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'reason',
  'cancelledControlNumber as Control Number',
  ...REQUESTED_COLUMNS,
  { field: 'approvedAt', header: 'Approved' },
  { field: 'cancelledAt', header: 'Cancelled' },
];

const CANCELLATION_REQUEST_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedNumber as Reference',
  'name',
  { field: 'cancellationReason', header: 'Reason', valueFn: (row) => row?.cancellationReason?.reason },
  ...REQUESTED_COLUMNS,
  payloadColumn('Sent'),
];

const CANCELLATION_RESPONSE_COLUMNS: GridKeyColumn[] = [
  'index',
  'responseId as Response Id',
  'requestId as Request Id',
  'groupBillId as Group Bill Id',
  'cancellationStatus as Status',
  'cancellationStatusCode as Code',
  'cancellationStatusDescription as Description',
  { field: 'createdAt', header: 'Received' },
];

const CANCELLATION_RESPONSE_PAYLOAD_COLUMNS: GridKeyColumn[] = [
  'index',
  'assignedCode as Code',
  'name',
  { field: 'createdAt', header: 'Received' },
  payloadColumn('Body'),
];

/**
 * The thirteen record tabs for one bill header.
 *
 * @param billHeaderUid the header GePG issues numbers against
 */
export function billHeaderGepgRecordPanels(billHeaderUid?: string): ContentParameter[] {
  const tab = (
    name: string,
    icon: string,
    keyColumns: GridKeyColumn[],
    query: DocumentNode,
    noContentLabel: string,
  ): ContentParameter => ({
    type: 'table',
    name,
    label: name,
    icon,
    keyColumns,
    noContentLabel,
    fetchParameter: { query, variables: { billHeaderUid } },
  });

  return [
    tab(
      'Control Number Requests',
      'numbers',
      CONTROL_NUMBER_REQUEST_COLUMNS,
      CONTROL_NUMBER_REQUESTS_OF_BILL_HEADER,
      'Nothing has been sent to ask for a control number',
    ),
    tab(
      'Acknowledgements',
      'check_circle',
      ACKNOWLEDGEMENT_COLUMNS,
      ACKNOWLEDGEMENTS_OF_BILL_HEADER,
      'GePG has not acknowledged anything on this header',
    ),
    tab(
      'Final Responses',
      'inbox',
      FINAL_RESPONSE_COLUMNS,
      FINAL_RESPONSES_OF_BILL_HEADER,
      'No control number answer has come back yet',
    ),
    tab(
      'Control Numbers',
      'numbers',
      CONTROL_NUMBER_COLUMNS,
      CONTROL_NUMBERS_OF_BILL_HEADER,
      'This header holds no control number yet',
    ),
    tab(
      'Reuse Reasons',
      'loop_alt',
      REUSE_REASON_COLUMNS,
      REUSE_REASONS_OF_BILL_HEADER,
      'No reuse has been asked for on this header',
    ),
    tab(
      'Reuse Requests',
      'loop_alt',
      REUSE_REQUEST_COLUMNS,
      REUSE_REQUESTS_OF_BILL_HEADER,
      'Nothing has been sent to reuse a control number',
    ),
    tab(
      'Change Requests',
      'changebill',
      CHANGE_REQUEST_COLUMNS,
      CHANGE_REQUESTS_OF_BILL_HEADER,
      'No change of expiry date has been asked for',
    ),
    tab(
      'Change Payloads',
      'changebill',
      CHANGE_REQUEST_PAYLOAD_COLUMNS,
      CHANGE_REQUEST_PAYLOADS_OF_BILL_HEADER,
      'No change request body has been recorded',
    ),
    tab(
      'Expiry Extensions',
      'schedule',
      EXPIRY_EXTENSION_COLUMNS,
      EXPIRY_EXTENSIONS_OF_BILL_HEADER,
      'GePG has not answered a change of expiry date',
    ),
    tab(
      'Expiry Dates',
      'schedule',
      EXPIRY_DATE_COLUMNS,
      EXPIRY_DATES_OF_BILL_HEADER,
      'This bill has not been moved to a new expiry date',
    ),
    tab(
      'Cancellation Reasons',
      'cancel',
      CANCELLATION_REASON_COLUMNS,
      CANCELLATION_REASONS_OF_BILL_HEADER,
      'No cancellation has been asked for on this header',
    ),
    tab(
      'Cancellation Requests',
      'cancel',
      CANCELLATION_REQUEST_COLUMNS,
      CANCELLATION_REQUESTS_OF_BILL_HEADER,
      'Nothing has been sent to cancel a control number',
    ),
    tab(
      'Cancellation Responses',
      'inbox',
      CANCELLATION_RESPONSE_COLUMNS,
      CANCELLATION_RESPONSES_OF_BILL_HEADER,
      'GePG has not answered a cancellation',
    ),
    tab(
      'Cancellation Payloads',
      'inbox',
      CANCELLATION_RESPONSE_PAYLOAD_COLUMNS,
      CANCELLATION_RESPONSE_PAYLOADS_OF_BILL_HEADER,
      'No cancellation answer body has been recorded',
    ),
  ];
}
