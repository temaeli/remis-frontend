# @shared/crud

Deep, opt-in primitives that absorb the CRUD boilerplate that was scattered across every entity. Originated under `routes/pipeline-management/_shared/` and promoted here so any module — `pipeline-management/`, `reports/`, future siblings — can consume it via `'@shared/crud'`. Existing entity files keep working unchanged. Adopt one entity at a time.

## What's here

| File | Purpose |
| --- | --- |
| `process-status.ts` | One `ProcessStatus` enum + pure predicates (`canSubmit`, `canApprove`, `canReject`, `canEdit`, `canDelete`, `canRegenerate`, `canExport`) that replace the per-entity status enums. |
| `crud-host.ts` | `CrudHost` interface — narrow seam for what a button factory needs (fetch, openModal, navigate, notify, reload$). Replaces taking the whole `BaseComponent`. |
| `crud-host.from-base.ts` | Adapter `crudHostFromBase(comp)` — turns a `BaseComponent` into a `CrudHost`. |
| `entity-crud.ts` | `defineEntityCrud<T>(config)` factory. Returns `{ upsertBtn, viewBtn, deleteBtn, tableBtns, reload$ }`. Owns its own reload Subject. Multi-step wizards opt in via `formSteppers` in the config. |
| `lookup-provider.ts` | `LookupProvider<T>` contract — the shape entities expose so other modules can drop them into select-field configs without importing raw GraphQL. |
| `index.ts` | Barrel. Import from `'@shared/crud'`. |

## Why

- **Locality** — fix a bug in modal wiring, reload behaviour, or status transitions in one place; every adopting entity benefits.
- **Leverage** — a new entity becomes ~30 lines of config rather than ~100 lines of copy-paste.
- **Testability** — `CrudHost` is mockable with four functions; no need to fake the whole `BaseComponent`.

## Adoption checklist

For each entity:

1. Drop the entity's local `entityName$ = new Subject()` — the factory owns reload.
2. Drop the entity's local status enum — use `ProcessStatus` + predicates.
3. Move field list into a `getXxxFields()` (or reuse the existing one).
4. Wire `defineEntityCrud({...})` and re-export `tableBtns` from the same file. Public surface stays the same so list/detail pages don't change.
5. Build + smoke. Done.

## What's *not* here

- No changes to `BaseComponent`, `FormComponent`, `DataGrid`, `view.helpers`, `action-buttons`. This folder builds *on top of* them — never modifies them.
- No code for entities owned by other developers. Adopt-when-ready.
