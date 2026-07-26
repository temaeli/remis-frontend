import { Directive, Input, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { NavAccordion } from './nav-accordion';

@Directive({
  selector: '[navAccordionItem]',
  exportAs: 'navAccordionItem',
  host: {
    '[class.expanded]': 'expanded()',
  },
})
export class NavAccordionItem implements OnInit, OnDestroy {
  private readonly nav = inject(NavAccordion);

  readonly route = input('');

  expanded = signal(false);

  protected active = false;
  protected timer: any = undefined;

  @Input() type: 'link' | 'sub' | 'extLink' | 'extTabLink' = 'link';
  @Input() listElement!: HTMLUListElement;
  @Input() listItemElement!: HTMLLIElement;
  @Input() level!: number;
  /** Keeps this item permanently expanded, ignoring toggle/route-driven collapse. */
  @Input() initiallyExpanded = false;

  ngOnInit() {
    this.nav.addItem(this);
    if (this.initiallyExpanded) this.expanded.set(true);
  }

  ngOnDestroy() {
    this.nav.removeItem(this);
  }

  toggle() {
    if (this.initiallyExpanded) return;

    this.expanded.update((v) => !v);

    if (this.expanded()) {
      this.nav.closeOtherItems(this);
    }
  }

  setExpanded(value: boolean): void {
    if (this.initiallyExpanded) return;

    if (this.expanded() !== value) {
      this.expanded.set(value);
    }

    // this.isExpanded = this.type === 'sub' && value; // Only sub menu can be expanded
    // if ((this.active = value)) this.nav.closeOtherLinks(this);

    this.timer
      ? this.handleSubMenuLine()
      : (this.timer = setTimeout(() => this.handleSubMenuLine(), 310));
  }

  handleSubMenuLine() {
    const line: HTMLElement | null = this.listElement.querySelector('.selection-line');
    if (this.level === 0 || !line || !this.active) return; // no line in level 0

    const itemY = this.listItemElement.getBoundingClientRect().top;
    const itemH = this.listItemElement.getBoundingClientRect().height;
    const lineY = line.getBoundingClientRect().top;
    const height = itemY - lineY + itemH / 2;

    line.style.cssText = `height:${height}px`;
  }
}
