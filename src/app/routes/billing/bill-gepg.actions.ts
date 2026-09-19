import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';

import {
  CANCEL_CONTROL_NUMBER,
  CHANGE_BILL_EXPIRY,
  REQUEST_CONTROL_NUMBER,
  REUSE_CONTROL_NUMBER,
  SEND_BILL_REUSE_REQUEST,
  SEND_BILL_CANCELLATION_REQUEST,
  SEND_BILL_CHANGE_REQUEST,
} from './bill-gepg.graphql';

/**
 * The GePG actions on a bill, as buttons.
 *
 * Everything here operates on the bill's **header**, because that is what GePG
 * issues a control number against. A header can carry more than one bill, so a
 * cancellation raised from one bill's screen retires all of them — the confirm
 * text says so rather than leaving it to be discovered.
 *
 * These are the only writes on an otherwise read-only screen. A bill's own
 * fields are still not editable: a correction is a new bill, and these change
 * what GePG knows about it, not what it says.
 */

/** Raising or amending a bill at GePG is an update to it. */
export const GEPG_ACTION_PERMISSIONS = ['ROLE_CREATE_BILL_HEADER', 'ROLE_UPDATE_BILL_HEADER'];

/** Cancelling retires the bill, so it is gated like a delete. */
export const GEPG_CANCEL_PERMISSIONS = ['ROLE_DELETE_BILL_HEADER'];

/** The bill screen, as far as this file needs it. */
type BillComp = BaseComponent & { bill?: any; reload?: () => any };

function headerUidOf(comp: BillComp): string | undefined {
  return comp.bill?.billHeader?.id;
}

/**
 * Runs one mutation and reports what GePG said.
 *
 * `notify: true` surfaces the backend's own `message`, which is the point: a
 * refusal explains itself ("Bill has no control number yet...") and an
 * acknowledgement is only an acknowledgement — the control number lands later,
 * on the callback, so the screen is reloaded rather than patched with a number
 * that is not there yet.
 */
async function runGepgAction(comp: BillComp, mutation: any, variables: any, loadingOn: string) {
  const billHeaderUid = headerUidOf(comp);
  if (!billHeaderUid) {
    comp.notify.error('This bill has no header, so GePG has nothing to act on.');
    return;
  }
  await comp.fs.fetch({
    // `mutation`, not `query`: FetchService picks the Apollo call from which of
    // the two is set, and a mutation document sent as a query is refused by
    // Apollo itself before it reaches the network.
    mutation,
    notify: true,
    loadingOn,
    variables: { billHeaderUid, ...variables },
    successFn: () => comp.reload?.(),
  });
}

/**
 * Opens a form, then runs the action with what it collected.
 *
 * GePG wants a reason on every amendment and records it against the bill, so
 * these are prompts rather than plain confirmations — a free-text box the
 * operator has to fill in, not a Yes button.
 */
function promptThen(
  comp: BaseComponent,
  form: FormParameters,
  run: (data: any, close: () => void) => any,
) {
  const ref = comp.vs?.openDialog({
    data: {
      ...form,
      fieldsClass: 'grid grid-cols-1 gap-4',
      onSubmit: (data?: any) => run(data, () => ref?.close()),
    } as FormParameters,
    component: FormComponent,
    width: '96%',
    maxWidth: '520px',
  });
}

const reasonField = (label: string, placeholder: string) => ({
  key: 'reason',
  label,
  placeholder,
  type: FieldType.textarea,
  class: 'col-span-full',
  validations: [VALIDATOR_REQUIRED],
});

/**
 * Asks GePG for a control number now.
 *
 * The only one of the four with no form: there is nothing to say about it, and
 * nothing is lost by repeating it — a bill already holding a number is refused
 * by the backend as ineligible rather than submitted twice.
 */
