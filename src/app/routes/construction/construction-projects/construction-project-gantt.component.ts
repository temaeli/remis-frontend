import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FetchService } from '@shared/fetch/fetch.service';
import { CONSTRUCTION_GANTT_CHART } from './construction-projects.graphql';
import { ConstructionGantt, ConstructionGanttBar } from './construction-projects.interface';

interface GanttRow extends ConstructionGanttBar {
  id: number;
  leftPercent: number;
  widthPercent: number;
  startLabel: string;
  finishLabel: string;
  durationLabel: string;
}

interface MonthTick {
  label: string;
  leftPercent: number;
}

const MS_PER_DAY = 86_400_000;

@Component({
  selector: 'construction-project-gantt',
  imports: [CommonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (gantt(); as gantt) {
      <div class="flex flex-col gap-3 bg-white rounded-lg p-4">
        <div class="flex items-center gap-4 text-sm opacity-70">
          <span class="font-semibold opacity-90">{{ gantt.projectName }}</span>
          <span>{{ gantt.chartStartDate }} — {{ gantt.chartEndDate }}</span>
          <span>Overall progress: {{ pct(gantt.projectProgressPercent) }}</span>
        </div>

        @if (rows().length) {
          <div class="gantt">
            <!-- Header row -->
            <div class="gantt-row gantt-header">
              <div class="gantt-col gantt-col--id">ID</div>
              <div class="gantt-col gantt-col--name">Task Name</div>
              <div class="gantt-col gantt-col--duration">Duration</div>
              <div class="gantt-col gantt-col--date">Start</div>
              <div class="gantt-col gantt-col--date">Finish</div>
              <div class="gantt-track">
                @for (tick of monthTicks(); track tick.label + tick.leftPercent) {
                  <span class="gantt-gridline" [style.left.%]="tick.leftPercent"></span>
                  <span class="gantt-tick" [style.left.%]="tick.leftPercent">{{ tick.label }}</span>
                }
              </div>
            </div>

            @for (row of rows(); track row.uid) {
              <div class="gantt-row" [class.gantt-row--summary]="row.type === 'CATEGORY'">
                <div class="gantt-col gantt-col--id">{{ row.id }}</div>
                <div
                  class="gantt-col gantt-col--name"
                  [class.font-semibold]="row.type === 'CATEGORY'"
                  [style.padding-left.px]="8 + row.level * 16"
                >
                  {{ row.name }}
                </div>
                <div class="gantt-col gantt-col--duration">{{ row.durationLabel }}</div>
                <div class="gantt-col gantt-col--date">{{ row.startLabel }}</div>
                <div class="gantt-col gantt-col--date">{{ row.finishLabel }}</div>

                <div class="gantt-track">
                  @for (tick of monthTicks(); track tick.label + tick.leftPercent) {
                    <span class="gantt-gridline" [style.left.%]="tick.leftPercent"></span>
                  }

                  @if (row.type === 'CATEGORY') {
                    <div
                      class="gantt-bar gantt-bar--summary"
                      [style.left.%]="row.leftPercent"
                      [style.width.%]="row.widthPercent"
                      [matTooltip]="tooltipFor(row)"
                    >
                      <span class="gantt-summary-cap gantt-summary-cap--start"></span>
                      <span class="gantt-summary-cap gantt-summary-cap--end"></span>
                    </div>
                  } @else {
                    <div
                      class="gantt-bar gantt-bar--task"
                      [class.gantt-bar--not-started]="row.status === 'NOT_STARTED'"
                      [style.left.%]="row.leftPercent"
                      [style.width.%]="row.widthPercent"
                      [matTooltip]="tooltipFor(row)"
                    >
                      <div class="gantt-bar-fill" [style.width.%]="row.progressPercent ?? 0"></div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-5 text-xs opacity-70 mt-1">
            <span class="flex items-center gap-1.5">
              <span class="legend-swatch legend-swatch--summary"></span> Summary (Main Activity)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="legend-swatch legend-swatch--task"></span> Task (Sub Activity)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="legend-swatch legend-swatch--progress"></span> Progress
            </span>
          </div>
        } @else {
          <span class="text-sm opacity-60">No schedule data yet.</span>
        }
      </div>
    } @else {
      <div class="bg-white rounded-lg p-4 text-sm opacity-60">Loading schedule…</div>
    }
  `,
  styles: [
    `
      .gantt {
        display: flex;
        flex-direction: column;
        border: 1px solid #c9c9c9;
        border-radius: 0.25rem;
        overflow: hidden;
        font-size: 0.75rem;
      }
      .gantt-row {
        display: flex;
        align-items: stretch;
        min-height: 1.75rem;
        border-top: 1px solid #e2e2e2;
      }
      .gantt-row:first-child {
        border-top: none;
      }
      .gantt-row--summary {
        background: #f7f7f7;
      }
      .gantt-header {
        min-height: 1.5rem;
        font-weight: 600;
        background: #f0f0f0;
        border-bottom: 1px solid #c9c9c9;
      }
      .gantt-col {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        padding: 0.2rem 0.5rem;
        border-right: 1px solid #e2e2e2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .gantt-col--id {
        width: 32px;
        justify-content: center;
      }
      .gantt-col--name {
        width: 220px;
      }
      .gantt-col--duration {
        width: 64px;
        justify-content: flex-end;
      }
      .gantt-col--date {
        width: 80px;
      }
      .gantt-track {
        position: relative;
        flex: 1;
        height: 100%;
        min-height: 1.5rem;
      }
      .gantt-gridline {
        position: absolute;
        top: 0;
        bottom: 0;
        border-left: 1px solid #ececec;
      }
      .gantt-tick {
        position: absolute;
        top: 0.2rem;
        font-size: 0.65rem;
        opacity: 0.65;
      }
      .gantt-bar {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        min-width: 4px;
      }

      /* Summary bar — MS Project style: thin black bar, downward-pointing end caps */
      .gantt-bar--summary {
        height: 5px;
        background: #333;
      }
      .gantt-summary-cap {
        position: absolute;
        top: 100%;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid #333;
      }
      .gantt-summary-cap--start {
        left: 0;
      }
      .gantt-summary-cap--end {
        right: 0;
      }

      /* Task bar — light blue track, darker blue progress fill */
      .gantt-bar--task {
        height: 0.85rem;
        border-radius: 2px;
        background: #cfe2f3;
        border: 1px solid #9fc5e8;
        overflow: hidden;
      }
      .gantt-bar--not-started {
        background: #f0f0f0;
        border-color: #d9d9d9;
      }
      .gantt-bar-fill {
        height: 100%;
        background: #4472c4;
      }

      .legend-swatch {
        display: inline-block;
        width: 18px;
        height: 8px;
        border-radius: 2px;
      }
      .legend-swatch--summary {
        background: #333;
        height: 5px;
      }
      .legend-swatch--task {
        background: #cfe2f3;
        border: 1px solid #9fc5e8;
      }
      .legend-swatch--progress {
        background: #4472c4;
      }
    `,
  ],
})
export class ConstructionProjectGanttComponent implements OnInit {
  projectUid = input.required<string>();

  private fs = inject(FetchService);

  gantt = signal<ConstructionGantt | undefined>(undefined);
  rows = signal<GanttRow[]>([]);
  monthTicks = signal<MonthTick[]>([]);

  async ngOnInit(): Promise<void> {
    const result: ConstructionGantt | undefined = await this.fs.fetch({
      query: CONSTRUCTION_GANTT_CHART,
      variables: { projectUid: this.projectUid() },
    });
    this.gantt.set(result);
    if (!result?.chartStartDate || !result?.chartEndDate) return;

    this.rows.set(this.buildRows(result));
    this.monthTicks.set(this.buildMonthTicks(result.chartStartDate, result.chartEndDate));
  }

  private buildRows(gantt: ConstructionGantt): GanttRow[] {
    const start = gantt.chartStartDate!;
    const end = gantt.chartEndDate!;
    const totalDays = Math.max(this.daysBetween(start, end) + 1, 1);

    const rows: GanttRow[] = [];
    let id = 0;
    const walk = (bars: ConstructionGanttBar[]) => {
      for (const bar of bars) {
        id += 1;
        const durationLabel = bar.durationDays != null ? `${bar.durationDays} days` : '—';
        const startLabel = this.formatDate(bar.startDate);
        const finishLabel = this.formatDate(bar.endDate);

        if (bar.startDate && bar.endDate) {
          const leftPercent = (this.daysBetween(start, bar.startDate) / totalDays) * 100;
          const widthPercent =
            ((this.daysBetween(bar.startDate, bar.endDate) + 1) / totalDays) * 100;
          rows.push({ ...bar, id, leftPercent, widthPercent, startLabel, finishLabel, durationLabel });
        } else {
          rows.push({ ...bar, id, leftPercent: 0, widthPercent: 0, startLabel, finishLabel, durationLabel });
        }
        if (bar.children?.length) walk(bar.children);
      }
    };
    walk(gantt.bars ?? []);
    return rows;
  }

  private buildMonthTicks(start: string, end: string): MonthTick[] {
    const totalDays = Math.max(this.daysBetween(start, end) + 1, 1);
    const ticks: MonthTick[] = [];

    const cursor = new Date(start);
    cursor.setUTCDate(1);
    const endDate = new Date(end);

    while (cursor <= endDate) {
      const leftPercent = (this.daysBetween(start, cursor.toISOString().slice(0, 10)) / totalDays) * 100;
      if (leftPercent >= 0) {
        ticks.push({
          label: cursor.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
          leftPercent,
        });
      }
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return ticks;
  }

  private daysBetween(a: string, b: string): number {
    return Math.round((Date.parse(b) - Date.parse(a)) / MS_PER_DAY);
  }

  private formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  }

  pct(value?: number): string {
    return `${(value ?? 0).toFixed(1)}%`;
  }

  tooltipFor(row: GanttRow): string {
    const status = (row.status ?? 'NOT_STARTED').replace('_', ' ');
    return `${row.name}\n${row.startLabel} → ${row.finishLabel}\n${status} · ${this.pct(row.progressPercent)}`;
  }
}
