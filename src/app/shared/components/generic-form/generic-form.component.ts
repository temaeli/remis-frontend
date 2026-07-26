import { NgZone, OnChanges, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input } from '@angular/core';
import { StepperOrientation } from '@angular/cdk/stepper';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { Subscription, isObservable, lastValueFrom } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DynamicFormService } from './generic-form.service';
import { getInvalidControls } from './field-helpers';
import { FieldConfig, FieldType, FormStepper, ObserverParameter } from './field.interface';
import { StepperAppearance, StepperLabelPosition } from './form.interface';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AnyPipe } from '../../pipes/any.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { findReplace, areObjectsEqual, Obj } from '../../../core/helpers';
import { GenericFieldDirective } from './field.directive';
import { StepIndicatorComponent } from './step-indicator/step-indicator.component';
import { MergeClassesPipe } from '../details/util/class-name/merge-classes.pipe';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'generic-form',
  templateUrl: `generic-form.component.html`,
  standalone: true,
  imports: [
    MatStepper,
    MatStep,
    CommonModule,
    GenericFieldDirective,
    ReactiveFormsModule,
    MatIcon,
    MatTooltip,
    MergeClassesPipe,
  ],
  styles: [],
  host: { class: 'grow' },
})
export class GenericFormComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  dfs = inject(DynamicFormService);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);
  notify = inject(NotificationService);
  ngZone = inject(NgZone);

  @ViewChild(MatStepper, { static: true }) stepper?: MatStepper;

  @Input() fields: FieldConfig[] = [];
  @Input() hostClass = '';
  @Input() field?: FieldConfig = undefined; // for field with fields
  @Input() animation = 'scale-up origin-left';
  @Input() formData: any = null;
  @Input() isFormOpen = true;
  @Input() loading = false;
  @Input() fieldsClass?: string = undefined;
  @Input() outerClass?: string = undefined;
  @Input() loadingMessage = 'Please Wait, Loading Form Options...';

  @Input() form!: FormGroup;
  @Input() parentForm?: FormGroup;
  @Input() formIndex?: number = 0;

  @Input() formObservers: ObserverParameter[] = [];

  // when using stepper
  @Input() formSteppers: FormStepper[] = [];
  @Input() linearSteppers = true;
  @Input() stepperOrientation: StepperOrientation = 'horizontal';
  @Input() stepperLabelPosition: StepperLabelPosition = 'end';
  @Input() stepperAppearance: StepperAppearance = 'fill';
  @Input() showStepperCancel = true;
  stepValue: any = undefined;

  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectedData: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeForm: EventEmitter<any> = new EventEmitter<any>();

  @Input() emitChange = false;
  @Output() change = new EventEmitter();
  @Output() stepperClose = new EventEmitter();

  @Output() scrolledToBottom: EventEmitter<any> = new EventEmitter<any>();
  @Output() scrolledToTop: EventEmitter<any> = new EventEmitter<any>();

  saveButton?: FieldConfig = undefined;

  selectedKeyValue = [];
  subscriptions = new Subscription();

  allShowKeys: string[] = [];
  allSetKeys: string[] = [];
  allObservedKeys: string[] = [];

  isLoading = true;

  get value() {
    return this.form?.value;
  }

  ngOnDestroy(): void {
    this.fields.forEach((field) => (field.value = undefined));
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {}

  ngOnInit() {
    // console.log(this.form);

    if (!this.form) return;
    if (!this.isFormOpen) this.form.reset();

    this.subscriptions.add(
      this.form.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
        this.emitChange && this.change.emit(value);
      }),
    );

    // set initial values to inputs
    this.fields.forEach((field) => (field.value = this.form?.value[field?.key]));
    // set conditional disabled
    this.fields.forEach((field) => this.dfs.setDisabled(field, (this.form as any)));
    //set form steps if provided
    if (this.formSteppers.length) this.setFormSteps();
    //listen to changes on fields mentioned on change when
    this.listenToChanges();
    // map fields
    this.mapFields();

    // remove animation after loading
    setTimeout(() => {
      this.animation = '';
      this.cdr.detectChanges();
    }, 400);

    this.isLoading = false;
  }

  ngOnChanges() {
    this.cdr.detectChanges();
    // console.log(this.cdr.detectChanges());
  }

  cancelForm() {
    this.closeForm.emit();
  }

  mapFields() {
    this.fields = this.fields.map((field) => {
      // handle mapper
      if (field.optionsVariablesMapper && this.form) {
        field.optionsVariables = field.optionsVariablesMapper(this.form, this.fields);
      }

      return field;
    });
  }

  getFormInvalidMsg(form: FormGroup, fields: FieldConfig[], name?: string): string {
    const c = getInvalidControls(form, fields).map((i) => i.label);
    let msg = `<b>${c.length}</b> ${name ?? ''} field`;
    msg = `${msg}${c.length > 1 ? 's are' : ' is'} not Valid : <b> ${c.join(', ')}</b> `;
    return msg;
  }

  goToStep(stepper: MatStepper, index: number) {
    const focusedIndex: any = stepper._getFocusIndex();
    if (!focusedIndex) return;
    const step = this.formSteppers[focusedIndex];
    const validMove = step.formGroup?.valid || stepper.selectedIndex > index;
    if (!step || !step.formGroup) return;
    const msg = this.getFormInvalidMsg(step.formGroup, this.fields, step.name);
    if (!validMove && this.linearSteppers) this.notify.error(msg);
    stepper.selectedIndex = index;
  }

  stepperIndexChange(event: any) {
    const newIndex = event?.selectedIndex;
    const previousIndex = event?.previousIndex;

    // Allow going backwards or if linear steppers is disabled
    if (newIndex < previousIndex || !this.linearSteppers) return;

    // Validate current step before moving forward
    const currentStep = this.formSteppers[previousIndex];
    if (!currentStep || !currentStep.formGroup) return;

    currentStep.formGroup.markAllAsTouched();
    currentStep.formGroup.updateValueAndValidity();

    // Block navigation if step is invalid and not optional
    if (currentStep.formGroup.invalid && !currentStep.optional) {
      event.preventDefault();
      const msg = this.getFormInvalidMsg(currentStep.formGroup, this.fields, currentStep.name);
      this.notify.error(msg);
    }
  }

  setFormSteps() {
    this.formSteppers = this.formSteppers.map((step, index) => {
      this.saveButton = this.fields.find((f) => f.type === FieldType.button);

      const stepsFields = this.fields.filter((f) => {
        return !f.key.includes((this.saveButton?.key as any));
      });

      const fields: FieldConfig[] = (step.keys as any)
        .map((k: string) => stepsFields.find((f) => f.key === k))
        .filter((f: Obj) => !!f);

      const formGroup: FormGroup = this.fb.group({});

      fields.forEach((field) => {
        const ctrl = this.form?.controls[field.key];
        if (ctrl) formGroup.addControl(field.key, ctrl);
      });

      // if (step.proceedAction$) {
      //   this.subscriptions.add(
      //     proceedAction$.subscribe((res) => this.handleProceedAction(step, index)),
      //   );
      // }

      return { ...step, fields, formGroup };
    });
    this.form?.updateValueAndValidity();
  }

  isStepperVisible(stepper: FormStepper): boolean {
    if (!stepper.showWhen || stepper.showWhen.length === 0) {
      return true;
    }

    // Check all showWhen conditions
    return stepper.showWhen.every((condition) => {
      const controlValue = this.form?.get(condition.key)?.value;
      const negate = condition.negate || false;
      const matches = controlValue === condition.value;
      return negate ? !matches : matches;
    });
  }

  getWhenKeys(whenKey: string): string[] {
    let whens = this.fields
      .filter((field: Obj) => field?.[whenKey]?.length)
      .map((field: Obj) => field?.[whenKey])
      .reduce((when1, when2) => when1.concat(when2), []);

    if (whenKey == 'setWhen') {
      whens = whens.map((w: Obj) => w['when']).reduce((w1: Obj[], w2: Obj[]) => w1.concat(w2), []);
    }

    const whenKeys = whens.map((when: Obj) => when['key'].split('.')?.[0]);
    return [...new Set(whenKeys)] as string[];
  }

  getObservedKeys() {
    const getKeys = (strs: string[]) => strs.map((str) => str.split('.')[0]);
    return getKeys(this.formObservers.reduce((a, b) => a.concat((b.observedKeys as any)), []));
  }

  listenToChanges() {
    // all keys having showWhen property
    this.allShowKeys = this.getWhenKeys('showWhen');
    this.allSetKeys = this.getWhenKeys('setWhen');
    this.allObservedKeys = this.getObservedKeys();

    const allEventKeys = [
      ...new Set(this.allShowKeys.concat(this.allSetKeys).concat(this.allObservedKeys)),
    ];

    let control: AbstractControl | any = undefined;

    allEventKeys.forEach((key: string) => {
      if (!(control = this.form?.get(key))) return;
      const action$ = control.valueChanges.pipe(distinctUntilChanged());
      this.subscriptions.add(action$.subscribe((value: any) => this.doFieldActions(key, value)));
      this.doFieldActions(key, control.value); // for onload
    });

    // console.log({ allEventKeys });
  }

  async doFieldActions(key: string, value: any) {
    // handle fields observers1// onload is already handled on observer creation

    if (this.allObservedKeys.includes(key)) {
      await new Promise((resolve, reject) => {
        const promises = this.dfs.handleObservers(key, this.formObservers, this.form, this.fields);

        promises.forEach((promise, index) => {
          promise.then((field) => {
            this.upsertFields([field]);
            if (index === promises.length - 1) resolve(true);
          });
        });
      });
    }

    // handle conditional fields visibility
    if (this.allShowKeys.includes(key)) {
      await this.dfs.handleShowWhen(key, value, this.form, this.fields).then((fields) => {
        this.upsertFields(fields);
      });
    }

    // handle conditional changes in field props
    if (this.allSetKeys.includes(key)) {
      await this.dfs.handleSetWhen(key, value, this.form, this.fields).then((fields) => {
        this.upsertFields(fields);
      });
    }

    this.cdr.detectChanges();
  }

  upsertFields(fields: FieldConfig[]) {
    //affect fields //affect the one in steps too
    this.fields = findReplace(this.fields, fields, 'key');
    this.formSteppers.forEach(
      (step: FormStepper) => (step.fields = findReplace((step.fields as any), fields, 'key')),
    );
  }

  async selectedValue(data: { value: string; field: FieldConfig; object: any }) {
    this.selectedData.emit({ value: data.value, key: data.field.key, object: data.object });

    let option = undefined;

    const findOption = (options: any[]) => options?.find((opt) => opt.value === data.value);

    if (isObservable(data?.field?.options)) {
      const mapOptions = map((options: any[]) => (options ? findOption(options) : null));
      option = mapOptions(await (lastValueFrom(data.field.options) as any));
    } else option = findOption(data.field?.options);
  }

  onSubmit(event: Event) {
    this.form.updateValueAndValidity();
    this.submit.emit(this.dfs.onSubmit(event, this.form, this.fields, this.formSteppers));
  }

  onProceed(step: FormStepper, index: number, stepper: MatStepper) {
    this.stepper = this.stepper ?? stepper;

    // Mark all form controls as touched to display validation errors
    step.formGroup?.markAllAsTouched();
    step.formGroup?.updateValueAndValidity();

    // Validate required fields before proceeding
    if (step.formGroup?.invalid && !step.optional) {
      const msg = this.getFormInvalidMsg(step.formGroup, this.fields, step.name);
      this.notify.error(msg);
      return;
    }

    if (!step.onSubmit) return this.stepper.next();

    this.stepValue = this.dfs?.onSubmit((undefined as any), (step.formGroup as any), (step.fields as any));

    if (!areObjectsEqual(this.stepValue, (step.value as any))) {
      if (!step.hasOwnProperty('onSubmit')) this.submit.emit(step);
      else step.onSubmit(this.stepValue, step);
    }
  }

  handleProceedAction(step: FormStepper, index: number) {
    //update step's value on success save // proceed
    step.value = this.stepValue;
    if (this.formSteppers.length - 1 === index) this.stepperClose.emit(true);
    else this.stepper?.next();
  }

  async viewInvalid(stepForm: FormGroup | undefined) {
    if (!stepForm) return;
    const dis = await this.notify.error(this.dfs.getFormInvalidMsg(stepForm, []));

    // getInvalidControls(stepForm, []).forEach((inv: InvalidControl) => {
    //   this.ds.highlightFormField(inv.key, this.r2);
    // });
  }

  changeButtonColor(event: MouseEvent, color: string): void {
    const target = event.target as HTMLElement;
    if (target?.style) {
      target.style.backgroundColor = color;
    }
  }
}
