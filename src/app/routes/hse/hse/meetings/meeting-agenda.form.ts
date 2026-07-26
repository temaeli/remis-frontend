import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import {
  CREATE_HSE_MEETING_AGENDA,
  DELETE_HSE_MEETING_AGENDA,
  GET_HSE_MEETING_AGENDAS_BY_MEETING,
  GET_HSE_MEETING_AGENDA_BY_UID,
  SAVE_HSE_MEETING_AGENDA_NOTES,
} from './meeting-agenda.graphql';

export const hseMeetingAgenda$ = new Subject<any>();

export function getHseMeetingAgendaFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    { key: 'meetingUid', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Agenda',
      type: FieldType.input,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'indexOrder',
      label: 'Order',
      type: FieldType.number,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

export function hseMeetingAgendaUpsertBtn(comp: BaseComponent, meetingUid: string): ActionButton {
  return {
    click: async (data?: any) => {
      let seed: any = null;
      if (data?.uid) {
        seed = await comp.fs.fetch({
          query: GET_HSE_MEETING_AGENDA_BY_UID,
          variables: { uid: data.uid },
        });
      } else {
        const page = await comp.fs.fetch({
          query: GET_HSE_MEETING_AGENDAS_BY_MEETING,
          variables: { meetingUid, active: true, pageableParam: { size: 1000 } },
        });
        const rows: any[] = page?.content ?? [];
        const maxOrder = rows.reduce((m, a) => Math.max(m, Number(a?.indexOrder ?? 0)), 0);
        seed = { indexOrder: maxOrder + 1 };
      }
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { ...seed, meetingUid },
        title: 'Meeting Agenda',
        fields: getHseMeetingAgendaFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_HSE_MEETING_AGENDA,
            variables: { input: value },
            successFn: () => {
              hseMeetingAgenda$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '45%');
    },
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    ...getUpsertBtnProps('Agenda'),
  };
}

export function hseMeetingAgendaDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('Agenda'),
    permissions: ['ROLE_DELETE_HSE_MEETING'],
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_HSE_MEETING_AGENDA,
        variables: { uid: data.uid },
        successFn: () => hseMeetingAgenda$.next(null),
      });
    },
  };
}

export function hseMeetingAgendaSetNotesBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'notes',
    label: 'Set Notes',
    color: 'primary',
    toolTip: 'Set Agenda Notes',
    permissions: ['ROLE_SCHEDULE_HSE_MEETING'],
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { notes: data?.notes ?? '' },
        title: `Agenda Notes: ${data?.name ?? ''}`,
        fields: [
          {
            key: 'notes',
            label: 'Notes',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: SAVE_HSE_MEETING_AGENDA_NOTES,
            // BE param is named `meetingUid` but the service treats it as
            // the agenda's own uid (see HseMeetingAgendaService.setNotes).
            variables: { meetingUid: data?.uid, notes: value?.notes },
            successFn: () => {
              hseMeetingAgenda$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '45%');
    },
  };
}

export function hseMeetingAgendaTableBtns(
  comp: BaseComponent,
  meetingUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        hseMeetingAgendaUpsertBtn(comp, meetingUid),
        hseMeetingAgendaSetNotesBtn(comp),
        hseMeetingAgendaDeleteBtn(comp),
      ],
    },
  ];
}
