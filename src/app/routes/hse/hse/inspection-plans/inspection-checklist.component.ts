import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GET_INSPECTION_CHECKLISTS_BY_INSPECTION_TYPE } from '../inspection-types/inspection-type.graphql';
import {
  GET_INSPECTION_CHECKLIST_ANSWERS_BY_INSPECTION,
  CREATE_OR_UPDATE_INSPECTION_CHECKLIST_ANSWERS,
} from './inspection-checklist-answer.graphql';
import { CHECKLIST_ANSWER_OPTIONS, checklistAnswerLabel } from './checklist-answers.constants';
import { InspectionChecklistAnswerViewComponent } from './inspection-checklist-answer-view.component';

interface ChecklistRow {
  questionUid: string;
  question: string;
  mandatory: boolean;
  group?: string | null;
  answer: string | null;
  remarks: string | null;
  answerUid?: string;
}

@Component({
  selector: 'inspection-checklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    DataGridComponent,
  ],
  template: `
    <div class="p-1">
      <div *ngIf="!loaded" class="py-8 text-center faded text-sm">Loading checklist…</div>

      <!-- No questions defined for the inspection type -->
      <div *ngIf="loaded && rows.length === 0" class="py-8 text-center faded text-sm">
        No checklist questions are defined for this inspection type.
      </div>

      <!-- EDIT MODE: bulk form -->
      <div *ngIf="loaded && rows.length > 0 && editing" class="flex flex-col gap-3">
        <div
          *ngFor="let row of rows; let i = index"
          class="rounded-lg border border-gray-100 bg-white p-3 flex flex-col gap-1"
        >
          <div class="text-sm font-medium">
            {{ i + 1 }}. {{ row.question }}
            <span *ngIf="row.mandatory" class="text-danger">*</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Answer</mat-label>
              <mat-select [(ngModel)]="row.answer" [name]="'answer-' + i">
                <mat-option *ngFor="let o of options" [value]="o.value">{{ o.label }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Remarks</mat-label>
              <textarea
                matInput
                rows="2"
                [(ngModel)]="row.remarks"
                [name]="'remarks-' + i"
              ></textarea>
            </mat-form-field>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <button mat-raised-button color="primary" [disabled]="saving" (click)="save()">
            {{ saving ? 'Saving…' : 'Save Checklist' }}
          </button>
          <button mat-stroked-button type="button" [disabled]="saving" (click)="cancelEdit()">
            Cancel
          </button>
          <span *ngIf="missingMandatory" class="text-xs text-warning">
            Answer all mandatory (*) questions before saving.
          </span>
        </div>
      </div>

      <!-- VIEW MODE: completion summary + standard grid of answered rows -->
      <div *ngIf="loaded && rows.length > 0 && !editing" class="flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm">
            <span class="font-medium">{{ answeredCount }}</span> / {{ rows.length }} answered
            <span *ngIf="mandatoryRemaining > 0" class="text-danger ml-2">
              · {{ mandatoryRemaining }} mandatory remaining
            </span>
          </span>
          <button *ngIf="canEdit" mat-flat-button color="primary" (click)="startEdit()">
            {{ hasAnswers ? 'Edit Checklist' : 'Fill Checklist' }}
          </button>
        </div>

        <data-grid
          *ngIf="gridParam"
          class="block"
          theme="simple"
          [gridParameter]="gridParam"
          [hasActionsColumn]="true"
        />
      </div>
    </div>
  `,
})
export class InspectionChecklistComponent extends BaseComponent implements OnInit {
  @Input() planUid!: string;
  @Input() inspectionTypeUid?: string | null;
  @Input() canEdit = false;

  rows: ChecklistRow[] = [];
  loaded = false;
  saving = false;
  editing = false;
  private snapshot: ChecklistRow[] = [];
  readonly options = CHECKLIST_ANSWER_OPTIONS;
  readonly answerLabel = checklistAnswerLabel;

  private reload$ = new Subject<void>();
  gridParam: any = null;

