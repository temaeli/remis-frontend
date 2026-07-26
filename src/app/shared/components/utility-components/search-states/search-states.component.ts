import { Component, EventEmitter, Input } from '@angular/core';
import { OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ANIMATION } from '@shared/components/details/util/field/field.constants';
import { formatDate_ } from '@shared/components/details/util/field/fields.helper';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { DataInputComponent } from '../data-inputs/data-input/data-input.component';
import { LabelPipe } from '../../details/util/pipes/label.pipe';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { NumberRangeComponent } from '../number-range/number-range.component';
import { SliderRangeComponent } from '../slider-range/slider-range.component';
import { DataLabelComponent } from '../data-label/data-label.component';
import { CommonModule } from '@angular/common';
import { SearchState } from '@shared/fetch/fetch.interface';
@Component({
  selector: 'search-states',
  templateUrl: './search-states.component.html',
  styleUrls: ['./search-states.component.scss'],
  imports: [
    MergeClassesPipe,
    DataInputComponent,
    LabelPipe,
    DateFilterComponent,
    CommonModule,
    NumberRangeComponent,
    SliderRangeComponent,
    DataLabelComponent,
  ],
})
export class SearchStatesComponent implements OnInit, OnChanges {
  @Input() animation = ANIMATION;

  @Input() order = 2;
  @Input() showSearchStates = true;
  @Input() states: SearchState[] = [];

  @Output() labelClick = new EventEmitter<any>(true);
  @Output() onChange = new EventEmitter<any>();
  @Output() clearSearchStates = new EventEmitter<any>(true);

  inputContainerClass = `thin-form-fields mat-form-field-no-margin rounded-lg mat-form-field-no-padding
  inline-flex items-center border border-gray-200/50 bg-gradient-very-faded p-[1px] m-1 mx-0`;

  listStateValueClass = `inline-block text-center p-1 m-1 px-2 rounded-lg
border-slightly-faded_  bg-hover-slightly-gradient cursor-pointer text-bold border-on-hover`;

  hasClear = true;

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit(): void {
    this.states = this.states.map((state) => {
      if (!state.labelsMapper) state.labelsMapper = (v: any) => v;
      state.labelsMap = {};

      state.labelsMap = state.values?.reduce(
        (p: any, v: any) => ({ ...p, [v]: state?.labelsMapper?.(v) }),
        {},
      );

      return state;
    });

    this.hasClear = this.states.filter((s) => !s.locked).every((s) => s?.hasClear !== false);
  }

  onChange_(state: SearchState, value: any) {
    if (state.type == 'date') value = formatDate_(value, state?.format);
    this.onChange.emit({ state, value });
    if (state.onchange) state.onchange(value);
  }

  hasActiveStates() {
    return !!this.states
      ?.filter((s) => !s.isQueryVariable)
      ?.find((state) => !state.locked && (!!state.value || state.value === false));
  }
}
