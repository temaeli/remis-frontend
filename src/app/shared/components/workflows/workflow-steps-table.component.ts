import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WorkflowStep } from './workflow.models';

@Component({
  selector: 'app-workflow-steps-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="overflow-x-auto rounded-lg border border-slate-300">
      <table mat-table [dataSource]="steps()" class="w-full border-collapse bg-white">
        <ng-container matColumnDef="stepId">
          <th
            mat-header-cell
            *matHeaderCellDef
            class="bg-slate-100 font-semibold text-slate-800 px-4 py-4 text-left border-b-2 border-slate-300"
          >
            Step
          </th>
          <td mat-cell *matCellDef="let element" class="px-4 py-3 border-b border-slate-200">
            <span
              class="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#136148] to-[#11573f] text-white rounded-full font-semibold text-sm"
              >{{ element.stepId }}</span
            >
          </td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th
            mat-header-cell
            *matHeaderCellDef
            class="bg-slate-100 font-semibold text-slate-800 px-4 py-4 text-left border-b-2 border-slate-300"
          >
            Role
          </th>
          <td mat-cell *matCellDef="let element" class="px-4 py-3 border-b border-slate-200">
            <span
              class="inline-block bg-[#e8f3ef] text-[#136148] px-3 py-1 rounded-full text-xs font-medium"
              >{{ element.role }}</span
            >
          </td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th
            mat-header-cell
            *matHeaderCellDef
            class="bg-slate-100 font-semibold text-slate-800 px-4 py-4 text-left border-b-2 border-slate-300"
          >
            Action
          </th>
          <td mat-cell *matCellDef="let element" class="px-4 py-3 border-b border-slate-200">
            <div class="flex flex-col gap-2">
              <p class="m-0 text-slate-800 font-medium">{{ element.action }}</p>
              @if (element.alternativeActions) {
                <div class="flex flex-col gap-1">
                  @if (isArray(element.alternativeActions)) {
                    @for (alt of element.alternativeActions; track $index) {
                      <span
                        class="inline-block bg-[#fff8e8] text-[#fbba17] px-2 py-0.5 rounded text-xs"
                        >{{ alt }}</span
                      >
                    }
                  } @else {
                    <span
                      class="inline-block bg-[#fff8e8] text-[#fbba17] px-2 py-0.5 rounded text-xs"
                      >{{ element.alternativeActions }}</span
                    >
                  }
                </div>
              }
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="nextStep">
          <th
            mat-header-cell
            *matHeaderCellDef
            class="bg-slate-100 font-semibold text-slate-800 px-4 py-4 text-left border-b-2 border-slate-300"
          >
            Next Step
          </th>
          <td mat-cell *matCellDef="let element" class="px-4 py-3 border-b border-slate-200">
            @if (element.nextStep) {
              <span class="text-[#136148] font-medium">{{ element.nextStep }}</span>
            } @else {
              <span class="inline-block bg-[#e8f3ef] text-[#136148] px-2 py-1 rounded font-medium"
                >&#10003; Completion</span
              >
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="systemBehavior">
          <th
            mat-header-cell
            *matHeaderCellDef
            class="bg-slate-100 font-semibold text-slate-800 px-4 py-4 text-left border-b-2 border-slate-300"
          >
            System Behavior
          </th>
          <td mat-cell *matCellDef="let element" class="px-4 py-3 border-b border-slate-200">
            @if (element.systemBehavior) {
              <span
                class="inline-flex items-center justify-center cursor-help"
                [matTooltip]="element.systemBehavior"
              >
                <mat-icon class="text-xl w-5 h-5 text-[#136148]">info</mat-icon>
              </span>
            } @else {
              <span class="text-slate-400">&mdash;</span>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns" class="hover:bg-[#e8f3ef]"></tr>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStepsTableComponent {
  steps = input.required<WorkflowStep[]>();
  displayedColumns: string[] = ['stepId', 'role', 'action', 'nextStep', 'systemBehavior'];

  isArray(value: unknown): value is string[] {
    return Array.isArray(value);
  }
}
