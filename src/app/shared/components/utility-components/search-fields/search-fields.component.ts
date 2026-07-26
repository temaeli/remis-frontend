import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { isValue, valueIsEither } from '@core/helpers';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { ANIMATION } from '@shared/components/details/util/field/field.constants';
import { key, keys } from '@shared/components/details/util/field/fields.helper';
import { LabelPipe } from '@shared/components/details/util/pipes/label.pipe';
import { SearchState } from '@shared/fetch/fetch.interface';
import { AnyPipe } from '@shared/pipes/any.pipe';
import { CamelToTitleCasePipe } from '@shared/pipes/camel-to-title-case.pipe';
import { KeyPipe } from '@shared/pipes/key.pipe';

@Component({
  selector: 'search-fields',
  templateUrl: './search-fields.component.html',
  styleUrls: ['./search-fields.component.scss'],
  imports: [
    MatInputModule,
    MatSelect,
    MatAutocompleteModule,
    CamelToTitleCasePipe,
    ActionButtonsComponent,
    MatIconModule,
    FormsModule,
    MatTooltipModule,
    AnyPipe,
    LabelPipe,
    KeyPipe,
    CommonModule,
  ],
})
export class SearchFieldsComponent implements OnInit, OnChanges {
  @Input() animation = ANIMATION;
  @Input() searchKeys: string[] = [];
  @Input() model: any = undefined;
  @Input() searchByMultipleKeys = false;
  @Input() order = 2;
  @Input() icon?: string | undefined;
  @Input() delay = 300;

  @Input() searchFields: SearchState[] = [];
  @Output() searchFieldChange = new EventEmitter<SearchState[]>();
  @Output() onCancel = new EventEmitter<string>();

  timer: any = undefined;
  unUsedKeys: string[] = [];
  animation_: any = '';

  addbutton: ActionButton = {
    type: 'mini-icon',
    class: 'border',
    icon: 'add',
    click: () => this.addState(),
  };

  setData() {
    if (!this.searchFields.length) this.searchFields = [{ key: key(this.searchKeys[0]) as any }];
    const used = this.searchFields.filter((s) => isValue(s.value)).map((s) => s.key);
    this.unUsedKeys = this.searchKeys.filter((k) => !valueIsEither(key(k), used));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setData();
  }

  ngOnInit(): void {
    this.setData();
    this.animation_ = this.animation;
    const t = setTimeout(() => (this.animation_ = 'no-animation'), 2000);
  }

  onKeyUp(state: SearchState) {
    if (this.timer) clearTimeout(this.timer);
    //
    const search = () => {
      if (this.model) this.searchFields.forEach((s) => this.model && (this.model[s.key] = s.value));
      this.searchFieldChange.emit(this.searchFields);
    };

    //search rightaway if no value (to populate the first n items)
    const delay = state.value?.trim() ? this.delay : 0;
    if (delay) this.timer = setTimeout(async () => search(), delay);
    else search();
  }

  onSelectionChange(state: SearchState) {
    if (!isValue(state.value)) return;
    this.searchFieldChange.emit(this.searchFields);
  }

  removeState(state: SearchState) {
    if (!isValue(state.value)) return;
    this.searchFieldChange.emit(this.searchFields);
  }

  addState() {
    const unUsedKey: any = this.getUnusedKey();
    this.searchFields.push({ key: key(unUsedKey) as any, value: '' });
  }

  getUnfilledState() {
    return this.searchFields.find((s) => !isValue(s.value));
  }

  onCancel_(state: SearchState) {
    state.value = '';
    this.onCancel.emit(state.key);
    this.searchFieldChange.emit(this.searchFields);
  }

  getUnusedKey() {
    return this.searchKeys.find((k) => !valueIsEither(key(k), keys(this.searchFields)));
  }
}
