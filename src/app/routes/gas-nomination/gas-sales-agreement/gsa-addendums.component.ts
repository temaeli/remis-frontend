import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { Location } from '@angular/common';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ContentsViewComponent } from '@shared/components/view-component/contents-view/contents-view.component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { LoadingDirective } from '@core/loading/loader.directive';
import { GsaAddendum } from './gas-sales-agreement.interface';
import { GAS_SALES_AGREEMENT_ADDENDUMS } from './gas-sales-agreement.graphql';
import { approvalHistoryContent, GSA_SUBJECT } from './gsa-approval-history';

@Component({
  selector: 'app-gsa-addendums',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ContentsViewComponent, LoadingDirective],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3" [loading]="isLoading">
      <page-header
        [title]="title"
        [subtitle]="subtitle()"
        [showBackBtn]="true"
        [goBackUrl]="'/gas-nomination/gas-sales-agreement'"
      />

      <div class="container-fluid mt-4 grow">
        <div class="row">
          <div class="col-12">
            @if (addendums().length === 0) {
              <div class="alert alert-info">No addendums found</div>
            } @else {
              <div class="card">
                <div class="card-body">
                  @for (addendum of addendums(); track $index) {
                    <div class="addendum-item mb-4" [class.border-top]="$index > 0">
                      <div class="row pt-3">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="text-muted small">Reason</label>
                            <p class="fw-500">{{ addendum.reason }}</p>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="text-muted small">Addendum Date</label>
                            <p class="fw-500">{{ addendum.addendumDate | date: 'MMM dd, yyyy' }}</p>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="text-muted small">New End Date</label>
                            <p class="fw-500">
                              {{
                                addendum.newEndDate
                                  ? (addendum.newEndDate | date: 'MMM dd, yyyy')
                                  : 'N/A'
                              }}
                            </p>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="text-muted small">New Min Daily (MMscfd)</label>
                            <p class="fw-500">{{ addendum.newMinimumDailyMmscfd || 'N/A' }}</p>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="text-muted small">New Max Daily (MMscfd)</label>
                            <p class="fw-500">{{ addendum.newMaximumDailyMmscfd || 'N/A' }}</p>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-group">
                            <label class="text-muted small">Created At</label>
                            <p class="fw-500">
                              {{ addendum.createdAt | date: 'MMM dd, yyyy HH:mm' }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      <contents-view class="block" [contents]="[approvalHistoryTab]" *ngIf="approvalHistoryTab" />
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .addendum-item {
        padding: 1rem 0;
        border-bottom: 1px solid #e5e5e5;
      }
      .addendum-item:last-child {
        border-bottom: none;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      p {
        margin-bottom: 0;
        font-size: 0.95rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GsaAddendumComponent extends BaseComponent implements OnInit {
  private location = inject(Location);

  subtitle = signal('');
  addendums = signal<GsaAddendum[]>([]);
  approvalHistoryTab: ContentParameter | undefined;

  override title = 'Addendums';

  ngOnInit(): void {
    this.loadAddendums();
  }

  private async loadAddendums(): Promise<void> {
    const agreementUid = this.route.snapshot.paramMap.get('uid');
    const contractNumber = this.route.snapshot.queryParamMap.get('contractNumber');

    if (!agreementUid) {
      this.location.back();
      return;
    }

    this.subtitle.set(`Contract: ${contractNumber || 'N/A'}`);

    try {
      const data: GsaAddendum[] = await this.fs.fetch({
        notify: true,
        variables: { agreementUid },
        query: GAS_SALES_AGREEMENT_ADDENDUMS,
      });
      this.addendums.set(data || []);

      // Set approval history tab
      this.approvalHistoryTab = approvalHistoryContent(
        GSA_SUBJECT.GAS_SALES_AGREEMENT,
        agreementUid,
      );

      this.cdr.detectChanges();
    } catch (error) {
      // Error handled by fetch service
      this.location.back();
    }
  }
}
