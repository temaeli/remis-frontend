import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataInputComponent } from './data-input/data-input.component';
import { DataInput } from '../inputs.interface';
import { settings$ } from '@core/settings/settings.store';

@Component({
  selector: 'data-inputs',
  templateUrl: './data-inputs.component.html',
  styleUrls: ['./data-inputs.component.scss'],
  imports: [DataInputComponent],
})
export class DataInputsComponent implements OnInit {
  @Input() model?: Record<string, any> = undefined;
  @Input() dataInputs: DataInput[] = [];
  @Input() animation = settings$.value.animations?.pages;
  @Output() onChange = new EventEmitter();

  ngOnInit(): void {}
}
