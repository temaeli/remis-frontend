import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ViewService } from './view.service';

const identifier = '.wheeled-item';
const props = ['value', 'rate', 'min', 'max'];

export interface HTMLElement extends Element {
  [key: string]: any;
}

export interface WheeledItemData {
  rate: number;
  value?: number;
  max?: number;
  min?: number;
}

@Injectable({
  providedIn: 'root',
})
export class WheeledItemsService implements OnDestroy {
  vs = inject(ViewService);
  wheeledItems: NodeListOf<HTMLElement> = document.querySelectorAll(identifier);
  wids: WheeledItemData[] = [];

  ///////////////////
  subs = new Subscription();
  hasReset = false;

  init() {
    this.wheeledItems = document.querySelectorAll(identifier);
    this.wids = [];
    this.hasReset = false;

    this.wheeledItems.forEach((bg, index) => {
      this.wids.push({ value: 0, rate: 0.5 });
      props.forEach(
        (k) => bg.dataset[k] && ((this.wids as any)[index][k] = parseFloat(bg.dataset[k])),
      );

      let v = '0px';
      const getValue = () => this.wids[index].value + 'px';
      if (this.vs.windowWidth$.getValue() > 991.98) v = getValue();
      bg.style.transform = `translateY(${v})`;
    });

    //listen to on resize
    this.subs.add(
      this.vs.windowWidth$.subscribe((width) => {
        this.doWheeling(this.vs.wheelDeltaY$.getValue(), width);
        this.hasReset = false;
      }),
    );

    //listen to wheel scroll
    this.subs.add(
      this.vs.wheelDeltaY$.subscribe((delta) => {
        this.doWheeling(delta, this.vs.windowWidth$.getValue());
      }),
    );
  }

  doWheeling(delta: number, windowWidth: number) {
    if ((this.hasReset && windowWidth < 991.98) || !this.wheeledItems.length) return;

    this.wheeledItems.forEach((bg, index) => {
      let v = '0px';
      if (windowWidth > 991.98) v = this.getCumulatedValue(delta, index) + 'px';
      else this.hasReset = true;
      bg.style.transform = `translateY(${v})`;
    });
  }

  getCumulatedValue(delta: number, index: number) {
    const max = this.wids[index].max;
    const min = this.wids[index].min;
    let value: any = this.wids[index].value;

    const delta_ = delta * this.wids[index].rate;
    const value_ = value + delta_;
    let limited = false;

    if (max && value_ > max && (limited = true)) value = max;
    if (min && value_ < min && (limited = true)) value = min;
    if (!limited) value = value_;

    return (this.wids[index].value = value);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
