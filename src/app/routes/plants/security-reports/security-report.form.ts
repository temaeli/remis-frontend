import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import {
  GET_SECURITY_REPORTS_PAGEABLE,
  PROCESS_SECURITY_REPORT,
  SAVE_SECURITY_REPORT,
} from './security-report.graphql';
import { SecurityReport } from './security-report.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import {
  CommonProcessReportFp,
  getInputItems,
  PlantReportCols,
  proccessPlantReportBtn,
} from '../common-plant-reports/comon-plant-report';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { StageEnum } from '../hse-reports/hse-report.interface';

//Listener for all SecurityReport actions
export const securityReport$ = new Subject<SecurityReport | any>();

export const getSecurityReportFormFields = (comp: BaseComponent): FieldConfig[] => [
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
    label: 'Security Report Items',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'grid grid-cols-2 xl:grid-cols-2 gap-4 w-full',
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
        key: 'count',
        type: FieldType.number,
        validations: [VALIDATOR_REQUIRED],
      },
    ],
  },
];

export function securityReportUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: SecurityReport) => {
      const inputs = await getInputItems(comp, PlantInputType.SECURITY);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'Security Report',
        fields: getSecurityReportFormFields(comp),
        closeAction$: securityReport$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_SECURITY_REPORT,
            successFn: (res) => securityReport$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { minWidth: '680px' });
    },
    showFunction: () => !comp?.router?.url?.includes('plant'),
    permissions: ['ROLE_CREATE_SECURITY_REPORT', 'ROLE_UPDATE_SECURITY_REPORT'],
    ...getUpsertBtnProps('Security Report'),
  };
}

export function securityReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_SECURITY_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_SECURITY_REPORT_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_SECURITY_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_SECURITY_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_SECURITY_REPORT_AS_PLANT_MANAGER',
  });
}

export function securityReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Security Report',
    click: (data: SecurityReport) => navigateRelativeTo(comp, 'security-reports', data?.uid),
    permissions: ['ROLE_VIEW_SECURITY_REPORT'],
  };
}

// export function securityReportDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: SecurityReport) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: ACTIVATE_OR_DEACTIVATE_SECURITY_REPORT,
//         finalFn: (res) => securityReport$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('Security Report', 'name'),
//     permissions: ['ROLE_DELETE_SECURITY_REPORT'],
//   };
// }

export function securityReportTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        securityReportViewBtn(comp),
        // securityReportUpsertBtn(comp, plantUid),
        // securityReportDeleteBtn(comp),
      ],
    },
  ];
}

export function securityReportsContent(comp: BaseComponent, plantUid?: string) {
  return {
    type: 'table',
    label: 'SECURITY',
    icon: 'shield_star',
    title: 'Security Reports',
    slug: 'security-reports',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: securityReportTableBtns(comp, plantUid),
    headerButtons: [securityReportUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_SECURITY_REPORT'],

    fetchParameter: {
      query: GET_SECURITY_REPORTS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
