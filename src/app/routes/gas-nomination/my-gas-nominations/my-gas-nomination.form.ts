import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { getUpsertBtnProps } from '@shared/components/view-component/view.helpers';
import { NominationPeriodType } from '../nominations/gas-nomination.interface';
import { ProcessStatus } from '@shared/crud/process-status';
import {
  SAVE_MY_GAS_NOMINATION,
  SUBMIT_MY_GAS_NOMINATION,
  CHECK_NOMINATION_CUTOFF,
  MY_GAS_SALES_AGREEMENT,
} from './my-gas-nominations.graphql';

export const gasNomination$ = new Subject<any>();

// Fetch GSA data to get min/max quantities
export async function fetchMyGSA(comp: BaseComponent) {
  try {
    const response = await comp.fs.fetch({
      query: MY_GAS_SALES_AGREEMENT,
    });
    return response?.[0] ?? null; // Return first agreement
  } catch (error) {
    console.error('[fetchMyGSA] Error:', error);
    return null;
  }
}

// Check if quantity is within GSA range
export function isQuantityWithinRange(
  quantity: number,
  minQuantity?: number,
  maxQuantity?: number,
): boolean {
  if (!minQuantity || !maxQuantity) return true; // If no GSA data, consider it valid
  return quantity >= minQuantity && quantity <= maxQuantity;
}

export async function checkNominationCutoff(
  comp: BaseComponent,
  nominationDate?: string,
  periodType?: string,
) {
  try {
    const response = await comp.fs.fetch({
      query: CHECK_NOMINATION_CUTOFF,
      variables: {
        nominationDate: nominationDate || new Date().toISOString().split('T')[0],
        periodType: periodType || NominationPeriodType.DAILY,
      },
    });
    console.log('[checkNominationCutoff] response:', response);
    return response;
  } catch (error) {
    console.error('Error checking nomination cutoff:', error);
    return null;
  }
}

export function getGasNominationFormFields(gsa?: any, existingData?: any): FieldConfig[] {
  const minQuantity = gsa?.minimumDailyMmscfd;
  const maxQuantity = gsa?.maximumDailyMmscfd;
  const hasGSA = minQuantity !== undefined && maxQuantity !== undefined;

  const fields: FieldConfig[] = [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'nominationDate',
      label: 'Nomination Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
    },
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
      key: 'quantityMmscfd',
      label: `Quantity (MMscfd)${hasGSA ? ` [Min: ${minQuantity}, Max: ${maxQuantity}]` : ''}`,
      type: FieldType.number,
      class: 'col-span-full',
      validations: [VALIDATOR_REQUIRED],
      hint: hasGSA
        ? `Your GSA allows nominations between ${minQuantity} and ${maxQuantity} MMscfd`
        : undefined,
    },
  ];

  // Always add conditional fields if GSA data exists
  if (hasGSA) {
    fields.push(
      {
        key: 'reason',
        label: 'Reason',
        type: FieldType.textarea,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
        value: existingData?.reason,
        visible: false,
        showWhen: [
          {
            key: 'quantityMmscfd',
            checker: (quantity: any) => {
              // Must return boolean, not undefined
              if (!quantity) return false;
              return !isQuantityWithinRange(quantity, minQuantity, maxQuantity);
            },
          },
        ],
      },
      {
        key: 'evidenceAttachmentBase64',
        label: 'Evidence Attachment',
        type: FieldType.attachment,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
        value: existingData?.evidenceAttachmentBase64,
        visible: false,
        showWhen: [
          {
            key: 'quantityMmscfd',
            checker: (quantity: any) => {
              // Must return boolean, not undefined
              if (!quantity) return false;
              return !isQuantityWithinRange(quantity, minQuantity, maxQuantity);
            },
          },
        ],
      },
    );
  }

  return fields;
}

export function gasNominationUpsertBtn(comp: BaseComponent): ActionButton {
  return {
    click: async (data?: any) => {
      const close$ = new Subject<void>();

      // Fetch GSA data before opening form
      const gsa = await fetchMyGSA(comp);

      const formParameter: FormParameters = {
        model: { ...data },
        title: 'Gas Nomination',
        fields: getGasNominationFormFields(gsa, data),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          // Validate required fields when quantity is outside GSA range
          if (gsa) {
            const isWithinRange = isQuantityWithinRange(
              value.quantityMmscfd,
              gsa.minimumDailyMmscfd,
              gsa.maximumDailyMmscfd,
            );

            // Only require reason and evidence if quantity is outside GSA range
            if (!isWithinRange) {
              if (!value.reason?.trim() || !value.evidenceAttachmentBase64) {
                comp.notify.error(
                  'Please provide both reason and evidence attachment when quantity is outside GSA range',
                );
                return;
              }
            } else {
              // Clear these fields if quantity is within range
              value.reason = undefined;
              value.evidenceAttachmentBase64 = undefined;
            }
          }

          await comp.fs.fetch({
            notify: true,
            variables: { dto: value },
            mutation: SAVE_MY_GAS_NOMINATION,
            successFn: (res) => {
              gasNomination$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '60%');
    },
    permissions: [],
    showFunction: (row: any) => !row?.status || row?.status === ProcessStatus.DRAFT,
    ...getUpsertBtnProps('Gas Nomination'),
  };
}

export function submitNominationBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'submit',
    label: 'Submit',
    class: 'btn-edit-secondary',
    confirmDataMapper: (data: any) => ({
      title: 'Submit Gas Nomination',
      message: 'Are you sure you want to submit this nomination?',
      confirmText: 'Submit',
      confirmButtonColor: 'primary',
    }),
    click: async (data: any) => {
      await comp.fs.fetch({
        notify: true,
        variables: { groupReferenceNumber: data?.groupReferenceNumber ?? data?.uid },
        mutation: SUBMIT_MY_GAS_NOMINATION,
        successFn: () => gasNomination$.next(null),
      });
    },
    permissions: [],
    showFunction: (row: any) => row?.status === ProcessStatus.DRAFT,
  };
}

export function checkCutoffBtn(comp: BaseComponent): ActionButton {
  return {
    icon: 'clock',
    label: 'Check Cutoff',
    click: async () => {
      try {
        const cutoffInfo = await checkNominationCutoff(comp);
        if (cutoffInfo) {
          const formParameter: FormParameters = {
            title: 'Nomination Cutoff Information',
            icon: 'clock',
            model: cutoffInfo,
            fields: [
              {
                key: 'cutoffEnforced',
                label: 'Cutoff Enforced',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'dailyCutoffTime',
                label: 'Daily Cutoff Time',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'deadline',
                label: 'Deadline',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'late',
                label: 'Late',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'nominationDate',
                label: 'Nomination Date',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'periodType',
                label: 'Period Type',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'now',
                label: 'Current Time',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'outcomeIfSubmittedNow',
                label: 'Outcome if Submitted Now',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'reasoning',
                label: 'Reasoning',
                type: FieldType.input,
                disabled: true,
              },
              {
                key: 'weeklyLeadHours',
                label: 'Weekly Lead Hours',
                type: FieldType.input,
                disabled: true,
              },
            ],
          };

          comp.vs?.openModal(FormComponent, formParameter, '50%', '60vh');
        } else {
          console.warn('[checkCutoffBtn] No cutoff info received');
        }
      } catch (error) {
        console.error('[checkCutoffBtn] Error:', error);
      }
    },
    permissions: [],
  };
}
