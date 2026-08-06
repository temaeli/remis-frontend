import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { BaseComponent } from '@shared/components/base-componet/base-component';

@Component({
  selector: 'app-project-management-dashboard',
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-4">
      <page-header [title]="title" [subtitle]="subtitle" />
      <section class="w-full rounded-lg bg-white p-6">
        <p class="text-sm text-gray-500">
          Use the menu to manage the project taxonomy, the register itself, the links between
          projects, and the cost and master plan records beside them.
        </p>
      </section>
    </div>
  `,
})
export class Dashboard extends BaseComponent {
  override title = 'Project Management';
  override subtitle = 'Project registry overview';
}
