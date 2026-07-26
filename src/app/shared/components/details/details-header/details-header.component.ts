import { Component, Input, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { setObjectParameters } from '../util/util.helpers';
import { MergeClassesPipe } from '../util/class-name/merge-classes.pipe';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { SignalPipe } from '../util/pipes/signal.pipe';
import { settings$ } from '@core/settings/settings.store';

export interface HeaderParameter {
  title?: string;
  titleClass?: string;
  subtitle?: string | number;
  subtitleClass?: string;
  animation?: string;

  icon?: string;
  iconClass?: string;

  data?: any;
  containerClass?: string;
  actionButtons?: ActionButton[];
  dataInputs?: Input[];
}

@Component({
  selector: 'details-header',
  templateUrl: './details-header.component.html',
  styleUrls: ['./details-header.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, ActionButtonsComponent, MergeClassesPipe, SignalPipe],
})
export class DetailsHeaderComponent implements OnInit {
  @Input() animation = settings$.value.animations?.pages;

  @Input() title?: string | Signal<string> = undefined;
  @Input() titleClass = '';

  @Input() subtitle?: string | number = undefined;
  @Input() subtitleClass = '';

  @Input() icon?: string = undefined;
  @Input() iconClass = '';

  @Input() data: any = undefined;

  @Input() containerClass = '';
  @Input() actionButtons: ActionButton[] = [];
  @Input() dataInputs: Input[] = [];

  @Input() headerParameter?: HeaderParameter;

  constructor() {
    if (this.headerParameter) setObjectParameters(this, this.headerParameter);
  }

  ngOnInit(): void {}
}
