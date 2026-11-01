import { gql } from '@apollo/client/core';
import { Observable, Subject, take } from 'rxjs';
import { getDisplayName } from '@shared/components/view-component/view.helpers';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldType, Option } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { responseGqlFields } from '@shared/fetch/graphql.constants';
import { Lookup, lookupChildGqlFields, LookupModule, openLookupForm } from '@shared/lookup';
import { openOwnerForm } from './land-registration-panels';

/**
 * What can be done to an asset, from its own page — and its row menu — with the
 * asset already chosen: Verify, Value, Dispose, Add Owner, Change Status.
 *
 * Each button shows only when it applies. A disposed asset shows none: it is
 * closed. Verifying and disposing move the status on the backend, so the page
 * reloads after each to show where the asset now stands.
 *
 * The lookups these open are passed in rather than imported, because
 * asset-lookups imports this file and the reverse would be a cycle.
 */

export interface AssetActionLookups {
  verification: LookupModule;
  disposal: LookupModule;
  landRegistration: LookupModule;
  /** What "Link to…" offers. */
  linkTargets: AssetLinkTarget[];
}

/** One kind of link "Link to…" can make. */
export interface AssetLinkTarget {
  label: string;
  icon: string;
  /** Opens the link form with this asset as the owning side. */
  open: (assetUid: string) => void;
  /** Emits when such a link is saved — the asset then reloads, so its tab appears. */
  saved$: Observable<unknown>;
  permissions?: string[];
}

/** Mirrors AssetStatusFlow on the backend: the statuses a disposal may follow. */
const DISPOSABLE = ['VERIFIED', 'AVAILABLE', 'UNDER_MAINTENANCE', 'DISPUTED', 'INACTIVE'];

const isDisposed = (asset?: Lookup) => asset?.['status'] === 'DISPOSED';
const isLand = (asset?: Lookup) => !!asset?.['assetSubcategory']?.assetCategory?.assetType?.forLand;

/** Now in local time as "2026-11-01T09:30:00" — toISOString alone would give UTC. */
const now = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 19);
};

const ASSET_NEXT_STATUSES = gql`
  query assetNextStatuses($uid: String) {
    assetNextStatuses(uid: $uid)
  }
`;

export const UPDATE_ASSET_STATUS = gql`
  mutation updateAssetStatus($uid: String, $status: AssetStatus) {
    updateAssetStatus(uid: $uid, status: $status) {
      ${responseGqlFields(lookupChildGqlFields)}
    }
  }
`;

const VALUE_ASSET = gql`
  mutation valueAsset($assetUid: String, $input: ValuationDtoInput) {
    valueAsset(assetUid: $assetUid, input: $input) {
      ${responseGqlFields('id')}
    }
  }
`;

const ALL_PEOPLE = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

const LAND_REGISTRATION_OF_ASSET = gql`
  query landRegistrationsByAsset($assetUid: String) {
    landRegistrationsByAsset(assetUid: $assetUid) {
      id
    }
  }
`;

export function assetActions(
  comp: BaseComponent,
  asset: LookupModule,
  lookups: AssetActionLookups,
): ActionButton[] {
  /** Opens a lookup's own form on this asset, and reloads the asset once it saves. */
  const openOnAsset = (lookup: LookupModule, model: Record<string, unknown>) => {
    lookup.changed$.pipe(take(1)).subscribe(() => asset.changed$.next(undefined));
    openLookupForm(comp, lookup, model);
  };

  return [
    {
      icon: 'check',
      label: 'Verify',
      toolTip: 'Record a check of this asset — a pass moves a pending asset to Verified',
      hideFunction: (a?: Lookup) => !a || isDisposed(a),
      // Only the asset: the backend names the record and fills in the rest.
      click: (a: Lookup) => openOnAsset(lookups.verification, { assetUid: a?.id }),
      permissions: lookups.verification.upsertPermissions,
    },
    {
      icon: 'linear_scale',
      label: 'Value',
      toolTip: 'Record what this asset is worth now',
      hideFunction: (a?: Lookup) => !a || isDisposed(a),
      click: (a: Lookup) => openValueForm(comp, asset, a),
      permissions: ['ROLE_CREATE_VALUATION'],
    },
    {
      icon: 'users',
      label: 'Add Owner',
      toolTip: 'Add a holder to this land — register the land first if it has none',
      hideFunction: (a?: Lookup) => !a || isDisposed(a) || !isLand(a),
      click: (a: Lookup) => addOwner(comp, asset, lookups.landRegistration, a),
      permissions: ['ROLE_CREATE_LAND_REGISTRATION', 'ROLE_UPDATE_LAND_REGISTRATION'],
    },
    {
      icon: 'sync',
      label: 'Change Status',
      hideFunction: (a?: Lookup) => !a || isDisposed(a),
      click: (a: Lookup) => openStatusForm(comp, asset, a),
      permissions: asset.upsertPermissions,
    },
    {
      icon: 'link',
      label: 'Link to…',
      toolTip: 'Tie this asset to a project, unit, cost, task or another asset',
      hideFunction: (a?: Lookup) => !a || isDisposed(a),
      buttons: lookups.linkTargets.map((target) => ({
        icon: target.icon,
        label: target.label,
        permissions: target.permissions,
        click: (a: Lookup) => {
          target.saved$.pipe(take(1)).subscribe(() => asset.changed$.next(undefined));
          target.open(a?.id as string);
        },
      })),
    },
    {
      icon: 'delete_sweep',
      label: 'Dispose',
      toolTip: 'Take this asset out of the register for good',
      hideFunction: (a?: Lookup) => !a || !DISPOSABLE.includes(a?.['status']),
      // Only the asset and the date: the backend writes the rest.
      click: (a: Lookup) => openOnAsset(lookups.disposal, { assetUid: a?.id, disposedAt: now() }),
      permissions: lookups.disposal.upsertPermissions,
    },
  ];
}

