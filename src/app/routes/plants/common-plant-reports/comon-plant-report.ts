import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { map, Subject } from 'rxjs';
import { Decision, HseReport, StageEnum } from '../hse-reports/hse-report.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ApprovalStatus } from '@routes/client-registration/customers/clients.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { PlantInputType } from '../plant-form-groups/plant-form-group.interface';
import { GET_ALL_PLANT_FORM_ITEMS } from '../plant-form-items/plant-form-item.graphql';
import { PlantFormItem, UnitOfMeasureMap } from '../plant-form-items/plant-form-item.interface';

export const processReport$ = new Subject<any>();

/** Shared "Unit" column for plant-report item tables, reading the unit off the row's PlantFormItem. */
export const unitOfMeasureColumn: GridKeyColumn = {
  field: 'item.unitOfMeasure',
  header: 'Unit',
  valueFn: (row) => UnitOfMeasureMap[row?.item?.unitOfMeasure as keyof typeof UnitOfMeasureMap] ?? '-',
};

export const PlantReportCols: GridKeyColumn[] = [
  'sno as S/No',
  'plant.name as Plant',
  'name',
  'stage as Stage',
  'createdBy.fullName as User',
  'createdAt type(date)',
  'actions',
];

export const CommonProcessReportFp: Partial<FetchParameter> = {
  notify: true,
  loadingOn: 'content',
  successFn: (res) => processReport$.next(res?.data),
};

export const getInputItems = async (comp: BaseComponent, inputType: PlantInputType) => {
  const items: PlantFormItem[] = await comp.fs.fetch({
    query: GET_ALL_PLANT_FORM_ITEMS,
    resMapFn: (results) => results?.filter((item: any) => item.group?.inputType === inputType),
  });

  if (!items.length) {
    const msg = `No form items found for ${inputType} Report. Please create form items with input type "${inputType}" to proceed.`;
    comp.notify.info(msg);
    return [];
  }

  const inputs = items?.map((i) => {
    const unit = UnitOfMeasureMap[i.unitOfMeasure] ?? i.unitOfMeasure ?? '';

    return {
      itemUid: i.uid,
      item: i.name.toLowerCase().includes(unit.toLowerCase()) ? i.name : `${i.name} (${unit})`,
    };
  });

  return inputs ?? [];
};

/**
 * Auto-computes a "Total" row inside a formGroupArray of plant report items
 * (Fuel & Flared Gas's summed item, Export Gas Analysis's Mole% total, etc.)
 * as the sum of every other row's `valueKey` field, whenever any row changes.
 *
 * Matches the total row by item label (case-insensitive "total" substring)
 * rather than by index, since the row set/order comes from backend-configured
 * PlantFormItems and isn't guaranteed stable across plants.
 *
 * `form` is the FormGroup of the row whose field just changed - climbing to
 * `.parent` reaches the surrounding FormArray so sibling rows can be read.
 */
export function sumIntoTotalRow(form?: any, valueKey = 'measure', totalMatch = 'total') {
  const rows = form?.parent?.controls;
  if (!rows?.length) return;

  let totalControl: any;
  let sum = 0;

  rows.forEach((row: any) => {
    const label = String(row?.get('item')?.value ?? '').toLowerCase();
    if (label.includes(totalMatch)) {
      totalControl = row.get(valueKey);
      return;
    }

    const value = Number(row?.get(valueKey)?.value);
    if (!isNaN(value)) sum += value;
  });

  totalControl?.setValue(sum, { emitEvent: false });
}

/**
 * Row-class hook for the auto-computed "Total" row inside a formGroupArray of plant
 * report items. Matches the same way sumIntoTotalRow does (case-insensitive "total"
 * substring on the item label) and mirrors the printed-PDF total-row treatment
 * (daily-operations-report.html: bold + light-gray background) so the on-screen
 * form and printed report look consistent.
 */
export function totalRowClass(rowValue: any, _index: number, totalMatch = 'total'): string {
  const label = String(rowValue?.item ?? '').toLowerCase();
  return label.includes(totalMatch)
    ? 'bg-gray-100 font-semibold border-t border-gray-300 mt-1 pt-2 rounded-b-lg'
    : '';
}

/**
 * Reorders rows so any whose label (case-insensitive) contains one of `orderLast`
 * moves to the end, in that exact sequence - everything else keeps its original
 * relative order ahead of them. Used to push derived "Total"/"Percentage"/etc rows
 * after the inputs they're computed from, both in the upsert form and the detail
 * view's items table (Fuel & Flared Gas, Export Gas Analysis, ...).
 */
export function sortByOrderLast<T>(
  rows: T[],
  orderLast: string[],
  getLabel: (row: T) => string,
): T[] {
  const rank = (label: string) =>
    orderLast.findIndex((o) => label.toLowerCase().includes(o.toLowerCase()));

  const head: T[] = [];
  const tail: (T | undefined)[] = new Array(orderLast.length).fill(undefined);

  rows.forEach((row) => {
    const idx = rank(getLabel(row) ?? '');
    if (idx === -1) head.push(row);
    else tail[idx] = row;
  });

  return [...head, ...tail.filter((row): row is T => !!row)];
}

