import { BehaviorSubject, Subject } from 'rxjs';
import { MORE_BTN } from '@shared/components/data-grid/data-grid.constants';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { getDeleteBtnProps } from '@shared/components/view-component/view.helpers';
import {
  ALL_CONSTRUCTION_PROJECTS,
  CONSTRUCTION_CATEGORIES,
  CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
} from '../../construction-projects/construction-projects.graphql';
import {
  ConstructionSopAssignment,
  ConstructionSopAssignmentDtoInput,
  SopAssignmentScope,
} from '../construction-sop.interface';
import {
  SAVE_CONSTRUCTION_SOP_ASSIGNMENT,
  DELETE_CONSTRUCTION_SOP_ASSIGNMENT,
} from './sop-catology.graphql';

export const constructionSopAssignment$ = new Subject<ConstructionSopAssignment | any>();

const SCOPE_OPTIONS = [
  { label: 'Project', value: SopAssignmentScope.PROJECT },
  { label: 'Category', value: SopAssignmentScope.CATEGORY },
  { label: 'Activity', value: SopAssignmentScope.ACTIVITY },
];

export function constructionSopAssignBtn(comp: BaseComponent, sopUid: string): ActionButton {
  return {
    icon: 'add',
    label: 'Assign to Project / Category / Activity',
    click: () => {
      const projectUid$ = new BehaviorSubject<string | null>(null);

      const fields: FieldConfig[] = [
        {
          key: 'scopeType',
          label: 'Assign To',
          type: FieldType.select,
          options: SCOPE_OPTIONS,
          validations: [VALIDATOR_REQUIRED],
        },
        {
          key: 'projectUid',
          label: 'Project',
          type: FieldType.select,
          validations: [VALIDATOR_REQUIRED],
          optionsVariables: {
            fetchParameter: { query: ALL_CONSTRUCTION_PROJECTS },
            labelKey: 'name',
            valueKey: 'uid',
          },
          onChange: (value: string, form: any) => {
            projectUid$.next(value ?? null);
            form?.get('categoryUid')?.reset();
            form?.get('activityUid')?.reset();
          },
        },
        {
          key: 'categoryUid',
          label: 'Category',
          type: FieldType.select,
          showWhen: [{ key: 'scopeType', checker: (v: any) => v === SopAssignmentScope.CATEGORY }],
          optionsVariables: {
            labelKey: 'name',
            valueKey: 'uid',
            fetchParameter: {
              query: CONSTRUCTION_CATEGORIES,
              variables: { projectUid: projectUid$ },
            },
          },
        },
        {
          key: 'activityUid',
          label: 'Activity',
          type: FieldType.select,
          showWhen: [{ key: 'scopeType', checker: (v: any) => v === SopAssignmentScope.ACTIVITY }],
          optionsVariables: {
            labelKey: 'name',
            valueKey: 'uid',
            fetchParameter: {
              query: CONSTRUCTION_ACTIVITIES_FOR_PROJECT,
              variables: { projectUid: projectUid$ },
            },
          },
        },
      ];

      const formParameter: FormParameters = {
        title: 'Assign SOP to WBS',
        fields,
        closeAction$: constructionSopAssignment$,
        onSubmit: async (model: any) => {
          if (model.scopeType === SopAssignmentScope.CATEGORY && !model.categoryUid) {
            comp.notify.error('Select a category to assign this SOP to.');
            return;
          }
          if (model.scopeType === SopAssignmentScope.ACTIVITY && !model.activityUid) {
            comp.notify.error('Select an activity to assign this SOP to.');
            return;
          }
          const dto: ConstructionSopAssignmentDtoInput = { sopUid };
          if (model.scopeType === SopAssignmentScope.PROJECT) dto.projectUid = model.projectUid;
          if (model.scopeType === SopAssignmentScope.CATEGORY) dto.categoryUid = model.categoryUid;
          if (model.scopeType === SopAssignmentScope.ACTIVITY) dto.activityUid = model.activityUid;

          const result = await comp.fs.fetch({
            notify: true,
            mutation: SAVE_CONSTRUCTION_SOP_ASSIGNMENT,
            variables: { dto },
          });
          if (result) constructionSopAssignment$.next(result);
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '55%');
    },
    permissions: ['ROLE_CREATE_SOP_CATALOG', 'ROLE_UPDATE_SOP_CATALOG'],
  };
}

export function constructionSopAssignmentDeleteBtn(comp: BaseComponent): ActionButton {
  return {
    ...getDeleteBtnProps('SOP Assignment'),
    permissions: ['ROLE_DELETE_SOP_CATALOG'],
    click: async (data?: ConstructionSopAssignment) => {
      const result = await comp.fs.fetch({
        notify: true,
        mutation: DELETE_CONSTRUCTION_SOP_ASSIGNMENT,
        variables: { uid: data?.uid },
      });
      if (result) constructionSopAssignment$.next(result);
    },
  };
}

export function constructionSopAssignmentTableBtns(comp: BaseComponent): ActionButton[] {
  return [
    {
      ...MORE_BTN,
      buttons: [constructionSopAssignmentDeleteBtn(comp)],
    },
  ];
}
