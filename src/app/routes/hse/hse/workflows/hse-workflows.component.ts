import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Workflow, WorkflowDisplayComponent } from '@shared/components/workflows';
import { HseWorkflowService } from './hse-workflow.service';

@Component({
  selector: 'hse-workflows',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    WorkflowDisplayComponent,
  ],
  template: `
    <div class="px-6 py-6 max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="m-0 text-4xl font-bold text-slate-800">HSE Workflows</h1>
        <p class="mt-2 text-slate-600 text-base">
          Reference for the six HSE operational workflows &mdash; incidents, training, meetings,
          drills, environment management and inspections.
        </p>
      </div>

      <mat-tab-group (selectedIndexChange)="onTabChange($event)" class="mb-10">
        @for (workflow of workflows(); track workflow.name; let idx = $index) {
          <mat-tab [label]="workflow.name">
            <ng-template mat-tab-label>
              <span class="flex items-center gap-2 py-2">
                <mat-icon class="text-xl w-5 h-5">{{ getTabIcon(idx) }}</mat-icon>
                {{ workflow.name }}
              </span>
            </ng-template>

            <div class="py-6">
              <app-workflow-display [workflow]="workflow" />
            </div>
          </mat-tab>
        }
      </mat-tab-group>

      <div class="mt-10">
        <h2 class="m-0 mb-4 text-2xl font-semibold text-slate-800">Quick Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (workflow of workflows(); track workflow.name) {
            <mat-card
              class="rounded-lg border-l-4 border-[#136148] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <mat-card-header class="mb-3">
                <mat-card-title class="text-base font-semibold m-0">{{
                  workflow.name
                }}</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600 text-sm">Total Steps:</span>
                  <span class="font-semibold text-[#136148]">{{ workflow.steps.length }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-200">
                  <span class="text-slate-600 text-sm">Business Rules:</span>
                  <span class="font-semibold text-[#136148]">{{ workflow.rules.length }}</span>
                </div>
                <p class="mt-3 text-slate-600 text-xs leading-relaxed">
                  {{ workflow.description }}
                </p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HseWorkflowsComponent implements OnInit {
  workflows = signal<Workflow[]>([]);
  selectedTabIndex = signal(0);

  private tabIcons = [
    'warning',
    'school',
    'groups',
    'local_fire_department',
    'checklist',
    'eco',
  ];

  constructor(private hseWorkflowService: HseWorkflowService) {}

  ngOnInit(): void {
    this.workflows.set(this.hseWorkflowService.getWorkflows());
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
  }

  getTabIcon(index: number): string {
    return this.tabIcons[index] ?? 'flag';
  }
}
