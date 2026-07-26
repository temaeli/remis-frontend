export interface EmissionSubstance {
  uid?: string;
  code?: string;
  name?: string;
  unitOfMeasure?: string;
  conversionFactor?: number;
  energyUse?: { uid?: string; name?: string };
  description?: string;
}
