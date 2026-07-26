import { LookupProvider } from '@shared/crud';
import { PipelineStation } from './pipeline-station.interface';
import { GET_ALL_PIPELINE_STATIONS } from './pipeline-station.graphql';

export const pipelineStationLookupProvider: LookupProvider<PipelineStation> = {
  query: GET_ALL_PIPELINE_STATIONS,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true, pageableParam: { size: 1000 } },
};
