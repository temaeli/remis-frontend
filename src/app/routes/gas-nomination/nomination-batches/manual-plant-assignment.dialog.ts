import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PlantDistributionPreviewData } from './plant-distribution-preview.dialog';

export interface PlantAssignmentEntry {
  plantUid: string;
  dailyMmscfd: number;
}

@Component({
  selector: 'manual-plant-assignment-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 min-w-[600px] max-w-3xl">
      <h2 class="text-xl font-semibold mb-1">Manual Plant Distribution</h2>
      <p class="text-sm text-gray-500 mb-4">
        {{ data.referenceNumber }} — adjust each plant's daily share below, starting from the
        auto-computed split. This never auto-sends the upstreamer letter.
      </p>

      <form [formGroup]="form">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50">
                <th class="text-left py-2 px-3 font-semibold text-gray-700">Plant</th>
                <th class="text-right py-2 px-3 font-semibold text-gray-700">Capacity (MMscfd)</th>
                <th class="text-right py-2 px-3 font-semibold text-gray-700">Daily Share (MMscfd)</th>
              </tr>
            </thead>
            <tbody formArrayName="entries">
              @for (row of entries.controls; track row; let i = $index) {
                <tr class="border-b border-slate-100" [formGroupName]="i">
                  <td class="py-2 px-3">
                    <p class="font-medium text-gray-900">{{ data.plants[i].plantName }}</p>
                    <p class="text-xs text-gray-500">{{ data.plants[i].plantCode }}</p>
                  </td>
                  <td class="py-2 px-3 text-right">
                    {{ data.plants[i].plantDailyProductionCapacityMmscfd }}
                  </td>
                  <td class="py-2 px-3 text-right">
                    <mat-form-field appearance="outline" class="w-32" subscriptSizing="dynamic">
                      <input matInput type="number" formControlName="dailyMmscfd" min="0" />
                    </mat-form-field>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="py-6 text-center text-gray-500">No plants available</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </form>

      <div class="flex justify-end gap-2 mt-6">
        <button mat-stroked-button (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="confirm()">
          Confirm Distribution
        </button>
      </div>
    </div>
  `,
})
export class ManualPlantAssignmentDialogComponent {
  private dialogRef = inject(MatDialogRef<ManualPlantAssignmentDialogComponent>);
  private fb = inject(FormBuilder);
  data = inject<PlantDistributionPreviewData>(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    entries: this.fb.array(
      (this.data.plants ?? []).map((plant) =>
        this.fb.group({
          plantUid: [plant.plantUid],
          dailyMmscfd: [plant.allocatedDailyMmscfd ?? 0, [Validators.required, Validators.min(0)]],
        }),
      ),
    ),
  });

  get entries(): FormArray {
    return this.form.get('entries') as FormArray;
  }

  confirm(): void {
    if (this.form.invalid) return;
    const value: PlantAssignmentEntry[] = (this.form.value.entries ?? []).filter(
      (entry: PlantAssignmentEntry) => !!entry.plantUid && Number(entry.dailyMmscfd) > 0,
    );
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
