import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { GridKeyColumn } from '@shared/components/data-grid/data-grid.interfaces';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';

/**
 * A panel for one of the two-column join tables the core schema is full of.
 *
 * Every one of them is the same screen: a grid of what the record is linked to,
 * a button that opens a one-field form to add another, and an unlink on each
 * row. They differ only in what they join and what the backend named the read.
 *
 * `task-links.ts` was the first of these and is left as it is — it declares nine
 * links against a single owner and derives their query names from one pattern,
 * which is a simpler job than this. Use this where an owner has one or two links
 * and the names do not follow from the owner's own name.
 */

/** Notifies every panel built here that a link was made or broken. */
export const entityLink$ = new Subject<unknown>();

/** One side of a link, kept to what a grid row and a select need. */
const sideGqlFields = `
  id
  assignedNumber
  name
`;

/**
 * A column the join table carries beyond the two sides it joins.
 *
 * `inventories_entries` is the first of these to hold any: the DBA added a
 * person, an organisation and two reference numbers, all NOT NULL, so the link
 * form has to ask for them and the mutation has to pass them.
 */
export interface EntityLinkField {
  /** What the link mutation calls it, e.g. `personUid`. Also the form field's key. */
  arg: string;

  /** The field to ask for it with. Its `key` is set from `arg`. */
  field: Omit<FieldConfig, 'key'>;

  /** What the value comes back as on a row — the scalar, or the reference holding it. */
  rowField?: string;

  /** Selection inside `rowField` where it is a reference rather than a scalar. */
  rowGqlFields?: string;

  /** Where it belongs in the grid. Left out, it is not shown as a column. */
  column?: GridKeyColumn;

  /**
   * The GraphQL type to declare the variable as. Defaults to `String`, which is
   * what every uid argument is.
   *
   * A numeric argument has to say so: the backend takes
   * `linkInventoryEntry(quantity: BigDecimal)`, and declaring `$quantity:
   * String` is rejected before the call is made —
   * `Variable 'quantity' of type 'String' used in position expecting type
   * 'BigDecimal'`.
   */
  gqlType?: string;
}

export interface EntityLinkConfig {
  /** The backend entity name — `link…`, `unlink…`. */
  entity: string;

  /** The read listing an owner's links, e.g. `mitigationRisksByMitigation`. */
  byOwnerQuery: string;

  /** What the read and the link mutation call the owning side, e.g. `mitigationUid`. */
  ownerArg: string;

  /** What the link mutation calls the other side, e.g. `riskUid`. */
  targetArg: string;

  /** The field holding the other side on a row, e.g. `risk`. */
  field: string;

  /** Singular label, shown on the buttons. */
  label: string;

  /** Plural label, used as the panel's title. */
  pluralLabel: string;

  icon: string;

  /** UPPER_SNAKE suffix of the permission set `PermissionSeeder` generates. */
  permission: string;

  /** The read the link form's select is filled from. */
  optionsQuery: unknown;

  /**
   * Selection for the other side. Defaults to the
   * `id`/`assignedNumber`/`name` triple the core tables repeat — override where
   * the far side is not a `CoreNamedEntity`, as `bio_data` is not.
   */
  targetGqlFields?: string;

  /** Columns for the other side. Defaults to match `targetGqlFields`. */
  columns?: GridKeyColumn[];

  /** Columns the join table carries of its own, asked for alongside the link. */
  extraFields?: EntityLinkField[];
}

/** One line of selection per extra column: a scalar, or a reference and what to read off it. */
const extraSelection = (extras: EntityLinkField[]): string =>
  extras
    .filter((extra) => !!extra.rowField)
    .map((extra) =>
      extra.rowGqlFields ? `${extra.rowField} {\n${extra.rowGqlFields}\n}` : `${extra.rowField}`,
    )
    .join('\n');

