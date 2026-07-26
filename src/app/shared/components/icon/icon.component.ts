import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IconTypePipe } from './icon-type.pipe';

@Component({
  selector: 'app-icon',
  template: `
    <ng-container *ngIf="icon">
      <ng-container *ngIf="icon | iconType as type">
        <mat-icon
          *ngIf="type === 'SVG'; else materialIconTpl"
          class="{{ iconClass }}"
          [svgIcon]="icon"
        />

        <ng-template #materialIconTpl>
          <mat-icon class="{{ iconClass }} "> {{ icon }} </mat-icon>
        </ng-template>
      </ng-container>
    </ng-container>
  `,

  host: { class: 'flex items-center justify-center' },
  imports: [MatIcon, CommonModule, IconTypePipe],
})
export class IconComponent implements OnInit {
  @Input() iconClass?: string | null | undefined;
  @Input() icon?: string | null | undefined;

  ngOnInit() {}
}
