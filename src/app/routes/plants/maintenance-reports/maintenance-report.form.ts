import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  GET_MAINTENANCE_REPORTS_PAGEABLE,
  PROCESS_MAINTENANCE_REPORT,
  SAVE_MAINTENANCE_REPORT,
} from './maintenance-report.graphql';
import { MaintenanceReport, UnitOfMeasure } from './maintenance-report.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CommonProcessReportFp,
  getInputItems,
  PlantReportCols,
  proccessPlantReportBtn,
} from '../common-plant-reports/comon-plant-report';
import { StageEnum } from '../hse-reports/hse-report.interface';

//Listener for all MaintenanceReport actions
export const maintenanceReport$ = new Subject<MaintenanceReport | any>();

export const getMaintenanceReportFormFields = (comp: BaseComponent): FieldConfig[] => [
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
    label: 'Maintenance Report Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-5 xl:grid-cols-5 gap-4',
    fields: [
      { key: 'uid', type: FieldType.input, visible: false },
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
        key: 'plannedMaintenance',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'plannedMaintenanceDone',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'plannedMaintenanceNotDone',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
      {
        key: 'unPlannedMaintenanceDone',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
    ],
  },
];

export function maintenanceReportUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: MaintenanceReport) => {
      const inputs = await getInputItems(comp, PlantInputType.MAINTENANCE);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Maintenance Report',
        fields: getMaintenanceReportFormFields(comp),
        closeAction$: maintenanceReport$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_MAINTENANCE_REPORT,
            successFn: (res) => maintenanceReport$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '1280px' });
    },
    permissions: ['ROLE_CREATE_MAINTENANCE_REPORT', 'ROLE_UPDATE_MAINTENANCE_REPORT'],
    ...getUpsertBtnProps('Maintenance Report'),
  };
}

export function maintenanceReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_MAINTENANCE_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_MAINTENANCE_REPORT_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_MAINTENANCE_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_MAINTENANCE_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_MAINTENANCE_REPORT_AS_PLANT_MANAGER',
  });
}

export function maintenanceReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Maintenance Report',
    click: (data: MaintenanceReport) => navigateRelativeTo(comp, 'maintenance-reports', data?.uid),
    permissions: ['ROLE_VIEW_MAINTENANCE_REPORT'],
  };
}

// export function maintenanceReportDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: MaintenanceReport) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: ACTIVATE_OR_DEACTIVATE_MAINTENANCE_REPORT,
//         finalFn: (res) => maintenanceReport$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Maintenance Report', 'name'),
//     permissions: [],
//   };
// }

export function maintenanceReportTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        maintenanceReportViewBtn(comp),
        // maintenanceReportUpsertBtn(comp, plantUid),
        // maintenanceReportDeleteBtn(comp),
      ],
    },
  ];
}

export function maintenanceReportsContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'Maintenance',
    title: 'Maintenance Reports',
    slug: 'maintenance-reports',
    icon: 'hand_fix',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: maintenanceReportTableBtns(comp, plantUid),
    headerButtons: [maintenanceReportUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_MAINTENANCE_REPORT'],

    fetchParameter: {
      query: GET_MAINTENANCE_REPORTS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
