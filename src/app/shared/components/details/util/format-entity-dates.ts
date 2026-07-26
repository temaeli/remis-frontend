import { formatDate } from '@angular/common';

const FMT_DATETIME = 'dd MMM y, HH:mm';
const FMT_DATE = 'dd MMM y';
const LOCALE = 'en-GB';

// The details renderer only ships a 'date' pipe case (date-only). For datetime
// display in Details tabs we pre-format date/datetime fields on a view-only
// clone of the entity; the default safeHtml renderer outputs the resulting
// strings as-is. Top-level only — nested objects/arrays are left untouched.
//
// Suffix rules:
//   *At         (createdAt, updatedAt, submittedAt, rejectedAt, actedAt...) -> 'dd MMM y, HH:mm'
//   *Date / date (startDate, endDate, installationDate, the literal 'date')  -> 'dd MMM y'
export interface FormatEntityDatesOptions {
  // Field names that should be formatted as datetime but don't end in 'At'
  // (e.g. timeHappened, eventTime). Use this list to opt them in.
  extraDateTimeKeys?: string[];
  // Field names that should be formatted as date-only but don't end in 'Date'
  // or equal 'date'.
  extraDateKeys?: string[];
}

export function formatEntityDates<T extends Record<string, any>>(
  entity: T | null | undefined,
  options: FormatEntityDatesOptions = {},
): T | null | undefined {
  if (!entity || typeof entity !== 'object') return entity;

  const extraDateTime = new Set(options.extraDateTimeKeys ?? []);
  const extraDate = new Set(options.extraDateKeys ?? []);

  const out: any = { ...entity };
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (typeof val !== 'string') continue;
    if (isAtKey(key) || extraDateTime.has(key)) out[key] = safeFormat(val, FMT_DATETIME);
    else if (isDateKey(key) || extraDate.has(key)) out[key] = safeFormat(val, FMT_DATE);
  }
  return out;
}

function isAtKey(key: string): boolean {
  // Match createdAt/updatedAt/submittedAt/rejectedAt/actedAt etc.
  // Require a lowercase letter before the capital A so plain 'At' or 'AT' don't match.
  return /[a-z]At$/.test(key);
}

function isDateKey(key: string): boolean {
  return key === 'date' || /[a-z]Date$/.test(key);
}

function safeFormat(value: string, format: string): string {
  try {
    return formatDate(value, format, LOCALE);
  } catch {
    return value;
  }
}