  async ngOnInit(): Promise<void> {
    this.gridParam = {
      keyColumns: [
        'index',
        { field: 'question', header: 'Question' },
        {
          field: 'answer',
          header: 'Answer',
          valueFn: (row: any) => checklistAnswerLabel(row?.answer),
        },
        'actions',
      ] as GridKeyColumn[],
      actionButtons: [this.buildViewBtn()],
      reloadActions$: [this.reload$],
      hasActionsColumn: true,
      theme: 'simple',
      noContentLabel: 'No answers recorded yet',
      fetchParameter: {
        query: GET_INSPECTION_CHECKLIST_ANSWERS_BY_INSPECTION,
        variables: { inspectionUid: this.planUid },
      },
    };
    await this.load();
  }

  get missingMandatory(): boolean {
    return this.rows.some((r) => r.mandatory && !r.answer);
  }

  get hasAnswers(): boolean {
    return this.rows.some((r) => !!r.answer);
  }

  get answeredCount(): number {
    return this.rows.filter((r) => !!r.answer).length;
  }

  get mandatoryRemaining(): number {
    return this.rows.filter((r) => r.mandatory && !r.answer).length;
  }

  private buildViewBtn(): ActionButton {
    return {
      icon: 'details',
      label: 'View',
      toolTip: 'View answer',
      click: (row: any) => this.openView(row),
    };
  }

  private openView(row: any): void {
    const ref = this.vs?.openModal(
      InspectionChecklistAnswerViewComponent,
      { uid: row?.uid, canDelete: this.canEdit },
      '480px',
    );
    ref?.afterClosed?.().subscribe((res: any) => {
      if (res?.deleted) this.refresh();
    });
  }

  startEdit(): void {
    this.snapshot = this.rows.map((r) => ({ ...r }));
    this.editing = true;
  }

  cancelEdit(): void {
    this.rows = this.snapshot.map((r) => ({ ...r }));
    this.editing = false;
  }

  /** Refresh both the summary/edit rows and the grid. */
  private refresh(): void {
    this.load();
    this.reload$.next();
  }

  async load(): Promise<void> {
    if (!this.planUid) return;
    this.loaded = false;
    const pageableParam = { size: 500 };

    const [questionsPage, answersPage] = await Promise.all([
      this.inspectionTypeUid
        ? this.fs.fetch({
            query: GET_INSPECTION_CHECKLISTS_BY_INSPECTION_TYPE,
            variables: { inspectionTypeUid: this.inspectionTypeUid, active: true, pageableParam },
          })
        : Promise.resolve(null),
      this.fs.fetch({
        query: GET_INSPECTION_CHECKLIST_ANSWERS_BY_INSPECTION,
        variables: { inspectionUid: this.planUid, active: true, pageableParam },
      }),
    ]);

    const questions: any[] = questionsPage?.content ?? [];
    const answers: any[] = answersPage?.content ?? [];

    const byQuestion = new Map<string, any>();
    answers.forEach((a) => {
      const qid = a?.checklistItem?.uid;
      if (qid) byQuestion.set(qid, a);
    });

    this.rows = questions.map((q) => {
      const existing = byQuestion.get(q.uid);
      return {
        questionUid: q.uid,
        question: q.question,
        mandatory: q.mandatory !== false,
        group: q.groupName,
        answer: existing?.answer ?? null,
        remarks: existing?.remarks ?? null,
        answerUid: existing?.uid,
      } as ChecklistRow;
    });

    this.loaded = true;
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    if (this.missingMandatory) {
      this.notify.warn('Please answer all mandatory questions before saving.');
      return;
    }
    const answers = this.rows
      .filter((r) => !!r.answer)
      .map((r) => ({
        uid: r.answerUid,
        questionUid: r.questionUid,
        answer: r.answer,
        remarks: r.remarks,
      }));

    if (!answers.length) {
      this.notify.warn('Answer at least one question before saving.');
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();
    await this.fs.fetch({
      notify: true,
      mutation: CREATE_OR_UPDATE_INSPECTION_CHECKLIST_ANSWERS,
      variables: { inspectionUid: this.planUid, answers },
      successFn: async () => {
        this.editing = false;
        this.refresh();
      },
    });
    this.saving = false;
    this.cdr.detectChanges();
  }
}