//OFFICER - SHIFT SUPERVISOR - SUPERINTENDENT - PLANT MANAGER
export const PlantReportContents: Partial<Record<StageEnum | 'MY' | 'ALL', ContentParameter>> = {
  [StageEnum.OFFICER]: {
    keyColumns: PlantReportCols,
    type: 'table',
    slug: 'officer',
    label: 'Officer',
    title: 'Officer Reports',
    icon: 'user',
  },

  [StageEnum.SHIFT_SUPERVISOR]: {
    keyColumns: PlantReportCols,
    type: 'table',
    slug: 'shift-supervisor',
    label: 'Plant Shift Supervisor',
    title: 'Plant Shift Supervisor Reports',
    icon: 'user_down',
  },

  [StageEnum.SUPERINTENDENT]: {
    keyColumns: PlantReportCols,
    type: 'table',
    slug: 'superintendent',
    label: 'Head of Operations',
    title: 'Head of Operations Reports',
    icon: 'user_settings',
  },

  [StageEnum.PLANT_MANAGER]: {
    keyColumns: PlantReportCols,
    type: 'table',
    slug: 'plant-manager',
    label: 'Plant Manager',
    title: 'Plant Manager Reports',
    icon: 'user_tie',
  },

  ['MY']: {
    //all
    keyColumns: PlantReportCols,
    type: 'table',
    slug: 'my-reports',
    label: 'My Reports',
    title: 'My Reports',
    icon: 'user',
  },

  ['ALL']: {
    //all
    keyColumns: PlantReportCols,
    type: 'table',
    slug: 'all-reports',
    label: 'All Reports',
    title: 'All Reports',
    icon: 'user_group',
  },
};

export const StageDecisionMap: Partial<Record<StageEnum, Partial<Record<Decision, string>>>> = {
  [StageEnum.SHIFT_SUPERVISOR]: {
    [Decision.APPROVE]: 'VALIDATE, checked for accuracy, completeness & Compliance',
    [Decision.ROLLBACK]: 'Send back to Officer',
  },
  [StageEnum.SUPERINTENDENT]: {
    [Decision.APPROVE]: 'ENDORSE, Recommend for Approval',
    [Decision.ROLLBACK]: 'Send back to Plant Shift Supervisor',
  },
  [StageEnum.PLANT_MANAGER]: {
    [Decision.APPROVE]: 'APPROVE',
    [Decision.ROLLBACK]: 'Send back to Head of Operations',
  },
};

const badgedContentsSlugs = ['officer', 'shift-supervisor', 'superintendent', 'plant-manager'];

export function mapPlantListContent(
  base: BaseComponent,
  content_: ContentParameter,
): ContentParameter {
  const fp: FetchParameter = { loadingOn: 'content' };
  const content = { ...content_, fetchParameter: { ...fp, ...content_.fetchParameter } };

  //add badge for officer, hod and gm contents
  if (content.slug && badgedContentsSlugs.includes(content.slug)) {
    // content.fetchParameter.cacheTTL = 60 * 1000;

    content.badge = base.fs
      .fetch$({ ...content.fetchParameter, notifyError: false, notifySuccess: false })
      .pipe(map((res: any) => res?.totalElements || 0));
  }

  return content;
}

/**
 * Maps each plant report stage to the permission(s) that let a user process a
 * report currently sitting at that stage. A stage with no entry means no one
 * may process a report at that stage - fail closed, not fail open.
 */
export type PlantStagePermissions = Partial<Record<StageEnum, string | string[]>>;

function flattenStagePermissions(stagePermissions: PlantStagePermissions): string[] {
  return Object.values(stagePermissions).flatMap((p) => (Array.isArray(p) ? p : p ? [p] : []));
}

function hasStagePermission(
  stage: StageEnum | undefined,
  stagePermissions: PlantStagePermissions,
): boolean {
  const perms = stage ? stagePermissions[stage] : undefined;
  return !!perms && HasPermissionDirective.hasPermission(Array.isArray(perms) ? perms : [perms]);
}

export function proccessPlantReportBtn(
  comp: BaseComponent,
  onSubmit: (value: any) => any,
  stagePermissions: PlantStagePermissions,
): ActionButton {
  return {
    icon: 'send',
    permissions: flattenStagePermissions(stagePermissions),
    labelMapper: (d: HseReport) =>
      d?.stage === StageEnum.OFFICER ? 'Submit Report' : 'Proccess Report',
    showFunction: (d: HseReport) =>
      !!d?.uid && d?.stage !== StageEnum.APPROVED && hasStagePermission(d?.stage, stagePermissions),

    click: async (data: HseReport) => {
      if (data?.stage === StageEnum.OFFICER) {
        //directly submit without approval
        const msg = `Are you sure you want to submit this report? Once submitted, it will be reviewed by Plant Shift Supervisor.`;
        const value = { uid: data.uid, decision: Decision.APPROVE, comment: 'Submitted' };
        const c = await comp.notify.confirm_('Confirm', msg);
        if (c.isConfirmed) onSubmit(value);
        return;
      }

      const fp: FormParameters = {
        onSubmit,
        title: 'Approve Report',
        closeAction$: processReport$,
        model: { uid: data.uid },

        fields: [
          { key: 'uid', type: FieldType.input, visible: false },
          {
            key: 'decision',
            type: FieldType.select,
            options: Object.values(Decision).map((v) => ({
              label: StageDecisionMap[data?.stage as StageEnum]?.[v as Decision] ?? v,
              value: v,
            })),
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          {
            key: 'comment',
            type: FieldType.textarea,
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
        ],
      };

      comp.vs?.openModal(FormComponent, fp, '96%');
    },
  };
}
