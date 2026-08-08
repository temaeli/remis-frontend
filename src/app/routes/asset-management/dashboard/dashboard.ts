import { ChangeDetectionStrategy, Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

import { Lookup } from '@shared/lookup';
import {
  ASSET,
  ASSET_CATEGORY,
  ASSET_SUBCATEGORY,
  ASSET_TYPE,
  ASSET_VERIFICATION,
  LAND_REGISTRATION,
} from '../asset-lookups';

interface Tile {
  label: string;
  value: number;
  route: string;
}

interface StatusBar {
  label: string;
  value: number;
  /** Width as a percentage of the largest bar, so the longest fills the track. */
  percent: number;
}

/** Turns SCREAMING_SNAKE status codes into sentence case for display. */
const humanise = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

@Component({
  selector: 'app-asset-management-dashboard',
  imports: [CommonModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-4">
      <page-header [title]="title" [subtitle]="subtitle" />

      <!-- Hero figure — the one number the view leads with. -->
      <section class="w-full rounded-lg bg-white p-6">
        <p class="text-sm text-gray-500">Registered assets</p>
        <p class="text-5xl font-semibold text-black leading-tight tabular-nums">
          {{ totalAssets() | number }}
        </p>
        <p class="text-sm text-gray-500">
          across {{ typeCount() | number }} types and
          {{ subcategoryCount() | number }} subcategories
        </p>
      </section>

      <!-- Counts. One shared accent: each tile is labelled, so colour is not
           carrying identity and a hue per tile would be decoration. -->
      <section class="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        @for (tile of tiles(); track tile.label) {
          <button
            type="button"
            class="text-left rounded-lg bg-white p-4 border-l-4 cursor-pointer
                   hover:shadow-md focus:outline-2 focus:outline-offset-2 transition-shadow"
            style="border-left-color: var(--color-primary); outline-color: var(--color-primary)"
            (click)="open(tile.route)"
          >
            <span class="block text-sm text-gray-500">{{ tile.label }}</span>
            <span class="block text-2xl font-semibold text-black tabular-nums">
              {{ tile.value | number }}
            </span>
          </button>
        }
      </section>

      <!-- Assets by status. Single series, so no legend: the row label names each
           bar and the title says what is plotted. -->
      <section class="w-full rounded-lg bg-white p-6">
        <h2 class="text-base font-semibold text-black">Assets by status</h2>
        <p class="text-sm text-gray-500 mb-4">Statuses with no assets are omitted</p>

        @if (statusBars().length) {
          <ul class="flex flex-col gap-2">
            @for (bar of statusBars(); track bar.label) {
              <li class="grid grid-cols-[10rem_1fr_3rem] items-center gap-3">
                <span class="text-sm text-gray-700 truncate" [title]="bar.label">
                  {{ bar.label }}
                </span>
                <span class="block h-4 rounded-sm bg-gray-100">
                  <span
                    class="block h-full rounded-e-sm"
                    style="background: var(--color-primary)"
                    [style.width.%]="bar.percent"
                  ></span>
                </span>
                <span class="text-sm font-medium text-black text-right tabular-nums">
                  {{ bar.value | number }}
                </span>
              </li>
            }
          </ul>
        } @else {
          <p class="text-sm text-gray-500">No assets registered yet.</p>
        }
      </section>
    </div>
  `,
})
export class Dashboard extends BaseComponent implements OnInit {
  override title = 'Asset Management';
  override subtitle = 'Registry totals and the current spread of asset statuses';

  private readonly assets = signal<Lookup[]>([]);
  private readonly counts = signal<Record<string, number>>({});

  readonly totalAssets = computed(() => this.assets().length);
  readonly typeCount = computed(() => this.counts()['types'] ?? 0);
  readonly subcategoryCount = computed(() => this.counts()['subcategories'] ?? 0);

  readonly tiles = computed<Tile[]>(() => {
    const c = this.counts();
    return [
      { label: 'Asset types', value: c['types'] ?? 0, route: 'configurations/asset-types' },
      {
        label: 'Asset categories',
        value: c['categories'] ?? 0,
        route: 'configurations/asset-categories',
      },
      {
        label: 'Asset subcategories',
        value: c['subcategories'] ?? 0,
        route: 'configurations/asset-subcategories',
      },
      {
        label: 'Land registrations',
        value: c['landRegistrations'] ?? 0,
        route: 'land-registrations',
      },
      { label: 'Verifications', value: c['verifications'] ?? 0, route: 'asset-verifications' },
    ];
  });

  readonly statusBars = computed<StatusBar[]>(() => {
    const tally = new Map<string, number>();
    for (const asset of this.assets()) {
      const status = asset.status ? String(asset.status) : 'UNKNOWN';
      tally.set(status, (tally.get(status) ?? 0) + 1);
    }

    const rows = [...tally.entries()].sort((a, b) => b[1] - a[1]);
    const largest = rows.length ? rows[0][1] : 0;

    return rows.map(([status, value]) => ({
      label: humanise(status),
      value,
      // Scaled against the largest bar rather than the total, so short bars stay
      // visible instead of collapsing to a sliver.
      percent: largest ? Math.max((value / largest) * 100, 2) : 0,
    }));
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  open(route: string) {
    this.router.navigate([route], { relativeTo: this.route.parent });
  }

  private async load(): Promise<void> {
    const asList = (res: any): any[] => (Array.isArray(res) ? res : (res?.data ?? []));

    const [assets, types, categories, subcategories, landRegistrations, verifications] =
      await Promise.all(
        [
          ASSET,
          ASSET_TYPE,
          ASSET_CATEGORY,
          ASSET_SUBCATEGORY,
          LAND_REGISTRATION,
          ASSET_VERIFICATION,
        ]
          .map((lookup) => lookup.gql.all)
          .map((query) =>
            // One failing query should leave the rest of the dashboard readable.
            this.fs
              .fetch({ query, showLoading: false })
              .then(asList)
              .catch(() => []),
          ),
      );

    this.assets.set(assets as Lookup[]);
    this.counts.set({
      types: types.length,
      categories: categories.length,
      subcategories: subcategories.length,
      landRegistrations: landRegistrations.length,
      verifications: verifications.length,
    });

    this.cdr.detectChanges();
  }
}
