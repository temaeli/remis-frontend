import { LookupProvider } from '@shared/crud';
import { Pipeline } from './pipeline.interface';
import { GET_ALL_PIPELINES } from './pipeline.graphql';

export const pipelineLookupProvider: LookupProvider<Pipeline> = {
  query: GET_ALL_PIPELINES,
  labelKey: 'name',
  valueKey: 'uid',
  variables: { active: true },
};
