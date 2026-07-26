import { ViewChild, Renderer2, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { Component, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { isValue } from '@core/helpers';

@Component({
  selector: 'number-counter',
  template: `
    <span
      #numberElement
      id="numberCounter"
      [style.letter-spacing]="letterSpacing"
      [style.font-size]="digitSize"
      [style.--line-height]="lineHeight ?? digitSize"
    ></span>
  `,
  styleUrls: ['./number-counter.component.scss'],
})
export class NumberCounterComponent implements OnChanges, AfterViewInit {
  @Input() number = 0;
  @Input() time = 500;
  @Input() digitSize?: string = undefined;
  @Input() lineHeight?: string = undefined;
  @Input() letterSpacing = '1px';
  @Input() useCommaSeparators = false;

  @ViewChild('numberElement', { static: true }) numberElement!: ElementRef;
  private currNum = 0;
  numEl: Element | any = undefined;

  cdr = inject(ChangeDetectorRef);

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.numEl = this.numberElement.nativeElement;
    if (!this.digitSize) this.digitSize = getComputedStyle(this.numEl, null).fontSize;
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['number']) {
      if (changes['number'].firstChange) this.setup(this.number);
      else this.update(this.number);
    }
    this.cdr.detectChanges();
  }

  private scrollNumber(digits: string[]): void {
    this.numEl.querySelectorAll('span[data-value]').forEach((tick: any, i: number) => {
      tick.style.transform = `translateY(-${100 * this.getDigitValue(digits[i])}%)`;
    });

    const width = `${getComputedStyle(this.numEl, null).width}px`;
    setTimeout(() => (this.numEl.style.width = width), 100);
  }

  private addDigit(digit: string, fresh: boolean): void {
    const digitContainer = this.renderer.createElement('span');
    this.renderer.addClass(digitContainer, 'digit-container');
    this.renderer.setStyle(digitContainer, 'transform', 'translateY(-1000%)');
    this.renderer.setAttribute(digitContainer, 'data-value', digit);

    if (digit === ',') {
      const commaValue = this.renderer.createElement('span');
      this.renderer.addClass(commaValue, 'digit-value');
      this.renderer.setProperty(commaValue, 'textContent', ',');
      this.renderer.appendChild(digitContainer, commaValue);
    } else {
      for (let j = 0; j < 10; j++) {
        const digitValue = this.renderer.createElement('span');
        this.renderer.addClass(digitValue, 'digit-value');
        this.renderer.setProperty(digitValue, 'textContent', j.toString());
        this.renderer.appendChild(digitContainer, digitValue);
      }
    }

    this.renderer.appendChild(this.numEl, digitContainer);
    setTimeout(() => this.renderer.addClass(digitContainer, 'visible'), fresh ? 0 : this.time);
  }

  private removeDigit(): void {
    const firstDigit = this.numEl.lastElementChild;
    this.renderer.removeClass(firstDigit, 'visible');
    setTimeout(() => this.renderer.removeChild(this.numEl, firstDigit), this.time);
  }

  private setup(startNum: number): void {
    if (!isValue(startNum)) return;
    const digits = this.formatNumber(startNum).split('');
    this.numEl = this.numberElement.nativeElement;
    this.numEl.innerHTML = '';

    for (let i = 0; i < digits.length; i++) this.addDigit(digits[i], true);

    this.scrollNumber(Array(String(this.formatNumber(startNum)).length).fill('0'));
    setTimeout(() => this.scrollNumber(digits), this.time);
    this.currNum = startNum;
  }

  private update(num: number): void {
    const toDigits = this.formatNumber(num)?.split('');
    const fromDigits = this.formatNumber(this.currNum).split('');

    if ((this.currNum === 0 && num > 0) || num === 0) return this.setup(num);
    for (let i = fromDigits.length - toDigits.length; i > 0; i--) this.removeDigit();
    for (let i = fromDigits.length; i < toDigits.length; i++) this.addDigit(toDigits[i], false);

    this.scrollNumber(toDigits);
    this.currNum = num;

    const tex = Array.from(this.numEl.querySelectorAll('.visible')).map((s: any) => s['textContent']);
    const numLen = this.formatNumber(this.currNum).split('').length;
    const hasCorrectCommas = this.hasCorrectCommas(tex);

    if (numLen !== tex.length || !hasCorrectCommas) this.setup(num);
  }

  private formatNumber(num: number): string {
    if (this.useCommaSeparators) return num?.toLocaleString();
    return num?.toString();
  }

  private getDigitValue(digit: string): number {
    if (digit === ',') return 0;
    return parseInt(digit);
  }

  hasCorrectCommas(digitElements: string[]): boolean {
    // Track digit count since last comma (right to left)
    let digitsSinceLastComma = 0;

    for (let i = digitElements.length - 1; i >= 0; i--) {
      const element = digitElements[i];
      // Comma should only appear after exactly 3 digits (except possibly first group)
      if (element === ',') {
        if (digitsSinceLastComma !== 3 && i !== digitElements.length - 4) return false;
        digitsSinceLastComma = 0;
      } else if (element === '0123456789') digitsSinceLastComma++;
      // Ignore other element types
    }

    // After checking all, remaining digits should be <= 3
    return digitsSinceLastComma <= 3;
  }
}
