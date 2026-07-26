import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { PlantReport } from './plant-report.interface';
import { StageEnum } from '../hse-reports/hse-report.interface';
import { INITIALIZE_AGGREGATED_PLANT_REPORT, PROCESS_PLANT_REPORT } from './plant-report.graphql';
import {
  CommonProcessReportFp,
  proccessPlantReportBtn,
  processReport$,
} from '../common-plant-reports/comon-plant-report';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';

//Listener for all PlantReport actions
export const plantReport$ = new Subject<PlantReport | any>();

export function plantReportInitializeBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'rocket',
    label: 'Initialize Report',
    permissions: ['ROLE_INITIALIZE_PLANT_REPORT'],

    click: async () => {
      const msg = `Are you sure you want to initialize today's aggregated plant report?`;
      const c = await comp.notify.confirm_('Confirm', msg);
      if (!c.isConfirmed) return;

      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        mutation: INITIALIZE_AGGREGATED_PLANT_REPORT,
        successFn: (res) => plantReport$.next(res?.data),
      });
    },
  };
}

export function plantReportProcessBtn(comp: BaseComponent): ActionButton {
  const onSubmit = async (value: any) => {
    await comp.fs.fetch({
      ...CommonProcessReportFp,
      variables: { processingDto: value },
      mutation: PROCESS_PLANT_REPORT,
    });
  };

  return proccessPlantReportBtn(comp, onSubmit, {
    [StageEnum.SHIFT_SUPERVISOR]: 'ROLE_PROCESS_PLANT_REPORT_AS_SHIFT_SUPERVISOR',
    [StageEnum.SUPERINTENDENT]: 'ROLE_PROCESS_PLANT_REPORT_AS_SUPERINTENDENT',
    [StageEnum.PLANT_MANAGER]: 'ROLE_PROCESS_PLANT_REPORT_AS_PLANT_MANAGER',
  });
}

export function plantReportTableBtns(comp: BaseComponent): ActionButton[] {
  return [{ ...MORE_BTN, buttons: [plantReportProcessBtn(comp)] }];
}
