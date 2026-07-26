import { DatePipe, formatDate } from '@angular/common';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DateRange } from '@shared/components/data-grid/data-grid.interfaces';

export function yearQuartersDateFilter(date: Date | null): boolean {
  if (!date || date === null) return false;
  date = new Date(formatDate(date, 'YYYY-MM-dd', 'en-GB'));
  const year = date.getFullYear();
  const month = date.getMonth();
  return (month === 0 || month === 3 || month === 6 || month === 9) && date.getDate() === 1;
}

export function formatIfDate(value: any, format = 'yyyy-MM-dd') {
  return isValidDate(value) ? formatDate(value, format, 'en-GB') : value;
}

export function addDaysToDate(date = new Date(), daysFromDate = 0, format = 'yyyy-MM-dd') {
  const result = new Date(date);
  result.setDate(result.getDate() + daysFromDate);
  return format ? new DatePipe('en-GB').transform(result, format) : result;
}

// days is a ref from today (0 = today) (-1 yesterday) (1 tomorrow)

export function dateFromToday(daysFromToday = 0, format = 'yyyy-MM-dd') {
  const result = new Date();
  result.setDate(result.getDate() + daysFromToday);
  return format ? new DatePipe('en-GB').transform(result, format) : result;
}

export function dateRangeFromToday(fromToday = 0, toToday = 0, format = 'yyyy-MM-dd'): DateRange {
  return {
    fromDate: dateFromToday(fromToday, format) as string,
    toDate: dateFromToday(toToday, format) as string,
  };
}

export function addYearsToDate(date: any, years: number) {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  newDate.setDate(newDate.getDate() - 1);
  return newDate;
}

/** Inverse of getMonthsBetween: the date `months` whole calendar months after `date`. */
export function addMonthsToDate(date: any, months: number) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

export function isValidDate(value: string) {
  const wrongType = ['number', 'boolean', 'undefined'].includes(typeof value);
  if (!value || wrongType || value?.toString().length < 10) return false;

  // below method is no reliable this reads as date => Confirm Survey Instructions - Sf 37 //TODO:
  const isDate = new Date(value) as any !== 'Invalid Date' && !isNaN((new Date(value) as any));
  return isDate;
}

export function addFormatedDates(object: any, dateFormat = 'dd MMM y | HH:mm') {
  const objectMod = { ...object };

  const addField = (key: string) => {
    const value = objectMod[key];
    const isDate = isValidDate(value);
    if (isDate) objectMod[`${key}Mod`] = getDisplayDateTime(value);
  };

  for (const key in objectMod) if (objectMod.hasOwnProperty(key)) addField(key);
  return objectMod;
}

export function getDisplayDateTime(date: any, format?: string): string | null {
  return date.toString() === '2023-04-19'.length
    ? new DatePipe('en-GB').transform(date, ' dd MMM y')
    : new DatePipe('en-GB').transform(date, ' dd MMM y | HH:mm');
}

/** Whole calendar months between two dates (floored), or undefined if either date is missing/invalid. */
export function getMonthsBetween(startDate: any, endDate: any): number | undefined {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return undefined;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return undefined;

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(months, 0);
}

export function getDaysBetween(startDate: any, endDate: any) {
  if (!startDate?.split('-').length || !endDate?.split('-').length) return undefined;
  // The number of milliseconds in all UTC days (no DST)
  const oneDay = 1000 * 60 * 60 * 24;
  // A day in UTC always lasts 24 hours (unlike in other time formats)
  const start = Date.UTC(endDate.split('-')[0], endDate.split('-')[1], endDate.split('-')[2]);
  const end = Date.UTC(startDate.split('-')[0], startDate.split('-')[1], startDate.split('-')[2]);
  // so it's safe to divide by 24 hours
  return (start - end) / oneDay;
}

export const getDisplayDate = (date: string) => new DatePipe('en-GB').transform(date, ' dd MMM y');
