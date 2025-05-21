// src/hooks/useUserManagement.ts (adjust path if different)
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router"; // Assuming react-router-dom
import {
  UserFiltersState,
  PaginationState,
  StateForUrl, // expects financial_approver?: string
} from "../types/userManagementTypes"; // Adjust path
import { useDebounce } from "./useDebounce"; // Adjust path
import { getUrlParams, setUrlParams } from "../utils/urlUtils"; // Adjust path

// Interface for the return value of the hook
interface UseUserManagementReturn extends PaginationState {
  // Removed UserFiltersState if it's part of this
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
  filterFinancial: boolean; // <-- ADDED
  setFilterFinancial: React.Dispatch<React.SetStateAction<boolean>>; // <-- ADDED
  debouncedFilterName: string;
  debouncedFilterUsername: string;
  debouncedFilterPosition: string;
  debouncedFilterEmail: string;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (size: number) => void;
  handleRoleFilterToggle: (roleId: string) => void;
  currentQueryInput: any;
}

// Assume StateForUrl in userManagementTypes.ts is updated like this:
// export interface StateForUrl {
//   // ... other props
//   filterFinancial?: string; // 'true' or undefined/omitted
// }
// Assume UserFiltersState in userManagementTypes.ts is updated like this:
// export interface UserFiltersState {
//   // ... other props
//   financial?: boolean;
// }

