export type ValueType = 'object' | 'number' | 'array' | 'string' | 'boolean';

export type Obj = Record<string, any>;

export interface Option {
  label: string;
  value: any;
}

export interface DateRange {
  key?: string;
  fromDate?: string;
  toDate?: string;
}
