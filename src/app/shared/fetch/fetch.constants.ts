import { CurrentSort, PageableParam } from './fetch.interface';

export const PAGEABLE_PARAM_KEYS = ['pageParam', 'pageableParam', 'searchData'];

export const PAGEABLE_RESULT_KEYS = [
  'content',
  'pagination',
  'page',
  'number',
  'size',
  'pageResponse',
];

export const INITIAL_PAGE_PARAMETER: PageableParam = {
  first: 0,
  size: 10,
  sortBy: 'id',
  sortDirection: 'DESC',
};

export const DEFAULT_SORT: CurrentSort = {
  sortBy: 'id',
  sortDirection: 'DESC',
};
