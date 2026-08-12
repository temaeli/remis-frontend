import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MergeClassesPipe } from '../util/class-name/merge-classes.pipe';
import { CommonModule } from '@angular/common';
import { findSidebarMatch } from '@shared/components/view-component/view.helpers';
import { Router } from '@angular/router';
import { menuItems$ } from '@core/settings/settings.store';
import { IconTypePipe } from '@shared/components/icon/icon-type.pipe';

@Component({
  selector: 'bg-icon-mark',
  standalone: true,
  imports: [MatIcon, MergeClassesPipe, CommonModule, IconTypePipe],
  template: ` <div
    class=" {{ outerClass ?? '' | mergeClasses: ' ' }}
       absolute overflow-hidden size-full top-0 left-0
      {{ animation }} --order-4"
  >
    <div class="absolute top-[50%] right-[-40%] size-full">
      @if (icon) {
        @switch (icon | iconType) {
          @case ('SVG') {
            <mat-icon
              [svgIcon]="icon"
              class="absolute icon-full opacity-[0.015]"
              [style.opacity]="opacity"
            />
          }
          @case ('MATERIAL') {
            <mat-icon class="absolute icon-full opacity-[0.015]" [style.opacity]="opacity">{{
              icon
            }}</mat-icon>
          }
        }
      }
    </div>
  </div>`,
})
export class BgIconMarkComponent implements AfterViewInit {
  router = inject(Router);

  @Input() public animation?: string;
  @Input() public icon?: string;
  @Input() public opacity?: number;
  @Input() public outerClass?: string;

  async ngAfterViewInit() {
    const menu = findSidebarMatch(menuItems$.getValue(), this.router.url);

    if (menu) {
      if (!this.icon) this.icon = menu.icon;
    }
  }
}
