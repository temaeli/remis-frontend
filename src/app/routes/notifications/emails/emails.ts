import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataGridComponent } from '@shared/components/data-grid/data-grid.component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridKeyColumn, GridParameter } from '@shared/components/data-grid/data-grid.interfaces';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_EMAIL, VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

import {
  ALL_NOTIFICATIONS_PAGEABLE,
  FAILED_NOTIFICATION_COUNT,
  FAILED_NOTIFICATIONS_PAGEABLE,
  SEND_TEST_EMAIL,
} from './emails.graphql';

/**
 * Every email the system has attempted, and whether it left.
 *
 * The activation email is sent asynchronously and its failures are logged
 * rather than raised — deliberately, so a mail outage cannot block user
 * creation. The cost is that a message which never arrived used to leave
 * nothing behind but a line in a log file on a server. This is that log, kept
 * as rows.
 *
 * Read-only. A failed message is resent by doing again whatever produced it,
 * not by editing the record of the attempt.
 */
@Component({
  selector: 'app-emails',
  imports: [DataGridComponent, PageHeaderComponent],
  template: `
    <div class="size-full flex-1 flex flex-col gap-3">
      <page-header [title]="title" [subtitle]="subtitle" [actionButtons]="actionButtons" />
      <data-grid class="grow flex flex-col" theme="simple" [gridParameter]="gridParameter" />
    </div>
  `,
})
export class Emails extends BaseComponent implements OnInit {
  override title = 'Emails';
  override subtitle = 'Every email the system has attempted, and whether it left';

  /** Reload signal, so a test send refreshes the grid it was launched from. */
  private sent$ = new Subject<unknown>();

  /**
   * Whether the grid is showing only what failed.
   *
   * A filter rather than a second screen: the two lists differ by one predicate
   * and the columns are identical, so a tab would be two of everything to save
   * one click.
   */
  failedOnly = false;

  /** How many have not left. Shown in the subtitle so the number is visible without filtering. */
  failedCount = 0;

  override actionButtons: ActionButton[] = [this.filterBtn(), this.sendTestBtn()];

  keyColumns: GridKeyColumn[] = [
    'index',
    'mailTo as To',
    'subject',
    // Sent is the whole point of the list, so it reads as words and colour
    // rather than a bare true/false.
    {
      field: 'isSent',
      header: 'Sent',
      valueFn: (row) => (row?.isSent ? 'Sent' : 'Failed'),
      valueClassMapper: (row) => (row?.isSent ? 'text-success' : 'text-danger'),
    },
    // Null on anything that worked, so the column is empty until something
    // goes wrong — which is the right amount of noise.
    'errorMessage as Reason',
    { field: 'createdAt', header: 'Attempted' },
  ];

  gridParameter: GridParameter = {
    title: 'Emails',
    icon: 'email',
    keyColumns: this.keyColumns,
    isPageable: true,
    reloadActions$: [this.sent$],
    fetchParameter: { query: ALL_NOTIFICATIONS_PAGEABLE },
  };

  async ngOnInit(): Promise<void> {
    await this.refreshFailedCount();
  }

  /**
   * Reads the failed count and folds it into the subtitle.
   *
   * Its own query rather than counting the grid: the grid is paged, so its rows
   * are one page of the answer and not the answer.
   */
  private async refreshFailedCount(): Promise<void> {
    const res = await this.fs.fetch({
      query: FAILED_NOTIFICATION_COUNT,
      showLoading: false,
      mapData: false,
    });
    this.failedCount = res?.data?.failedNotificationCount ?? res?.failedNotificationCount ?? 0;
    this.subtitle = this.failedCount
      ? `Every email the system has attempted — ${this.failedCount} did not leave`
      : 'Every email the system has attempted, and whether it left';
    this.cdr.detectChanges();
  }

  /** Swaps the grid between everything and only what failed. */
  filterBtn(): ActionButton {
    return {
      icon: this.failedOnly ? 'list' : 'exclamation',
      label: this.failedOnly ? 'Show All' : 'Show Failed Only',
      toolTip: this.failedOnly
        ? 'Show every email, sent or not'
        : 'Show only the emails that did not leave',
      permissions: ['ROLE_VIEW_ALL_NOTIFICATION', 'ROLE_VIEW_NOTIFICATION'],
      click: () => {
        this.failedOnly = !this.failedOnly;
        // Both the grid config and the button array are replaced rather than
        // mutated: the header and the grid are OnPush, and a new reference is
        // what tells them the input changed.
        this.gridParameter = {
          ...this.gridParameter,
          fetchParameter: {
            query: this.failedOnly ? FAILED_NOTIFICATIONS_PAGEABLE : ALL_NOTIFICATIONS_PAGEABLE,
          },
        };
        this.actionButtons = [this.filterBtn(), this.sendTestBtn()];
        this.cdr.detectChanges();
      },
    };
  }

  /**
   * Sends a message and waits for the mail server.
   *
   * The one place in the system that reports a mail failure to the person who
   * caused it. Everything else sends asynchronously and swallows the error, so
   * "I created a user and nothing arrived" cannot distinguish a broken relay
   * from a slow one. This says which.
   *
   * Subject and message are optional — left blank the backend uses its own test
   * wording, so this also works as a bare "does mail leave at all" check.
   */
  sendTestBtn(): ActionButton {
    return {
      icon: 'send',
      label: 'Send Test Email',
      class: 'btn-add-primary',
      permissions: ['ROLE_UPDATE_SYSTEM_SETTING', 'ROLE_VIEW_ALL_SYSTEM_SETTING'],
      click: () => {
        const close$ = new Subject<void>();
        const formParameter: FormParameters = {
          title: 'Send Test Email',
          model: {
            subject: 'WHI REMIS — test email',
            message: 'Mambo. This is a test message from WHI REMIS.',
          },
          fields: [
            {
              key: 'email',
              label: 'Send To',
              hint: 'Where the test message should arrive',
              type: FieldType.input,
              inputType: 'email',
              validations: [VALIDATOR_REQUIRED, VALIDATOR_EMAIL],
              class: 'col-span-full',
            },
            {
              key: 'subject',
              label: 'Subject',
              hint: 'Leave blank for the default test subject',
              type: FieldType.input,
              class: 'col-span-full',
            },
            {
              key: 'message',
              label: 'Message',
              hint: 'Leave blank for the default test wording. HTML is allowed.',
              type: FieldType.textarea,
              rows: 4,
              class: 'col-span-full',
            },
          ],
          closeAction$: close$,

          onSubmit: async (value: any) => {
            // notify: false — the response is reported here instead, because a
            // failure needs the SMTP server's own words rather than a generic
            // "operation failed".
            const res = await this.fs.fetch({
              query: SEND_TEST_EMAIL,
              notify: false,
              mapData: false,
              variables: {
                email: value?.email,
                subject: value?.subject,
                message: value?.message,
              },
            });

            const result = res?.data?.sendTestEmail ?? res?.sendTestEmail ?? res;
            this.sent$.next(result);
            // A test that failed adds a row to the backlog, so the subtitle is
            // stale the moment this returns either way.
            await this.refreshFailedCount();

            if (result?.status) {
              this.notify.success(result?.message ?? `Test email sent to ${value?.email}`);
              close$.next();
              return;
            }
            // Left open on failure so the address can be corrected and retried
            // without retyping the message.
            this.notify.error(result?.message ?? 'The mail server refused the message');
          },
        };

        this.vs?.openModal(FormComponent, formParameter, '50%');
      },
    };
  }
}
