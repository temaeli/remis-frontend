import { LookupProvider } from '@shared/crud';
import { PipelineSegment } from './segment.interface';
import { GET_ALL_PIPELINE_SEGMENTS } from './segment.graphql';

/** Flat segment lookup (label = segmentId). */
export const segmentLookupProvider: LookupProvider<PipelineSegment> = {
  query: GET_ALL_PIPELINE_SEGMENTS,
  labelKey: 'segmentId',
  valueKey: 'uid',
  variables: { active: true, pageableParam: { size: 500 } },
};
