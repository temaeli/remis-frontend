import { LookupProvider } from '@shared/crud';
import { PipelineSection } from './section.interface';
import { GET_ALL_PIPELINE_SECTIONS } from './section.graphql';

export const pipelineSectionLookupProvider: LookupProvider<PipelineSection> = {
  query: GET_ALL_PIPELINE_SECTIONS,
  labelKey: 'sectionId',
  valueKey: 'uid',
  variables: { active: true },
};
