import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface PlantDistributionPreviewPlant {
  plantUid: string;
  plantName: string;
  plantCode: string;
  plantDailyProductionCapacityMmscfd: number;
  allocatedDailyMmscfd: number;
  allocatedDailySm3: number;
  allocatedHourlyFlowSm3PerHour: number;
  assignedItemsCount: number;
}

export interface PlantDistributionPreviewData {
  batchUid: string;
  referenceNumber: string;
  originalDemandMmscfd: number;
  proposedDemandMmscfd: number;
  demandScale: number;
  plants: PlantDistributionPreviewPlant[];
}

@Component({
  selector: 'plant-distribution-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-6 min-w-[600px] max-w-3xl">
      <h2 class="text-xl font-semibold mb-1">Plant Distribution Preview</h2>
      <p class="text-sm text-gray-500 mb-4">{{ data.referenceNumber }}</p>

      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-xs text-gray-500 mb-1">Original Demand</p>
          <p class="text-lg font-semibold">{{ data.originalDemandMmscfd }} MMscfd</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-xs text-gray-500 mb-1">Proposed Demand</p>
          <p class="text-lg font-semibold">{{ data.proposedDemandMmscfd }} MMscfd</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-xs text-gray-500 mb-1">Demand Scale</p>
          <p class="text-lg font-semibold">{{ data.demandScale }}x</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50">
              <th class="text-left py-2 px-3 font-semibold text-gray-700">Plant</th>
              <th class="text-right py-2 px-3 font-semibold text-gray-700">Capacity (MMscfd)</th>
              <th class="text-right py-2 px-3 font-semibold text-gray-700">Allocated (MMscfd)</th>
              <th class="text-right py-2 px-3 font-semibold text-gray-700">
                Allocated (Sm3/hr)
              </th>
              <th class="text-right py-2 px-3 font-semibold text-gray-700">Items</th>
            </tr>
          </thead>
          <tbody>
            @for (plant of data.plants; track plant.plantUid) {
              <tr class="border-b border-slate-100">
                <td class="py-2 px-3">
                  <p class="font-medium text-gray-900">{{ plant.plantName }}</p>
                  <p class="text-xs text-gray-500">{{ plant.plantCode }}</p>
                </td>
                <td class="py-2 px-3 text-right">
                  {{ plant.plantDailyProductionCapacityMmscfd }}
                </td>
                <td class="py-2 px-3 text-right font-semibold">
                  {{ plant.allocatedDailyMmscfd }}
                </td>
                <td class="py-2 px-3 text-right">{{ plant.allocatedHourlyFlowSm3PerHour }}</td>
                <td class="py-2 px-3 text-right">{{ plant.assignedItemsCount }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="py-6 text-center text-gray-500">No plants allocated</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="flex justify-end mt-6">
        <button mat-stroked-button (click)="close()">Close</button>
      </div>
    </div>
  `,
})
export class PlantDistributionPreviewDialogComponent {
  private dialogRef = inject(MatDialogRef<PlantDistributionPreviewDialogComponent>);
  data = inject<PlantDistributionPreviewData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
