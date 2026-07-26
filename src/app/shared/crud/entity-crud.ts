import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldConfig, FormStepper } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import {
  getUpsertBtnProps,
  getDeleteBtnProps,
} from '@shared/components/view-component/view.helpers';
import { CrudHost } from './crud-host';
import { canDelete, canEdit, ProcessStatus } from './process-status';

/**
 * Configuration for a single entity's CRUD surface. Defaults match the
 * conventions already in use across pipeline-management — most entities
 * only need name, routeSlug, fields, mutations, and permissions.
 */
export interface EntityCrudConfig<T = any> {
  /** Display name used in button labels (e.g. "Working Station"). */
  name: string;
  /** Optional override for the modal title. Defaults to `name`. */
  modalTitle?: string;
  /** Route segment for the View button. Omit to skip the View action. */
  routeSlug?: string;
  /** Static field list, or a function that derives fields from the row being edited. */
  fields: FieldConfig[] | ((data?: T, ctx?: EntityCrudContext) => FieldConfig[]);
  modalWidth?: any;
  modalHeight?: any;
  modalDialogProps?: any;
  mutations: { create: any; update: any; delete: any };
  /** GraphQL variables for create/update. Default: `{ input: value }`. */
  upsertVariables?: (value: any, isCreate: boolean) => any;
  /** GraphQL variables for delete. Default: `{ uid: row.uid }`. */
  deleteVariables?: (row: T) => any;
  /** Transform a row before it seeds the upsert form (e.g. flatten FK objects). */
  modelMapper?: (data?: T) => any;
  idKey?: string;
  permissions?: { manage?: string[]; delete?: string[]; view?: string[] };
  /**
   * Opt-in ProcessStatus gating. Off by default — entities without a
   * workflow status (working-stations, incident-types, power-generators)
   * leave this undefined.
   */
  statusGate?: { edit?: boolean; delete?: boolean };
  /** Optional multi-step wizard. When set, the upsert form renders as a stepper. */
  formSteppers?: FormStepper[] | ((data?: T) => FormStepper[]);
  linearSteppers?: boolean;
  /**
   * Resolve a row's ProcessStatus when the backend doesn't expose `status`
   * directly (e.g. PowerGeneratorRefuel/Operation derive it from
   * submittedAt/approvedAt). Used by canEdit/canDelete gates.
   */
  statusResolver?: (row: any) => ProcessStatus | string | undefined;
  /**
   * Extra row-scoped visibility predicate for the Edit action. Applied only
   * when a row is present (edit case); the header Add action always shows if
   * the perm gate passes. ANDed with perm + statusGate.
   */
  upsertShow?: (row: any) => boolean;
  /**
   * Extra row-scoped visibility predicate for the Delete action.
   * ANDed with perm + statusGate.
   */
  deleteShow?: (row: any) => boolean;
}

/**
 * Context passed to a `fields` function to vary the form when opened from a
 * scoped view (e.g. a project's detail page) rather than a global list.
 */
export interface EntityCrudContext {
  /** When set, forms should hide their own project picker and use this uid instead. */
  fixedProjectUid?: string;
}

export interface EntityCrud<T = any> {
  /** Reload Subject. Wire it into list pages as `reloadActions$: [reload$]`. */
  reload$: Subject<T | null | undefined>;
  upsertBtn: (host: CrudHost, ctx?: EntityCrudContext) => ActionButton;
  deleteBtn: (host: CrudHost) => ActionButton;
  viewBtn: (host: CrudHost) => ActionButton | undefined;
  /** MORE_BTN dropdown wrapping view + upsert + extras + delete. */
  tableBtns: (host: CrudHost, extraButtons?: ActionButton[], ctx?: EntityCrudContext) => ActionButton[];
}

export function defineEntityCrud<T = any>(config: EntityCrudConfig<T>): EntityCrud<T> {
  const reload$ = new Subject<T | null | undefined>();
  const idKey = config.idKey ?? 'uid';
  const resolveFields = (data?: T, ctx?: EntityCrudContext) =>
    typeof config.fields === 'function' ? config.fields(data, ctx) : config.fields;
  const upsertVars = config.upsertVariables ?? ((v: any) => ({ input: v }));
  const deleteVars = config.deleteVariables ?? ((r: any) => ({ uid: r?.[idKey] }));
  const withStatus = (row: any) =>
    config.statusResolver ? { ...(row ?? {}), status: config.statusResolver(row) } : row;

  const upsertBtn = (host: CrudHost, ctx?: EntityCrudContext): ActionButton => ({
    permissions: config.permissions?.manage,
    click: (data?: T) => {
      const close$ = new Subject<void>();
      const isCreate = !(data as any)?.[idKey];
      const model = config.modelMapper ? config.modelMapper(data) : { ...(data as any) };
      const steppers =
        typeof config.formSteppers === 'function'
          ? config.formSteppers(data)
          : config.formSteppers;
      const params: FormParameters = {
        title: config.modalTitle ?? config.name,
        model,
        fields: resolveFields(data, ctx),
        formSteppers: steppers,
        linearSteppers: config.linearSteppers,
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const mutation = isCreate ? config.mutations.create : config.mutations.update;
          await host.fetch({
            notify: true,
            mutation,
            variables: upsertVars(value, isCreate),
            successFn: (res) => {
              reload$.next(res?.data as any);
              close$.next();
            },
          });
        },
      };
      host.openModal(
        FormComponent,
        params,
        config.modalWidth ?? '50%',
        config.modalHeight,
        config.modalDialogProps,
      );
    },
    disabledFunction: config.statusGate?.edit
      ? (row: any) => !!row && !canEdit(withStatus(row))
      : undefined,
    showFunction: config.upsertShow
      ? (row: any) => !row?.[idKey] || config.upsertShow!(row)
      : undefined,
    ...getUpsertBtnProps(config.name, idKey),
  });

  const deleteBtn = (host: CrudHost): ActionButton => ({
    ...getDeleteBtnProps(config.name),
    permissions: config.permissions?.delete,
    showFunction:
      config.statusGate?.delete || config.deleteShow
        ? (row: any) =>
            (!config.statusGate?.delete || canDelete(withStatus(row))) &&
            (!config.deleteShow || config.deleteShow(row))
        : undefined,
    click: (row: T) => {
      host.fetch({
        notify: true,
        mutation: config.mutations.delete,
        variables: deleteVars(row),
        successFn: () => reload$.next(null),
      });
    },
  });

  const viewBtn = (host: CrudHost): ActionButton | undefined => {
    if (!config.routeSlug) return undefined;
    return {
      icon: 'view',
      label: `View ${config.name}`,
      permissions: config.permissions?.view,
      click: (row: any) => host.navigate(config.routeSlug!, row?.[idKey]),
    };
  };

  const tableBtns = (
    host: CrudHost,
    extraButtons: ActionButton[] = [],
    ctx?: EntityCrudContext,
  ): ActionButton[] => {
    const v = viewBtn(host);
    const buttons: ActionButton[] = [];
    if (v) buttons.push(v);
    buttons.push(upsertBtn(host, ctx));
    buttons.push(...extraButtons);
    buttons.push(deleteBtn(host));
    return [{ ...MORE_BTN, buttons }];
  };

  return { reload$, upsertBtn, deleteBtn, viewBtn, tableBtns };
}
