import { LookupProvider } from '@shared/crud';
import { CngMonthlyReport } from './cng-monthly-report.interface';
import { ALL_CNG_MONTHLY_REPORTS_PAGEABLE } from './cng-monthly-report.graphql';

export const cngMonthlyReportLookupProvider: LookupProvider<CngMonthlyReport> = {
  query: ALL_CNG_MONTHLY_REPORTS_PAGEABLE,
  labelKey: 'year',
  valueKey: 'uid',
};
