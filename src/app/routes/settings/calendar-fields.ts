import { gql } from '@apollo/client/core';

import { FieldConfig, FieldType, Option } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';

/**
 * Dates that come round every year, written as a day and a month with no year,
 * and the `months` rows that say what those dates are for a bill raised in each
 * month.
 *
 * Shared by the reference lookups (renewals, grace periods) and the project
 * lookups (the months themselves), which do not import each other.
 */

/** A month of the year as the tables store it: 1 to 12. */
export const MONTH_OPTIONS: Option[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((label, index) => ({ value: index + 1, label }));

export const monthField = (key: string, label: string): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  options: MONTH_OPTIONS,
  validations: [VALIDATOR_REQUIRED],
});

/**
 * A day of the month, with no month to measure it against — the tables store the
 * two apart. The ceiling is 31 here and the backend refuses the days the chosen
 * month does not have, which is the only place both numbers are known.
 */
export const dayField = (key: string, label: string, max = 31): FieldConfig => ({
  key,
  label,
  type: FieldType.input,
  inputType: 'number',
  min: 1,
  max,
  validations: [VALIDATOR_REQUIRED],
});

/** The month's name, for a column showing a stored month number. */
export const monthName = (month?: number): string =>
  MONTH_OPTIONS.find((option) => option.value === month)?.label ?? '';

//  months

/**
 * The PostgreSQL enum `month_types`. February is two: a row for the short one
 * and a row for the long, and a grace period points at each.
 */
export const MONTH_TYPES = [
  'JANUARY',
  'SHORT_FEBRUARY',
  'LONG_FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

export const MONTH_TYPE_OPTIONS: Option[] = MONTH_TYPES.map((value) => ({
  value,
  label: value
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' '),
}));

/** Everything `months` carries beyond order and days. */
export const monthRowGqlFields = `
  monthType
  startedDay
  endedDay
  firstGracePeriodStartedDay
  secondGracePeriodStartedDay
  firstGracePeriodEndedDay
  secondGracePeriodEndedDay
  firstBillCreatedInThisMonthExpiredDay
  secondBillCreatedInThisMonthExpiredDay
  firstPenaltyDay
  secondPenaltyDay
  firstGracePeriodStartedMonth
  secondGracePeriodStartedMonth
  firstGracePeriodEndedMonth
  secondGracePeriodEndedMonth
  firstBillCreatedInThisMonthExpiredMonth
  secondBillCreatedInThisMonthExpiredMonth
  firstPenaltyMonth
  secondPenaltyMonth
  firstBillCreatedInThisMonthRenewedDay
  secondBillCreatedInThisMonthRenewedDay
  firstBillCreatedInThisMonthRenewedMonth
  secondBillCreatedInThisMonthRenewedMonth
  shortFebruaryExpiredDay
  shortFebruaryEndedDay
  longFebruaryExpiredDay
  longFebruaryEndedDay
`;

/**
 * The month's own days, then for a bill raised in it: when the two grace
 * periods run, when a first and a second bill expire and renew, and when the two
 * penalties fall — each a day and a month — and the two Februaries' days.
 */
export const monthRowFields = (): FieldConfig[] => [
  {
    key: 'monthType',
    label: 'Month Type',
    hint: 'Which month of the year this is — February is kept twice, short and long',
    type: FieldType.select,
    options: MONTH_TYPE_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
  },
  dayField('startedDay', 'Starts On (Day)'),
  dayField('endedDay', 'Ends On (Day)'),
  dayField('firstGracePeriodStartedDay', 'First Grace Period Starts (Day)'),
  monthField('firstGracePeriodStartedMonth', 'First Grace Period Starts (Month)'),
  dayField('firstGracePeriodEndedDay', 'First Grace Period Ends (Day)'),
  monthField('firstGracePeriodEndedMonth', 'First Grace Period Ends (Month)'),
  dayField('secondGracePeriodStartedDay', 'Second Grace Period Starts (Day)'),
  monthField('secondGracePeriodStartedMonth', 'Second Grace Period Starts (Month)'),
  dayField('secondGracePeriodEndedDay', 'Second Grace Period Ends (Day)'),
  monthField('secondGracePeriodEndedMonth', 'Second Grace Period Ends (Month)'),
  dayField('firstBillCreatedInThisMonthExpiredDay', 'First Bill Expires (Day)'),
  monthField('firstBillCreatedInThisMonthExpiredMonth', 'First Bill Expires (Month)'),
  dayField('firstBillCreatedInThisMonthRenewedDay', 'First Bill Renews (Day)'),
  monthField('firstBillCreatedInThisMonthRenewedMonth', 'First Bill Renews (Month)'),
  dayField('secondBillCreatedInThisMonthExpiredDay', 'Second Bill Expires (Day)'),
  monthField('secondBillCreatedInThisMonthExpiredMonth', 'Second Bill Expires (Month)'),
  dayField('secondBillCreatedInThisMonthRenewedDay', 'Second Bill Renews (Day)'),
  monthField('secondBillCreatedInThisMonthRenewedMonth', 'Second Bill Renews (Month)'),
  dayField('firstPenaltyDay', 'First Penalty (Day)'),
  monthField('firstPenaltyMonth', 'First Penalty (Month)'),
  dayField('secondPenaltyDay', 'Second Penalty (Day)'),
  monthField('secondPenaltyMonth', 'Second Penalty (Month)'),
  dayField('shortFebruaryExpiredDay', 'Short February Expires (Day)', 28),
  dayField('shortFebruaryEndedDay', 'Short February Ends (Day)', 28),
  dayField('longFebruaryExpiredDay', 'Long February Expires (Day)', 29),
  dayField('longFebruaryEndedDay', 'Long February Ends (Day)', 29),
];

