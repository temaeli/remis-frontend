import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FetchService } from '@shared/fetch/fetch.service';
import { CONSTRUCTION_PROJECT_DASHBOARD } from './construction-projects.graphql';
import { ConstructionDashboard } from './construction-projects.interface';

@Component({
  selector: 'construction-project-dashboard',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dashboard(); as dashboard) {
      <div class="flex flex-col gap-4 bg-white rounded-lg p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="stat-card">
            <span class="stat-label">Overall Progress</span>
            <span class="stat-value">{{ pct(dashboard.overallProgressPercent) }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Expected Progress</span>
            <span class="stat-value">{{ pct(dashboard.expectedProgressPercent) }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Schedule Variance</span>
            <span
              class="stat-value"
              [class.text-red-600]="(dashboard.scheduleVariancePercent ?? 0) < 0"
              [class.text-green-600]="(dashboard.scheduleVariancePercent ?? 0) >= 0"
            >
              {{ pct(dashboard.scheduleVariancePercent) }}
            </span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Forecast Completion</span>
            <span class="stat-value">{{ dashboard.forecastCompletionDate ?? '—' }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="stat-card">
            <span class="stat-label">Main Activity</span>
            <span class="stat-value">{{ dashboard.categoryCount ?? 0 }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Sub Activities</span>
            <span class="stat-value">{{ dashboard.activityCount ?? 0 }}</span>
            <span class="stat-sub"
              >{{ dashboard.activitiesCompleted ?? 0 }} completed ·
              {{ dashboard.activitiesInProgress ?? 0 }} in progress ·
              {{ dashboard.activitiesNotStarted ?? 0 }} not started</span
            >
          </div>
          <div class="stat-card">
            <span class="stat-label">Milestones</span>
            <span class="stat-value">{{ dashboard.milestoneCount ?? 0 }}</span>
            <span class="stat-sub"
              >{{ dashboard.milestonesCompleted ?? 0 }} completed ·
              {{ dashboard.milestonesDelayed ?? 0 }} delayed</span
            >
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Man-Hours</span>
            <span class="stat-value">{{ dashboard.totalManHours ?? 0 }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="stat-card">
            <span class="stat-label">Daily Reports</span>
            <span class="stat-value">{{ dashboard.dailyReportCount ?? 0 }}</span>
            <span class="stat-sub"
              >{{ dashboard.dailyReportsApproved ?? 0 }} approved ·
              {{ dashboard.dailyReportsPending ?? 0 }} pending</span
            >
          </div>
          <div class="stat-card">
            <span class="stat-label">Open Constraints</span>
            <span class="stat-value">{{ dashboard.openConstraintCount ?? 0 }}</span>
            <span class="stat-sub"
              >{{ dashboard.constraintsCritical ?? 0 }} critical ·
              {{ dashboard.constraintsHigh ?? 0 }} high</span
            >
          </div>
          <div class="stat-card">
            <span class="stat-label">Elapsed / Remaining Days</span>
            <span class="stat-value">{{ dashboard.elapsedDays ?? '—' }} / {{ dashboard.remainingDays ?? '—' }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Duration</span>
            <span class="stat-value">{{ dashboard.durationDays ?? '—' }} days</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 mt-2">
          <h3 class="text-sm font-semibold opacity-70">Main Activity Progress</h3>
          @for (cat of dashboard.categories ?? []; track cat.categoryUid) {
            <div class="flex items-center gap-3">
              <span class="w-40 truncate text-sm">{{ cat.name }}</span>
              <div class="flex-1 h-2 rounded bg-black/10 overflow-hidden">
                <div
                  class="h-full bg-primary rounded"
                  [style.width.%]="cat.progressPercent ?? 0"
                ></div>
              </div>
              <span class="w-16 text-right text-sm">{{ pct(cat.progressPercent) }}</span>
              <span class="w-20 text-right text-xs opacity-60">wt {{ cat.weight ?? 0 }}%</span>
            </div>
          } @empty {
            <span class="text-sm opacity-60">No Main Activity yet.</span>
          }
        </div>
      </div>
    } @else {
      <div class="bg-white rounded-lg p-4 text-sm opacity-60">Loading dashboard…</div>
    }
  `,
  styles: [
    `
      .stat-card {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        background: color-mix(in srgb, currentColor 6%, transparent);
      }
      .stat-label {
        font-size: 0.75rem;
        opacity: 0.65;
      }
      .stat-value {
        font-size: 1.25rem;
        font-weight: 600;
      }
      .stat-sub {
        font-size: 0.7rem;
        opacity: 0.6;
      }
    `,
  ],
})
export class ConstructionProjectDashboardComponent implements OnInit {
  projectUid = input.required<string>();

  private fs = inject(FetchService);

  dashboard = signal<ConstructionDashboard | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    const result = await this.fs.fetch({
      query: CONSTRUCTION_PROJECT_DASHBOARD,
      variables: { projectUid: this.projectUid() },
    });
    this.dashboard.set(result);
  }

  pct(value?: number): string {
    return `${(value ?? 0).toFixed(1)}%`;
  }
}
