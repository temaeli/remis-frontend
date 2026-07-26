export enum TimelineType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALY = 'ANNUALY',
}

export interface InspectionPlan {
  uid?: string;
  station: string;
  area: string;
  category?: TimelineType;
  inspectionDate: string;
  closedAt?: string;
  inspectedAt?: string;
  observation?: string;
  recommendation?: string;
  endorsementOfDoer?: string;
  remarks?: string;
  type?: { uid?: string; name?: string };
  active?: boolean;
  createdAt?: string;
}

export interface InspectionPlanDtoInput {
  uid?: string;
  station: string;
  area: string;
  category: TimelineType;
  inspectionDate: string;
  inspectorUids?: string[];
}
