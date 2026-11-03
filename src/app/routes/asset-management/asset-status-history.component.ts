import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { gql } from '@apollo/client/core';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { FetchService } from '@shared/fetch/fetch.service';

/** An asset's rows in `assets_statuses`, newest first. */
export const STATUSES_BY_ASSET = gql`
  query statusesByAsset($assetUid: String) {
    statusesByAsset(assetUid: $assetUid) {
      id
      status
      since
    }
  }
`;

interface StatusRow {
  id: string;
  status: string;
  since?: string;
}

/**
 * What each label means for an asset. The backend writes these on its own:
 * the DBA's `statuses` type has no asset words, so each step is stored under
 * the label closest to it.
 */
const MEANING: Record<string, string> = {
  DRAFT: 'Saved as a draft',
  SUBMITTED: 'Registered, waiting for verification',
  PASSED: 'Verification passed',
  FAILED: 'Verification failed',
  APPROVED: 'Made available',
  CANCELLED: 'Disposed',
};

/**
 * The steps an asset has been through, from `assets_statuses`, newest first.
 * Registering, verifying, making available and disposing each add a row;
 * moves the DBA's type has no label for (reserved, allocated…) do not.
 */
@Component({
  selector: 'app-asset-status-history',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Status history" class="flex flex-col gap-3 p-2">
      @if (loading()) {
        <p class="text-sm text-gray-700">Loading the status history…</p>
      } @else if (error()) {
        <p class="text-sm text-red-600" role="alert">{{ error() }}</p>
      } @else if (rows().length) {
        <ol class="flex flex-col">
          @for (row of rows(); track row.id; let first = $first) {
            <li class="flex gap-3 border-l-2 border-gray-300 pl-3 pb-3">
              <span class="w-36 shrink-0 text-sm text-gray-700">
                {{ row.since ? (row.since | date: 'd MMM y, HH:mm') : 'No date' }}
              </span>
              <span>
                <span class="font-medium">{{ meaning(row.status) }}</span>
                <span class="text-gray-700"> · {{ label(row.status) }}</span>
                @if (first) {
                  <span class="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">Now</span>
                }
              </span>
            </li>
          }
        </ol>
      } @else {
        <p class="text-sm text-gray-700">
          No status recorded yet. Registering, verifying or disposing the asset adds one.
        </p>
      }
    </section>
  `,
})
export class AssetStatusHistoryComponent {
  readonly assetUid = input<string>();

  private readonly fs = inject(FetchService);

  protected readonly rows = signal<StatusRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const uid = this.assetUid();
      if (uid) void this.load(uid);
    });
  }

  protected meaning(status: string): string {
    return MEANING[status] ?? this.label(status);
  }

  protected label(status: string): string {
    return (getDisplayName(status) as string) ?? status;
  }

  private async load(uid: string): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const rows = await this.fs.fetch({
        query: STATUSES_BY_ASSET,
        variables: { assetUid: uid },
        showLoading: false,
      });
      this.rows.set(rows ?? []);
    } catch {
      this.error.set('The status history could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }
}
