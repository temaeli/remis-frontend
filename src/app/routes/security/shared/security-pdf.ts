// Shared PDF report helpers for the Security module.
// The `*Pdf` queries return a `Response<String>` with base64 in `data`; these
// helpers fetch the payload and either open it in a new tab or download it.

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { downloadBlob } from '@shared/components/details/util/base-64/base-64.helpers';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { enumToObjectArray } from '@core/helpers';
import { Subject } from 'rxjs';
import { SecurityFormPeriodicity } from './security.enums';
import { SECURITY_OPS_REPORT_PDF } from './security-pdf.graphql';

function base64ToPdfBlob(base64: string): Blob {
  const clean = base64.replace(/\s/g, '').trim();
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'application/pdf' });
}

export interface SecurityPdfBtnOptions {
  query: any;
  /** Build the query variables from the clicked row / detail entity. */
  variablesFn: (row: any) => Record<string, any>;
  /** Build the download filename from the row (without extension). */
  fileNameFn: (row: any) => string;
  permissions?: string[];
  label?: string;
  icon?: string;
  /** Open in a new tab instead of downloading. */
  preview?: boolean;
  showFunction?: (row: any) => boolean;
}

export function securityPdfBtn(comp: BaseComponent, o: SecurityPdfBtnOptions): ActionButton {
  return {
    icon: o.icon ?? (o.preview ? 'visibility' : 'download'),
    label: o.label ?? (o.preview ? 'Preview PDF' : 'Download PDF'),
    color: 'primary',
    toolTip: o.label ?? (o.preview ? 'Preview PDF' : 'Download PDF'),
    permissions: o.permissions,
    showFunction: o.showFunction,
    click: async (row: any) => {
      await comp.fs.fetch({
        query: o.query,
        variables: o.variablesFn(row),
        successFn: (res) => {
          const base64 = res?.data;
          if (!base64 || typeof base64 !== 'string') {
            comp.notify?.errorSnackBar('No PDF content received');
            return;
          }
          try {
            const blob = base64ToPdfBlob(base64);
            if (o.preview) {
              const url = URL.createObjectURL(blob);
              const win = window.open(url, '_blank');
              if (!win) comp.notify?.errorSnackBar('Please allow pop-ups to preview the PDF');
            } else {
              downloadBlob(blob, `${o.fileNameFn(row)}.pdf`);
            }
          } catch {
            comp.notify?.errorSnackBar('Error processing PDF');
          }
        },
      });
    },
  };
}

/**
 * Opens a small form to collect period + date range, then fetches and downloads
 * the Security Operational Report PDF (`securityOpsReportPdf`).
 */
export function securityOpsReportPdfBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'reports',
    label: 'Operational Report',
    color: 'primary',
    toolTip: 'Download Operational Report PDF',
    permissions: ['ROLE_VIEW_SECURITY_DASHBOARD'],
    click: () => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        title: 'Operational Report',
        icon: 'reports',
        model: { period: SecurityFormPeriodicity.MONTHLY },
        fields: [
          {
            key: 'period',
            label: 'Period',
            type: FieldType.select,
            options: enumToObjectArray(SecurityFormPeriodicity),
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          { key: 'fromDate', label: 'From Date', type: FieldType.date, validations: [] },
          { key: 'toDate', label: 'To Date', type: FieldType.date, validations: [] },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            query: SECURITY_OPS_REPORT_PDF,
            variables: {
              period: value?.period,
              fromDate: value?.fromDate,
              toDate: value?.toDate,
            },
            successFn: (res) => {
              const base64 = res?.data;
              if (!base64 || typeof base64 !== 'string') {
                comp.notify?.errorSnackBar('No PDF content received');
                return;
              }
              try {
                downloadBlob(base64ToPdfBlob(base64), `security-ops-report-${value?.period}.pdf`);
                close$.next();
              } catch {
                comp.notify?.errorSnackBar('Error processing PDF');
              }
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, params, '45%');
    },
  };
}
