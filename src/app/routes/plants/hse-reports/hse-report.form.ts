import { Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { navigateRelativeTo } from '@shared/components/view-component/view.helpers';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PROCESS_HSE_REPORT, SAVE_HSE_REPORT } from './hse-report.graphql';
import { GET_HSE_REPORTS_PAGEABLE } from './hse-report.graphql';
import { HseReport, StageEnum } from './hse-report.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { getInputItems, PlantReportCols } from '../common-plant-reports/comon-plant-report';
import { proccessPlantReportBtn } from '../common-plant-reports/comon-plant-report';
import { CommonProcessReportFp } from '../common-plant-reports/comon-plant-report';

//Listener for all HseReport actions
export const hseReport$ = new Subject<HseReport | any>();

export const getHseReportFormFields = (comp: BaseComponent): FieldConfig[] => [
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
    label: 'HSE Records',
    labelClass: 'p-0 pb-3',
    fieldsClass: 'xl:grid-cols-[3fr_1fr] lg:grid-cols-[3fr_1fr] gap-4 w-full',
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
        innerClass: 'bg-gray-400/10 rounded-lg  p-3',
        valueAsLabel: true,
        validations: [VALIDATOR_REQUIRED],
        ignoreOnSubmit: true,
        disabled: true,
      },

      {
        key: 'count',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
      },
    ],
  },
];

export function hseReportUpsertBtn(comp: BaseComponent, plantUid?: string): ActionButton {
  return {
    click: async (data?: HseReport) => {
      const inputs = await getInputItems(comp, PlantInputType.HSE);
      if (!inputs.length) return;

      const formParameter: FormParameters = {
        model: { ...data, inputs, plantUid },
        title: 'HSE Report',
        fields: getHseReportFormFields(comp),
        closeAction$: hseReport$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { ...value },
            mutation: SAVE_HSE_REPORT,
            successFn: (res) => hseReport$.next(res?.data),
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '96%', 'auto', { maxWidth: '840px' });
    },
    permissions: ['ROLE_CREATE_HSE_REPORT', 'ROLE_UPDATE_HSE_REPORT'],
    showFunction: () => !comp?.router?.url?.includes('plant'),
    ...getUpsertBtnProps('HSE Report'),
  };
}

export function hseReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_HSE_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.OFFICER]: 'ROLE_PROCESS_HSE_REPORT_AS_OFFICER',
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_HSE_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_HSE_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_HSE_REPORT_AS_PLANT_MANAGER',
  });
}

export function hseReportViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View HSE Report',
    click: (data: HseReport) => navigateRelativeTo(comp, 'hse-reports', data?.uid),
    permissions: ['ROLE_VIEW_HSE_REPORT'],
  };
}

// export function hseReportDeleteBtn(comp: BaseComponent): ActionButton {
//   return {
//     click: async (data: HseReport) => {
//       await comp.fs.fetch({
//         notify: true,
//         loadingOn: 'content',
//         variables: { uid: data.uid },
//         mutation: ACTIVATE_OR_DEACTIVATE_HSE_REPORT,
//         finalFn: (res) => hseReport$.next(res?.data),
//       });
//     },
//     ...getDeleteBtnProps('HSE Report', 'name'),
//     permissions: ['ROLE_DELETE_HSE_REPORT'],
//   };
// }

export function hseReportTableBtns(comp: BaseComponent, plantUid?: string): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [
        hseReportViewBtn(comp),
        // hseReportUpsertBtn(comp, plantUid),
        // hseReportDeleteBtn(comp),
      ],
    },
  ];
}

export function hseReportsContent(comp: BaseComponent, plantUid?: string): ContentParameter {
  return {
    type: 'table',
    label: 'HSE',
    icon: 'document_settings',
    title: 'HSE Reports',
    slug: 'hse-reports',
    keyColumns: PlantReportCols.filter((col) => !col?.toString()?.includes('plant')),
    actionButtons: hseReportTableBtns(comp, plantUid),
    headerButtons: [hseReportUpsertBtn(comp, plantUid)],
    permissions: ['ROLE_VIEW_ALL_HSE_REPORT'],

    fetchParameter: {
      query: GET_HSE_REPORTS_PAGEABLE,
      searchStates: [{ key: 'plant.uid', value: plantUid }],
      variables: { active: true },
    },
  } as ContentParameter;
}
