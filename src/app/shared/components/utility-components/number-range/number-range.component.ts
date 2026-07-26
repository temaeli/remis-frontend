import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ANIMATION } from '@shared/components/details/util/field/field.constants';
import { DataLabelComponent } from '../data-label/data-label.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { isValue } from '@core/helpers';

@Component({
  selector: 'number-range',
  templateUrl: './number-range.component.html',
  styleUrls: ['./number-range.component.scss'],
  imports: [DataLabelComponent, MatInputModule, MatIconModule],
})
export class NumberRangeComponent implements OnInit {
  @Input() label: string | undefined = undefined;
  @Input() animation = ANIMATION;

  @Input() toolTip = undefined;
  @Input() labelToolTip = undefined;

  @Input() icon: string | undefined = undefined;
  @Input() order = 2;

  @Input() value: number[] | any = [undefined, undefined];
  @Input() placeholder: string[] = ['from', 'to'];
  @Input() maxWidth = '200px';

  @Input() min?: number;
  @Input() max?: number;

  @Output() labelClick = new EventEmitter<boolean>(true);
  @Output() onCancel = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();

  ngOnInit(): void {}

  onChange_(index: any, event: any) {
    const value = event.target.value;
    this.value[index] = Number(value);
  }

  onLabelClick() {
    if (isValue(this.value[0]) || isValue(this.value[1])) this.onChange.emit(this.value);
  }
}