/** Only the statuses the asset may move to next — the backend's AssetStatusFlow decides. */
async function openStatusForm(comp: BaseComponent, asset: LookupModule, a: Lookup) {
  const next: string[] =
    (await comp.fs.fetch({ query: ASSET_NEXT_STATUSES, variables: { uid: a?.id } })) ?? [];
  const options: Option[] = next.map((value) => ({
    value,
    label: getDisplayName(value) as string,
  }));

  const close$ = new Subject<void>();
  const formParameter: FormParameters = {
    title: `Change Status — ${a?.name ?? ''}`,
    model: {},
    fields: [
      {
        key: 'status',
        label: `Now ${getDisplayName(a?.['status'])}. Move to`,
        hint: 'Verifying and disposing set the status themselves.',
        type: FieldType.select,
        options,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
    ],
    closeAction$: close$,
    onSubmit: async (value: Record<string, unknown>) => {
      await comp.fs.fetch({
        notify: true,
        mutation: UPDATE_ASSET_STATUS,
        variables: { uid: a?.id, status: value['status'] },
        successFn: (res) => {
          asset.changed$.next(res?.data);
          close$.next();
        },
      });
    },
  };

  comp.vs?.openModal(FormComponent, formParameter, '40%');
}

/** A valuation of this asset, recorded and linked in one save. */
function openValueForm(comp: BaseComponent, asset: LookupModule, a: Lookup) {
  const close$ = new Subject<void>();
  const formParameter: FormParameters = {
    title: `Value — ${a?.name ?? ''}`,
    // No name: the backend issues it ("Valuation VAL-… · asset").
    model: { valuedAt: now() },
    fields: [
      {
        key: 'value',
        label: 'Value',
        type: FieldType.decimal,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full md:col-span-1',
      },
      {
        key: 'valuedAt',
        label: 'Valued At',
        type: FieldType.dateTime,
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full md:col-span-1',
      },
      {
        key: 'valuerUid',
        label: 'Valuer',
        type: FieldType.select,
        optionsVariables: {
          labelKey: 'name',
          valueKey: 'id',
          fetchParameter: { query: ALL_PEOPLE },
        },
        validations: [VALIDATOR_REQUIRED],
        class: 'col-span-full',
      },
      {
        key: 'description',
        label: 'Remarks',
        hint: 'Optional — how it was valued, the method or the basis',
        type: FieldType.textarea,
        rows: 2,
        class: 'col-span-full',
      },
    ],
    closeAction$: close$,
    onSubmit: async (value: Record<string, unknown>) => {
      await comp.fs.fetch({
        notify: true,
        mutation: VALUE_ASSET,
        variables: { assetUid: a?.id, input: value },
        successFn: () => {
          asset.changed$.next(undefined);
          close$.next();
        },
      });
    },
  };

  comp.vs?.openModal(FormComponent, formParameter, '45%');
}

/**
 * Owners hang off the land registration, not the asset. With one, the owner
 * form opens on it; with none yet, the land registration form opens instead,
 * since an owner needs a parcel to own.
 */
async function addOwner(
  comp: BaseComponent,
  asset: LookupModule,
  landRegistration: LookupModule,
  a: Lookup,
) {
  const registrations: { id: string }[] =
    (await comp.fs.fetch({ query: LAND_REGISTRATION_OF_ASSET, variables: { assetUid: a?.id } })) ??
    [];

  if (!registrations.length) {
    comp.notify.info(`Register the land for ${a?.name} first — its owners go on the registration.`);
    landRegistration.changed$.pipe(take(1)).subscribe(() => asset.changed$.next(undefined));
    openLookupForm(comp, landRegistration, { assetUid: a?.id });
    return;
  }

  await openOwnerForm(comp, registrations[0].id)();
}
