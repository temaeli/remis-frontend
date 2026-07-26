import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  NominationAggregationDtoInput,
  NominationPeriodType,
  NominationStatus,
} from '../nominations/gas-nomination.interface';
import {
  AGGREGATE_NOMINATIONS,
  SUBMIT_AGGREGATE_NOMINATIONS,
  ASSIGN_BATCH_TO_PLANTS,
  MANUAL_ASSIGN_BATCH_TO_PLANTS,
  REVIEW_AGGREGATE_AS_PIPELINE_MANAGER,
  TRIGGER_AUTO_NOMINATION_AGGREGATE,
  ADJUST_AGGREGATE_NOMINATIONS,
  PREVIEW_PLANT_DISTRIBUTIONS,
} from './nomination-batch.graphql';
import { PlantDistributionPreviewDialogComponent } from './plant-distribution-preview.dialog';
import { ManualPlantAssignmentDialogComponent } from './manual-plant-assignment.dialog';

export const nominationBatch$ = new Subject<any>();

export function getAggregateNominationsFormFields(): FieldConfig[] {
  return [
    {
      key: 'nominationDate',
      label: 'Nomination Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
    // {
    //   key: 'startDate',
    //   label: 'Start Date',
    //   type: FieldType.date,
    //   validations: [VALIDATOR_REQUIRED],
    // },
    // {
    //   key: 'endDate',
    //   label: 'End Date',
    //   type: FieldType.date,
    //   validations: [VALIDATOR_REQUIRED],
    // },
    {
      key: 'periodType',
      label: 'Period Type',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      options: Object.values(NominationPeriodType),
      visible: true,
      value: NominationPeriodType.DAILY,
      disabled: true,
    },
    {
      key: 'pipelineSupervisorComments',
      label: 'Pipeline Supervisor Comments',
      type: FieldType.textarea,
      validations: [],
      class: 'col-span-full',
    },
  ];
}

export function getReviewPlantNominationFormFields(): FieldConfig[] {
  return [
    {
      key: 'plantNominationUid',
      type: FieldType.input,
      visible: false,
    },
    {
      key: 'approved',
      label: 'Decision',
      type: FieldType.select,
      options: [
        { label: 'Approve', value: true },
        { label: 'Reject', value: false },
      ],
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'sendToUpstreamer',
      label: 'Send to Upstreamer',
      type: FieldType.toggle,
      validations: [],
    },
    {
      key: 'upstreamerCapacityMmscfd',
      label: 'Upstreamer Capacity (Mmscfd)',
      type: FieldType.number,
      validations: [],
    },
    {
      key: 'supervisorComments',
      label: 'Supervisor Comments',
      type: FieldType.textarea,
      validations: [],
      class: 'col-span-full',
    },
  ];
}

export function aggregateNominationsBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_AGGREGATE_NOMINATION'],
    icon: 'sub_task',
    label: 'Aggregate Nominations',
    class: 'btn-primary',
    // showFunction: (row: any) => row?.status == NominationStatus.SUBMITTED,
    click: (data?: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Aggregate Nominations',
        icon: 'sub_task',
        fields: getAggregateNominationsFormFields(),
        closeAction$: close$,
        onSubmit: async (value: NominationAggregationDtoInput) => {
          try {
            await comp.fs.fetch({
              notify: true,
              variables: { dto: value },
              mutation: AGGREGATE_NOMINATIONS,
              successFn: (res) => {
                nominationBatch$.next(res?.data);
                close$.next();
              },
            });
          } catch (error) {
            console.error('Aggregation error:', error);
            throw error;
          }
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
  };
}

export function nominationBatchTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      // buttons: [aggregateNominationsBtn(comp)],
    },
  ];
}

export function triggerAutoNominationAggregateBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_AGGREGATE_NOMINATION'],
    icon: 'renew',
    label: 'Auto Aggregate',
    class: 'btn-primary',
    confirmDataMapper: (data: any) => ({
      title: 'Trigger Auto Nomination Aggregate',
      message: 'Are you sure you want to trigger automatic nomination aggregation?',
      confirmText: 'Trigger',
      confirmButtonColor: 'primary',
    }),
    click: async () => {
      try {
        await comp.fs.fetch({
          notify: true,
          mutation: TRIGGER_AUTO_NOMINATION_AGGREGATE,
          successFn: (res) => {
            nominationBatch$.next(res?.data);
          },
        });
      } catch (error) {
        console.error('Auto aggregate error:', error);
        throw error;
      }
    },
  };
}

export function nominationBatchHeaderBtns(comp: BaseComponent): ActionButton[] {
  return [aggregateNominationsBtn(comp)];
}

export function submitBatchBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_SUBMIT_NOMINATION_AGGREGATE'],
    icon: 'submit',
    label: 'Submit Batch',
    showFunction: (row: any) => row?.status === NominationStatus.DRAFT,
    confirmDataMapper: (data: any) => ({
      title: 'Submit Batch',
      message: 'Are you sure you want to submit this batch?',
      onfirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: async (data: any) => {
      try {
        await comp.fs.fetch({
          notify: true,
          variables: { batchUid: data.uid },
          mutation: SUBMIT_AGGREGATE_NOMINATIONS,
          successFn: (res) => {
            nominationBatch$.next(res?.data);
          },
        });
      } catch (error) {
        console.error('Submit batch error:', error);
        throw error;
      }
    },
  };
}

