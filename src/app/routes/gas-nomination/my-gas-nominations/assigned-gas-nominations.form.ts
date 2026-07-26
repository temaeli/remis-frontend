import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { GridParameter } from '@shared/components/data-grid/data-grid.interfaces';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import {
  MY_ASSIGNED_PLANT_NOMINATIONS_PAGEABLE,
  MY_PLANT_NOMINATION_COUNTS,
} from './my-gas-nominations.graphql';

import {
  RESEND_UPSTREAMER_NOMINATION_LETTER,
  SEND_UPSTREAMER_NOMINATION_LETTER,
  UPSTREAMER_CONFIRMED_PLANT_NOMINATIONS,
  REVIEW_AS_PLANT_SHIFT_SUPERVISOR,
  RETURN_PLANT_NOMINATION_TO_PIPELINE_SHIFT_SUPERVISOR,
  REVIEW_AS_PLANT_SUPERINTENDENT,
  APPROVE_AS_PLANT_MANAGER,
  PREVIEW_UPSTREAMER_LETTER_PDF,
} from '../nomination-batches/nomination-batch.graphql';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { NominationReportService } from '../nominations/nomination-report.service';

export const assignedNomination$ = new Subject<any>();

export function getAssignedNominationsGridParameter(
  comp: BaseComponent,
  batchStatus: string | undefined,
  nominationReportService: NominationReportService,
): GridParameter {
  return {
    title: 'Assigned Plant Nominations',
    icon: 'assigned_placement',
    keyColumns: [
      'index',
      'batch.referenceNumber as Reference #',
      'createdAt as Nomination Date',
      'plant.name as Plant Name',
      {
        field: 'status',
        valueFn: (row) => row?.status?.replace(/_/g, ' ') || row?.status,
      },
      'supervisorReviewStatus as Review Status',
      'allocatedDailyMmscfd as Allocated (MMscfd)',
      'allocatedDailySm3 as Allocated (MMscfd)',
      'allocatedHourlyFlowSm3PerHour as Allocated Hourly Flow (Sm3/hr)',
      'actions',
    ],
    isPageable: true,
    pageSize: 20,
    actionButtons: [
      {
        ...MORE_BTN,
        buttons: [
          viewApprovalHistoryBtn(comp),
          reviewAsPlantShiftSupervisorBtn(comp),
          returnPlantNominationToPipelineShiftSupervisorBtn(comp),
          reviewAsPlantSuperintendentBtn(comp),
          approveAsPlantManagerBtn(comp),
          // sendUpstreamerNominationLetterBtn(comp),
          // resendUpstreamerNominationLetterBtn(comp),
          previewUpstreamerLetterPdfBtn(comp),
          // downloadUpstreamerLetterPdfBtn(comp),
          // downloadNominationReportBtn(comp, nominationReportService),
        ],
      },
    ],
    reloadActions$: [assignedNomination$],
    fetchParameter: {
      query: MY_ASSIGNED_PLANT_NOMINATIONS_PAGEABLE,
      variables: batchStatus
        ? {
            batchStatus,
            pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
          }
        : {
            pageableParam: { sortBy: 'createdAt', sortDirection: 'DESC' },
          },
    },
  };
}

export async function getPlantNominationCounts(comp: BaseComponent) {
  try {
    const response = await comp.fs.fetch({
      query: MY_PLANT_NOMINATION_COUNTS,
    });
    return response?.data;
  } catch (error) {
    console.error('Error fetching plant nomination counts:', error);
    return null;
  }
}

export function viewApprovalHistoryBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_VIEW_ALL_PLANT_NOMINATION'],
    icon: 'history',
    label: 'View Approval History',
    click: (data: any) => {
      const plantNominationUid = data?.uid || data?.plantNominationUid;
      comp.router.navigate(['/gas-nomination/plant-nominations', plantNominationUid], {
        queryParams: { batchUid: data?.batch?.uid },
      });
    },
  };
}

export function reviewAsPlantShiftSupervisorBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_REVIEW_PLANT_NOMINATION_AS_SHIFT_SUPERVISOR'],
    showFunction: (row: any) => row?.status === 'SENT_TO_PLANT_SHIFT_SUPERVISOR',
    icon: 'approve',
    label: 'Review as Shift Supervisor',
    click: (data: any) => {
      const close$ = new Subject<void>();
      const plantNominationUid = data?.uid || data?.plantNominationUid;
      const formParameter: FormParameters = {
        title: 'Review as Plant Shift Supervisor',
        icon: 'approve',
        model: { plantNominationUid, approved: true, comments: '' },
        fields: [
          { key: 'plantNominationUid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Action',
            type: FieldType.select,
            options: [
              { label: 'Approve', value: true },
              { label: 'Reject', value: false },
            ],
            class: 'col-span-full',
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          try {
            await comp.fs.fetch({
              notify: true,
              variables: {
                plantNominationUid: value.plantNominationUid,
                approved: value.approved,
                comments: value.comments,
              },
              mutation: REVIEW_AS_PLANT_SHIFT_SUPERVISOR,
              successFn: (res) => {
                assignedNomination$.next(res?.data);
                close$.next();
              },
            });
          } catch (error) {
            console.error('Review as plant shift supervisor error:', error);
            throw error;
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function previewUpstreamerLetterPdfBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: [
      'ROLE_SEND_UPSTREAMER_LETTER',
      'ROLE_APPROVE_AS_PLANT_MANAGER',
      'ROLE_VIEW_ALL_PLANT_NOMINATION',
    ],
    icon: 'visibility',
    label: 'Preview Upstreamer Letter',
    click: async (data: any) => {
      try {
        const plantNominationUid = data?.uid || data?.plantNominationUid;
        console.log('Fetching PDF for:', plantNominationUid);
        await comp.fs.fetch({
          variables: { plantNominationUid },
          query: PREVIEW_UPSTREAMER_LETTER_PDF,
          successFn: (res) => {
            console.log('PDF Response:', res);
            let pdfBase64 = res?.data;
            if (pdfBase64 && typeof pdfBase64 === 'string') {
              pdfBase64 = pdfBase64.replace(/\s/g, '').trim();
              console.log('PDF Base64 length:', pdfBase64.length);
              if (pdfBase64.length > 0) {
                // Convert base64 to blob
                try {
                  const binaryString = atob(pdfBase64);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const blob = new Blob([bytes], { type: 'application/pdf' });
                  const blobUrl = URL.createObjectURL(blob);
                  console.log('Opening PDF blob URL:', blobUrl);
                  const newWindow = window.open(blobUrl, '_blank');
                  if (!newWindow) {
                    comp.notify?.errorSnackBar('Please allow pop-ups to preview PDF');
                  } else {
                    comp.notify?.successSnackBar('PDF preview opened');
                  }
                } catch (err) {
                  console.error('Blob conversion error:', err);
                  comp.notify?.errorSnackBar('Error processing PDF');
                }
              } else {
                comp.notify?.errorSnackBar('No PDF content received');
              }
            } else {
              comp.notify?.errorSnackBar('Invalid PDF response');
            }
          },
        });
      } catch (error) {
        console.error('Preview error:', error);
        comp.notify?.errorSnackBar('Failed to preview letter');
      }
    },
  };
}

export function downloadUpstreamerLetterPdfBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: [
      'ROLE_SEND_UPSTREAMER_LETTER',
      'ROLE_APPROVE_AS_PLANT_MANAGER',
      'ROLE_VIEW_ALL_PLANT_NOMINATION',
    ],
    icon: 'download',
    label: 'Download Upstreamer Letter',
    click: async (data: any) => {
      try {
        const plantNominationUid = data?.uid || data?.plantNominationUid;
        await comp.fs.fetch({
          variables: { plantNominationUid },
          query: PREVIEW_UPSTREAMER_LETTER_PDF,
          successFn: (res) => {
            let pdfBase64 = res?.data;
            if (pdfBase64 && typeof pdfBase64 === 'string') {
              pdfBase64 = pdfBase64.replace(/\s/g, '').trim();
              if (pdfBase64.length > 0) {
                const binaryString = atob(pdfBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `Upstreamer-Letter-${plantNominationUid}.pdf`;
                link.click();
                URL.revokeObjectURL(blobUrl);
              } else {
                comp.notify?.errorSnackBar('No PDF content received');
              }
            } else {
              comp.notify?.errorSnackBar('No PDF content received');
            }
          },
        });
      } catch (error) {
        console.error('Download upstreamer letter error:', error);
        comp.notify?.errorSnackBar('Failed to download letter');
        throw error;
      }
    },
  };
}

export function downloadNominationReportBtn(
  comp: BaseComponent,
  nominationReportService: NominationReportService,
): ActionButton {
  return {
    permissions: [
      'ROLE_SEND_UPSTREAMER_LETTER',
      'ROLE_APPROVE_AS_PLANT_MANAGER',
      'ROLE_VIEW_ALL_PLANT_NOMINATION',
    ],
    icon: 'pdf',
    label: 'Download Nomination Report',
    click: (data: any) => {
      const plantNominationUid = data?.uid || data?.plantNominationUid;
      nominationReportService.downloadNominationReport(plantNominationUid, false).subscribe({
        next: (blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `nomination-report-${plantNominationUid}.pdf`;
          link.click();
          URL.revokeObjectURL(blobUrl);
        },
        error: (error) => {
          console.error('Download nomination report error:', error);
          comp.notify?.errorSnackBar('Failed to download nomination report');
        },
      });
    },
  };
}

export function returnPlantNominationToPipelineShiftSupervisorBtn(
  comp: BaseComponent,
): ActionButton {
  return {
    permissions: ['ROLE_REVIEW_PLANT_NOMINATION_AS_SHIFT_SUPERVISOR'],
    showFunction: (row: any) => row?.status === 'SENT_TO_PLANT_SHIFT_SUPERVISOR',
    icon: 'returns',
    label: 'Return to Pipeline Supervisor',
    confirmDataMapper: (data: any) => ({
      title: 'Return Plant Nomination',
      message: 'Are you sure you want to return this nomination to pipeline shift supervisor?',
      confirmText: 'Return',
      confirmButtonColor: 'primary',
    }),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const plantNominationUid = data?.uid || data?.plantNominationUid;
      const formParameter: FormParameters = {
        title: 'Return to Pipeline Shift Supervisor',
        icon: 'returns',
        model: { plantNominationUid, comments: '' },
        fields: [
          { key: 'plantNominationUid', type: FieldType.input, visible: false },
          {
            key: 'comments',
            label: 'Reason for Return',
            type: FieldType.textarea,
            class: 'col-span-full',
            validations: [VALIDATOR_REQUIRED],
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          try {
            await comp.fs.fetch({
              notify: true,
              variables: { plantNominationUid: value.plantNominationUid, comments: value.comments },
              mutation: RETURN_PLANT_NOMINATION_TO_PIPELINE_SHIFT_SUPERVISOR,
              successFn: (res) => {
                assignedNomination$.next(res?.data);
                close$.next();
              },
            });
          } catch (error) {
            console.error('Return plant nomination error:', error);
            throw error;
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function reviewAsPlantSuperintendentBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_REVIEW_PLANT_NOMINATION_AS_SUPERINTENDENT'],
    showFunction: (row: any) => row?.status === 'SENT_TO_PLANT_SUPERINTENDENT',
    icon: 'approve',
    label: 'Review as Superintendent',
    click: (data: any) => {
      const close$ = new Subject<void>();
      const plantNominationUid = data?.uid || data?.plantNominationUid;
      const formParameter: FormParameters = {
        title: 'Review as Plant Superintendent',
        icon: 'approve',
        model: { plantNominationUid, approved: true, comments: '' },
        fields: [
          { key: 'plantNominationUid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Action',
            type: FieldType.select,
            options: [
              { label: 'Approve', value: true },
              { label: 'Reject', value: false },
            ],
            class: 'col-span-full',
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          try {
            await comp.fs.fetch({
              notify: true,
              variables: {
                plantNominationUid: value.plantNominationUid,
                approved: value.approved,
                comments: value.comments,
              },
              mutation: REVIEW_AS_PLANT_SUPERINTENDENT,
              successFn: (res) => {
                assignedNomination$.next(res?.data);
                close$.next();
              },
            });
          } catch (error) {
            console.error('Review as plant superintendent error:', error);
            throw error;
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function approveAsPlantManagerBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_APPROVE_AS_PLANT_MANAGER'],
    showFunction: (row: any) => row?.status === 'SENT_TO_PLANT_MANAGER',
    icon: 's-approvals',
    label: 'Approve as Manager',
    click: (data: any) => {
      const close$ = new Subject<void>();
      const plantNominationUid = data?.uid || data?.plantNominationUid;
      const formParameter: FormParameters = {
        title: 'Approve as Plant Manager',
        icon: 's-approvals',
        model: { plantNominationUid, approved: true, comments: '' },
        fields: [
          { key: 'plantNominationUid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Action',
            type: FieldType.select,
            options: [
              { label: 'Approve', value: true },
              { label: 'Reject', value: false },
            ],
            class: 'col-span-full',
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          try {
            await comp.fs.fetch({
              notify: true,
              variables: {
                plantNominationUid: value.plantNominationUid,
                approved: value.approved,
                comments: value.comments,
              },
              mutation: APPROVE_AS_PLANT_MANAGER,
              successFn: (res) => {
                assignedNomination$.next(res?.data);
                close$.next();
              },
            });
          } catch (error) {
            console.error('Approve as plant manager error:', error);
            throw error;
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function sendUpstreamerNominationLetterBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'attachment_paper',
    permissions: ['ROLE_SEND_UPSTREAMER_LETTER'],
    showFunction: (row: any) => row?.status === 'SENT_TO_PLANT_MANAGER',
    label: 'Send Upstreamer Letter',
    confirmDataMapper: (data: any) => ({
      title: 'Send Upstreamer Nomination Letter',
      message: 'Are you sure you want to send the nomination letter to the upstreamer?',
      confirmText: 'Send',
      confirmButtonColor: 'primary',
    }),
    click: async (data: any) => {
      try {
        const plantNominationUid =
          data?.plantNominationUid ||
          data?.uid ||
          (Array.isArray(data?.plantNominations) ? data?.plantNominations?.[0]?.uid : undefined);

        await comp.fs.fetch({
          notify: true,
          variables: { plantNominationUid },
          mutation: SEND_UPSTREAMER_NOMINATION_LETTER,
          successFn: (res) => {
            assignedNomination$.next(res?.data);
          },
        });
      } catch (error) {
        console.error('Send upstreamer nomination letter error:', error);
        throw error;
      }
    },
  };
}

export function resendUpstreamerNominationLetterBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_SEND_UPSTREAMER_LETTER'],
    showFunction: (row: any) => row?.status === 'SENT_TO_PLANT_MANAGER',
    icon: 'attachment_paper',
    label: 'Resend Upstreamer Letter',
    confirmDataMapper: (data: any) => ({
      title: 'Resend Upstreamer Nomination Letter',
      message: 'Are you sure you want to resend the nomination letter to the upstreamer?',
      confirmText: 'Resend',
      confirmButtonColor: 'primary',
    }),
    click: async (data: any) => {
      try {
        // Extract dispatch UID from the dispatches array
        const dispatchUid =
          data?.dispatchUid ||
          (Array.isArray(data?.dispatches) && data?.dispatches?.[0]?.uid) ||
          (Array.isArray(data?.plantNominations) &&
            data?.plantNominations?.[0]?.dispatches?.[0]?.uid);

        if (!dispatchUid) {
          comp.notify?.errorSnackBar('No dispatch found for this nomination');
          return;
        }

        await comp.fs.fetch({
          notify: true,
          variables: { dispatchUid },
          mutation: RESEND_UPSTREAMER_NOMINATION_LETTER,
          successFn: (res) => {
            assignedNomination$.next(res?.data);
          },
        });
      } catch (error) {
        console.error('Resend upstreamer nomination letter error:', error);
        throw error;
      }
    },
  };
}

export function viewUpstreamerConfirmedNominationsBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'verified_user',
    label: 'Upstreamer Confirmed',
    click: async (data: any) => {
      try {
        const response = await comp.fs.fetch({
          query: UPSTREAMER_CONFIRMED_PLANT_NOMINATIONS,
          variables: { batchUid: data?.batch?.uid || data?.uid },
        });

        const confirmedNominations = response?.data?.upstreamerConfirmedPlantNominations || [];

        // Display confirmed nominations as info notification
        const confirmationMessage = confirmedNominations
          .map((nom: any) => `${nom?.plant?.name}: ${nom?.upstreamerCapacityMmscfd || 0} MMscfd`)
          .join(' | ');

        comp.notify?.info(`Confirmed (${confirmedNominations.length}): ${confirmationMessage}`);
      } catch (error) {
        console.error('View upstreamer confirmed nominations error:', error);
        comp.notify?.errorSnackBar('Failed to load confirmed nominations');
        throw error;
      }
    },
    permissions: [],
  };
}
