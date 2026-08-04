import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-land-management-dashboard',
  template: `<p>Land Management dashboard works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
