import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';

/** The external user's landing page. A placeholder until there is something to summarise. */
@Component({
  selector: 'app-portal-dashboard',
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-4">
      <page-header [title]="title" [subtitle]="subtitle" />
      <section class="w-full rounded-lg bg-white p-6">
        <p class="text-sm text-gray-600">
          Your applications and their progress will appear here.
        </p>
      </section>
    </div>
  `,
})
export class PortalDashboard extends BaseComponent {
  override title = 'Dashboard';
  override subtitle = 'Welcome to your portal';
}