export function requestControlNumberBtn(comp: BillComp): ActionButton {
  return {
    icon: 'send',
    label: 'Request Control Number',
    permissions: GEPG_ACTION_PERMISSIONS,
    confirmData: {
      title: 'Request Control Number',
      message:
        'Submit this bill to GePG and ask for a control number? ' +
        'GePG acknowledges immediately; the number itself arrives shortly afterwards.',
      confirmText: 'Submit',
    },
    click: () => runGepgAction(comp, REQUEST_CONTROL_NUMBER, {}, 'gepg-request'),
  };
}

/**
 * Puts the bill's existing control number back into use.
 *
 * Not on the page header with the other three: it lives on the Reuse tab, which
 * is where someone is standing when they look at what has already been reused
 * and decide to do it again.
 */
export function reuseControlNumberBtn(comp: BillComp): ActionButton {
  return {
    icon: 'refresh',
    label: 'Reuse Control Number',
    permissions: GEPG_ACTION_PERMISSIONS,
    click: () =>
      promptThen(
        comp,
        {
          title: 'Reuse Control Number',
          subTitle: 'Puts the number this bill already holds back into use at GePG.',
          fields: [reasonField('Reason for reuse', 'Why is this control number being reused?')],
        } as FormParameters,
        async (data, close) => {
          await runGepgAction(comp, REUSE_CONTROL_NUMBER, { reason: data?.reason }, 'gepg-reuse');
          close();
        },
      ),
  };
}

/**
 * Sends a saved re-use record to GePG, from the re-uses list.
 *
 * The record already holds both things the mutation needs -- the header whose
 * number is being used again, and the reason -- so this asks for nothing and
 * confirms instead. Saving a re-use has never sent anything: the row is the
 * decision written down, and until now nothing turned it into a request except
 * opening the bill and reusing it from there.
 *
 * A row action rather than a header one. It acts on the record picked out of
 * the list, and on a list header there would be nothing saying which re-use it
 * would send.
 *
 * Sends the record's own identifier and nothing else. It used to send the bill's
 * identifier and the reason, which made the backend look up a control number on
 * the receiving bill — the one place it is not, since a re-use moves a finished
 * bill's number onto a bill that has none. Every send came back "no control
 * number to reuse".
 *
 * Repeating it is safe in the sense that matters: GePG's refusal comes back
 * here. It does not refuse a second reuse of the same number, which is the
 * point of the table.
 */
export function sendReuseToGepgBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Send Re-use to GePG',
    permissions: GEPG_ACTION_PERMISSIONS,
    // Hidden rather than disabled where there is no header: bill_headers is NOT
    // NULL on this table, so a row without one is a read that did not ask for it
    // rather than a record someone could fix.
    showFunction: (data: any) => !!data?.billHeader?.id,
    confirmDataMapper: (data?: any) => ({
      title: 'Send Re-use to GePG',
      message:
        `Ask GePG to put control number ${data?.controlNumber ?? 'this number'} back into use, ` +
        'with the reason recorded here? GePG acknowledges immediately; its answer ' +
        "arrives on the bill's own callback.",
      confirmText: 'Send',
    }),
    click: async (data?: any) => {
      await comp.fs.fetch({
        mutation: SEND_BILL_REUSE_REQUEST,
        notify: true,
        loadingOn: 'content',
        variables: { uid: data?.id },
      });
    },
  };
}

/**
 * Sends a saved expiry change to GePG, from the change requests list.
 *
 * A prompt rather than a confirmation, because the date is not on the saved
 * row: `control_number_extension_requests` records which bill and why, and the
 * date belongs to the change request written when this actually goes. So the
 * operator names it here, at the moment of sending, and the reason still comes
 * off the record rather than from the screen.
 */
export function sendChangeRequestToGepgBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Send Change to GePG',
    permissions: GEPG_ACTION_PERMISSIONS,
    click: (data?: any) =>
      promptThen(
        comp,
        {
          title: 'Send Change to GePG',
          subTitle:
            'Moves the expiry date at GePG, with the reason on this record. The control number is kept.',
          fields: [
            {
              key: 'latestExpiryDate',
              label: 'New expiry date',
              hint: 'Must be in the future — GePG refuses a date that has passed',
              type: FieldType.dateTime,
              class: 'col-span-full',
              // minDate, not min: the date-time control reads its bound off
              // minDate and ignores min, which is for a numeric input.
              minDate: new Date(),
              validations: [VALIDATOR_REQUIRED],
            },
          ],
        } as FormParameters,
        async (form, close) => {
          await comp.fs.fetch({
            mutation: SEND_BILL_CHANGE_REQUEST,
            notify: true,
            loadingOn: 'content',
            variables: { uid: data?.id, latestExpiryDate: form?.latestExpiryDate },
          });
          close();
        },
      ),
  };
}

/**
 * Sends a saved cancellation to GePG, from the cancellation requests list.
 *
 * Worded to say what it does rather than what it sends: the number stops being
 * payable and every bill under the same header goes with it. Red for the same
 * reason the button on the bill screen is — it is the least reversible thing
 * this system asks GePG for.
 */
export function sendCancellationRequestToGepgBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Send Cancellation to GePG',
    class: 'text-red-600',
    permissions: GEPG_CANCEL_PERMISSIONS,
    confirmDataMapper: (data?: any) => ({
      title: 'Send Cancellation to GePG',
      message:
        'Ask GePG to cancel this bill\'s control number, with the reason recorded here? ' +
        'The number stops being payable and every bill raised under the same header is ' +
        'cancelled with it.',
      confirmText: 'Send',
    }),
    click: async (data?: any) => {
      await comp.fs.fetch({
        mutation: SEND_BILL_CANCELLATION_REQUEST,
        notify: true,
        loadingOn: 'content',
        variables: { uid: data?.id },
      });
    },
  };
}

/**
 * Extends the bill: moves its expiry date at GePG.
 *
 * The date is required and the backend rejects one in the past, so the picker
 * is bounded at today rather than letting a request be sent to be refused.
 */
export function changeBillExpiryBtn(comp: BillComp): ActionButton {
  return {
    icon: 'calendar',
    label: 'Extend Expiry Date',
    permissions: GEPG_ACTION_PERMISSIONS,
    click: () =>
      promptThen(
        comp,
        {
          title: 'Extend Expiry Date',
          subTitle: 'Moves the expiry date at GePG. The control number is kept.',
          fields: [
            {
              key: 'newExpiry',
              label: 'New expiry date',
              type: FieldType.dateTime,
              class: 'col-span-full',
              // minDate, not min: the date-time control reads its bound off
              // minDate and ignores min, which is for a numeric input.
              minDate: new Date(),
              validations: [VALIDATOR_REQUIRED],
            },
            reasonField('Reason for the change', 'Why is this bill being extended?'),
          ],
        } as FormParameters,
        async (data, close) => {
          await runGepgAction(
            comp,
            CHANGE_BILL_EXPIRY,
            { newExpiry: data?.newExpiry, reason: data?.reason },
            'gepg-change',
          );
          close();
        },
      ),
  };
}

/**
 * Asks GePG to cancel the control number.
 *
 * Worded to say what it really does: the number stops being payable, and every
 * bill under the same header goes with it.
 */
export function cancelControlNumberBtn(comp: BillComp): ActionButton {
  return {
    icon: 'delete',
    label: 'Cancel Control Number',
    class: 'text-red-600',
    permissions: GEPG_CANCEL_PERMISSIONS,
    click: () =>
      promptThen(
        comp,
        {
          title: 'Cancel Control Number',
          subTitle:
            'The number stops being payable. Every bill raised under the same header is cancelled with it.',
          fields: [reasonField('Reason for cancellation', 'Why is this bill being cancelled?')],
        } as FormParameters,
        async (data, close) => {
          await runGepgAction(comp, CANCEL_CONTROL_NUMBER, { reason: data?.reason }, 'gepg-cancel');
          close();
        },
      ),
  };
}

/** All four, in the order an operator meets them. */
export function gepgActionButtons(comp: BillComp): ActionButton[] {
  return [requestControlNumberBtn(comp), changeBillExpiryBtn(comp), cancelControlNumberBtn(comp)];
}
