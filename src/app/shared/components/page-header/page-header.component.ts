import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  OnDestroy,
} from '@angular/core';

import { ToggleButtonsComponent } from '../toggle-buttons/toggle-buttons.component';
import { Router } from '@angular/router';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { HeaderParameter } from './page-header.interface';
import { isValue, setObjectParameters } from '../details/util/util.helpers';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, Location } from '@angular/common';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { DataInputsComponent } from '../utility-components/data-inputs/data-inputs.component';
import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { AuthService } from 'app/routes/auth';
import { settings$ } from '@core/settings/settings.store';
import { isObservable, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MergeClassesPipe,
    MatIconModule,
    ActionButtonsComponent,
    CommonModule,
    Breadcrumb,
    ToggleButtonsComponent,
    DataInputsComponent,
  ],
})
export class PageHeaderComponent implements OnInit, OnChanges, OnDestroy {
  auth = inject(AuthService);
  router = inject(Router);
  location = inject(Location);

  @Input() title: string | undefined = '';
  @Input() subtitle: any = '';
  @Input() goBackUrl: string | undefined = undefined;

  @Input() showBackBtn = true;
  @Input() animation = settings$.value.animations?.pages;

  @Input() headerClass = '';
  @Input() toggleButtonsClass = '';
  @Input() actionButtonsClass = '';
  @Input() dataInputsClass = '';

  @Input() data: any = undefined;
  @Input() actionButtons: ActionButton[] = [];
  @Input() valueKey = 'value';
  initialValue: any = undefined;

  @Input() goBack$: Observable<any> | undefined = undefined;

  @Input() model: any = undefined; // for the inputs
  @Input() dataInputs: any[] = []; // DataInput[] = [];

  @Input() toggleButtons: any[] = [];
  @Output() toggleValue = new EventEmitter();
  @Output() toggleOption = new EventEmitter();

  @Input() headerParameter: HeaderParameter = {};
  @Input() showBreadcrumb = false;
  @Input() nav: string[] = [];

  subs = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    // only set this value once
    setObjectParameters(this, this.headerParameter);
    if (!isValue(this.initialValue)) this.initialValue = this.data;
  }

  ngOnInit() {
    setObjectParameters(this, this.headerParameter);

    if (isObservable(this.goBack$)) this.subs.add(this.goBack$!.subscribe(() => this.goBack()));

    this.nav = Array.isArray(this.nav) ? this.nav : [];
    this.title = this.title || this.nav[this.nav.length - 1];

    if (this.toggleButtons.length && !this.initialValue) {
      this.initialValue = this.toggleButtons[0]?.[this.valueKey] ?? this.toggleButtons[0].name;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  goBack() {
    if (this.goBackUrl) this.router.navigateByUrl(this.goBackUrl);
    else this.location.back();
  }

  valueChanged(event: any) {
    this.toggleValue.emit(event);
    this.toggleOption.emit(this.toggleButtons.find((o) => (o[this.valueKey] ?? o.name) === event));
  }
}
