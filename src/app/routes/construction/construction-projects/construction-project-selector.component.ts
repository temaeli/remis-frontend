import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FetchService } from '@shared/fetch/fetch.service';
import { ALL_CONSTRUCTION_PROJECTS } from './construction-projects.graphql';
import { ConstructionProject } from './construction-projects.interface';

@Component({
  selector: 'construction-project-selector',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field
      appearance="outline"
      subscriptSizing="dynamic"
      class="w-full max-w-md bg-white rounded"
    >
      <mat-label>{{ label() }}</mat-label>
      <mat-select [(ngModel)]="selectedUid" (selectionChange)="onChange($event.value)">
        @if (clearable()) {
          <mat-option [value]="null">All Projects</mat-option>
        }
        @for (p of projects(); track p.uid) {
          <mat-option [value]="p.uid">{{ p.name }} ({{ p.code }})</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [
    `
      ::ng-deep .mat-mdc-text-field-wrapper {
        background-color: #fff;
      }
    `,
  ],
})
export class ConstructionProjectSelectorComponent implements OnInit {
  label = input<string>('Project');
  clearable = input<boolean>(false);
  projectSelected = output<ConstructionProject | null>();

  private fs = inject(FetchService);

  projects = signal<ConstructionProject[]>([]);
  selectedUid: string | null = null;

  async ngOnInit(): Promise<void> {
    const list = await this.fs.fetch({ query: ALL_CONSTRUCTION_PROJECTS });
    this.projects.set(list ?? []);
  }

  onChange(uid: string | null): void {
    const project = this.projects().find((p) => p.uid === uid) ?? null;
    this.projectSelected.emit(project);
  }
}
