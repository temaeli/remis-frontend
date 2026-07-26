import { User } from '@routes/auth/auth.interface';
import { Plant } from '@routes/plants/plants/plant.interface';

export interface CondensateParameter {
  active?: boolean;
  createdAt?: string;
  createdBy?: User;
  plant?: Plant;
  /** Returned field name - differs from the input field name (testedRedVapourPressure), see schema. */
  testedRvp?: number;
  uid?: string;
  updatedAt?: string;
}

export interface CondensateParameterDtoInput {
  testedRedVapourPressure?: number;
}
