// src/page/hooks/useUserManagement.ts
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  UserFiltersState,
  PaginationState,
  StateForUrl,
} from "../types/userManagementTypes"; // Adjust path
import { useDebounce } from "../../hooks/useDebounce"; // Adjust path
import { getUrlParams, setUrlParams } from "../../utils/urlUtils"; // Adjust path

// Interface for the return value of the hook
interface UseUserManagementReturn extends PaginationState, UserFiltersState {
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
  debouncedFilterName: string;
  debouncedFilterUsername: string;
  debouncedFilterPosition: string;
  debouncedFilterEmail: string;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (size: number) => void;
  handleRoleFilterToggle: (roleId: string) => void;
  currentQueryInput: any; // Consider defining a stricter type based on GraphQL hook input
}

export function useUserManagement(): UseUserManagementReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const initialStateFromUrl = useMemo(
    () => getUrlParams(searchParams),
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
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      const params = new URLSearchParams(location.search);
      const stateForUrl: StateForUrl = {
        currentPage: page,
        itemsPerPage,
        filterName: debouncedFilterName,
        filterUsername: debouncedFilterUsername,
        filterPosition: debouncedFilterPosition,
        filterEmail: debouncedFilterEmail,
        filterRoleIds,
      };
      setUrlParams(params, stateForUrl);
      navigate(`${location.pathname}?${params.toString()}`);
    },
    [
      currentPage,
      itemsPerPage,
      debouncedFilterName,
      debouncedFilterUsername,
      debouncedFilterPosition,
      debouncedFilterEmail,
      filterRoleIds,
      location.search,
      navigate,
      location.pathname,
    ]
  );

  const handleItemsPerPageChange = useCallback(
    (size: number) => {
      if (size === itemsPerPage) return;
      const newPage = 1;
      setItemsPerPage(size);
      setCurrentPage(newPage);
      const params = new URLSearchParams(location.search);
      const stateForUrl: StateForUrl = {
        currentPage: newPage,
        itemsPerPage: size,
        filterName: debouncedFilterName,
        filterUsername: debouncedFilterUsername,
        filterPosition: debouncedFilterPosition,
        filterEmail: debouncedFilterEmail,
        filterRoleIds,
      };
      setUrlParams(params, stateForUrl);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    },
    [
      itemsPerPage,
      debouncedFilterName,
      debouncedFilterUsername,
      debouncedFilterPosition,
      debouncedFilterEmail,
      filterRoleIds,
      location.search,
      navigate,
      location.pathname,
    ]
  );

  // Effect to Update URL & Reset Page ONLY when effective FILTERS change
  useEffect(() => {
    const currentEffectiveFilters: UserFiltersState = {
      name: debouncedFilterName,
      username: debouncedFilterUsername,
      position: debouncedFilterPosition,
      email: debouncedFilterEmail,
      roleIds: filterRoleIds,
    };
    const previousEffectiveFilters = prevFiltersRef.current ?? {
      name: initialStateFromUrl.name,
      username: initialStateFromUrl.username,
      position: initialStateFromUrl.position,
      email: initialStateFromUrl.email,
      roleIds: initialStateFromUrl.roleIds,
    };
    const stringifiedCurrent = JSON.stringify({
      ...currentEffectiveFilters,
      roleIds: [...(currentEffectiveFilters.roleIds ?? [])].sort(),
    });
    const stringifiedPrevious = JSON.stringify({
      ...previousEffectiveFilters,
      roleIds: [...(previousEffectiveFilters.roleIds ?? [])].sort(),
    });
    const filtersHaveChanged = stringifiedCurrent !== stringifiedPrevious;
    prevFiltersRef.current = currentEffectiveFilters; // Update ref *after* comparison

    if (filtersHaveChanged) {
      const newPage = 1;
      if (currentPage !== newPage) {
        // Setting page state will trigger a re-render, and the handlePageChange
        // logic (or the URL sync effect if preferred) will update the URL.
        // Avoid direct navigation here if state change handles it.
        setCurrentPage(newPage);
      } else {
        // Page is already 1, but filters changed, so update URL directly
        const params = new URLSearchParams(location.search);
        const stateForUrl: StateForUrl = {
          currentPage: newPage,
          itemsPerPage,
          filterName: debouncedFilterName,
          filterUsername: debouncedFilterUsername,
          filterPosition: debouncedFilterPosition,
          filterEmail: debouncedFilterEmail,
          filterRoleIds,
        };
        setUrlParams(params, stateForUrl);
        const newSearchString = params.toString();
        if (newSearchString !== location.search.substring(1)) {
          navigate(`${location.pathname}?${newSearchString}`, {
            replace: true,
          });
        }
      }
    }
    // Dependencies: Debounced values, role IDs, pagination state (for URL update), and navigation utils.
  }, [
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    currentPage,
    itemsPerPage,
    initialStateFromUrl,
    location.pathname,
    location.search,
    navigate,
  ]);

  // Effect to sync state FROM URL (e.g., browser back/forward)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stateFromUrl = getUrlParams(params);

    // Sync pagination state
    if (stateFromUrl.page !== currentPage) setCurrentPage(stateFromUrl.page);
    if (stateFromUrl.perPage !== itemsPerPage)
      setItemsPerPage(stateFromUrl.perPage);

    // Sync filter state *only if* the URL value differs from the *debounced* value.
    // This prevents overwriting user input that hasn't been debounced and reflected in the URL yet.
    const urlName = stateFromUrl.name ?? "";
    if (urlName !== debouncedFilterName && urlName !== filterName) {
      setFilterName(urlName);
    }

    const urlUsername = stateFromUrl.username ?? "";
    if (
      urlUsername !== debouncedFilterUsername &&
      urlUsername !== filterUsername
    ) {
      setFilterUsername(urlUsername);
    }

    const urlPosition = stateFromUrl.position ?? "";
    if (
      urlPosition !== debouncedFilterPosition &&
      urlPosition !== filterPosition
    ) {
      setFilterPosition(urlPosition);
    }

    const urlEmail = stateFromUrl.email ?? "";
    if (urlEmail !== debouncedFilterEmail && urlEmail !== filterEmail) {
      setFilterEmail(urlEmail);
    }

    const urlRoleIds = stateFromUrl.roleIds ?? [];
    if (
      JSON.stringify(urlRoleIds.sort()) !== JSON.stringify(filterRoleIds.sort())
    ) {
      setFilterRoleIds(urlRoleIds);
    }

    // This effect should ONLY depend on location.search to avoid infinite loops
    // caused by state updates within the effect itself.
  }, [location.search]); // Removed state dependencies

  const handleRoleFilterToggle = useCallback((roleId: string) => {
    setFilterRoleIds((prevRoleIds) =>
      prevRoleIds.includes(roleId)
        ? prevRoleIds.filter((id) => id !== roleId)
        : [...prevRoleIds, roleId]
    );
    // Page reset is handled by the filter change effect
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
