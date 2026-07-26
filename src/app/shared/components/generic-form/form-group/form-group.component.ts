import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { DynamicFormService } from '../generic-form.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig, ObserverParameter } from '../field.interface';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeClassesPipe } from '../../details/util/class-name/merge-classes.pipe';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-form-array',
  imports: [CommonModule, ReactiveFormsModule, IconComponent, MergeClassesPipe, MatExpansionModule],
  template: `
    <div class="{{ field.innerClass }}">
      @if (field.expandable !== false) {
        <mat-expansion-panel [expanded]="field.defaultExpanded ?? true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <div class="{{ 'flex items-center font-bold' | mergeClasses: field.labelClass }}">
                @if (field.icon) {
                  <app-icon class="me-3" [icon]="field.icon" />
                }
                <span> {{ field.label }}</span>
              </div>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <ng-container [formGroup]="group">
            <ng-container [formGroupName]="field.key">
              <div class="px-2 py-3 fields-with-no-margin mat-form-field-no-padding">
                <ng-container #formContainer />
              </div>
            </ng-container>
          </ng-container>
        </mat-expansion-panel>
      } @else {
        @if (field.showGroupLabel !== false) {
          <div class="{{ 'flex items-center font-bold' | mergeClasses: field.labelClass }}">
            @if (field.icon) {
              <app-icon class="me-3" [icon]="field.icon" />
            }
            <span> {{ field.label }}</span>
          </div>
        }

        <ng-container [formGroup]="group">
          <ng-container [formGroupName]="field.key">
            <ng-container #formContainer />
          </ng-container>
        </ng-container>
      }
    </div>
  `,
})
export class FormGroupComponent implements AfterViewInit, OnDestroy {
  fb = inject(FormBuilder);
  dynamicFormService = inject(DynamicFormService);

  @ViewChild('formContainer', { read: ViewContainerRef })
  formContainer!: ViewContainerRef;

  field!: FieldConfig;
  group!: FormGroup;
  control!: FormGroup;

  formObservers?: ObserverParameter[];

  @Output() selectedValue = new EventEmitter();

  private componentRef?: ComponentRef<any>;
  private isViewInitialized = false;

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.loadFormComponent());
  }

  ngOnDestroy(): void {
    // Clean up the component reference
    if (this.componentRef) this.componentRef.destroy();
  }

  async loadFormComponent() {
    if (!this.isViewInitialized || !this.formContainer) {
      return;
    }

    // Clear any existing components
    this.formContainer.clear();

    // Destroy previous component reference if it exists
    if (this.componentRef) {
      this.componentRef.destroy();
    }

    try {
      // Dynamically import the component to avoid circular dependencies
      const { GenericFormComponent } = await import('../generic-form.component');

      // Create the component dynamically
      this.componentRef = this.formContainer.createComponent(GenericFormComponent);

      // Set inputs
      this.componentRef.setInput('fields', this.field.fields ?? []);
      this.componentRef.setInput('formObservers', this.formObservers ?? []);
      this.componentRef.setInput('form', this.control);
      this.componentRef.setInput('field', this.field);

      // Subscribe to output
      this.componentRef.instance.selectedData.subscribe((event: any) => this.selectedData(event));

      // Trigger change detection
      this.componentRef.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Error loading GenericFormComponent:', error);
    }
  }

  selectedData(event: any) {
    this.selectedValue.emit(event);
  }
}
