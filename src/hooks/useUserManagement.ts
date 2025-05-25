// src/hooks/useUserManagement.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router"; // Assuming react-router-dom
import {
  UserFiltersState,
  PaginationState,
  StateForUrl,
} from "../types/userManagementTypes"; // Adjust path
import { useDebounce } from "./useDebounce"; // Adjust path
import { getUrlParams, setUrlParams } from "../utils/urlUtils"; // Adjust path

// Interface for the return value of the hook
interface UseUserManagementReturn extends PaginationState {
  filterName: string;
  setFilterName: React.Dispatch<React.SetStateAction<string>>;
  filterUsername: string;
  setFilterUsername: React.Dispatch<React.SetStateAction<string>>;
  filterPosition: string;
  setFilterPosition: React.Dispatch<React.SetStateAction<string>>;
  filterEmail: string;
  setFilterEmail: React.Dispatch<React.SetStateAction<string>>;
  filterRoleIds: string[];
  setFilterRoleIds: React.Dispatch<React.SetStateAction<string[]>>;
  filterFinancial: boolean;
  setFilterFinancial: React.Dispatch<React.SetStateAction<boolean>>;
  filterManager: boolean; // <-- ADDED
  setFilterManager: React.Dispatch<React.SetStateAction<boolean>>; // <-- ADDED
  debouncedFilterName: string;
  debouncedFilterUsername: string;
  debouncedFilterPosition: string;
  debouncedFilterEmail: string;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (size: number) => void;
  handleRoleFilterToggle: (roleId: string) => void;
  currentQueryInput: any;
}

// Ensure getUrlParams in utils/urlUtils.ts is updated to parse 'is_manager' (string 'true') to a boolean.
// Example:
// if (params.get('is_manager') === 'true') result.manager = true;

// Ensure setUrlParams in utils/urlUtils.ts is updated to handle 'is_manager' from StateForUrl.
// Example:
// if (state.is_manager === 'true') params.set('is_manager', 'true');
// else params.delete('is_manager');

