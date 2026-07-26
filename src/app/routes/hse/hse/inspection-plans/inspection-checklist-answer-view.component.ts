import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import {
  GET_INSPECTION_CHECKLIST_ANSWER_BY_UID,
  DELETE_INSPECTION_CHECKLIST_ANSWER,
} from './inspection-checklist-answer.graphql';
import { checklistAnswerLabel } from './checklist-answers.constants';

@Component({
  selector: 'inspection-checklist-answer-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="!text-base">Checklist Answer</h2>
    <mat-dialog-content class="!pt-1">
      <div *ngIf="!loaded" class="py-6 text-center faded text-sm">Loading…</div>

      <div *ngIf="loaded && answer" class="flex flex-col gap-3 text-sm min-w-[320px]">
        <div>
          <div class="text-xs uppercase tracking-wider faded">Question</div>
          <div class="font-medium">
            {{ answer.question || answer.checklistItem?.question }}
            <span *ngIf="answer.checklistItem?.mandatory" class="text-danger">*</span>
          </div>
        </div>

        <div *ngIf="answer.checklistItem?.description">
          <div class="text-xs uppercase tracking-wider faded">Guidance</div>
          <div class="whitespace-pre-wrap">{{ answer.checklistItem?.description }}</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div *ngIf="answer.checklistItem?.groupName">
            <div class="text-xs uppercase tracking-wider faded">Section</div>
            <div>{{ answer.checklistItem?.groupName }}</div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wider faded">Answer</div>
            <div class="font-medium">{{ answerLabel(answer.answer) || '—' }}</div>
          </div>
        </div>

        <div>
          <div class="text-xs uppercase tracking-wider faded">Remarks</div>
          <div class="whitespace-pre-wrap">{{ answer.remarks || '—' }}</div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
          <div>
            <div class="text-xs uppercase tracking-wider faded">Recorded</div>
            <div>{{ (answer.createdAt | date: 'medium') || '—' }}</div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wider faded">Updated</div>
            <div>{{ (answer.updatedAt | date: 'medium') || '—' }}</div>
          </div>
        </div>
      </div>

      <div *ngIf="loaded && !answer" class="py-6 text-center faded text-sm">
        Answer not found.
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        *ngIf="canDelete && answer"
        mat-stroked-button
        class="!text-danger"
        [disabled]="deleting"
        (click)="remove()"
      >
        {{ deleting ? 'Removing…' : 'Remove Answer' }}
      </button>
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
})
export class InspectionChecklistAnswerViewComponent extends BaseComponent implements OnInit {
  dialogData = inject<{ uid: string; canDelete?: boolean }>(MAT_DIALOG_DATA, { optional: true });
  dialogRef = inject(MatDialogRef<InspectionChecklistAnswerViewComponent>, { optional: true });

  answer: any;
  loaded = false;
  deleting = false;
  readonly answerLabel = checklistAnswerLabel;

  get canDelete(): boolean {
    return !!this.dialogData?.canDelete;
  }

  async ngOnInit(): Promise<void> {
    const uid = this.dialogData?.uid;
    if (!uid) {
      this.loaded = true;
      return;
    }
    this.answer = await this.fs.fetch({
      query: GET_INSPECTION_CHECKLIST_ANSWER_BY_UID,
      variables: { uid },
    });
    this.loaded = true;
    this.cdr.detectChanges();
  }

  async remove(): Promise<void> {
    const uid = this.dialogData?.uid;
    if (!uid) return;
    const confirmed = await firstValueFrom(
      this.notify
        .confirm({
          title: 'REMOVE ANSWER',
          message:
            'Remove this answer? The question stays on the checklist and can be answered again.',
          confirmText: 'REMOVE',
          confirmButtonColor: 'red',
        })
        .afterClosed(),
    );
    if (!confirmed) return;

    this.deleting = true;
    this.cdr.detectChanges();
    await this.fs.fetch({
      notify: true,
      mutation: DELETE_INSPECTION_CHECKLIST_ANSWER,
      variables: { uid },
      successFn: () => this.dialogRef?.close({ deleted: true }),
    });
    this.deleting = false;
  }

  close(): void {
    this.dialogRef?.close();
  }
}
