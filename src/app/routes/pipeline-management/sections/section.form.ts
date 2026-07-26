import { Subject } from 'rxjs';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { CrudHost, crudHostFromBase, defineEntityCrud, lookupOptions } from '@shared/crud';
import { pipelineLookupProvider } from '../pipelines/pipeline.provider';
import {
  CREATE_PIPELINE_SECTION,
  CREATE_PIPELINE_SECTION_BEFORE,
  UPDATE_PIPELINE_SECTION,
  DELETE_PIPELINE_SECTION,
} from './section.graphql';
import { PipelineSection } from './section.interface';

export function getPipelineSectionFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'sectionId',
      label: 'Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'pipelineUid',
      label: 'Associated Pipeline',
      type: FieldType.select,
      optionsVariables: lookupOptions(pipelineLookupProvider),
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'diameter',
      label: 'Diameter (mm)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'designPressure',
      label: 'Design Pressure (bar)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'maxPressure',
      label: 'Max Pressure (bar)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'minPressure',
      label: 'Min Pressure (bar)',
      type: FieldType.decimal,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'materialUsed',
      label: 'Material Used',
      type: FieldType.input,
      validations: [],
    },
    {
      key: 'installationDate',
      label: 'Installation Date',
      type: FieldType.date,
      validations: [VALIDATOR_REQUIRED],
      maxDate: new Date(),
    },
  ];
}

const sectionCrud = defineEntityCrud<PipelineSection>({
  name: 'Section',
  modalTitle: 'Pipeline Section',
  routeSlug: 'sections',
  fields: getPipelineSectionFormFields(),
  modalWidth: '60%',
  mutations: {
    create: CREATE_PIPELINE_SECTION,
    update: UPDATE_PIPELINE_SECTION,
    delete: DELETE_PIPELINE_SECTION,
  },
  permissions: {
    manage: ['ROLE_CREATE_PIPELINE_SECTION', 'ROLE_UPDATE_PIPELINE_SECTION'],
    delete: ['ROLE_DELETE_PIPELINE_SECTION'],
    view: ['ROLE_VIEW_PIPELINE_SECTION'],
  },
  modelMapper: (data: any) => ({
    ...data,
    pipelineUid: data?.pipelineUid ?? data?.pipeline?.uid,
  }),
});

export const pipelineSection$ = sectionCrud.reload$;

export const sectionUpsertBtn = (comp: BaseComponent): ActionButton =>
  sectionCrud.upsertBtn(crudHostFromBase(comp));

export const sectionViewBtn = (comp: BaseComponent): ActionButton =>
  sectionCrud.viewBtn(crudHostFromBase(comp))!;

export const sectionDeleteBtn = (comp: BaseComponent): ActionButton =>
  sectionCrud.deleteBtn(crudHostFromBase(comp));

function buildInsertBeforeBtn(host: CrudHost): ActionButton {
  return {
    icon: 'add_alt',
    label: 'Insert Before',
    color: 'accent',
    toolTip: 'Insert Section Before',
    permissions: ['ROLE_CREATE_PIPELINE_SECTION', 'ROLE_UPDATE_PIPELINE_SECTION'],
    click: (data: any) => {
      const close$ = new Subject<void>();
      const params: FormParameters = {
        model: { pipelineUid: data?.pipeline?.uid },
        title: 'Insert Section Before: ' + data.sectionId,
        fields: getPipelineSectionFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          await host.fetch({
            notify: true,
            mutation: CREATE_PIPELINE_SECTION_BEFORE,
            variables: { input: value, beforeSectionUid: data.uid },
            successFn: (res) => {
              pipelineSection$.next(res?.data);
              close$.next();
            },
          });
        },
      };
      host.openModal(FormComponent, params, '60%');
    },
  };
}

export const sectionInsertBeforeBtn = (comp: BaseComponent): ActionButton =>
  buildInsertBeforeBtn(crudHostFromBase(comp));

export const sectionTableBtns = (comp: BaseComponent): ActionButton[] => {
  const host = crudHostFromBase(comp);
  return sectionCrud.tableBtns(host, [buildInsertBeforeBtn(host)]);
};
