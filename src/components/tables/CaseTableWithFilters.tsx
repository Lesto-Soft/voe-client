import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import CaseTable from "./CaseTable";
import CaseSearchBar from "./CaseSearchBar";
import Pagination from "./Pagination";
import CaseTableSkeleton from "../skeletons/CaseTableSkeleton"; // Import the skeleton

// Accepts a fetch hook as a prop
type FetchHook = (input: any) => {
  cases: any[];
  count: number;
  loading: boolean;
  error: any;
  refetch: (args?: any) => void;
};

interface CaseTableWithFiltersProps {
  fetchHook: FetchHook;
  clearFiltersSignal?: any;
  filter: boolean;
  t: (key: string) => string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function getFiltersFromParams(params: URLSearchParams) {
  // Parse categoryIds as array from comma-separated string
  const categoryIdsParam = params.get("categoryIds");
  const categoryIds = categoryIdsParam
    ? categoryIdsParam.split(",").filter(Boolean)
    : [];
  return {
    caseNumber: params.get("caseNumber") || "",
    priority: params.get("priority") || "",
    type: params.get("type") || "",
    creatorId: params.get("creatorId") || "",
    categoryIds, // use array
    content: params.get("content") || "",
    status: params.get("status") || "",
  };
}

function setFiltersToParams(params: URLSearchParams, filters: any) {
  Object.entries(filters).forEach(([key, value]) => {
    if (key === "categoryIds") {
      if (Array.isArray(value) && value.length > 0) {
        params.set("categoryIds", value.join(","));
      } else {
        params.delete("categoryIds");
      }
    } else if (value) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
  });
}

const CaseTableWithFilters: React.FC<CaseTableWithFiltersProps> = ({
  fetchHook,
  filter,
  t,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get current page from URL
  const searchParams = new URLSearchParams(location.search);
  const urlCurrentPage = Number(searchParams.get("page")) || 1;

  // Initialize filters from URL
  const initialFilters = getFiltersFromParams(searchParams);

  const [currentPage, setCurrentPage] = useState(urlCurrentPage);

  // Filter state
  const [caseNumber, setCaseNumber] = useState(initialFilters.caseNumber);
  const [priority, setPriority] = useState(initialFilters.priority);
  const [type, setType] = useState(initialFilters.type);
  const [creatorId, setCreatorId] = useState(initialFilters.creatorId);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialFilters.categoryIds
  );
  const [content, setContent] = useState(initialFilters.content);
  const [status, setStatus] = useState(initialFilters.status);

  // Debounced values for inputs that should trigger fetch after delay
  const debouncedCaseNumber = useDebounce(caseNumber, 500); // Adjust delay as needed
  const debouncedContent = useDebounce(content, 500);

  // Track previous filters to detect changes for URL update
  const prevFiltersRef = useRef({
    caseNumber: initialFilters.caseNumber,
    priority: initialFilters.priority,
    type: initialFilters.type,
    creatorId: initialFilters.creatorId,
    categoryIds: initialFilters.categoryIds,
    content: initialFilters.content,
    status: initialFilters.status,
  });

  function clearFilters() {
    setCaseNumber("");
    setPriority("");
    setType("");
    setCreatorId("");
    setCategoryIds([]);
    setContent("");
    setStatus("");
    setCurrentPage(1);
    const params = new URLSearchParams(location.search);
    params.set("perPage", String(itemsPerPage));
    params.set("page", "1");
    // Remove filter params
    [
      "caseNumber",
      "priority",
      "type",
      "creatorId",
      "categoryIds",
      "content",
      "status",
    ].forEach((key) => params.delete(key));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }

  // Sync currentPage with URL
  useEffect(() => {
    if (urlCurrentPage !== currentPage) {
      setCurrentPage(urlCurrentPage);
    }
  }, [urlCurrentPage]);

  // Update URL when filters change (immediate or debounced)
  useEffect(() => {
    // Use debounced values for URL update if they are the trigger for the fetch
    const filtersForUrl = {
      caseNumber: debouncedCaseNumber,
      priority,
      type,
      creatorId,
      categoryIds, // use array
      content: debouncedContent,
      status,
    };

    const prevFilters = prevFiltersRef.current;
    const categoryIdsChanged =
      JSON.stringify(categoryIds) !== JSON.stringify(prevFilters.categoryIds);

    const filtersChanged =
      caseNumber !== prevFilters.caseNumber ||
      priority !== prevFilters.priority ||
      type !== prevFilters.type ||
      creatorId !== prevFilters.creatorId ||
      categoryIdsChanged ||
      content !== prevFilters.content ||
      status !== prevFilters.status;

    if (filtersChanged) {
      const params = new URLSearchParams(location.search);
      params.set("perPage", String(itemsPerPage));
      // Reset to page 1 only if filters (not page itself) changed
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset page state
        params.set("page", "1"); // Set page param for URL
      } else {
        params.set("page", String(currentPage)); // Keep current page if already 1
      }
      setFiltersToParams(params, filtersForUrl); // Use potentially debounced values for URL consistency with fetch
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });

      // Update ref with current non-debounced values
      prevFiltersRef.current = {
        caseNumber,
        priority,
        type,
        creatorId,
        categoryIds,
        content,
        status,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedCaseNumber,
    priority,
    type,
    creatorId,
    categoryIds,
    debouncedContent,
    status,
    itemsPerPage,
    navigate,
    location.search,
    location.pathname,
  ]); // Add debounced values to dependencies