export function useUserManagement(): UseUserManagementReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const initialStateFromUrl = useMemo(
    () => getUrlParams(searchParams), // Ensure getUrlParams parses 'financial' and 'manager' strings to boolean
    [searchParams]
  );

  const [currentPage, setCurrentPage] = useState(initialStateFromUrl.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialStateFromUrl.perPage);
  const [filterName, setFilterName] = useState(initialStateFromUrl.name || "");
  const [filterUsername, setFilterUsername] = useState(
    initialStateFromUrl.username || ""
  );
  const [filterPosition, setFilterPosition] = useState(
    initialStateFromUrl.position || ""
  );
  const [filterEmail, setFilterEmail] = useState(
    initialStateFromUrl.email || ""
  );
  const [filterRoleIds, setFilterRoleIds] = useState<string[]>(
    initialStateFromUrl.roleIds || []
  );
  const [filterFinancial, setFilterFinancial] = useState<boolean>(
    initialStateFromUrl.financial || false
  );
  const [filterManager, setFilterManager] = useState<boolean>( // <-- ADDED state for manager filter
    initialStateFromUrl.manager || false // Ensure getUrlParams provides this
  );

  const debouncedFilterName = useDebounce(filterName, 500);
  const debouncedFilterUsername = useDebounce(filterUsername, 500);
  const debouncedFilterPosition = useDebounce(filterPosition, 500);
  const debouncedFilterEmail = useDebounce(filterEmail, 500);

  const prevFiltersRef = useRef<UserFiltersState | undefined>(undefined);

  const currentQueryInput = useMemo(() => {
    const input: any = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage - 1, // Usually 0-indexed for backend
      name: debouncedFilterName,
      username: debouncedFilterUsername,
      position: debouncedFilterPosition,
      email: debouncedFilterEmail,
      roleIds: filterRoleIds,
      ...(filterFinancial && { financial_approver: true }),
      ...(filterManager && { is_manager: true }), // <-- ADDED: manager filter to GraphQL query input
    };

    Object.keys(input).forEach((key) => {
      if (
        (input[key] === "" ||
          input[key] === null ||
          (Array.isArray(input[key]) && input[key].length === 0)) &&
        key !== "currentPage" &&
        key !== "itemsPerPage"
      ) {
        delete input[key];
      }
    });
    return input;
  }, [
    currentPage,
    itemsPerPage,
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    filterFinancial,
    filterManager, // <-- ADDED dependency
  ]);

  const createStateForUrl = useCallback((): StateForUrl => {
    return {
      currentPage,
      itemsPerPage,
      filterName: debouncedFilterName,
      filterUsername: debouncedFilterUsername,
      filterPosition: debouncedFilterPosition,
      filterEmail: debouncedFilterEmail,
      filterRoleIds,
      financial_approver: filterFinancial ? "true" : undefined,
      is_manager: filterManager ? "true" : undefined, // <-- ADDED: manager filter to URL state
    };
  }, [
    currentPage,
    itemsPerPage,
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    filterFinancial,
    filterManager, // <-- ADDED dependency
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      const params = new URLSearchParams(location.search);
      const stateForUrl = createStateForUrl();
      stateForUrl.currentPage = page;
      setUrlParams(params, stateForUrl); // Ensure setUrlParams can handle all fields in StateForUrl
      navigate(`${location.pathname}?${params.toString()}`);
    },
    [
      currentPage,
      createStateForUrl,
      location.pathname,
      location.search,
      navigate,
    ]
  );

  const handleItemsPerPageChange = useCallback(
    (size: number) => {
      if (size === itemsPerPage) return;
      const newPage = 1;
      setItemsPerPage(size);
      setCurrentPage(newPage);
      const params = new URLSearchParams(location.search);
      const stateForUrl = createStateForUrl();
      stateForUrl.itemsPerPage = size;
      stateForUrl.currentPage = newPage;
      setUrlParams(params, stateForUrl);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    },
    [
      itemsPerPage,
      createStateForUrl,
      location.pathname,
      location.search,
      navigate,
    ]
  );

  useEffect(() => {
    const currentEffectiveFilters: UserFiltersState = {
      name: debouncedFilterName,
      username: debouncedFilterUsername,
      position: debouncedFilterPosition,
      email: debouncedFilterEmail,
      roleIds: filterRoleIds,
      financial: filterFinancial,
      manager: filterManager, // <-- ADDED
    };

    const previousEffectiveFilters = prevFiltersRef.current ?? {
      name: initialStateFromUrl.name,
      username: initialStateFromUrl.username,
      position: initialStateFromUrl.position,
      email: initialStateFromUrl.email,
      roleIds: initialStateFromUrl.roleIds,
      financial: initialStateFromUrl.financial,
      manager: initialStateFromUrl.manager, // <-- ADDED
    };

    const stringifyFilters = (filters: UserFiltersState) =>
      JSON.stringify({
        ...filters,
        roleIds: [...(filters.roleIds ?? [])].sort(),
      });

    const filtersHaveChanged =
      stringifyFilters(currentEffectiveFilters) !==
      stringifyFilters(previousEffectiveFilters);

    if (filtersHaveChanged) {
      prevFiltersRef.current = currentEffectiveFilters; // Update ref *after* comparison for next cycle
      const newPage = 1;
      // Update URL if filters changed
      // This logic ensures page is reset to 1 if it's not already, and updates URL params
      const params = new URLSearchParams(location.search); // Use current search as base
      const stateForUrl = createStateForUrl(); // Gets all current filter states

      if (currentPage !== newPage) {
        setCurrentPage(newPage); // This state update will be used by createStateForUrl if it's called again before navigate
        stateForUrl.currentPage = newPage; // Ensure the stateForUrl has the reset page number
      }

      setUrlParams(params, stateForUrl);
      const newSearchString = params.toString();

      // Only navigate if the search string actually changed or if page was reset
      if (
        newSearchString !== location.search.substring(1) ||
        currentPage !== newPage
      ) {
        navigate(`${location.pathname}?${newSearchString}`, { replace: true });
      }
    } else if (!prevFiltersRef.current && initialStateFromUrl) {
      // Initialize prevFiltersRef on first meaningful render after initial state is set
      prevFiltersRef.current = currentEffectiveFilters;
    }
  }, [
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    filterFinancial,
    filterManager, // <-- ADDED dependency
    currentPage,
    itemsPerPage, // Added itemsPerPage as it's part of URL state via createStateForUrl
    initialStateFromUrl,
    createStateForUrl,
    location.pathname,
    location.search,
    navigate,
  ]);

  useEffect(() => {
    // This effect syncs component state FROM the URL, e.g., on browser back/forward
    const params = new URLSearchParams(location.search);
    const stateFromUrl = getUrlParams(params); // Ensure this parses 'financial' and 'manager'

    if (stateFromUrl.page !== currentPage) setCurrentPage(stateFromUrl.page);
    if (stateFromUrl.perPage !== itemsPerPage)
      setItemsPerPage(stateFromUrl.perPage);

    const urlName = stateFromUrl.name ?? "";
    if (urlName !== filterName) setFilterName(urlName); // Non-debounced for immediate UI reflection

    const urlUsername = stateFromUrl.username ?? "";
    if (urlUsername !== filterUsername) setFilterUsername(urlUsername);

    const urlPosition = stateFromUrl.position ?? "";
    if (urlPosition !== filterPosition) setFilterPosition(urlPosition);

    const urlEmail = stateFromUrl.email ?? "";
    if (urlEmail !== filterEmail) setFilterEmail(urlEmail);

    const urlRoleIds = stateFromUrl.roleIds ?? [];
    if (
      JSON.stringify(urlRoleIds.sort()) !== JSON.stringify(filterRoleIds.sort())
    )
      setFilterRoleIds(urlRoleIds);

    const urlFinancial = stateFromUrl.financial || false;
    if (urlFinancial !== filterFinancial) {
      setFilterFinancial(urlFinancial);
    }

    const urlManager = stateFromUrl.manager || false; // <-- ADDED: sync manager filter from URL
    if (urlManager !== filterManager) {
      setFilterManager(urlManager);
    }
  }, [location.search]); // Keep dependencies minimal for effects syncing FROM URL.

  const handleRoleFilterToggle = useCallback((roleId: string) => {
    setFilterRoleIds((prevRoleIds) =>
      prevRoleIds.includes(roleId)
        ? prevRoleIds.filter((id) => id !== roleId)
        : [...prevRoleIds, roleId]
    );
  }, []);

  return {
    currentPage,
    itemsPerPage,
    filterName,
    setFilterName,
    filterUsername,
    setFilterUsername,
    filterPosition,
    setFilterPosition,
    filterEmail,
    setFilterEmail,
    filterRoleIds,
    setFilterRoleIds,
    filterFinancial,
    setFilterFinancial,
    filterManager, // <-- ADDED
    setFilterManager, // <-- ADDED
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    handlePageChange,
    handleItemsPerPageChange,
    handleRoleFilterToggle,
    currentQueryInput,
  };
}
