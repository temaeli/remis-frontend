import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';

/** The external user's applications. A placeholder until the application processes exist. */
@Component({
  selector: 'app-portal-applications',
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-4">
      <page-header [title]="title" [subtitle]="subtitle" />
      <section class="w-full rounded-lg bg-white p-6">
        <p class="text-sm text-gray-600">
          You have no applications yet. Applications you make will be listed here.
        </p>
      </section>
    </div>
  `,
})
export class PortalApplications extends BaseComponent {
  override title = 'Applications';
  override subtitle = 'What you have applied for, and where each stands';
}
