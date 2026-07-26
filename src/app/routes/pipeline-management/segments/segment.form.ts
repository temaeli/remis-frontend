import { BehaviorSubject, Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { CrudHost, crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { pipelineSectionLookupProvider } from '../sections/section.provider';
import { pipelineStationLookupProvider } from '../pipeline-stations/pipeline-station.provider';
import { GET_PIPELINE_SUCTIONS_BY_STATION } from '../pipeline-station-suctions/suction.graphql';
import { GET_PIPELINE_DISCHARGES_BY_STATION } from '../pipeline-station-discharges/discharge.graphql';
import {
  CREATE_PIPELINE_SEGMENT,
  UPDATE_PIPELINE_SEGMENT,
  DELETE_PIPELINE_SEGMENT,
  SET_PIPELINE_SEGMENT_SUCTION_AND_DISCHARGE,
} from './segment.graphql';
import { PipelineSegment } from './segment.interface';

export function getPipelineSegmentFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'segmentId',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'sectionUid',
      label: 'Associated Section',
      type: FieldType.select,
      optionsVariables: lookupOptions(pipelineSectionLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'wallThickness',
      label: 'Wall Thickness (mm)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'elevation',
      label: 'Elevation (m)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
  ];
}

const segmentCrud = defineEntityCrud<PipelineSegment>({
  name: 'Segment',
  routeSlug: 'segments',
  modalTitle: 'Pipeline Segment',
  fields: getPipelineSegmentFormFields(),
  modalWidth: '60%',
  mutations: {
    create: CREATE_PIPELINE_SEGMENT,
    update: UPDATE_PIPELINE_SEGMENT,
    delete: DELETE_PIPELINE_SEGMENT,
  },
  permissions: {
    manage: ['ROLE_CREATE_PIPELINE_SEGMENT', 'ROLE_UPDATE_PIPELINE_SEGMENT'],
    delete: ['ROLE_DELETE_PIPELINE_SEGMENT'],
    view: ['ROLE_VIEW_PIPELINE_SEGMENT'],
  },
  modelMapper: (data: any) => {
    const model: any = { ...data };
    if (model.pipelineSection && !model.sectionUid) {
      model.sectionUid = model.pipelineSection.uid;
    }
    return model;
  },
});

export const pipelineSegment$ = segmentCrud.reload$;

export const segmentUpsertBtn = (comp: BaseComponent): ActionButton =>
  segmentCrud.upsertBtn(crudHostFromBase(comp));

export const segmentDeleteBtn = (comp: BaseComponent): ActionButton =>
  segmentCrud.deleteBtn(crudHostFromBase(comp));

export const segmentTableBtns = (comp: BaseComponent): ActionButton[] =>
  segmentCrud.tableBtns(crudHostFromBase(comp));

function buildSetSuctionDischargeBtn(host: CrudHost, segment: PipelineSegment | null): ActionButton {
  return {
    icon: 'workflow',
    label: 'Set Suction & Discharge',
    color: 'accent',
    toolTip: 'Bind suction point + discharge point for material balance',
    permissions: ['ROLE_UPDATE_PIPELINE_SEGMENT'],
    click: () => {
      const suctionStation$ = new BehaviorSubject<string | null>(
        segment?.suction?.station?.uid ?? null,
      );
      const dischargeStation$ = new BehaviorSubject<string | null>(
        segment?.discharge?.station?.uid ?? null,
      );
      const close$ = new Subject<void>();

      const fields: FieldConfig[] = [
        {
          key: 'suctionStationPickerUid',
          label: 'Suction Station',
          type: FieldType.select,
          ignoreOnSubmit: true,
          validations: [VALIDATOR_REQUIRED],
          optionsVariables: lookupOptions(pipelineStationLookupProvider),
          onChange: (value: string, form: any) => {
            suctionStation$.next(value ?? null);
            form?.get('suctionStationUid')?.reset();
          },
        },
        {
          key: 'suctionStationUid',
          label: 'Suction Point',
          type: FieldType.select,
          validations: [VALIDATOR_REQUIRED],
          showWhen: [{ key: 'suctionStationPickerUid', checker: (v) => !!v }],
          optionsVariables: {
            labelKey: 'name',
            valueKey: 'uid',
            fetchParameter: {
              query: GET_PIPELINE_SUCTIONS_BY_STATION,
              variables: { stationUid: suctionStation$, active: true },
            },
          },
        },
        {
          key: 'dischargeStationPickerUid',
          label: 'Discharge Station',
          type: FieldType.select,
          ignoreOnSubmit: true,
          validations: [VALIDATOR_REQUIRED],
          optionsVariables: lookupOptions(pipelineStationLookupProvider),
          onChange: (value: string, form: any) => {
            dischargeStation$.next(value ?? null);
            form?.get('dischargeStationUid')?.reset();
          },
        },
        {
          key: 'dischargeStationUid',
          label: 'Discharge Point',
          type: FieldType.select,
          validations: [VALIDATOR_REQUIRED],
          showWhen: [{ key: 'dischargeStationPickerUid', checker: (v) => !!v }],
          optionsVariables: {
            labelKey: 'name',
            valueKey: 'uid',
            fetchParameter: {
              query: GET_PIPELINE_DISCHARGES_BY_STATION,
              variables: { stationUid: dischargeStation$, active: true },
            },
          },
        },
      ];

      const params: FormParameters = {
        model: {
          suctionStationPickerUid: segment?.suction?.station?.uid,
          suctionStationUid: segment?.suction?.uid,
          dischargeStationPickerUid: segment?.discharge?.station?.uid,
          dischargeStationUid: segment?.discharge?.uid,
        },
        title: 'Set Suction & Discharge: ' + (segment?.segmentId ?? ''),
        fields,
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: SET_PIPELINE_SEGMENT_SUCTION_AND_DISCHARGE,
            variables: {
              segmentUid: segment?.uid,
              suctionStationUid: value.suctionStationUid,
              dischargeStationUid: value.dischargeStationUid,
            },
            successFn: (res) => {
              pipelineSegment$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '50%');
    },
  };
}

export const segmentSetSuctionDischargeBtn = (
  comp: BaseComponent,
  segment: PipelineSegment | null,
): ActionButton => buildSetSuctionDischargeBtn(crudHostFromBase(comp), segment);
