import { PipelineSection } from './section.interface';

export interface PipelineSectionCoordinate {
  id?: number;
  uid?: string;
  name?: string;
  northing?: number;
  easting?: number;
  elevation?: number;
  distance?: number;
  mileage?: number;
  sourceSrid?: number;
  pipelineSection?: PipelineSection;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
