import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ANIMATION } from '@shared/components/details/util/field/field.constants';
import { DataLabelComponent } from '../data-label/data-label.component';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'slider-range',
  templateUrl: './slider-range.component.html',
  styleUrls: ['./slider-range.component.scss'],
  imports: [CommonModule, MatSlideToggleModule],
})
export class SliderRangeComponent implements OnInit {
  @Input() label: string | undefined = undefined;
  @Input() animation = ANIMATION;

  @Input() toolTip = undefined;
  @Input() labelToolTip = undefined;

  @Input() icon: string | undefined = undefined;
  @Input() order = 2;

  @Input() value?: number[] = undefined;
  @Input() placeholder: string[] = ['from', 'to'];
  @Input() maxWidth = '200px';

  @Input() step?: number;
  @Input() min?: number;
  @Input() max?: number;

  @Output() labelClick = new EventEmitter<boolean>(true);
  @Output() cancel = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();

  ngOnInit(): void {}

  onChange_(value: any) {
    this.onChange.emit(value);
  }
}
