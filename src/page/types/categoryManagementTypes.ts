export interface User {
  __typename?: "User";
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  experts: User[];
  cases: string[];
  archived: boolean;
}

// Interface for the filters state managed by the hook
export interface CategoryFiltersState {
  name?: string;
  experts?: string;
  managers?: string;
  archived?: boolean;
}

// Interface for pagination state
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

// Combined type for URL parsing results
export interface UrlParamsInput extends CategoryFiltersState {
  page: number;
  perPage: number;
}

// State structure used for setting URL params
export interface StateForUrl {
  currentPage: number;
  itemsPerPage: number;
  filterName?: string;
  filterExperts?: string;
  filterManagers?: string;
  filterArchived?: boolean;
}
