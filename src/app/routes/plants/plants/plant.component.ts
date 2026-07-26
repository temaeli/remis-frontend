import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { Plant } from './plant.interface';
import { FIND_PLANT } from './plant.graphql';
import { plantUpsertBtn, plant$ } from './plant.form';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { hseReportsContent } from '../hse-reports/hse-report.form';
import { fieldEngineerReportsContent } from '../field-engineer-reports/field-engineer-report.form';
import { securityReportsContent } from '../security-reports/security-report.form';
import { powerReportsContent } from '../power-reports/power-report.form';
import { labReportsContent } from '../lab-reports/lab-report.form';
import { maintenanceReportsContent } from '../maintenance-reports/maintenance-report.form';
import { condensateSalesContent } from '../condensate-sales/condensate-sale.form';
import { plantExportReadingsContent } from '../plant-export-readings/plant-export-reading.form';
import { plantReceivedDataContent } from '../plant-received-datas/plant-received-data.form';
import { plantWaterReadingsContent } from '../plant-water-readings/plant-water-reading.form';
import { exportGasAnalysisContent } from '../export-gas-analysis/export-gas-analysis.form';
import { fuelFlaredGasContent } from '../fuel-flared-gas/fuel-flared-gas.form';
import { wasteWaterProducedContent } from '../waste-water-produced/waste-water-produced.form';
import { wasteWaterAnalysisContent } from '../waste-water-analysis/waste-water-analysis.form';
import { condensateStorageTankContent } from '../condensate-storage-tanks/condensate-storage-tank.form';
import { potableWaterAnalysisContent } from '../potable-water-analysis/potable-water-analysis.form';
import { monoEthyleneGlycolAnalysisContent } from '../mono-ethylene-glycol-analysis/mono-ethylene-glycol-analysis.form';
import { potableWaterProductionContent } from '../potable-water-production/potable-water-production.form';
import { waterTankLevelContent } from '../water-tank-levels/water-tank-level.form';

@Component({
  selector: 'app-plant.',
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent],
  template: `
    <!--  -->
    <div class="size-full flex-1 flex flex-col gap-2">
      <page-header
        [title]="title"
        [subtitle]="subtitle"
        [actionButtons]="actionButtons"
        [data]="plant"
      />
      <contents-view class="block grow" [contents]="contents()" />
    </div>
  `,
})
export class PlantComponent extends BaseComponent implements OnInit {
  override title = 'Plant';
  override subtitle = 'Plant Management';

  plant: Plant | undefined;
  plantUid: string = this.route.snapshot?.paramMap?.get('plantUid') as any;

  override contents = signal<ContentParameter[]>([]);
  override actionButtons: ActionButton[] = [plantUpsertBtn(this)];

  fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: FIND_PLANT,
    successFn: (res) => (this.title = res?.data?.name),
    variables: { uid: this.plantUid },
  };

  async ngOnInit(): Promise<void> {
    await this.setContents();
    this.subs.add(plant$.subscribe(() => this.setContents()));
  }

  async setContents() {
    this.plant = await this.fs.fetch(this.fetchParameter);

    this.contents.set([
      {
        type: 'details',
        icon: 'notes',
        showUndefined: true,
        entity: this.plant,
        fetchParameter: this.fetchParameter,
        fieldsProperties: { supervisorUser: { label: 'Supervisor' } },
        fieldsClass: 'col-span-full',
        contentContainerClass: 'xl:grid-cols-[1fr_3fr]',

        children: [
          {
            label: 'Processing Data',
            slug: 'processing-data',
            icon: 'document_settings',
            children: [
              plantExportReadingsContent(this, this.plantUid),
              plantReceivedDataContent(this, this.plantUid),
              condensateSalesContent(this, this.plantUid),
            ],
          },

          {
            label: 'Reports',
            slug: 'reports',
            icon: 'report',
            children: [
              hseReportsContent(this, this.plantUid),
              fieldEngineerReportsContent(this, this.plantUid),
              securityReportsContent(this, this.plantUid),
              powerReportsContent(this, this.plantUid),
              labReportsContent(this, this.plantUid),
              maintenanceReportsContent(this, this.plantUid),
              exportGasAnalysisContent(this, this.plantUid),
              fuelFlaredGasContent(this, this.plantUid),
              wasteWaterProducedContent(this, this.plantUid),
              wasteWaterAnalysisContent(this, this.plantUid),
              condensateStorageTankContent(this, this.plantUid),
              potableWaterAnalysisContent(this, this.plantUid),
              monoEthyleneGlycolAnalysisContent(this, this.plantUid),
              potableWaterProductionContent(this, this.plantUid),
              waterTankLevelContent(this, this.plantUid),
            ],
          },
        ],
      },
    ]);
  }
}
