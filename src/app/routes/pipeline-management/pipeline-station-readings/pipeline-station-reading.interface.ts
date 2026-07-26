export interface StationSuctionReading {
  id?: number;
  uid?: string;
  temperature?: number;
  pressure?: number;
  suctionPoint?: { uid?: string; name?: string };
  suctionPointUid?: string;
}

export interface StationSuctionReadingDtoInput {
  uid?: string;
  temperature: number;
  pressure: number;
  suctionPointUid: string;
}

export interface StationDischargeReading {
  id?: number;
  uid?: string;
  temperature?: number;
  pressure?: number;
  dischargePoint?: { uid?: string; name?: string };
  dischargePointUid?: string;
}

export interface StationDischargeReadingDtoInput {
  uid?: string;
  temperature: number;
  pressure: number;
  dischargePointUid: string;
}

export interface PipelineStationReading {
  id?: number;
  uid?: string;
  readingTime?: string;
  station?: { uid?: string; name?: string };
  pipelineStationUid?: string;
  suctionReadings?: StationSuctionReading[];
  dischargeReadings?: StationDischargeReading[];
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  remarks?: string;
  comment?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineStationReadingDtoInput {
  uid?: string;
  readingTime?: string;
  pipelineStationUid: string;
  remarks?: string;
  suctionReadings?: StationSuctionReadingDtoInput[];
  dischargeReadings?: StationDischargeReadingDtoInput[];
}
