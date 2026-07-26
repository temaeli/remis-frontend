export interface GeneratorTankRefuel {
  id?: number;
  uid?: string;
  date?: string;
  quantityInLitres?: number;
  newVolume?: number;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  remarks?: string;
  comment?: string;
  generatorTank?: {
    uid?: string;
    name?: string;
    capacityInLitres?: number;
    workingStation?: { uid?: string; name?: string; code?: string };
  };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratorTankRefuelDtoInput {
  uid?: string;
  powerGeneratorTankUid: string;
  date?: string;
  quantityInLitres: number;
  remarks?: string;
}
