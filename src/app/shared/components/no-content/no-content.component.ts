import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { inParensAfter } from '../details/util/field/fields.helper';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { findSidebarMatch } from '../view-component/view.helpers';
import { Router } from '@angular/router';

import { SignalPipe } from '../details/util/pipes/signal.pipe';
import { settings$, menuItems$ } from '@core/settings/settings.store';

@Component({
  selector: 'no-content',
  template: `<div
    class=" {{ 'flex items-center justify-center rounded-slight p-5 ' | mergeClasses: outerClass }}
     {{ animation }} {{ order }}"
  >
    <div
      (click)="onClick.emit(slug)"
      [ngClass]="{ 'p-5': !slim, 'px-5 py-3': slim }"
      class=" {{
        'text-gray-400 w-full max-w-[320px] cursor-pointer text-center ' +
          ' border-on-hover rounded-lg border border-gray-200/30 border-[4px] ' +
          ' hover:bg-[var(--color-primary-very-faded)]' | mergeClasses: innerClass
      }}  "
    >
      <div class="  bounce" style="--order: 8">
        @if (icon) {
          <mat-icon class="icon-large text-black faded relative top-3" [svgIcon]="icon" />
        }
      </div>
      <div
        class="{{ labelClass }} text-black faded relative top-2 opacity-60"
        [innerHTML]="label | signal | safeHtml"
      ></div>
    </div>
  </div> `,

  imports: [CommonModule, MatIconModule, SafeHtmlPipe, MergeClassesPipe, SignalPipe],
})
export class NoContentComponent implements OnInit {
  private readonly router = inject(Router);

  @Input() label: any | Signal<any> = 'No Data';
  @Input() animation = settings$.value.animations?.pages;
  @Input() order = 4;
  @Input() icon?: string;
  @Input() innerClass = '';
  @Input() outerClass: string | undefined = `min-h-[300px] size-full `;
  @Input() slim = false;
  @Input() labelClass = 'mt-4 ';
  @Input() slug = 'item';
  @Output() onClick = new EventEmitter();

  async ngOnInit() {
    const menu = findSidebarMatch(menuItems$.getValue(), this.router.url);

    if (menu) {
      if (!this.icon) this.icon = menu.icon;
      if (!this.label) this.label = 'No ' + menu.label;
    }

    if (this.outerClass && this.outerClass.includes('slim')) {
      this.slim = inParensAfter(this.outerClass, 'slim')?.trim() == 'true';
    }
  }
}
