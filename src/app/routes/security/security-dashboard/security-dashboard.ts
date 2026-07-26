import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  SECURITY_DASHBOARD_COUNTS,
  SECURITY_OCCURRENCE_LOG_FEED,
  SECURITY_GUARD_INITIATED_INCIDENTS,
  SecurityDashboardDto,
  SecurityOccurrenceLogEntry,
  SecurityGuardInitiatedIncident,
} from './security-dashboard.graphql';
import { securityOpsReportPdfBtn } from '../shared/security-pdf';

interface DashboardCard {
  label: string;
  icon: string;
  value: number;
  accent: string;
}

@Component({
  selector: 'security-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-4">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (card of cards; track card.label) {
          <div
            class="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4 shadow-sm"
          >
            <span
              class="material-icons rounded-lg p-3 text-2xl"
              [class]="card.accent"
              aria-hidden="true"
              >{{ card.icon }}</span
            >
            <div class="flex flex-col">
              <span class="text-2xl font-semibold text-gray-900">{{ card.value }}</span>
              <span class="text-sm text-gray-500">{{ card.label }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Control Room / CCTV Supervisor feeds -->
      @if (occurrenceLogFeed.length > 0 || guardInitiatedIncidents.length > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          @if (occurrenceLogFeed.length > 0) {
            <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 class="text-base font-semibold text-gray-900 mb-4">Occurrence Log Feed</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-2 pr-3 font-medium text-gray-600">Form</th>
                      <th class="text-left py-2 pr-3 font-medium text-gray-600">Station</th>
                      <th class="text-left py-2 pr-3 font-medium text-gray-600">Status</th>
                      <th class="text-left py-2 font-medium text-gray-600">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of occurrenceLogFeed; track entry.uid) {
                      <tr class="border-b border-gray-100">
                        <td class="py-2 pr-3 text-gray-900">{{ entry.form?.name }}</td>
                        <td class="py-2 pr-3 text-gray-700">{{ entry.station?.name }}</td>
                        <td class="py-2 pr-3 text-gray-700">{{ entry.status }}</td>
                        <td class="py-2 text-gray-500">{{ entry.createdAt | date: 'short' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (guardInitiatedIncidents.length > 0) {
            <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 class="text-base font-semibold text-gray-900 mb-4">Recent Incidents</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-2 pr-3 font-medium text-gray-600">Reference</th>
                      <th class="text-left py-2 pr-3 font-medium text-gray-600">Type</th>
                      <th class="text-left py-2 pr-3 font-medium text-gray-600">Severity</th>
                      <th class="text-left py-2 pr-3 font-medium text-gray-600">Status</th>
                      <th class="text-left py-2 font-medium text-gray-600">Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (incident of guardInitiatedIncidents; track incident.uid) {
                      <tr class="border-b border-gray-100">
                        <td class="py-2 pr-3 text-gray-900">{{ incident.referenceNumber }}</td>
                        <td class="py-2 pr-3 text-gray-700">{{ incident.incidentType?.name }}</td>
                        <td class="py-2 pr-3 text-gray-700">{{ incident.severity }}</td>
                        <td class="py-2 pr-3 text-gray-700">{{ incident.status }}</td>
                        <td class="py-2 text-gray-500">{{ incident.createdAt | date: 'short' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SecurityDashboard extends BaseComponent implements OnInit {
  override title = 'Security Dashboard';
  override subtitle = 'Overview of security operations';

  override actionButtons: ActionButton[] = [securityOpsReportPdfBtn(this)];

  cards: DashboardCard[] = [];
  occurrenceLogFeed: SecurityOccurrenceLogEntry[] = [];
  guardInitiatedIncidents: SecurityGuardInitiatedIncident[] = [];

  private fetchParameter: FetchParameter = {
    loadingOn: 'no-content',
    query: SECURITY_DASHBOARD_COUNTS,
  };

  async ngOnInit(): Promise<void> {
    const data: SecurityDashboardDto = (await this.fs.fetch(this.fetchParameter)) ?? {};
    this.cards = [
      {
        label: 'Open Incidents',
        icon: 'report',
        value: data.openIncidents ?? 0,
        accent: 'bg-red-100 text-red-600',
      },
      {
        label: 'Total Incidents',
        icon: 'summarize',
        value: data.totalIncidents ?? 0,
        accent: 'bg-blue-100 text-blue-600',
      },
      {
        label: 'Incidents Awaiting Review',
        icon: 'pending_actions',
        value: data.incidentsAwaitingReview ?? 0,
        accent: 'bg-amber-100 text-amber-600',
      },
      {
        label: 'Total Investigations',
        icon: 'policy',
        value: data.totalInvestigations ?? 0,
        accent: 'bg-indigo-100 text-indigo-600',
      },
      {
        label: 'Open Action Items',
        icon: 'task',
        value: data.openActionItems ?? 0,
        accent: 'bg-orange-100 text-orange-600',
      },
      {
        label: 'Active Guards',
        icon: 'local_police',
        value: data.activeGuards ?? 0,
        accent: 'bg-green-100 text-green-600',
      },
      {
        label: 'Rosters Awaiting Approval',
        icon: 'calendar_month',
        value: data.rostersAwaitingApproval ?? 0,
        accent: 'bg-purple-100 text-purple-600',
      },
      {
        label: 'Gate Passes Pending Approval',
        icon: 'badge',
        value: data.gatePassesPendingApproval ?? 0,
        accent: 'bg-teal-100 text-teal-600',
      },
      {
        label: 'Gate Passes Approved',
        icon: 'approval',
        value: data.gatePassesApproved ?? 0,
        accent: 'bg-cyan-100 text-cyan-600',
      },
      {
        label: 'Gate Passes Closed',
        icon: 'check_box',
        value: data.gatePassesClosed ?? 0,
        accent: 'bg-emerald-100 text-emerald-600',
      },
      {
        label: 'Gate Passes Unclosed',
        icon: 'pending',
        value: data.gatePassesUnclosed ?? 0,
        accent: 'bg-yellow-100 text-yellow-600',
      },
      {
        label: 'Denied Access Events',
        icon: 'block',
        value: data.deniedAccessEvents ?? 0,
        accent: 'bg-rose-100 text-rose-600',
      },
    ];

    // Control-room-guard / CCTV-supervisor feeds — permission-gated server-side,
    // so these simply come back empty for users without the relevant role.
    const [occurrenceLogFeed, guardInitiatedIncidents] = await Promise.all([
      this.fs.fetch({
        loadingOn: 'no-content',
        query: SECURITY_OCCURRENCE_LOG_FEED,
        showLoading: false,
        handleException: false,
      }),
      this.fs.fetch({
        loadingOn: 'no-content',
        query: SECURITY_GUARD_INITIATED_INCIDENTS,
        showLoading: false,
        handleException: false,
      }),
    ]);
    this.occurrenceLogFeed = occurrenceLogFeed ?? [];
    this.guardInitiatedIncidents = guardInitiatedIncidents ?? [];

    this.cdr.detectChanges();
  }
}
