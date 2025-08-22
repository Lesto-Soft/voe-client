import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router";
import CaseTable from "./CaseTable";
import CaseSearchBar from "./CaseSearchBar";
import Pagination from "./Pagination";
import CaseTableSkeleton from "../skeletons/CaseTableSkeleton";
import PaginationSkeleton from "../skeletons/PaginationSkeleton";
import { ICase, CasePriority, CaseType } from "../../db/interfaces";
import moment from "moment";

type FetchHook = (input: any) => {
  cases: any[];
  count: number;
  loading: boolean;
  error: any;
  refetch: (args?: any) => void;
};

// Define a type for the filters for clarity
type CaseFilters = {
  caseNumber?: string;
  priority?: ICase["priority"] | "";
  type?: ICase["type"] | "";
  creatorId?: string;
  categoryIds?: string[];
  content?: string;
  status?: (ICase["status"] | "")[];
  readStatus?: string;
  startDate?: Date | null;
  endDate?: Date | null;
};

interface CaseTableWithFiltersProps {
  fetchHook: FetchHook;
  clearFiltersSignal?: any;
  filter: boolean;
  t: (key: string) => string;
  initialFiltersOverride?: CaseFilters; // New prop for "props mode"
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function getFiltersFromParams(params: URLSearchParams): CaseFilters {
  const categoryIdsParam = params.get("categoryIds");
  const categoryIds = categoryIdsParam
    ? categoryIdsParam.split(",").filter(Boolean)
    : [];
  const statusParam = params.get("status");
  const status = statusParam ? statusParam.split(",").filter(Boolean) : [];
  return {
    caseNumber: params.get("caseNumber") || "",
    priority: (params.get("priority") || "") as ICase["priority"] | "",
    type: (params.get("type") || "") as ICase["type"] | "",
    creatorId: params.get("creatorId") || "",
    categoryIds,
    content: params.get("content") || "",
    status,
    readStatus: params.get("readStatus") || "ALL",
    startDate: params.get("startDate")
      ? moment(params.get("startDate"), "DD-MM-YYYY").toDate()
      : null,
    endDate: params.get("endDate")
      ? moment(params.get("endDate"), "DD-MM-YYYY").toDate()
      : null,
  };
}

function setFiltersToParams(params: URLSearchParams, filters: any) {
  Object.entries(filters).forEach(([key, value]) => {
    if (key === "categoryIds" || key === "status") {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else {
        params.delete(key);
      }
    } else if (key === "readStatus") {
      if (value && value !== "ALL") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    } else if (value instanceof Date) {
      params.set(key, moment(value).format("DD-MM-YYYY"));
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
  initialFiltersOverride,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Determine initial filters based on prop or URL
  const initialFilters = useMemo(() => {
    if (initialFiltersOverride) {
      return {
        ...initialFiltersOverride,
        readStatus: initialFiltersOverride.readStatus || "ALL",
      };
    }
    const searchParams = new URLSearchParams(location.search);
    return getFiltersFromParams(searchParams);
  }, [initialFiltersOverride, location.search]);

  const [currentPage, setCurrentPage] = useState(
    Number(new URLSearchParams(location.search).get("page")) || 1
  );

  const [caseNumber, setCaseNumber] = useState(initialFilters.caseNumber || "");
  const [priority, setPriority] = useState<"" | CasePriority>(
    initialFilters.priority || ""
  );
  const [type, setType] = useState<"" | CaseType>(initialFilters.type || "");
  const [creatorId, setCreatorId] = useState(initialFilters.creatorId || "");
  const [categoryIds, setCategoryIds] = useState(
    initialFilters.categoryIds || []
  );
  const [content, setContent] = useState(initialFilters.content || "");
  const [status, setStatus] = useState(initialFilters.status || []);
  const [readStatus, setReadStatus] = useState(
    initialFilters.readStatus || "ALL"
  );
  const [dateRange, setDateRange] = useState({
    startDate: initialFilters.startDate || null,
    endDate: initialFilters.endDate || null,
  });

  const debouncedCaseNumber = useDebounce(caseNumber, 500);
  const debouncedContent = useDebounce(content, 500);

  const prevFiltersRef = useRef(initialFilters);

  useEffect(() => {
    // If we are in props mode, don't ever update the main browser URL
    if (initialFiltersOverride) return;

    const filtersForUrl = {
      caseNumber: debouncedCaseNumber,
      priority,
      type,
      creatorId,
      categoryIds,
      content: debouncedContent,
      status,
      readStatus,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    const prevFilters = prevFiltersRef.current;
    const categoryIdsChanged =
      JSON.stringify(categoryIds) !== JSON.stringify(prevFilters.categoryIds);
    const statusChanged =
      JSON.stringify(status) !== JSON.stringify(prevFilters.status);
    const dateRangeChanged =
      dateRange.startDate?.getTime() !== prevFilters.startDate?.getTime() ||
      dateRange.endDate?.getTime() !== prevFilters.endDate?.getTime();

    const filtersChanged =
      caseNumber !== prevFilters.caseNumber ||
      priority !== prevFilters.priority ||
      type !== prevFilters.type ||
      creatorId !== prevFilters.creatorId ||
      categoryIdsChanged ||
      content !== prevFilters.content ||
      statusChanged ||
      readStatus !== prevFilters.readStatus ||
      dateRangeChanged;

    if (filtersChanged) {
      const params = new URLSearchParams(location.search);
      params.set("perPage", String(itemsPerPage));
      setCurrentPage(1);
      params.set("page", "1");
      setFiltersToParams(params, filtersForUrl);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });

      prevFiltersRef.current = {
        caseNumber,
        priority,
        type,
        creatorId,
        categoryIds,
        content,
        status,
        readStatus,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    }
  }, [
    debouncedCaseNumber,
    priority,
    type,
    creatorId,
    categoryIds,
    debouncedContent,
    status,
    readStatus,
    itemsPerPage,
    navigate,
    location.search,
    location.pathname,
    dateRange,
    initialFiltersOverride,
    caseNumber,
    content,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // If in props mode, just update state. Do not navigate.
    if (initialFiltersOverride) {
      return;
    }
    const params = new URLSearchParams(location.search);
    params.set("perPage", String(itemsPerPage));
    params.set("page", String(page));
    setFiltersToParams(params, {
      caseNumber: debouncedCaseNumber,
      priority,
      type,
      creatorId,
      categoryIds,
      content: debouncedContent,
      status,
      readStatus,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const buildInput = useCallback(() => {
    const input: any = {
      itemsPerPage,
      currentPage: currentPage - 1,
    };
    if (debouncedContent) input.query = debouncedContent;
    if (debouncedCaseNumber) input.case_number = parseInt(debouncedCaseNumber);
    if (priority) input.priority = priority;
    if (type) input.type = type;
    if (creatorId) input.creatorId = creatorId;
    if (categoryIds && categoryIds.length > 0) input.categories = categoryIds;
    if (status && status.length > 0) input.status = status;
    if (readStatus && readStatus !== "ALL") input.readStatus = readStatus;
    if (dateRange.startDate)
      input.startDate = moment(dateRange.startDate).format("DD-MM-YYYY");
    if (dateRange.endDate)
      input.endDate = moment(dateRange.endDate).format("DD-MM-YYYY");
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
    readStatus,
    dateRange,
  ]);

  const { cases, count, error, loading, refetch } = fetchHook(buildInput());

  const [showSkeleton, setShowSkeleton] = useState(loading);
  const skeletonTimerRef = useRef<number | null>(null);
  const MIN_SKELETON_TIME = 250;

  useEffect(() => {
    if (loading) {
      setShowSkeleton(true);
      if (skeletonTimerRef.current !== null) {
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
    } else {
      skeletonTimerRef.current = window.setTimeout(() => {
        setShowSkeleton(false);
        skeletonTimerRef.current = null;
      }, MIN_SKELETON_TIME);
    }
    return () => {
      if (skeletonTimerRef.current !== null) {
        clearTimeout(skeletonTimerRef.current);
      }
    };
  }, [loading]);

  useEffect(() => {
    refetch(buildInput());
  }, [buildInput, refetch]);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div
        className={` transition-all duration-300 ease-in-out ${
          filter && !initialFiltersOverride // Also hide filters in modal view
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
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
          readStatus={readStatus}
          setReadStatus={setReadStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
          t={t}
        />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {showSkeleton ? (
          <CaseTableSkeleton rows={itemsPerPage} />
        ) : cases && cases.length > 0 ? (
          <CaseTable cases={cases} t={t} onCaseDeleted={refetch} />
        ) : (
          <div className="text-center py-10 text-gray-500">
            {t("no_cases_found")}
          </div>
        )}
      </div>
      {/* This entire block is updated */}
      {showSkeleton ? (
        <PaginationSkeleton />
      ) : (
        count > 0 && (
          <Pagination
            totalPages={Math.ceil(Number(count) / itemsPerPage)}
            totalCount={Number(count)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setCurrentPage(1);
            }}
            onPageChange={handlePageChange}
          />
        )
      )}
    </div>
  );
};

export default CaseTableWithFilters;
