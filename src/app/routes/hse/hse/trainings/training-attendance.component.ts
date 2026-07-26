import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { GET_HSE_TRAINING_ATTENDEES_BY_TRAINING, SAVE_HSE_TRAINING_ATTENDANCE } from './training.graphql';
import { hseTrainingAttendee$ } from './attendee.form';

interface AttendanceRow {
  attendeeUid: string;
  name: string;
  designation?: string;
  organization?: string;
  attended: boolean;
  comment: string | null;
}

@Component({
  selector: 'hse-training-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    DataGridComponent,
  ],
  template: `
    <div class="p-1">
      <div *ngIf="!loaded" class="py-8 text-center faded text-sm">Loading attendees…</div>

      <!-- No attendees on the roster -->
      <div *ngIf="loaded && rows.length === 0" class="py-8 text-center faded text-sm">
        No attendees on the roster. Add attendees while the training is still planned.
      </div>

      <!-- EDIT MODE: bulk attendance form -->
      <div *ngIf="loaded && rows.length > 0 && editing" class="flex flex-col gap-3">
        <div
          *ngFor="let row of rows; let i = index"
          class="rounded-lg border border-gray-100 bg-white p-3 flex flex-col gap-1"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm font-medium">
              {{ i + 1 }}. {{ row.name }}
              <span class="faded text-xs">
                {{ row.designation }}{{ row.organization ? ' · ' + row.organization : '' }}
              </span>
            </div>
            <mat-checkbox [(ngModel)]="row.attended" [name]="'attended-' + i">Attended</mat-checkbox>
          </div>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Comment</mat-label>
            <textarea matInput rows="1" [(ngModel)]="row.comment" [name]="'comment-' + i"></textarea>
          </mat-form-field>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <button mat-raised-button color="primary" [disabled]="saving" (click)="save()">
            {{ saving ? 'Saving…' : 'Save Attendance' }}
          </button>
          <button mat-stroked-button type="button" [disabled]="saving" (click)="cancelEdit()">
            Cancel
          </button>
          <span class="text-xs faded">{{ attendedCount }} / {{ rows.length }} marked</span>
        </div>
      </div>

      <!-- VIEW MODE: attendance summary + grid -->
      <div *ngIf="loaded && rows.length > 0 && !editing" class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm">
            <span class="font-medium">{{ attendedCount }}</span> / {{ rows.length }} attended
          </span>
          <button *ngIf="canEdit" mat-flat-button color="primary" (click)="startEdit()">
            Take Attendance
          </button>
        </div>

        <data-grid
          *ngIf="gridParam"
          class="block"
          theme="simple"
          [gridParameter]="gridParam"
          [hasActionsColumn]="false"
        />
      </div>
    </div>
  `,
})
export class HseTrainingAttendanceComponent extends BaseComponent implements OnInit {
  @Input() trainingUid!: string;
  /** True only while the training is ONGOING — gates the editor. */
  @Input() canEdit = false;

  rows: AttendanceRow[] = [];
  loaded = false;
  saving = false;
  editing = false;
  private snapshot: AttendanceRow[] = [];

  private reload$ = new Subject<void>();
  gridParam: any = null;

  async ngOnInit(): Promise<void> {
    this.gridParam = {
      keyColumns: [
        'index',
        { field: 'name', header: 'Name' },
        { field: 'designation', header: 'Designation' },
        { field: 'organization', header: 'Organization' },
        {
          field: 'attended',
          header: 'Attended',
          valueFn: (row: any) => (row?.attended ? 'Yes' : 'No'),
        },
        { field: 'comment', header: 'Comment' },
      ] as GridKeyColumn[],
      reloadActions$: [this.reload$],
      hasActionsColumn: false,
      theme: 'simple',
      noContentLabel: 'No attendees on the roster yet',
      fetchParameter: {
        query: GET_HSE_TRAINING_ATTENDEES_BY_TRAINING,
        variables: { trainingUid: this.trainingUid },
      },
    };
    await this.load();
  }

  get attendedCount(): number {
    return this.rows.filter((r) => r.attended).length;
  }

  startEdit(): void {
    this.snapshot = this.rows.map((r) => ({ ...r }));
    this.editing = true;
  }

  cancelEdit(): void {
    this.rows = this.snapshot.map((r) => ({ ...r }));
    this.editing = false;
  }

  private refresh(): void {
    this.load();
    this.reload$.next();
  }

  async load(): Promise<void> {
    if (!this.trainingUid) return;
    this.loaded = false;
    const page = await this.fs.fetch({
      query: GET_HSE_TRAINING_ATTENDEES_BY_TRAINING,
      variables: { trainingUid: this.trainingUid, active: true, pageableParam: { size: 500 } },
    });
    const attendees: any[] = page?.content ?? [];
    this.rows = attendees.map((a) => ({
      attendeeUid: a.uid,
      name: a.name,
      designation: a.designation,
      organization: a.organization,
      attended: !!a.attended,
      comment: a.comment ?? null,
    }));
    this.loaded = true;
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    const attendances = this.rows.map((r) => ({
      uid: r.attendeeUid,
      attended: !!r.attended,
      comment: r.comment || null,
    }));

    this.saving = true;
    this.cdr.detectChanges();
    await this.fs.fetch({
      notify: true,
      mutation: SAVE_HSE_TRAINING_ATTENDANCE,
      variables: { trainingUid: this.trainingUid, attendances },
      successFn: (res: any) => {
        this.editing = false;
        // Let the detail view recompute the Mark Completed gate.
        hseTrainingAttendee$.next(res?.data);
        this.refresh();
      },
    });
    this.saving = false;
    this.cdr.detectChanges();
  }
}
