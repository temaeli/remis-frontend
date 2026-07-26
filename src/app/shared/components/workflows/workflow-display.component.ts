import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Workflow } from './workflow.models';
import { WorkflowStepsTableComponent } from './workflow-steps-table.component';
import { WorkflowDiagramComponent } from './workflow-diagram.component';

@Component({
  selector: 'app-workflow-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    WorkflowStepsTableComponent,
    WorkflowDiagramComponent,
  ],
  template: `
    <div class="flex flex-col gap-6 px-6 py-6 max-w-5xl mx-auto">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="m-0 text-3xl font-semibold text-slate-800">{{ workflow().name }}</h1>
          <p class="mt-2 text-slate-600 text-base">{{ workflow().description }}</p>
        </div>
      </div>

      <mat-card class="rounded-lg shadow-md bg-white">
        <mat-card-header class="mb-4">
          <mat-card-title class="text-lg font-semibold m-0">Process Flow Diagram</mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-4">
          <app-workflow-diagram [workflow]="workflow()" />
        </mat-card-content>
      </mat-card>

      <mat-card class="rounded-lg shadow-md bg-gradient-to-br from-[#e8f3ef] to-[#d0e7df]">
        <mat-card-header class="mb-4">
          <mat-card-title class="text-lg font-semibold m-0">Detailed Process Flow</mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-4">
          <div class="flex flex-col items-center py-5">
            @for (step of workflow().steps; track step.stepId; let last = $last) {
              <div class="flex flex-col items-center w-full">
                <div
                  class="flex items-start gap-3 bg-white px-4 py-4 rounded-lg shadow-sm w-full max-w-lg border-2 border-[#136148]"
                >
                  <div
                    class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#136148] to-[#11573f] text-white rounded-full font-semibold text-base flex-shrink-0 mt-0.5"
                  >
                    {{ step.stepId }}
                  </div>
                  <div class="flex-1">
                    <p class="m-0 font-semibold text-slate-800 text-sm">{{ step.role }}</p>
                    <p class="mt-1 text-slate-600 text-xs font-medium">{{ step.action }}</p>
                    @if (step.nextStep) {
                      <p class="mt-2 text-xs text-emerald-700 font-semibold">
                        &rarr; {{ step.nextStep }}
                      </p>
                    }
                    @if (step.systemBehavior) {
                      <p class="mt-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {{ step.systemBehavior }}
                      </p>
                    }
                  </div>
                </div>

                @if (step.alternativeActions) {
                  <div class="my-3 flex items-center gap-2">
                    @if (isArray(step.alternativeActions)) {
                      @for (alt of step.alternativeActions; track $index) {
                        <div class="flex flex-col items-center">
                          <div class="text-amber-600 text-sm">&swarr;</div>
                          <div
                            class="bg-amber-50 border-2 border-amber-400 text-amber-800 px-3 py-2 rounded text-xs font-medium whitespace-nowrap"
                          >
                            &times; {{ alt }}
                          </div>
                        </div>
                        @if ($index < step.alternativeActions.length - 1) {
                          <div class="mx-1 text-amber-400 text-sm">&bull;</div>
                        }
                      }
                    } @else {
                      <div class="flex flex-col items-center">
                        <div class="text-amber-600 text-sm">&swarr;</div>
                        <div
                          class="bg-amber-50 border-2 border-amber-400 text-amber-800 px-3 py-2 rounded text-xs font-medium whitespace-nowrap"
                        >
                          &times; {{ step.alternativeActions }}
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (!last) {
                  <div class="flex items-center justify-center text-[#136148] my-2 text-2xl">
                    <mat-icon>arrow_downward</mat-icon>
                  </div>
                }
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>

      @if (workflow().rules && workflow().rules.length > 0) {
        <mat-card class="rounded-lg shadow-md bg-gradient-to-br from-[#fff8e8] to-[#ffefd1]">
          <mat-card-header class="mb-4">
            <mat-card-title class="text-lg font-semibold m-0">Business Rules</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-4">
            <div class="flex flex-col gap-3">
              @for (rule of getRules(); track $index) {
                <div class="flex items-start gap-3 py-2">
                  <mat-icon class="text-[#136148] flex-shrink-0 mt-0.5">check_circle</mat-icon>
                  <span class="text-slate-700">{{ rule }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="rounded-lg shadow-md bg-white">
        <mat-card-header class="mb-4">
          <mat-card-title class="text-lg font-semibold m-0">Detailed Steps</mat-card-title>
        </mat-card-header>
        <mat-card-content class="p-4">
          <app-workflow-steps-table [steps]="workflow().steps" />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowDisplayComponent {
  workflow = input.required<Workflow>();

  getRules(): string[] {
    const rules = this.workflow().rules;
    if (Array.isArray(rules)) {
      return rules as string[];
    }
    return (rules as { rule: string }[]).map((r: { rule: string }) => r.rule);
  }

  isArray(value: unknown): value is string[] {
    return Array.isArray(value);
  }
}
