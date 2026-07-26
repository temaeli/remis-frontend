import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { NoContentComponent } from '@shared/components/no-content/no-content.component';

@Component({
  selector: 'app-consultant-works',
  imports: [CommonModule, PageHeaderComponent, NoContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" />
      <no-content label="No Consultant Works" icon="category" outerClass="min-h-[300px] size-full grow" />
    </div>
  `,
})
export class ConsultantWorks {
  title = 'Consultant Works';
  subtitle = 'Consultant work items, across all projects';
}
