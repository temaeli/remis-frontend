import { Pipeline } from '../pipelines/pipeline.interface';

export interface PipelineSection {
  id?: number;
  uid?: string;
  sectionId: string;
  diameter?: number;
  designPressure?: number;
  maxPressure?: number;
  minPressure?: number;
  materialUsed?: string;
  installationDate?: string;
  area?: number;
  pipeline?: Pipeline;
  active?: boolean;
}

export interface PipelineSectionDtoInput {
  uid?: string;
  sectionId: string;
  diameter: number;
  designPressure?: number;
  maxPressure: number;
  minPressure: number;
  materialUsed?: string;
  installationDate?: string;
  pipelineUid?: string;
  plantUid?: string;
  ignoreWarning?: boolean;
}
