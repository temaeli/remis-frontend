import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NumberCounterComponent } from '../number-counter/number-counter.component';
import { AnyPipe } from '../../pipes/any.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { IsValuePipe } from '../../pipes/is-value.pipe';
import { TypeOfIsPipe } from '../data-grid/pipes/type-of-is.pipe';

@Component({
  selector: 'circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss'],
  imports: [
    MatIconModule,
    NumberCounterComponent,
    AnyPipe,
    SafeHtmlPipe,
    IsValuePipe,
    TypeOfIsPipe,
  ],
})
export class CircleProgressComponent implements OnInit, OnChanges {
  @Input() animation = 'movel-left';
  @Input() progress: any = 0;
  @Input() size = 25;
  @Input() icon?: string;
  @Input() iconClass = '';
  @Input() strokeWidth = 4;
  @Input() color = 'primary';
  @Input() labelClass = '';
  @Input() order = 8;
  @Input() maxValue = 100;
  @Input() animate = true;
  @Input() label: string | number = '';
  @Input() showProgress = false;
  @Input() useDigitCouter = true;

  value = 0;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.setData();
  }

  ngOnInit(): void {
    this.setData();
  }

  setData() {
    if (!this.label) this.label = this.progress;
    if (!this.progress) return;
    if (this.progress?.toString()?.includes('.')) this.progress = Number(this.progress).toFixed(1);
    this.value = (this.progress * 100) / this.maxValue;
  }
}
