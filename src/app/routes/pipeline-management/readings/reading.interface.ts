import { ProcessStatus } from '@shared/crud';
import { PipelineSegment } from '../segments/segment.interface';

export interface PipelineReading {
  id?: number;
  uid?: string;
  readingTime?: string;
  temperatureIn?: number;
  pressureIn?: number;
  temperatureOut?: number;
  pressureOut?: number;
  flowRate?: number;
  pipelineSegment?: PipelineSegment;
  status?: ProcessStatus;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineReadingDtoInput {
  uid?: string;
  readingTime?: string;
  temperatureIn?: number;
  pressureIn?: number;
  temperatureOut?: number;
  pressureOut?: number;
  pipelineSegmentUid?: string;
}