export function useUserManagement(): UseUserManagementReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const initialStateFromUrl = useMemo(
    () => getUrlParams(searchParams), // Ensure getUrlParams parses 'financial' string to boolean
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
  // --- ADD filterFinancial state ---
  const [filterFinancial, setFilterFinancial] = useState<boolean>(
    initialStateFromUrl.financial || false // getUrlParams should return boolean for 'financial'
  );

  const debouncedFilterName = useDebounce(filterName, 500);
  const debouncedFilterUsername = useDebounce(filterUsername, 500);
  const debouncedFilterPosition = useDebounce(filterPosition, 500);
  const debouncedFilterEmail = useDebounce(filterEmail, 500);

  const prevFiltersRef = useRef<UserFiltersState | undefined>(undefined);

  const currentQueryInput = useMemo(() => {
    const input: any = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage - 1,
      name: debouncedFilterName,
      username: debouncedFilterUsername,
      position: debouncedFilterPosition,
      email: debouncedFilterEmail,
      roleIds: filterRoleIds,
      // --- ADD filterFinancial to query input ---
      // We only send 'financial: true' if the filter is active.
      // If 'financial: false', we omit it, meaning "don't filter on this criterion".
      // Adjust if your backend expects 'financial: false' explicitly.
      ...(filterFinancial && { financial_approver: true }),
    };

    Object.keys(input).forEach((key) => {
      if (
        (input[key] === "" ||
          input[key] === null ||
          (Array.isArray(input[key]) && input[key].length === 0)) &&
        key !== "currentPage" &&
        key !== "itemsPerPage"
        // No need for special handling for 'financial: false' here anymore
        // as it's conditionally added above.
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
    filterFinancial, // <-- ADDED dependency
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
      // --- ADD financial_approver to URL state ---
      // Store as 'true' string if true, otherwise omit (or 'false' string if preferred)
      financial_approver: filterFinancial ? "true" : undefined,
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
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      const params = new URLSearchParams(location.search);
      const stateForUrl = createStateForUrl();
      stateForUrl.currentPage = page; // Update page for this specific action
      setUrlParams(params, stateForUrl);
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
      setCurrentPage(newPage); // Also update current page to 1
      const params = new URLSearchParams(location.search);
      const stateForUrl = createStateForUrl();
      stateForUrl.itemsPerPage = size; // Update itemsPerPage
      stateForUrl.currentPage = newPage; // Reset page
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
      financial: filterFinancial, // <-- ADDED
    };

    const previousEffectiveFilters = prevFiltersRef.current ?? {
      name: initialStateFromUrl.name,
      username: initialStateFromUrl.username,
      position: initialStateFromUrl.position,
      email: initialStateFromUrl.email,
      roleIds: initialStateFromUrl.roleIds,
      financial: initialStateFromUrl.financial, // <-- ADDED
    };

    // Create comparable string versions
    const stringifyFilters = (filters: UserFiltersState) =>
      JSON.stringify({
        ...filters,
        roleIds: [...(filters.roleIds ?? [])].sort(),
      });

    const filtersHaveChanged =
      stringifyFilters(currentEffectiveFilters) !==
      stringifyFilters(previousEffectiveFilters);
    prevFiltersRef.current = currentEffectiveFilters;

    if (filtersHaveChanged) {
      const newPage = 1;
      // It's important to set the state that will be used by createStateForUrl BEFORE calling it
      // or ensure createStateForUrl uses the latest values directly.
      // The handlePageChange/ItemsPerPageChange already use a callback (createStateForUrl)
      // to get latest state. Here, we update URL with current filters.

      if (currentPage !== newPage) {
        setCurrentPage(newPage); // This will trigger another effect or handlePageChange logic eventually.
        // For immediate URL update when filters change and page also needs reset:
        const params = new URLSearchParams(); // Start fresh or use location.search
        const stateForUrl = createStateForUrl(); // This will use current state values
        stateForUrl.currentPage = newPage; // Set page to 1
        setUrlParams(params, stateForUrl);
        navigate(`${location.pathname}?${params.toString()}`, {
          replace: true,
        });
      } else {
        // Page is already 1, just update filter params
        const params = new URLSearchParams(location.search);
        const stateForUrl = createStateForUrl(); // Will use current filter states
        setUrlParams(params, stateForUrl);
        const newSearchString = params.toString();
        if (newSearchString !== location.search.substring(1)) {
          navigate(`${location.pathname}?${newSearchString}`, {
            replace: true,
          });
        }
      }
    }
  }, [
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    filterFinancial, // <-- ADDED dependency
    currentPage, // Added to correctly decide if page needs reset
    initialStateFromUrl, // To correctly compare on first load after URL parse
    createStateForUrl, // Now includes filterFinancial
    location.pathname,
    location.search,
    navigate,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stateFromUrl = getUrlParams(params); // Ensure this parses 'financial' correctly

    if (stateFromUrl.page !== currentPage) setCurrentPage(stateFromUrl.page);
    if (stateFromUrl.perPage !== itemsPerPage)
      setItemsPerPage(stateFromUrl.perPage);

    const urlName = stateFromUrl.name ?? "";
    if (urlName !== debouncedFilterName && urlName !== filterName)
      setFilterName(urlName);

    const urlUsername = stateFromUrl.username ?? "";
    if (
      urlUsername !== debouncedFilterUsername &&
      urlUsername !== filterUsername
    )
      setFilterUsername(urlUsername);

    const urlPosition = stateFromUrl.position ?? "";
    if (
      urlPosition !== debouncedFilterPosition &&
      urlPosition !== filterPosition
    )
      setFilterPosition(urlPosition);

    const urlEmail = stateFromUrl.email ?? "";
    if (urlEmail !== debouncedFilterEmail && urlEmail !== filterEmail)
      setFilterEmail(urlEmail);

    const urlRoleIds = stateFromUrl.roleIds ?? [];
    if (
      JSON.stringify(urlRoleIds.sort()) !== JSON.stringify(filterRoleIds.sort())
    )
      setFilterRoleIds(urlRoleIds);

    // --- ADD filterFinancial sync from URL ---
    const urlFinancial = stateFromUrl.financial || false;
    if (urlFinancial !== filterFinancial) {
      setFilterFinancial(urlFinancial);
    }
  }, [location.search]); // Keep this minimal to location.search for syncing FROM URL

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
    filterFinancial, // <-- ADDED
    setFilterFinancial, // <-- ADDED
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
