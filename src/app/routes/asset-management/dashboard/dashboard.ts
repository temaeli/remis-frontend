import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-asset-management-dashboard',
  template: `<p>Asset Management dashboard works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
