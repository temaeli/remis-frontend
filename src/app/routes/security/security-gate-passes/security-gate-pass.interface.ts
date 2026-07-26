import { SecurityGatePassItemStatus, SecurityGatePassStatus } from '../shared/security.enums';

export interface SecurityGatePassItem {
  uid?: string;
  materialDescription?: string;
  quantity?: number;
  itemRefNo?: string;
  itemStatus?: SecurityGatePassItemStatus;
}

export interface SecurityGatePass {
  id?: number;
  uid?: string;
  referenceNumber?: string;
  serialNo?: string;
  company?: string;
  vehicleNo?: string;
  station?: { uid?: string; name?: string };
  otherStation?: string;
  passDate?: string;
  initiatedByName?: string;
  comments?: string;
  status?: SecurityGatePassStatus;
  items?: SecurityGatePassItem[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityGatePassItemDtoInput {
  materialDescription?: string;
  quantity?: number;
  itemRefNo?: string;
  itemStatus?: SecurityGatePassItemStatus;
}

export interface SecurityGatePassDtoInput {
  // uid?: string;
  serialNo?: string;
  company?: string;
  vehicleNo?: string;
  stationUid?: string;
  otherStation?: string;
  passDate?: string;
  initiatedByName?: string;
  comments?: string;
  items?: SecurityGatePassItemDtoInput[];
}
