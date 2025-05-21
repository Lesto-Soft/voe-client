import { ICaseStatus } from "../db/interfaces";

export interface User {
  __typename?: "User";
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
  experts: User[];
  managers: User[];
  cases: Array<{ _id: string; status: ICaseStatus | string }>;
  archived: boolean;
}

// Interface for the filters state managed by the hook
export interface CategoryFiltersState {
  name?: string;
  expertIds?: string[];
  managerIds?: string[];
  archived?: boolean;
  caseStatus?: ICaseStatus | string | null; // Added for case status filtering
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
  filterExpertIds?: string[];
  filterManagerIds?: string[];
  filterArchived?: boolean;
  filterCaseStatus?: ICaseStatus | string | null; // Added
}
