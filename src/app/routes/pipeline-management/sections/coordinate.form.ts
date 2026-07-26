import { Subject } from 'rxjs';
import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { FieldConfig, FieldType } from '@shared/components/generic-form/field.interface';
import { FormComponent } from '@shared/components/generic-form/form.component';
import { FormParameters } from '@shared/components/generic-form/form.interface';
import { UPLOAD_PIPELINE_SECTION_POINT_COORDINATES } from './coordinate.graphql';

export const pipelineSectionCoordinate$ = new Subject<any>();

const UPLOAD_HINT =
  'Excel columns (header row + data rows): name, _ignored_, northing, easting, elevation, distance, mileage, sourceSrid (optional, defaults to 32737 — UTM Zone 37S). Existing points are matched by Name and updated; points not present in this file are kept.';

function getCoordinateUploadFormFields(): FieldConfig[] {
  return [
    {
      key: 'coordinateFile',
      label: 'Coordinates Excel',
      type: FieldType.attachment,
      acceptType: ['.xlsx', '.xls'],
      validations: [VALIDATOR_REQUIRED],
      class: 'col-span-full',
      hint: UPLOAD_HINT,
      skipAutoUpload: true,
    },
  ];
}

export function coordinateUploadBtn(comp: BaseComponent, sectionUid: string): ActionButton {
  return {
    icon: 'upload',
    label: 'Upload Coordinates',
    color: 'primary',
    toolTip: 'Upload section point coordinates from Excel',
    permissions: ['ROLE_CREATE_PIPELINE_SECTION', 'ROLE_UPDATE_PIPELINE_SECTION'],
    click: () => {
      const close$ = new Subject<void>();
      const formParameter: FormParameters = {
        title: 'Upload Section Coordinates',
        fields: getCoordinateUploadFormFields(),
        closeAction$: close$,
        onSubmit: async (value: any) => {
          const att = value?.coordinateFile ?? {};
          const excelFile = att?.dataBinary ?? att?.data;
          if (!excelFile || !sectionUid) return;
          await comp.fs.fetch({
            notify: true,
            mutation: UPLOAD_PIPELINE_SECTION_POINT_COORDINATES,
            variables: { uid: sectionUid, excelFile },
            successFn: () => {
              pipelineSectionCoordinate$.next(null);
              close$.next();
            },
          });
        },
      };
      comp.vs?.openModal(FormComponent, formParameter, '50%');
    },
  };
}
