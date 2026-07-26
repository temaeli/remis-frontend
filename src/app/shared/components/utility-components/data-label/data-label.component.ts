import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ANIMATION } from '@shared/components/details/util/field/field.constants';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AnyPipe } from '../../../pipes/any.pipe';

@Component({
  selector: 'data-label',
  templateUrl: './data-label.component.html',
  styleUrls: ['./data-label.component.scss'],
  imports: [IconComponent, CommonModule, MatTooltipModule, AnyPipe],
})
export class DataLabelComponent {
  @Input() label: any = undefined;
  @Input() subLabel: any = undefined;
  @Input() animation = ANIMATION;
  @Input() inContainer = true;

  @Input() iconClass = '';

  @Input() toolTip: string | number | undefined = undefined;
  @Input() icon: string | undefined = undefined;
  @Input() order = 2;
  @Input() class = '';
  @Input() active = false;

  @Output() click = new EventEmitter<boolean>(true);
}
