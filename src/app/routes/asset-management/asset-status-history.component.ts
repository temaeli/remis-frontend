import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { gql } from '@apollo/client/core';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { FetchService } from '@shared/fetch/fetch.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { NoContentComponent } from '@shared/components/no-content/no-content.component';

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

const ICON: Record<string, string> = {
  DRAFT: 'edit_note',
  SUBMITTED: 'send',
  PASSED: 'verified',
  FAILED: 'error',
  APPROVED: 'check_circle',
  CANCELLED: 'delete',
};

/**
 * The steps an asset has been through, from `assets_statuses`, newest first.
 * Registering, verifying, making available and disposing each add a row;
 * moves the DBA's type has no label for (reserved, allocated…) do not.
 */
@Component({
  selector: 'app-asset-status-history',
  imports: [DatePipe, IconComponent, NoContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Status history" class="rounded-lg bg-white p-3">
      <h3 class="mb-1 text-xs font-semibold uppercase text-gray-600">
        Status history · {{ rows().length }}
      </h3>

      @if (error()) {
        <p class="px-2 py-2 text-sm text-danger" role="alert">{{ error() }}</p>
      } @else if (rows().length) {
        <ol class="flex flex-col divide-y divide-gray-100">
          @for (row of rows(); track row.id; let first = $first) {
            <li class="flex items-center gap-3 px-2 py-2">
              <span
                class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <app-icon [icon]="iconOf(row.status)" />
              </span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="font-medium">
                  {{ meaning(row.status) }}
                  @if (first) {
                    <span class="ms-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                      Now
                    </span>
                  }
                </span>
                <span class="text-sm text-gray-700">{{ label(row.status) }}</span>
              </span>
              <span class="shrink-0 text-sm text-gray-600">
                {{ row.since ? (row.since | date: 'd MMM y, HH:mm') : 'No date' }}
              </span>
            </li>
          }
        </ol>
      } @else {
        <no-content
          icon="timeline"
          [slim]="true"
          outerClass="min-h-[160px] size-full"
          [label]="
            loading()
              ? 'Loading'
              : 'No status recorded yet. Registering, verifying or disposing the asset adds one.'
          "
        />
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

  protected iconOf(status: string): string {
    return ICON[status] ?? 'flag';
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
