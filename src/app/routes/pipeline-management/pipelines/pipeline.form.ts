import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { crudHostFromBase, defineEntityCrud } from '@shared/crud';
import { CREATE_PIPELINE, UPDATE_PIPELINE, DELETE_PIPELINE } from './pipeline.graphql';
import { Pipeline, PipelineStatus } from './pipeline.interface';
import { enumToObjectArray } from '@core/helpers';

export function getPipelineFormFields(): FieldConfig[] {
  return [
    { key: 'uid', type: FieldType.input, visible: false },
    {
      key: 'name',
      label: 'Pipeline Name',
      type: FieldType.input,
      validations: [VALIDATOR_REQUIRED],
    },
    {
      key: 'description',
      label: 'Description',
      type: FieldType.textarea,
      validations: [],
    },
    {
      key: 'status',
      label: 'Status',
      type: FieldType.select,
      validations: [VALIDATOR_REQUIRED],
      options: enumToObjectArray(PipelineStatus),
    },
  ];
}

const pipelineCrud = defineEntityCrud<Pipeline>({
  name: 'Pipeline',
  routeSlug: 'pipelines',
  fields: getPipelineFormFields(),
  modalWidth: '60%',
  mutations: {
    create: CREATE_PIPELINE,
    update: UPDATE_PIPELINE,
    delete: DELETE_PIPELINE,
  },
  permissions: {
    manage: ['ROLE_CREATE_PIPELINE', 'ROLE_UPDATE_PIPELINE'],
    delete: ['ROLE_DELETE_PIPELINE'],
    view: ['ROLE_VIEW_PIPELINE'],
  },
});

export const pipeline$ = pipelineCrud.reload$;

export const pipelineUpsertBtn = (comp: BaseComponent): ActionButton =>
  pipelineCrud.upsertBtn(crudHostFromBase(comp));

export const pipelineViewBtn = (comp: BaseComponent): ActionButton =>
  pipelineCrud.viewBtn(crudHostFromBase(comp))!;

export const pipelineDeleteBtn = (comp: BaseComponent): ActionButton =>
  pipelineCrud.deleteBtn(crudHostFromBase(comp));

export const pipelineTableBtns = (comp: BaseComponent): ActionButton[] =>
  pipelineCrud.tableBtns(crudHostFromBase(comp));
