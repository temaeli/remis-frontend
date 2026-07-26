import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { dateFromToday } from '@core/helpers';
import { PowerFormItem, PowerReport } from './power-report.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  GET_POWER_GEN_REPORT_ITEMS,
  GET_POWER_REPORTS_PAGEABLE,
  PROCESS_POWER_GENERATION_REPORT,
  SAVE_POWER_GENERATION_REPORT,
} from './power-report.graphql';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CommonProcessReportFp,
  getInputItems,
  proccessPlantReportBtn,
  PlantReportCols,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';

//Listener for all PowerReport actions
export const powerReport$ = new Subject<PowerReport | any>();

/**
 * Power demand isn't entered by hand - it's yesterday's todayMwh subtracted from
 * today's, per item. Looks up the most recent report dated exactly one day before
 * today (the two latest reports, sorted by id desc, are enough to find it - reports
 * are filed daily) and returns its items' todayMwh keyed by item uid. Requires
 * ROLE_VIEW_ALL_POWER_GENERATION_REPORT to look the prior day up at all; without it
 * powerDemand is simply left uncalculated (still disabled, so nothing overwrites it).
 */
async function getYesterdayTodayMwhByItem(comp: BaseComponent): Promise<Record<string, number>> {
  if (!HasPermissionDirective.hasPermission(['ROLE_VIEW_ALL_POWER_GENERATION_REPORT'])) return {};

  const yesterday = dateFromToday(-1, 'yyyy-MM-dd');

  const page = await comp.fs.fetch({
    notifyError: false,
    query: GET_POWER_REPORTS_PAGEABLE,
    variables: { pageableParam: { size: 2, sortBy: 'id', sortDirection: 'DESC' }, active: true },
  });

  const yesterdayReport = (page?.content ?? []).find(
    (r: PowerReport) => r?.createdAtDate === yesterday,
  );
  if (!yesterdayReport?.uid) return {};

  const items: PowerFormItem[] = await comp.fs.fetch({
    notifyError: false,
    query: GET_POWER_GEN_REPORT_ITEMS,
    variables: { formUid: yesterdayReport.uid },
  });

  const todayMwhByItem: Record<string, number> = {};
  (items ?? []).forEach((i) => {
    if (i?.item?.uid != null && i?.todayMwh != null) todayMwhByItem[i.item.uid] = i.todayMwh;
  });

  return todayMwhByItem;
}

function computePowerDemand(todayMwh: any, form: any, todayMwhByItem: Record<string, number>) {
  const itemUid = form?.get('itemUid')?.value;
  const yesterdayMwh = todayMwhByItem[itemUid];
  const today = Number(todayMwh);

  if (yesterdayMwh == null || isNaN(today)) return;

  form?.get('powerDemand')?.setValue(today - yesterdayMwh, { emitEvent: false });
}

export const getPowerReportFormFields = (
  comp: BaseComponent,
  todayMwhByItem: Record<string, number> = {},
): FieldConfig[] => [
  { key: 'uid', type: FieldType.input, visible: false },
  // {
  //   key: 'plantUid',
  //   type: FieldType.select,
  //   optionsVariables: { fetchParameter: { query: ALL_PLANT } },
  //   class: 'col-span-full',
  //   validations: [VALIDATOR_REQUIRED],
  // },
  {
    key: 'inputs',
    type: FieldType.formGroupArray,
    expandable: false,
    canAddFormGroup: false,
    showGroupLabel: false,
    class: 'col-span-full',
    label: 'Power Report Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-4 xl:grid-cols-4 gap-4',
    fields: [
      // { key: 'uid', type: FieldType.input, visible: false },
      {
        key: 'itemUid',
        type: FieldType.input,
        visible: false,
        validations: [VALIDATOR_REQUIRED],
      },

      {
        key: 'item',
        type: FieldType.label,
        valueAsLabel: true,
        innerClass: 'bg-gray-400/10 rounded-lg p-3',
        validations: [VALIDATOR_REQUIRED],
        ignoreOnSubmit: true,
        disabled: true,
      },
      {
        key: 'todayMwh',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
        onChange: (value, form) => computePowerDemand(value, form, todayMwhByItem),
      },
      {
        key: 'powerDemand',
        type: FieldType.decimal,
        disabled: true,
        hint: 'Auto-calculated',
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'todayHours',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
      },
    ],
  },
];

export function powerReportUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: PowerReport) => {
      const inputs = await getInputItems(comp, PlantInputType.PGO);
      if (!inputs.length) return;

      // Only auto-fill on create - editing an existing (possibly older) report
      // shouldn't have its powerDemand silently recomputed against "today".
      const todayMwhByItem = data?.uid ? {} : await getYesterdayTodayMwhByItem(comp);

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Power Report',
        fields: getPowerReportFormFields(comp, todayMwhByItem),
        closeAction$: powerReport$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_POWER_GENERATION_REPORT,
            successFn: (res) => powerReport$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '840px' });
    },
    permissions: ['ROLE_CREATE_POWER_GENERATION_REPORT', 'ROLE_UPDATE_POWER_GENERATION_REPORT'],
    ...getUpsertBtnProps('Power Report'),
  };
}

export function powerReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_POWER_GENERATION_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_POWER_GENERATION_REPORT_AS_PLANT_MANAGER',
  });
}

export function powerReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Power Report',
    click: (data: PowerReport) => navigateRelativeTo(comp, 'power-reports', data?.uid),
    permissions: ['ROLE_VIEW_POWER_GENERATION_REPORT'],
  };
}

// export function powerReportDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: PowerReport) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: ACTIVATE_OR_DEACTIVATE_POWER_GENERATION_REPORT,
//         finalFn: (res) => powerReport$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Power Report', 'name'),
//     permissions: ['ROLE_DELETE_POWER_GENERATION_REPORT'],
//   };
// }

export function powerReportTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        powerReportViewBtn(comp),
        // powerReportUpsertBtn(comp, plantUid),
        // powerReportDeleteBtn(comp),
      ],
    },
  ];
}

export function powerReportsContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'POWER',
    icon: 'flash',
    title: 'Power Reports',
    slug: 'power-reports',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: powerReportTableBtns(comp, plantUid),
    headerButtons: [powerReportUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_POWER_GENERATION_REPORT'],

    fetchParameter: {
      query: GET_POWER_REPORTS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
