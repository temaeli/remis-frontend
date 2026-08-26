import { gql } from '@apollo/client/core';
import { pageGqlFields, plainResponseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * The mail log — every email the system has attempted, and what became of it.
 *
 * `uaa.notification` is written by whatever sent the message. Nothing here
 * creates or edits a row: a message that failed is resent by doing again
 * whatever produced it, not by editing the record of the attempt.
 */
const notificationFields = `
  id
  uid
  createdAt
  mailTo
  sender
  subject
  message
  isSent
  errorMessage
`;

export const ALL_NOTIFICATIONS_PAGEABLE = gql`
  query allNotificationsPageable($pageableParam: PageableParamInput) {
    allNotificationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(notificationFields)}
    }
  }
`;

/** Only the ones that did not leave — the list worth acting on. */
export const FAILED_NOTIFICATIONS_PAGEABLE = gql`
  query failedNotificationsPageable($pageableParam: PageableParamInput) {
    failedNotificationsPageable(pageableParam: $pageableParam) {
      ${pageGqlFields(notificationFields)}
    }
  }
`;

export const FAILED_NOTIFICATION_COUNT = gql`
  query failedNotificationCount {
    failedNotificationCount
  }
`;

/**
 * Sends a message and waits for the mail server.
 *
 * Subject and message are optional — left blank the backend uses its own test
 * wording, so this doubles as a bare "does mail leave at all" check. Unlike the
 * activation email, which is sent asynchronously and whose failures are
 * swallowed, this one returns the SMTP server's actual answer.
 */
export const SEND_TEST_EMAIL = gql`
  query sendTestEmail($email: String, $subject: String, $message: String) {
    sendTestEmail(email: $email, subject: $subject, message: $message) {
      ${plainResponseGqlFields}
    }
  }
`;
