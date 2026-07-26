import { HostListener, inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { ViewService } from './view.service';

export interface HTMLElement extends Element {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ParallaxService implements OnDestroy {
  vs = inject(ViewService);

  ///parallax effect on bg
  backgrounds: NodeListOf<HTMLElement> = document.querySelectorAll('.parallax-bg');
  backgrounds_offsets: number[] = [];
  backgrounds_rates: number[] = [];

  ///////////////////
  subs = new Subscription();
  hasResetBg = false;

  initParallax() {
    this.backgrounds = document.querySelectorAll('.parallax-bg');
    this.backgrounds_offsets = [];
    this.backgrounds_rates = [];
    this.hasResetBg = false;

    this.backgrounds.forEach((bg, index) => {
      this.backgrounds_offsets.push(0);
      this.backgrounds_rates.push(0.5);

      if (bg.dataset.offset) this.backgrounds_offsets[index] = parseInt(bg.dataset.offset);
      if (bg.dataset.rate) this.backgrounds_rates[index] = parseFloat(bg.dataset.rate);

      if (this.vs.windowWidth$.getValue() < 991.98) bg.style.backgroundPosition = '0px 0px';
      else bg.style.backgroundPosition = '0px ' + -1 * this.backgrounds_offsets[index] + 'px';
    });

    //listen to on resize
    this.subs.add(
      this.vs.windowWidth$.subscribe((width) => {
        this.scrollbackground(this.vs.scrollTop$.getValue(), width);
        this.hasResetBg = false;
      }),
    );

    //listen to scroll
    this.subs.add(
      this.vs.scrollTop$.subscribe((top) => {
        this.scrollbackground(top, this.vs.windowWidth$.getValue());
      }),
    );
  }

  scrollbackground(scrollTop: number, windowWidth: number) {
    if ((this.hasResetBg && windowWidth < 991.98) || !this.backgrounds.length) return;

    this.backgrounds.forEach((bg, i) => {
      let value = '0px 0px';
      const getValue = () => scrollTop * this.backgrounds_rates[i] - this.backgrounds_offsets[i];
      if (windowWidth < 991.98) this.hasResetBg = true;
      else value = '0px ' + getValue() + 'px';
      bg.style.backgroundPosition = value;
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
