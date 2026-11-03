import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FetchService } from '@shared/fetch/fetch.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

import { findBillHeader, GepgLogComponent, GepgLogHeader } from './gepg-log.component';

/**
 * Billing → GePG Log. A user comes with a bill header number, a group bill id,
 * or a control number, and gets that bill's whole exchange with GePG, ready to
 * print or download.
 */
@Component({
  selector: 'app-gepg-log-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    GepgLogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <page-header
      title="GePG Log"
      subtitle="What was sent to GePG for a bill, and what came back — print it or download it"
    />

    <form
      class="mb-2 flex flex-wrap items-start gap-2 rounded-lg bg-white p-3"
      (ngSubmit)="find()"
    >
      <mat-form-field class="min-w-[280px] flex-1" subscriptSizing="dynamic">
        <mat-label>Bill header, group bill id or control number</mat-label>
        <input matInput [formControl]="search" placeholder="e.g. BLHX-GAMK4-17NX-0971" />
        <mat-hint>BLHX-…, WHI-… or the control number</mat-hint>
      </mat-form-field>
      <button mat-flat-button color="primary" type="submit" [disabled]="searching()">
        {{ searching() ? 'Finding…' : 'Show Log' }}
      </button>
    </form>

    @if (problem()) {
      <p class="mb-2 rounded-lg bg-white p-3 text-danger" role="alert">{{ problem() }}</p>
    }

    @if (header(); as h) {
      <app-gepg-log [header]="h" />
    }
  `,
})
export class GepgLogPageComponent {
  private readonly fs = inject(FetchService);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly header = signal<GepgLogHeader | undefined>(undefined);
  protected readonly searching = signal(false);
  protected readonly problem = signal('');

  protected async find(): Promise<void> {
    const text = this.search.value.trim();
    this.problem.set('');
    if (!text) {
      this.problem.set('Type a bill header number, a group bill id or a control number.');
      return;
    }
    this.searching.set(true);
    try {
      const found = await findBillHeader(this.fs, text);
      this.header.set(found);
      if (!found) this.problem.set(`No bill found for "${text}".`);
    } catch {
      this.problem.set('The search could not be run. Try again.');
    } finally {
      this.searching.set(false);
    }
  }
}
