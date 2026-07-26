import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter } from '@shared/components/data-grid/data-grid.interfaces';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  MY_ASSIGNED_UPSTREAMER_DISPATCHES_PAGEABLE,
  RECORD_UPSTREAMER_CONFIRMATION,
} from './my-gas-nominations.graphql';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';

export const upstreamerDispatch$ = new Subject<any>();

export function getUpstreamerDispatchesGridParameter(
  comp: BaseComponent,
  dispatchStatus = 'SENT',
): GridParameter {
  return {
    title: 'Assigned Upstreamer Dispatches',
    icon: 'caret_up',
    keyColumns: [
      'index',
      'plantNomination.batch.referenceNumber as Batch #',
      'recipientEmail as Recipient Email',
      'sentAt as Sent At',
      'status',
      'confirmedDailyMmscfd as Confirmed Capacity (MMscfd)',
      'actions',
    ],
    isPageable: true,
    pageSize: 20,
    actionButtons: [
      {
        ...MORE_BTN,
        buttons: [recordUpstreamerConfirmationBtn(comp)],
      },
    ],
    reloadActions$: [upstreamerDispatch$],
    fetchParameter: {
      query: MY_ASSIGNED_UPSTREAMER_DISPATCHES_PAGEABLE,
      variables: { status: dispatchStatus },
    },
  };
}

export function recordUpstreamerConfirmationBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'confirm',
    label: 'Confirm Dispatch',
    click: (data: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Confirm Dispatch',
        icon: 'confirm',
        model: {
          confirmedDailyMmscfd: data?.plantNomination?.allocatedDailyMmscfd || 0,
        },
        fields: [
          {
            key: 'confirmedDailyMmscfd',
            label: 'Confirmed Capacity (MMscfd)',
            type: FieldType.number,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: RECORD_UPSTREAMER_CONFIRMATION,
            variables: {
              dto: {
                dispatchUid: data?.uid,
                plantNominationUid: data?.plantNomination?.uid,
                upstreamerClientUid: data?.upstreamerClient?.uid,
                confirmedDailyMmscfd: value?.confirmedDailyMmscfd || 0,
                communicationRef: data?.communicationRef,
                comments: '',
              },
            },
            successFn: () => {
              upstreamerDispatch$.next(true);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%', '60vh');
    },
  };
}
