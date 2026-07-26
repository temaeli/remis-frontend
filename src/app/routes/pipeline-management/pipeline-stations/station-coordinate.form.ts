import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import {
  CREATE_OR_UPDATE_STATION_COORDINATES,
  DELETE_STATION_COORDINATES,
  GET_ALL_STATION_COORDINATES_BY_STATION,
} from './station-coordinate.graphql';

export const stationCoordinate$ = new Subject<any>();

const MANAGE_PERMS = ['ROLE_MANAGE_PIPELINE_STATION'];
const DEFAULT_SRID = 32737; // UTM Zone 37S

// One batch-level SRID + a repeatable group array of points. `sequence` is
// intentionally omitted — the backend orders polygon vertices via the
// right-hand rule, so client-side ordering is irrelevant.
function getStationCoordinatesBulkFormFields(): FieldConfig[] {
  return [
    {
      key: 'sourceSrid',
      label: 'Source SRID',
      type: FieldType.number,
      hint: 'CRS of all coordinates below — defaults to 32737 (UTM Zone 37S).',
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'coordinates',
      label: 'Coordinates',
      type: FieldType.formGroupArray,
      class: 'col-span-full',
      labelClass: 'p-0 pb-3',
      // Force 3-across at every breakpoint — the generic form's base grid is
      // `xl:grid-cols-2`, which would otherwise drop us to 2 per row on wide screens.
      fieldsClass: 'grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-4',
      canAddFormGroup: true,
      expandable: false,
      fields: [
        { key: 'uid', type: FieldType.input, visible: false },
        { key: 'name', label: 'Name / Label', type: FieldType.input, validations: [] },
        {
          key: 'northing',
          label: 'Northing',
          type: FieldType.decimal,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'easting',
          label: 'Easting',
          type: FieldType.decimal,
          validations: [VALIDATOR_REQUIRED],
        },
      ],
    },
  ];
}

/**
 * Single "Manage Coordinates" editor: loads the existing coordinate set into a
 * repeatable array, bulk-upserts it via `createOrUpdateStationCoordinates`, and —
 * because that mutation only upserts — reconciles removals by calling
 * `deleteStationCoordinates` for any pre-loaded coordinate whose row was removed.
 */
export function stationCoordinatesManageBtn(
  comp: BaseComponent,
  stationUid: string,
): ActionButton {
  return {
    icon: 'edit',
    label: 'Manage Coordinates',
    color: 'primary',
    toolTip: 'Add, edit or remove station coordinates',
    permissions: MANAGE_PERMS,
    click: async () => {
      const page = await comp.fs.fetch({
        query: GET_ALL_STATION_COORDINATES_BY_STATION,
        variables: { StationUid: stationUid, active: true, pageableParam: { size: 500 } },
      });
      const existing: any[] = page?.content ?? [];

      const model = {
        sourceSrid: existing[0]?.sourceSrid ?? DEFAULT_SRID,
        coordinates: existing.map((c) => ({
          uid: c.uid,
          name: c.name,
          northing: c.northing,
          easting: c.easting,
        })),
      };

      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        model,
        title: 'Manage Coordinates',
        fields: getStationCoordinatesBulkFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const srid = value?.sourceSrid ?? DEFAULT_SRID;
          const rows: any[] = value?.coordinates ?? [];
          const dtos = rows.map((r) => ({
            uid: r.uid,
            name: r.name,
            northing: r.northing,
            easting: r.easting,
            sourceSrid: srid,
          }));

          const keptUids = new Set(rows.map((r) => r.uid).filter(Boolean));
          const removed = existing.filter((c) => c.uid && !keptUids.has(c.uid));

          await comp.fs.fetch({
            notify: true,
            variables: { stationUid, dtos },
            mutation: CREATE_OR_UPDATE_STATION_COORDINATES,
            successFn: async () => {
              // Reconcile removals (upsert never deletes omitted rows).
              await Promise.all(
                removed.map((c) =>
                  comp.fs.fetch({
                    notify: false,
                    mutation: DELETE_STATION_COORDINATES,
                    variables: { uid: c.uid },
                  }),
                ),
              );
              stationCoordinate$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '85%');
    },
  };
}
