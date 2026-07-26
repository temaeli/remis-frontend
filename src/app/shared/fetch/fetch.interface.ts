import { HttpErrorResponse } from '@angular/common/http';
import { FetchPolicy } from '@apollo/client';
import { OptionsVariable } from '@shared/components/generic-form/field.interface';
import { InputType } from '@shared/components/generic-form/form.helpers';
import { Observable, BehaviorSubject } from 'rxjs';

export interface SearchField {
  fieldName: string;
  fieldValue?: string;
  fieldValues?: string[];
  searchType?: SearchOperationType;
}

export interface PageableParam {
  first?: number;
  size?: number;
  page?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  searchFields?: SearchField[];
  searchCombinationType?: SearchCombinationType; // addition for ease
}

export interface PageableResponse<T = any> {
  content?: T[];
  pagination?: ResponsePagination;
  size?: number;
  number?: number;
  page?: boolean;
  last?: boolean;

  totalElements?: number;
  totalPages?: number;

  hasContent?: boolean;
  slug?: any;

  pageResponse?: PageableResponse;
}

export interface ResponsePagination {
  totalElements?: number;
  totalPages?: number;
  hasContent: boolean;
}

export interface CurrentSort {
  sortBy?: string;
  sortDirection: 'DESC' | 'ASC';
}

export interface SearchState {
  key: string;
  name?: string;
  values?: string[];
  active?: boolean;
  value?: any;
  locked?: boolean;
  ignoreValues?: any[];
  required?: boolean;

  hideLabel?: boolean;
  class?: string;

  labelsMapper?: (value: string) => string;
  labelsMap?: Record<string, any>;

  searchType?: SearchOperationType;
  min?: number;
  max?: number;
  step?: number;
  type?:
    | InputType
    | 'list'
    | 'select'
    | 'radio'
    | 'toggle'
    | 'checkbox'
    | 'range'
    | 'date'
    | 'dateRange'
    | 'slider'
    | 'sliderRange'
    | 'numberRange'
    | 'slider-select';

  format?: string;
  url?: string;

  optionsVariables?: OptionsVariable;
  onchange?: (data?: any) => any;

  isQueryVariable?: boolean;
  defualtValue?: any;
  hasClear?: boolean;
}

export enum SearchCombinationType {
  And = 'And',
  Or = 'Or',
}

export enum SearchOperationType {
  Between = 'Between',
  Equals = 'Equals',
  GreaterThan = 'GreaterThan',
  In = 'In',
  LessThan = 'LessThan',
  Like = 'Like',
  NotEquals = 'NotEquals',
  IsNull = 'IsNull',
  IsNotNull = 'IsNotNull',
}

export interface AppResponse<T = any | PageResults> {
  data?: T;
  status?: boolean;
  success?: boolean;
  message?: string;
  code?: number;
}

export interface PageResults<T = any> {
  previousPage: number;
  size: number;
  nextPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  page: number; // from 0
  content: T[];
  totalElements: number;
}

export interface FetchParameter {
  variables?: Record<string, any>;
  resMapFn?: (res: AppResponse | any) => any;
  list?: boolean;
  mapData?: boolean;

  successFn?: (data?: AppResponse) => void;
  failedFn?: (data?: AppResponse) => void;
  finalFn?: (data?: AppResponse) => void;
  exceptionFn?: (data?: HttpErrorResponse) => void;

  url?: string;
  method?: 'POST' | 'GET';
  query?: any;
  mutation?: any;
  fetchFn?: (variables?: any) => Observable<any>;
  refetchActions?: Observable<boolean>[];
  defaultRes?: any;

  loadingOn?: string; // class of element to show loader on
  showLoading?: boolean;
  successMessage?: string;
  succesMessageFn?: (res?: any) => string;
  errorMessageFn?: (res?: any) => string;
  data$?: BehaviorSubject<any>;
  res$?: BehaviorSubject<any>;
  errorMessage?: string;
  notify?: boolean;
  notifyError?: boolean;
  handleException?: boolean;
  notifySuccess?: boolean;

  fetchPolicy?: FetchPolicy;
  cacheTTL?: number; // Time to live in milliseconds
  results?: any;

  queryFieldsKeys?: string[];
  searchStates?: SearchState[] | Record<string, any>;
  searchKeys?: string[];
  pageableParam?: PageableParam;
}

// Cache entry structure
export interface CacheEntry {
  data: any;
  timestamp: number;
  observable?: Observable<any>; // For in-flight requests
}
