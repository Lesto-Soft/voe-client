export interface Role {
  __typename?: "Role";
  _id: string;
  name: string;
  users?: { _id: string }[];
}

export interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string;
  role: Role | null;
  avatar?: string | null;
  financial_approver: boolean;
}

// Interface for the filters state managed by the hook
export interface UserFiltersState {
  name?: string;
  username?: string;
  position?: string;
  email?: string;
  roleIds?: string[];
  financial?: boolean;
}

// Interface for pagination state
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

// Combined type for URL parsing results
export interface UrlParamsInput extends UserFiltersState {
  page: number;
  perPage: number;
}

// State structure used for setting URL params
export interface StateForUrl {
  currentPage: number;
  itemsPerPage: number;
  filterName?: string;
  filterUsername?: string;
  filterPosition?: string;
  filterEmail?: string;
  filterRoleIds?: string[];
  financial_approver?: string;
}
