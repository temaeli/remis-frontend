import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FetchService } from '@shared/fetch/fetch.service';
import { SearchOperationType } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ALL_PLANT } from '../plants/plant.graphql';
import { Plant } from '../plants/plant.interface';
import { GET_ALL_PLANT_FORM_ITEMS } from '../plant-form-items/plant-form-item.graphql';
import { PlantFormItem, UnitOfMeasureMap } from '../plant-form-items/plant-form-item.interface';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { ALL_PLANT_EXPORT_READING_PAGEABLE } from '../plant-export-readings/plant-export-reading.graphql';
import { PlantExportReading } from '../plant-export-readings/plant-export-reading.interface';
import { ALL_PLANT_PROCESSING_DATA_PAGEABLE } from '../plant-received-datas/plant-received-data.graphql';
import { PlantReceivedData } from '../plant-received-datas/plant-received-data.interface';
import { DAILY_REPORT_ITEM_SECTIONS, DAILY_REPORT_PLACEHOLDER_SECTIONS } from './daily-report.config';
import { DailyReportRow, DailyReportSectionResult } from './daily-report.interface';

interface SourceOfRawGasRow {
  source: string;
  receivedScm?: number;
  pressure?: number;
  temperature?: number;
}

const LATEST_ONE: any = { first: 0, size: 1, sortBy: 'createdAt', sortDirection: 'DESC' };

function plantEquals(plantUid: string) {
  return [{ key: 'plant.uid', value: plantUid, searchType: SearchOperationType.Equals }];
}

function extractValue(key: string, match: any): unknown {
  if (!match) return undefined;
  if (key === 'yearToDate') return (Number(match.count) || 0) + (Number(match.prevCount) || 0);
  return match[key];
}

@Component({
  selector: 'app-daily-report',
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './daily-report.component.html',
})
export class DailyReportComponent implements OnInit {
  private fs = inject(FetchService);

  plants = signal<Plant[]>([]);
  selectedPlantUid = signal<string | undefined>(undefined);
  loading = signal(false);

  itemSections = signal<DailyReportSectionResult[]>([]);
  exportPipelineSection = signal<DailyReportSectionResult | undefined>(undefined);
  sourceOfRawGasRows = signal<SourceOfRawGasRow[]>([]);
  sourceOfRawGasHasData = signal(false);

  placeholderSections = DAILY_REPORT_PLACEHOLDER_SECTIONS;

  selectedPlantName = computed(
    () => this.plants().find((p) => p.uid === this.selectedPlantUid())?.name ?? '',
  );

  async ngOnInit(): Promise<void> {
    const plants = await this.fs.fetch({ query: ALL_PLANT });
    this.plants.set(plants ?? []);
    if (plants?.length) {
      this.selectedPlantUid.set(plants[0].uid);
      await this.loadPlant(plants[0].uid);
    }
  }

  async onPlantChange(plantUid: string): Promise<void> {
    this.selectedPlantUid.set(plantUid);
    await this.loadPlant(plantUid);
  }

  private async loadPlant(plantUid: string): Promise<void> {
    this.loading.set(true);

    try {
      const [itemSections, exportPipelineSection, sourceOfRawGasRows] = await Promise.all([
        this.loadItemSections(plantUid),
        this.loadExportPipelineSection(plantUid),
        this.loadSourceOfRawGas(plantUid),
      ]);

      this.itemSections.set(itemSections);
      this.exportPipelineSection.set(exportPipelineSection);
      this.sourceOfRawGasRows.set(sourceOfRawGasRows);
      this.sourceOfRawGasHasData.set(sourceOfRawGasRows.length > 0);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadItemSections(plantUid: string): Promise<DailyReportSectionResult[]> {
    const allItems: PlantFormItem[] = (await this.fs.fetch({ query: GET_ALL_PLANT_FORM_ITEMS })) ?? [];

    const itemsByInputType = new Map<PlantInputType, PlantFormItem[]>();
    for (const item of allItems) {
      const inputType = item.group?.inputType as PlantInputType | undefined;
      if (!inputType) continue;
      if (!itemsByInputType.has(inputType)) itemsByInputType.set(inputType, []);
      itemsByInputType.get(inputType)!.push(item);
    }

    return Promise.all(
      DAILY_REPORT_ITEM_SECTIONS.map(async (config) => {
        const baseItems = itemsByInputType.get(config.inputType) ?? [];

        const latestPage = await this.fs.fetch({
          query: config.pageableQuery,
          variables: { active: true },
          searchStates: plantEquals(plantUid),
          pageableParam: LATEST_ONE,
        });
        const latest = latestPage?.content?.[0];

        const submittedItems: any[] = latest?.uid
          ? ((await this.fs.fetch({
              query: config.itemsQuery,
              variables: { [config.itemsVarKey]: latest.uid },
            })) ?? [])
          : [];

        const rows: DailyReportRow[] = baseItems.map((baseItem) => {
          const match = submittedItems.find((row) => row?.item?.uid === baseItem.uid);
          const row: DailyReportRow = {
            itemUid: baseItem.uid,
            name: baseItem.name,
            unit: UnitOfMeasureMap[baseItem.unitOfMeasure as keyof typeof UnitOfMeasureMap] ?? '',
          };
          for (const col of config.columns) row[col.key] = extractValue(col.key, match);
          return row;
        });

        return {
          title: config.title,
          columns: config.columns,
          rows,
          reportDate: latest?.createdAt,
          hasReport: !!latest?.uid,
        } as DailyReportSectionResult;
      }),
    );
  }

  private async loadExportPipelineSection(
    plantUid: string,
  ): Promise<DailyReportSectionResult | undefined> {
    const page = await this.fs.fetch({
      query: ALL_PLANT_EXPORT_READING_PAGEABLE,
      variables: { active: true },
      searchStates: plantEquals(plantUid),
      pageableParam: LATEST_ONE,
    });
    const latest: PlantExportReading | undefined = page?.content?.[0];

    const rows: DailyReportRow[] = [
      { name: 'Total Gas Charged to Pipeline', unit: '', value: latest?.pipelineExportFlowRate },
      { name: 'Gas Pressure @00:00hrs', unit: '', value: latest?.pipelineExportPressure },
      { name: 'Gas Temperature @00:00hrs', unit: '', value: latest?.pipelineExportTemperature },
    ];

    return {
      title: 'Export Pipeline Charge Parameters',
      columns: [{ key: 'value', label: 'Value' }],
      rows,
      reportDate: (latest as any)?.createdAt,
      hasReport: !!latest,
    };
  }

  private async loadSourceOfRawGas(plantUid: string): Promise<SourceOfRawGasRow[]> {
    const page = await this.fs.fetch({
      query: ALL_PLANT_PROCESSING_DATA_PAGEABLE,
      variables: { active: true },
      searchStates: plantEquals(plantUid),
      pageableParam: { first: 0, size: 50, sortBy: 'createdAt', sortDirection: 'DESC' },
    });
    const recent: PlantReceivedData[] = page?.content ?? [];

    const latestByClient = new Map<string, PlantReceivedData>();
    for (const row of recent) {
      const clientName = (row.client as any)?.user?.fullName || row.client?.code || 'Unknown';
      if (!latestByClient.has(clientName)) latestByClient.set(clientName, row);
    }

    return [...latestByClient.entries()].map(([source, row]) => ({
      source,
      receivedScm: row.receivedRawGasVolume,
      pressure: row.receivedRawGasPressure,
      temperature: row.receivedRawGasTemperature,
    }));
  }
}