const buildGql = (config: EntityLinkConfig) => {
  const { entity, field, byOwnerQuery, ownerArg, targetArg } = config;
  const extras = config.extraFields ?? [];
  const rowFields = `
  uid
  ${field} {
    ${config.targetGqlFields ?? sideGqlFields}
  }
  ${extraSelection(extras)}
`;

  //  The owner and the target are always uids, so always String; an extra
  //  column says its own type, since the backend types those after the column.
  const args: { name: string; type: string }[] = [
    { name: ownerArg, type: 'String' },
    { name: targetArg, type: 'String' },
    ...extras.map((extra) => ({ name: extra.arg, type: extra.gqlType ?? 'String' })),
  ];
  const declared = args.map((arg) => `$${arg.name}: ${arg.type}`).join(', ');
  const passed = args.map((arg) => `${arg.name}: $${arg.name}`).join(', ');

  return {
    byOwner: gql`
      query ${byOwnerQuery}($${ownerArg}: String) {
        ${byOwnerQuery}(${ownerArg}: $${ownerArg}) {
          ${rowFields}
        }
      }
    `,
    link: gql`
      mutation link${entity}(${declared}) {
        link${entity}(${passed}) {
          ${responseGqlFields(rowFields)}
        }
      }
    `,
    unlink: gql`
      mutation unlink${entity}($uid: String) {
        unlink${entity}(uid: $uid) {
          ${responseGqlFields(rowFields)}
        }
      }
    `,
  };
};

function linkBtn(
  comp: BaseComponent,
  config: EntityLinkConfig,
  documents: ReturnType<typeof buildGql>,
  ownerUid?: string,
): ActionButton {
  return {
    icon: 'add',
    label: `Link ${config.label}`,
    class: 'btn-add-primary',
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model: {},
        title: `Link ${config.label}`,
        fields: [
          {
            key: config.targetArg,
            label: config.label,
            type: FieldType.select,
            optionsVariables: {
              labelKey: 'name',
              valueKey: 'id',
              fetchParameter: { query: config.optionsQuery },
            },
            validations: [VALIDATOR_REQUIRED],
            class: 'col-span-full',
          },
          ...(config.extraFields ?? []).map(
            (extra) => ({ ...extra.field, key: extra.arg }) as FieldConfig,
          ),
        ],
        closeAction$: close$,

        onSubmit: async (value: any) => {
          await comp.fs.fetch({
            notify: true,
            variables: { [config.ownerArg]: ownerUid, ...value },
            mutation: documents.link,
            successFn: (res) => {
              entityLink$.next(res?.data);
              close$.next();
            },
          });
        },
      };

      comp.vs?.openModal(FormComponent, formParameter, '40%');
    },
    permissions: [`ROLE_CREATE_${config.permission}`, `ROLE_UPDATE_${config.permission}`],
  };
}

function unlinkBtn(
  comp: BaseComponent,
  config: EntityLinkConfig,
  documents: ReturnType<typeof buildGql>,
): ActionButton {
  return {
    icon: 'block',
    label: 'Unlink',
    class: 'text-danger',
    confirmDataMapper: (row: any) => ({
      title: 'UNLINK',
      confirmText: 'UNLINK',
      confirmButtonColor: 'red',
      message: `Are you sure you want to unlink <b class='text-danger'>${
        row?.[config.field]?.name ?? ''
      }</b> ?`,
    }),
    click: async (row: any) => {
      await comp.fs.fetch({
        notify: true,
        loadingOn: 'content',
        variables: { uid: row?.uid },
        mutation: documents.unlink,
        successFn: (res) => entityLink$.next(res?.data),
      });
    },
    permissions: [`ROLE_DELETE_${config.permission}`],
  };
}

const defaultColumns = (config: EntityLinkConfig): GridKeyColumn[] => [
  'index',
  `${config.field}.assignedNumber as Assigned Number`,
  `${config.field}.name as Name`,
  ...(config.extraFields ?? []).flatMap((extra) => (extra.column ? [extra.column] : [])),
  'actions',
];

/** One panel per config, for the owning record's detail page. */
export const entityLinkPanels = (
  comp: BaseComponent,
  configs: EntityLinkConfig[],
  ownerUid?: string,
): ContentParameter[] =>
  configs.map((config) => {
    const documents = buildGql(config);
    return {
      type: 'table',
      name: config.pluralLabel,
      label: config.pluralLabel,
      icon: config.icon,
      permissions: [`ROLE_VIEW_ALL_${config.permission}`, `ROLE_VIEW_${config.permission}`],
      keyColumns: config.columns ?? defaultColumns(config),
      headerButtons: [linkBtn(comp, config, documents, ownerUid)],
      actionButtons: [{ ...MORE_BTN, buttons: [unlinkBtn(comp, config, documents)] }],
      reloadActions$: [entityLink$],
      fetchParameter: { query: documents.byOwner, variables: { [config.ownerArg]: ownerUid } },
    } as ContentParameter;
  });