/** The month form, a page per group. A key in no step renders nowhere. */
export const monthRowSteppers = [
  {
    name: 'Month',
    icon: 'date_range',
    keys: [
      'id',
      'name',
      'assignedNumber',
      'description',
      'order',
      'days',
      'monthType',
      'startedDay',
      'endedDay',
    ],
  },
  {
    name: 'Grace Periods',
    icon: 'clock',
    keys: [
      'firstGracePeriodStartedDay',
      'firstGracePeriodStartedMonth',
      'firstGracePeriodEndedDay',
      'firstGracePeriodEndedMonth',
      'secondGracePeriodStartedDay',
      'secondGracePeriodStartedMonth',
      'secondGracePeriodEndedDay',
      'secondGracePeriodEndedMonth',
    ],
  },
  {
    name: 'Bills Raised This Month',
    icon: 'receipt',
    keys: [
      'firstBillCreatedInThisMonthExpiredDay',
      'firstBillCreatedInThisMonthExpiredMonth',
      'firstBillCreatedInThisMonthRenewedDay',
      'firstBillCreatedInThisMonthRenewedMonth',
      'secondBillCreatedInThisMonthExpiredDay',
      'secondBillCreatedInThisMonthExpiredMonth',
      'secondBillCreatedInThisMonthRenewedDay',
      'secondBillCreatedInThisMonthRenewedMonth',
    ],
  },
  {
    name: 'Penalties',
    icon: 'warning',
    keys: ['firstPenaltyDay', 'firstPenaltyMonth', 'secondPenaltyDay', 'secondPenaltyMonth'],
  },
  {
    name: 'February',
    icon: 'event',
    keys: [
      'shortFebruaryExpiredDay',
      'shortFebruaryEndedDay',
      'longFebruaryExpiredDay',
      'longFebruaryEndedDay',
    ],
  },
];

//  grace_periods' thirteen months

const ALL_MONTHS = gql`
  query allMonths {
    allMonths {
      id
      name
      monthType
    }
  }
`;

/**
 * One of the thirteen month columns on a grace period. Only months of the type
 * the column is named after are offered; the backend refuses any other.
 */
const monthOfTypeField = (key: string, label: string, monthType: string): FieldConfig => ({
  key,
  label,
  type: FieldType.select,
  optionsVariables: {
    labelKey: 'name',
    valueKey: 'id',
    fetchParameter: { query: ALL_MONTHS },
    filterFunction: (month: { monthType?: string }) => month?.monthType === monthType,
  },
  validations: [VALIDATOR_REQUIRED],
});

export const graceMonthGqlFields = `
  january {
    id
    name
  }
  shortFebruary {
    id
    name
  }
  longFebruary {
    id
    name
  }
  march {
    id
    name
  }
  april {
    id
    name
  }
  may {
    id
    name
  }
  june {
    id
    name
  }
  july {
    id
    name
  }
  august {
    id
    name
  }
  september {
    id
    name
  }
  october {
    id
    name
  }
  november {
    id
    name
  }
  december {
    id
    name
  }
`;

export const graceMonthFields = (): FieldConfig[] => [
  monthOfTypeField('januaryUid', 'January', 'JANUARY'),
  monthOfTypeField('shortFebruaryUid', 'Short February', 'SHORT_FEBRUARY'),
  monthOfTypeField('longFebruaryUid', 'Long February', 'LONG_FEBRUARY'),
  monthOfTypeField('marchUid', 'March', 'MARCH'),
  monthOfTypeField('aprilUid', 'April', 'APRIL'),
  monthOfTypeField('mayUid', 'May', 'MAY'),
  monthOfTypeField('juneUid', 'June', 'JUNE'),
  monthOfTypeField('julyUid', 'July', 'JULY'),
  monthOfTypeField('augustUid', 'August', 'AUGUST'),
  monthOfTypeField('septemberUid', 'September', 'SEPTEMBER'),
  monthOfTypeField('octoberUid', 'October', 'OCTOBER'),
  monthOfTypeField('novemberUid', 'November', 'NOVEMBER'),
  monthOfTypeField('decemberUid', 'December', 'DECEMBER'),
];

export const graceMonthKeys = [
  'januaryUid',
  'shortFebruaryUid',
  'longFebruaryUid',
  'marchUid',
  'aprilUid',
  'mayUid',
  'juneUid',
  'julyUid',
  'augustUid',
  'septemberUid',
  'octoberUid',
  'novemberUid',
  'decemberUid',
];

/** The row's thirteen months, as the form's `…Uid` keys. */
export const graceMonthsToModel = (data: any) => ({
  januaryUid: data?.january?.id,
  shortFebruaryUid: data?.shortFebruary?.id,
  longFebruaryUid: data?.longFebruary?.id,
  marchUid: data?.march?.id,
  aprilUid: data?.april?.id,
  mayUid: data?.may?.id,
  juneUid: data?.june?.id,
  julyUid: data?.july?.id,
  augustUid: data?.august?.id,
  septemberUid: data?.september?.id,
  octoberUid: data?.october?.id,
  novemberUid: data?.november?.id,
  decemberUid: data?.december?.id,
});
