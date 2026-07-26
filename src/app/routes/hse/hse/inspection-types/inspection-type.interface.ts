export interface InspectionType {
  uid?: string;
  code?: string;
  name: string;
  description: string;
  active?: boolean;
  createdAt?: string;
}

export interface InspectionTypeChecklist {
  uid?: string;
  question: string;
  groupName?: string;
  mandatory?: boolean;
  description?: string;
  active?: boolean;
  createdAt?: string;
}
