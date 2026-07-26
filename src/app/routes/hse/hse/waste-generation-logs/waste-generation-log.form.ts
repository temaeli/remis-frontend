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
  buildApproveBtn,
  buildRejectBtn,
  canSubmit,
  crudHostFromBase,
  lookupOptions,
  processStatusFromTimestamps,
} from '@shared/crud';
import { workingStationLookupProvider } from '../../../pipeline-management/working-stations/working-station.provider';
import { wasteCategoryLookupProvider } from '../waste-categories/waste-category.provider';
import {
  APPROVE_WASTE_GENERATION_LOG,
  CREATE_OR_UPDATE_WASTE_GENERATION_LOG,
  DELETE_WASTE_GENERATION_LOG,
  GET_WASTE_GENERATION_LOG_BY_UID,
  REJECT_WASTE_GENERATION_LOG,
  SUBMIT_WASTE_GENERATION_LOG,
} from './waste-generation-log.graphql';

export const wasteGenerationLog$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_MANAGE_WASTE_GENERATION_LOG'];
const DELETE_PERMS = ['ROLE_DELETE_WASTE_GENERATION_LOG'];
const APPROVE_PERMS = ['ROLE_APPROVE_WASTE_GENERATION_LOG'];

const toDateStr = (d: any): string | undefined => {
  if (!d) return undefined;
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  return s.split('T')[0];
};

export function getWasteGenerationLogFormFields(data?: any): FieldConfig[] {
  const categoryLocked = !!data?.wasteCategoryUid;
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'wasteCategoryUid',
      label: 'Waste Category',
      type: categoryLocked ? FieldType.input : FieldType.select,
      visible: !categoryLocked,
      optionsVariables: categoryLocked ? undefined : lookupOptions(wasteCategoryLookupProvider),
      validations: categoryLocked ? [] : [VALIDATOR_REQUIRED],
    },
    {
      key: 'workingStationUid',
      label: 'Working Station',
      type: FieldType.select,
      optionsVariables: lookupOptions(workingStationLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'date',
      label: 'Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
    {
      key: 'amountGenerated',
      label: 'Amount Generated',
      type: FieldType.decimal,
      decimals: 2,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'amountRecycled',
      label: 'Amount Recycled',
      type: FieldType.decimal,
      decimals: 2,
      validations: [],
    },
    {
      key: 'remarks',
      label: 'Remarks',
      class: 'col-span-full',
      type: FieldType.textarea,
      validations: [],
    },
  ];
}

export function wasteGenerationLogUpsertBtnForCategory(
  comp: BaseComponent,
  wasteCategoryUid: string,
): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_WASTE_GENERATION_LOG_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        wasteCategoryUid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Waste Generation Log',
        fields: getWasteGenerationLogFormFields(seed),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_WASTE_GENERATION_LOG,
            variables: {
              input: {
                uid: value?.uid,
                wasteCategoryUid: value?.wasteCategoryUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                amountGenerated: value?.amountGenerated,
                amountRecycled: value?.amountRecycled,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              wasteGenerationLog$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Waste Generation Log'),
  };
}

export function wasteGenerationLogDeleteBtn(
  comp: BaseComponent,
  onAfterSuccess?: () => void,
): ActionButton {
  return {
    ...getDeleteBtnProps('Waste Generation Log'),
    permissions: DELETE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: DELETE_WASTE_GENERATION_LOG,
        variables: { uid: data.uid },
        successFn: () => {
          wasteGenerationLog$.next(null);
          onAfterSuccess?.();
        },
      });
    },
  };
}

export function wasteGenerationLogViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'visibility',
    label: 'View',
    color: 'primary',
    toolTip: 'View Waste Generation Log',
    permissions: ['ROLE_VIEW_WASTE_GENERATION_LOG'],
    click: (row: any) => {
      if (!row?.uid) return;
      comp.router.navigate(['/hse/waste-generation-logs', row.uid]);
    },
  };
}

export function wasteGenerationLogSubmitBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'send',
    label: 'Submit',
    color: 'primary',
    toolTip: 'Submit Waste Generation Log',
    permissions: MANAGE_PERMS,
    showFunction: (row: any) => canSubmit({ status: processStatusFromTimestamps(row) }),
    confirmDataMapper: () => ({
      title: 'Submit Waste Generation Log',
      message: 'Are you sure you want to submit this log?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      comp.fs.fetch({
        notify: true,
        mutation: SUBMIT_WASTE_GENERATION_LOG,
        variables: { uid: data.uid },
        successFn: () => wasteGenerationLog$.next(null),
      });
    },
  };
}

export function wasteGenerationLogApproveBtn(comp: BaseComponent): ActionButton {
  return buildApproveBtn(crudHostFromBase(comp), {
    mutation: APPROVE_WASTE_GENERATION_LOG,
    entityLabel: 'Waste Generation Log',
    permission: APPROVE_PERMS[0],
    onSuccess: () => wasteGenerationLog$.next(null),
    gateCreator: true,
  });
}

export function wasteGenerationLogRejectBtn(comp: BaseComponent): ActionButton {
  return buildRejectBtn(crudHostFromBase(comp), {
    mutation: REJECT_WASTE_GENERATION_LOG,
    entityLabel: 'Waste Generation Log',
    permission: APPROVE_PERMS[0],
    onSuccess: () => wasteGenerationLog$.next(null),
    gateCreator: true,
  });
}

export function wasteGenerationLogTableBtnsForCategory(
  comp: BaseComponent,
  wasteCategoryUid: string,
): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        wasteGenerationLogUpsertBtnForCategory(comp, wasteCategoryUid),
        wasteGenerationLogSubmitBtn(comp),
        wasteGenerationLogApproveBtn(comp),
        wasteGenerationLogRejectBtn(comp),
        wasteGenerationLogDeleteBtn(comp),
      ],
    },
  ];
}

export function wasteGenerationLogUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: any) => {
      const fresh = data?.uid
        ? await comp.fs.fetch({
            query: GET_WASTE_GENERATION_LOG_BY_UID,
            variables: { uid: data.uid },
          })
        : null;
      const raw = fresh ?? data;
      const seed = {
        ...(raw ?? {}),
        wasteCategoryUid: raw?.wasteCategoryUid ?? raw?.wasteCategory?.uid,
        workingStationUid: raw?.workingStationUid ?? raw?.workingStation?.uid,
      };
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: { ...seed },
        title: 'Waste Generation Log',
        fields: getWasteGenerationLogFormFields(seed),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            mutation: CREATE_OR_UPDATE_WASTE_GENERATION_LOG,
            variables: {
              input: {
                uid: value?.uid,
                wasteCategoryUid: value?.wasteCategoryUid,
                workingStationUid: value?.workingStationUid,
                date: toDateStr(value?.date),
                amountGenerated: value?.amountGenerated,
                amountRecycled: value?.amountRecycled,
                remarks: value?.remarks,
              },
            },
            successFn: (res) => {
              wasteGenerationLog$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
    permissions: MANAGE_PERMS,
    ...getUpsertBtnProps('Waste Generation Log'),
  };
}

export function wasteGenerationLogTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        wasteGenerationLogUpsertBtn(comp),
        wasteGenerationLogSubmitBtn(comp),
        wasteGenerationLogApproveBtn(comp),
        wasteGenerationLogRejectBtn(comp),
        wasteGenerationLogDeleteBtn(comp),
      ],
    },
  ];
}
