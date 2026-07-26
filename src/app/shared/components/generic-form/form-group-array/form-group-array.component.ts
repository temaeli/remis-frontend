import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  ViewContainerRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ComponentRef,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { DynamicFormService } from '../generic-form.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, ObserverParameter } from '../field.interface';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { MatButtonModule } from '@angular/material/button';
import { FillPlaceholdersPipe } from '../../../pipes/fill-from-object.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { setPathValue, stringAfterLast } from '@core/helpers';

@Component({
  selector: 'app-form-group-array',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatTooltipModule,
    MatIcon,
    IconComponent,
    MergeClassesPipe,
    MatButtonModule,
    FillPlaceholdersPipe,
    MatExpansionModule,
    SafeHtmlPipe,
  ],
  template: ` <ng-container [formGroup]="group">
    <ng-container [formArrayName]="field.key">
      @if ((!!field.label && field.showLabel !== false) || field.icon) {
        <div
          class="form-group-array-header {{
            'flex items-center font-bold mb-1  bg-white rounded-t-lg p-3'
              | mergeClasses: field.labelClass
          }}"
        >
          @if (field.icon) {
            <app-icon class="me-3" [icon]="field.icon" />
          }
          <span>
            <span> {{ field.label }} </span>
            <span class="bg-primary-100/70 px-2 rounded-sm">
              {{ getFormArray().controls.length }}
            </span>
          </span>
        </div>
      }

      @for (form of getFormArray().controls; track form; let i = $index) {
        <ng-template #indexTpl>
          @if (field.showIndex !== false) {
            <div
              class="rounded-lg me-3 p-1 flex-0 px-3 bg-primary-100 text-primary-700 font-semibold"
            >
              {{ i + 1 }}
            </div>
          }
        </ng-template>

        <ng-template #titleTpl>
          @if (field.showGroupLabel !== false) {
            <div class="flex items-center">
              @if (field.expandable !== false) {
                <ng-container [ngTemplateOutlet]="indexTpl" />
              }

              @if ($any(field.showGroupLabel) !== false) {
                @if (field.itemLabelKey) {
                  {{ form.get(field.itemLabelKey)?.value }}
                } @else if (field.itemLabelTemplate) {
                  <span
                    class=""
                    [innerHTML]="field.itemLabelTemplate | fillPlaceholders: form.value | safeHtml"
                  ></span>
                } @else {
                  <span class=""> {{ field.label }} #{{ i + 1 }} </span>
                }
              }
            </div>
          }

          @if (field.canAddFormGroup !== false && getFormArray().controls.length > 1) {
            <button
              class="scale-up !bg-warn ml-auto"
              type="button"
              matTooltip="Remove Item"
              (click)="removeForm(i); $event.stopPropagation()"
              color="warn"
              mat-icon-button
            >
              <mat-icon class=" " svgIcon="delete" />
            </button>
          }
        </ng-template>

        <div class="{{ field.itemClass }} {{ rowClass(form, i) }}" [formGroup]="getForm(form)">
          @if (field.expandable === false) {
            <ng-container [ngTemplateOutlet]="titleTpl" />

            <div class="flex items-start">
              <ng-container [ngTemplateOutlet]="indexTpl" />
              <ng-container #formContainer />
            </div>
          } @else {
            <mat-expansion-panel
              [expanded]="field.expanded || i === getFormArray().controls.length - 1"
              class="mb-2"
            >
              <mat-expansion-panel-header>
                <mat-panel-title class="flex items-center justify-between w-full">
                  <ng-container [ngTemplateOutlet]="titleTpl" />
                </mat-panel-title>
              </mat-expansion-panel-header>

              <ng-container #formContainer />
            </mat-expansion-panel>
          }
        </div>
      }

      @if (field.canAddFormGroup !== false) {
        <div class="w-full flex justify-center pt-2 p-1">
          <button
            class="button-add-row fade-on-hover"
            [matTooltip]="'Add ' + field.label"
            color="primary"
            matMiniFab
            (click)="addForm()"
            type="button"
          >
            <mat-icon class="icon-small text-white" svgIcon="add" />
          </button>
        </div>
      }
    </ng-container>
  </ng-container>`,
})
export class FormGroupArrayComponent implements OnInit, AfterViewInit, OnDestroy {
  fb = inject(FormBuilder);
  dynamicFormService = inject(DynamicFormService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChildren('formContainer', { read: ViewContainerRef })
  formContainers!: QueryList<ViewContainerRef>;

  field!: FieldConfig;
  group!: FormGroup;
  control!: FormArray;

  formObservers: ObserverParameter[] = [];
  fieldsArray: FieldConfig[][] = [];

  @Output() selectedValue = new EventEmitter();

  private componentRefs: ComponentRef<any>[] = [];
  private isViewInitialized = false;
  private isRendering = false;

  ngOnInit(): void {
    // Initialize fields for existing controls
    const existingCount = this.control?.controls?.length || 0;
    for (let i = 0; i < existingCount; i++) this.newFormFields();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;

    // Initial load with delay to ensure DOM is ready
    setTimeout(() => this.renderAllForms(), 0);

    // Watch for changes in the form containers
    this.formContainers.changes.subscribe(() => {
      if (!this.isRendering) setTimeout(() => this.renderAllForms(), 0);
    });
  }

  ngOnDestroy(): void {
    // Clean up all component references
    this.componentRefs.forEach((ref) => ref && !ref.hostView.destroyed && ref.destroy());
    this.componentRefs = [];
  }

  async renderAllForms() {
    if (!this.isViewInitialized || !this.formContainers || this.isRendering) return;
    this.isRendering = true;

    try {
      // Clear existing components
      this.componentRefs.forEach((ref) => {
        if (ref && !ref.hostView.destroyed) {
          ref.destroy();
        }
      });
      this.componentRefs = [];

      const containers = this.formContainers.toArray();
      const controls = this.getFormArray().controls;

      // Ensure we have fields for all controls
      while (this.fieldsArray.length < controls.length) {
        this.newFormFields();
      }

      // Load components for each container
      for (let i = 0; i < containers.length && i < controls.length; i++) {
        await this.loadFormComponent(containers[i], i);
      }

      // Trigger change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error rendering forms:', error);
    } finally {
      this.isRendering = false;
    }
  }

  async loadFormComponent(container: ViewContainerRef, index: number) {
    if (!container || !this.fieldsArray[index]) {
      console.warn(`Missing container or fields for index ${index}`);
      return;
    }

    try {
      // Clear the container
      container.clear();

      // Dynamically import to avoid circular dependency
      const { GenericFormComponent } = await import('../generic-form.component');

      // Create the component
      const componentRef = container.createComponent(GenericFormComponent);
      this.componentRefs.push(componentRef);

      const control = this.getFormArray().controls[index];
      if (!control) {
        console.warn(`Missing control for index ${index}`);
        return;
      }

      // Set inputs
      componentRef.setInput('fields', this.fieldsArray[index]);
      componentRef.setInput('formObservers', this.formObservers);
      componentRef.setInput('form', this.getForm(control));
      componentRef.setInput('parentForm', this.group);
      componentRef.setInput('formIndex', index + 1);
      componentRef.setInput('field', this.field);
      componentRef.setInput('animation', undefined);
      componentRef.setInput('hostClass', 'grow');

      // Subscribe to output
      const subscription = componentRef.instance.selectedData?.subscribe((event: any) => {
        this.selectedData(event);
      });

      // Store subscription for cleanup
      if (subscription) componentRef.onDestroy(() => subscription.unsubscribe());

      // Trigger change detection
      componentRef.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error(`Error loading GenericFormComponent at index ${index}:`, error);
    }
  }

  addForm() {
    const fields = this.newFormFields();
    this.getFormArray().push(this.dynamicFormService.createControl(fields, undefined));

    // Mark for check to ensure change detection runs
    this.cdr.markForCheck();
  }

  addFormObservers(fields: FieldConfig[]) {
    const observers = [
      ...this.formObservers.filter((o) => fields.map((f) => f.key).includes(o.key ?? '')),
    ];

    observers.forEach((observer) => {
      const oberverField = fields.find((f) => f.key === observer.key);
      observer.formIndex = this.getFormArray().length;
      observer.observable = new BehaviorSubject(undefined);
      const path_ = stringAfterLast(observer.path ?? '', /fields\.\d\.+/);

      if (observer.useObservable) {
        setPathValue(oberverField ?? {}, path_ ?? '', observer.observable);
      }
    });

    return observers;
  }

  removeForm(index: number) {
    // Destroy the specific component ref if it exists
    if (this.componentRefs[index] && !this.componentRefs[index].hostView.destroyed) {
      this.componentRefs[index].destroy();
    }

    this.getFormArray().removeAt(index);
    this.fieldsArray.splice(index, 1);
    this.formObservers = this.formObservers.filter((o) => o.formIndex !== index + 1);

    // Mark for check to ensure change detection runs
    this.cdr.markForCheck();
  }

  newFormFields() {
    const fields = [...(this.field.fields ?? [])].map((f) => ({
      ...f,
      formIndex: this.getFormArray().length,
    }));

    this.fieldsArray.push(fields);
    this.addFormObservers(fields);
    return fields;
  }

  getForm(abstractControl: any) {
    return abstractControl as FormGroup;
  }

  rowClass(form: any, index: number): string {
    return this.field.rowClassFn?.(form?.value, index) ?? '';
  }

  getFormArray() {
    return this.group.get(this.field.key) as FormArray;
  }

  selectedData(event: any) {
    this.selectedValue.emit(event);
  }
}
