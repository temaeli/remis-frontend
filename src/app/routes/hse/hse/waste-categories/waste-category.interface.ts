import { WasteGroup } from '../waste-groups/waste-group.interface';

export interface WasteCategory {
  uid?: string;
  code?: string;
  name?: string;
  description?: string;
  recyclable?: boolean;
  wasteGroup?: WasteGroup;
  wasteGroupUid?: string;
}
