import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ANIMATION } from '@shared/components/details/util/field/field.constants';
import { formatDate_ } from '@shared/components/details/util/field/fields.helper';
import { DataInputComponent } from '../data-inputs/data-input/data-input.component';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DataLabelComponent } from '../data-label/data-label.component';
import { MatIconModule } from '@angular/material/icon';
import { CamelToTitleCasePipe } from '../../../pipes/camel-to-title-case.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AnyPipe } from '../../../pipes/any.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
  imports: [
    DataInputComponent,
    MatInputModule,
    MatDatepickerModule,
    DataLabelComponent,
    MatIconModule,
    CamelToTitleCasePipe,
    MatTooltipModule,
    FormsModule,
    AnyPipe,
    CommonModule,
  ],
})
export class DateFilterComponent {
  @Input() animation = ANIMATION;
  @Input() label: string | undefined = undefined;
  @Input() subLabel = undefined;
  @Input() active = false;

  @Input() toolTip = 'Enter filter Date';
  @Input() keyToolTip = 'Select key to use as Date Filter';
  @Input() labelToolTip: string | undefined = 'Filter By Date Range';
  @Input() endDateToolTip = 'Select End Date';

  @Input() icon: string | undefined = undefined;
  @Input() iconClass = '';
  @Input() keySuffixIcon = 'edit';
  @Input() order = 2;

  @Input() date = undefined;
  @Input() endDate = undefined;
  @Input() format = undefined;
  @Input() dateRange = false;
  @Input() startDateLabel = 'Start Date';
  @Input() endDateLabel = 'End Date';

  @Input() selectedKey: string | undefined = undefined;
  @Input() maxWidth = '170px';
  @Input() keys: string[] = [];

  @Output() onLabelClick = new EventEmitter<boolean>(true);
  @Output() selectedKeyChange = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<boolean>(true);

  @Output() onChange = new EventEmitter<any>();
  @Output() endDateChange = new EventEmitter<any>();
  @Output() startDateChange = new EventEmitter<any>();
  @Output() startEndDateChange = new EventEmitter<any>();

  inputContainerClass = `thin-form-fields mat-form-field-no-margin rounded-lg mat-form-field-no-padding
  inline-flex items-center border border-gray-200/50 bg-gradient-very-faded p-[1px] m-1 mx-0`;

  onDateChange($event: any) {
    let value = $event.value;
    if (this.format) value = formatDate_(value);
    this.dateRange ? this.startDateChange.emit(value) : this.onChange.emit(value);
    this.startEndDateChange_();
  }

  startEndDateChange_() {
    if (!(this.date && this.endDate)) return;

    this.startEndDateChange.emit([
      formatDate_(this.date, this.format),
      formatDate_(this.endDate, this.format),
    ]);
  }

  onEndDateChange($event: any) {
    let value = $event.value;
    if (this.format) value = formatDate_(value);
    this.endDateChange.emit(value);
    this.startEndDateChange_();
  }
}
