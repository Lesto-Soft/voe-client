// src/hooks/useRatingMetricManagement.ts
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDebounce } from "./useDebounce";

// Define the possible states for the archived filter
export type ArchivedFilterStatus = "all" | "active" | "archived";

// Helper to get initial state from URL
const getParamsFromUrl = (params: URLSearchParams) => {
  const name = params.get("name") || "";
  const description = params.get("description") || "";
  const status = params.get("status") as ArchivedFilterStatus;
  // Validate the status param, default to "all"
  const archivedStatus = ["all", "active", "archived"].includes(status)
    ? status
    : "all";
  return { name, description, archivedStatus };
};

// Interface for the hook's return value
export interface UseRatingMetricManagementReturn {
  filterName: string;
  setFilterName: (value: string) => void;
  debouncedFilterName: string;
  filterDescription: string;
  setFilterDescription: (value: string) => void;
  debouncedFilterDescription: string;
  archivedStatus: ArchivedFilterStatus;
  setArchivedStatus: (value: ArchivedFilterStatus) => void;
}

export function useRatingMetricManagement(): UseRatingMetricManagementReturn {
  const location = useLocation();
  const navigate = useNavigate();

  const initialParams = useMemo(
    () => getParamsFromUrl(new URLSearchParams(location.search)),
    [location.search]
  );

  const [filterName, setFilterName] = useState(initialParams.name);
  const [filterDescription, setFilterDescription] = useState(
    initialParams.description
  );
  const [archivedStatus, setArchivedStatus] = useState<ArchivedFilterStatus>(
    initialParams.archivedStatus
  );

  const debouncedFilterName = useDebounce(filterName, 500);
  const debouncedFilterDescription = useDebounce(filterDescription, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedFilterName) {
      params.set("name", debouncedFilterName);
    }
    if (debouncedFilterDescription) {
      params.set("description", debouncedFilterDescription);
    }
    // Only add the status to the URL if it's not the default "all"
    if (archivedStatus && archivedStatus !== "all") {
      params.set("status", archivedStatus);
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [
    debouncedFilterName,
    debouncedFilterDescription,
    archivedStatus,
    location.pathname,
    navigate,
  ]);

  return {
    filterName,
    setFilterName,
    debouncedFilterName,
    filterDescription,
    setFilterDescription,
    debouncedFilterDescription,
    archivedStatus,
    setArchivedStatus,
  };
}