export function adjustAggregateDemandBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_AGGREGATE_NOMINATION'],
    icon: 'edit',
    label: 'Adjust Demand',
    showFunction: (row: any) =>
      [NominationStatus.DRAFT, NominationStatus.AGGREGATED].includes(row?.status),
    click: (data: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: `Adjust Aggregate Demand - ${data?.referenceNumber}`,
        icon: 'edit',
        model: { proposedDemandMmscfd: data?.totalDemandMmscfd },
        fields: [
          {
            key: 'proposedDemandMmscfd',
            label: 'Proposed Demand (MMscfd)',
            type: FieldType.number,
            validations: [VALIDATOR_REQUIRED],
          },
          {
            key: 'comments',
            label: 'Comments',
            type: FieldType.textarea,
            validations: [],
            class: 'col-span-full',
          },
        ],
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: {
              batchUid: data.uid,
              proposedDemandMmscfd: `${value.proposedDemandMmscfd}`,
              comments: value.comments,
            },
            mutation: ADJUST_AGGREGATE_NOMINATIONS,
            successFn: (res) => {
              nominationBatch$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}

export function previewPlantDistributionsBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_AGGREGATE_NOMINATION'],
    icon: 'preview',
    label: 'Preview Plant Distribution',
    showFunction: (row: any) =>
      [NominationStatus.DRAFT, NominationStatus.AGGREGATED].includes(row?.status),
    click: async (data: any) => {
      const preview = await comp.fs.fetch({
        query: PREVIEW_PLANT_DISTRIBUTIONS,
        variables: { batchUid: data.uid },
      });
      if (preview) {
        comp.vs?.openModal(PlantDistributionPreviewDialogComponent, preview, '70%');
      }
    },
  };
}

export function batchViewBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'view',
    label: 'View Batch',
    permissions: ['ROLE_VIEW_ALL_NOMINATION_BATCH'],
    click: (data: any) =>
      comp.router.navigate(['/gas-nomination/nomination-batches', data?.uid]),
  };
}

export function batchTableBtns(comp: BaseComponent, onViewItems?: (uid: string) => void): ActionButton[] {
  const buttons: ActionButton[] = [
    batchViewBtn(comp),
    adjustAggregateDemandBtn(comp),
    previewPlantDistributionsBtn(comp),
    submitBatchBtn(comp),
    assignBatchToPlantBtn(comp),
    manualAssignBatchToPlantBtn(comp),
    reviewAggregateAsPipelineManagerBtn(comp),
  ];
  if (onViewItems) {
    buttons.splice(1, 0, {
      icon: 'list',
      label: 'View Items',
      click: (data: any) => onViewItems(data?.uid),
    });
  }
  return [{ ...MORE_BTN, buttons }];
}

export function assignBatchToPlantBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_ASSIGN_BATCH_TO_PLANTS'],
    icon: 're_assign',
    label: 'Assign to Plants',
    showFunction: (row: any) => row?.status === NominationStatus.APPROVED_BY_PIPELINE_MANAGER,
    confirmDataMapper: (data: any) => ({
      title: 'Assign Batch to Plants',
      message: 'Are you sure you want to assign this batch to plants?',
      confirmText: 'Assign',
      confirmButtonColor: 'primary',
    }),
    click: async (data: any) => {
      try {
        await comp.fs.fetch({
          notify: true,
          variables: { batchUid: data.uid },
          mutation: ASSIGN_BATCH_TO_PLANTS,
          successFn: (res) => {
            nominationBatch$.next(res?.data);
          },
        });
      } catch (error) {
        console.error('Assign batch error:', error);
        throw error;
      }
    },
  };
}

export function manualAssignBatchToPlantBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_ASSIGN_BATCH_TO_PLANTS'],
    icon: 'edit_note',
    label: 'Manually Assign to Plants',
    showFunction: (row: any) => row?.status === NominationStatus.APPROVED_BY_PIPELINE_MANAGER,
    click: async (data: any) => {
      const preview = await comp.fs.fetch({
        query: PREVIEW_PLANT_DISTRIBUTIONS,
        variables: { batchUid: data.uid },
      });
      if (!preview) return;
      const dialogRef = comp.vs?.openModal(ManualPlantAssignmentDialogComponent, preview, '70%');
      dialogRef?.afterClosed().subscribe(async (entries: { plantUid: string; dailyMmscfd: number }[]) => {
        if (!entries || !entries.length) return;
        try {
          await comp.fs.fetch({
            notify: true,
            variables: { batchUid: data.uid, entries },
            mutation: MANUAL_ASSIGN_BATCH_TO_PLANTS,
            successFn: (res) => {
              nominationBatch$.next(res?.data);
            },
          });
        } catch (error) {
          console.error('Manual assign batch error:', error);
          throw error;
        }
      });
    },
  };
}

export function reviewAggregateAsPipelineManagerBtn(comp: BaseComponent): ActionButton {
  return {
    permissions: ['ROLE_APPROVE_AGGREGATE_AS_PIPELINE_MANAGER'],
    showFunction: (row: any) => row?.status === NominationStatus.SENT_TO_PIPELINE_MANAGER,
    icon: 's-approvals',
    label: 'Review as Pipeline Manager',
    click: (data: any) => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Review Aggregate as Pipeline Manager',
        icon: 's-approvals',
        model: { batchUid: data?.uid, approved: false, comments: '' },
        fields: [
          { key: 'batchUid', type: FieldType.input, visible: false },
          {
            key: 'approved',
            label: 'Approve',
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
          await comp.fs.fetch({
            notify: true,
            variables: {
              batchUid: value.batchUid,
              approved: value.approved,
              comments: value.comments,
            },
            mutation: REVIEW_AGGREGATE_AS_PIPELINE_MANAGER,
            successFn: (res) => {
              nominationBatch$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
  };
}