  // Handle page change (updates URL immediately)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set("perPage", String(itemsPerPage));
    params.set("page", String(page));
    // Use potentially debounced values consistent with current filter state for URL
    setFiltersToParams(params, {
      caseNumber: debouncedCaseNumber,
      priority,
      type,
      creatorId,
      categoryIds,
      content: debouncedContent,
      status,
    });
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Build input for the fetch hook using debounced values
  const buildInput = useCallback(() => {
    const input: any = {
      itemsPerPage,
      currentPage: currentPage - 1, // API might expect 0-based index
    };
    // Use debounced values here
    if (debouncedContent) input.query = debouncedContent;
    if (debouncedCaseNumber) input.case_number = parseInt(debouncedCaseNumber); // Ensure parsing if needed
    if (priority) input.priority = priority;
    if (type) input.type = type;
    if (creatorId) input.creatorId = creatorId;
    if (categoryIds && categoryIds.length > 0) input.categories = categoryIds; // Assuming backend expects array
    if (status) input.status = status;
    return input;
  }, [
    itemsPerPage,
    currentPage,
    debouncedContent,
    debouncedCaseNumber,
    priority,
    type,
    creatorId,
    categoryIds,
    status,
  ]);

  // Use the provided fetch hook. It will receive debounced inputs via buildInput.
  const { cases, count, error, loading, refetch } = fetchHook(buildInput());

  // State to control skeleton visibility with minimum display time
  const [showSkeleton, setShowSkeleton] = useState(loading); // Initialize based on initial loading state
  const skeletonTimerRef = useRef<number | null>(null); // Use number for browser timer ID
  const MIN_SKELETON_TIME = 250; // Minimum time in ms to show skeleton

  // Effect to manage skeleton visibility based on actual loading state
  useEffect(() => {
    if (loading) {
      // If loading starts (or is true initially), immediately show skeleton
      setShowSkeleton(true);
      // Clear any pending timer to hide skeleton prematurely
      if (skeletonTimerRef.current !== null) {
        // Check if timer exists
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
    } else {
      // If loading finishes, set a timer to hide the skeleton after 900ms
      skeletonTimerRef.current = window.setTimeout(() => {
        // Use window.setTimeout for clarity
        setShowSkeleton(false);
        skeletonTimerRef.current = null;
      }, MIN_SKELETON_TIME);
    }

    // Cleanup timer on unmount or if loading becomes true again
    return () => {
      if (skeletonTimerRef.current !== null) {
        // Check if timer exists
        clearTimeout(skeletonTimerRef.current);
      }
    };
  }, [loading]); // Depend only on the actual loading state from the hook

  // Effect to trigger refetch when debounced values or pagination changes
  useEffect(() => {
    buildInput();
  }, [buildInput, refetch]);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Animated Search Bar Container - Removed relative, z-20, overflow-hidden */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          filter ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <CaseSearchBar
          caseNumber={caseNumber}
          setCaseNumber={setCaseNumber}
          priority={priority}
          setPriority={setPriority}
          type={type}
          setType={setType}
          creatorId={creatorId}
          setCreatorId={setCreatorId}
          categoryIds={categoryIds}
          setCategoryIds={setCategoryIds}
          content={content}
          setContent={setContent}
          status={status}
          setStatus={setStatus}
          t={t}
        />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Use showSkeleton state for conditional rendering */}
        {showSkeleton ? (
          <CaseTableSkeleton rows={itemsPerPage} />
        ) : cases && cases.length > 0 ? (
          <CaseTable cases={cases} t={t} />
        ) : (
          <div className="text-center py-10 text-gray-500">
            {t("no_cases_found")}
          </div>
        )}
      </div>
      {/* Render Pagination only when not showing skeleton and there are items */}
      {!showSkeleton && count > 0 && (
        <Pagination
          totalPages={Math.ceil(Number(count) / itemsPerPage)}
          totalCount={Number(count)}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1); // Reset to page 1 on size change
          }}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default CaseTableWithFilters;
